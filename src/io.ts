import { FloorPlan, PlacedFurniture, Room, Wall, ROOM_TYPE_PRESETS } from './types';
import { getDefinitionById, CATEGORY_LABELS } from './catalog';
import { store } from './state';

interface ProjectFile {
  version: 1;
  floorPlan: FloorPlan;
  furniture: PlacedFurniture[];
}

/** Projekt als JSON-Datei speichern */
export function exportProject() {
  const state = store.getState();
  const project: ProjectFile = {
    version: 1,
    floorPlan: state.floorPlan,
    furniture: state.placedFurniture,
  };
  const json = JSON.stringify(project, null, 2);
  downloadFile(json, `${state.floorPlan.name || 'raumplan'}.json`, 'application/json');
}

/** Projekt aus JSON-Datei laden */
export function importProject(): Promise<void> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return resolve();
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const project = JSON.parse(reader.result as string) as ProjectFile;
          if (project.version === 1 && project.floorPlan && project.furniture) {
            store.loadProject(project.floorPlan, project.furniture);
          }
        } catch {
          alert('Fehler beim Laden der Datei. Bitte eine gültige Raumplan-Datei wählen.');
        }
        resolve();
      };
      reader.readAsText(file);
    };
    input.click();
  });
}

/** Grundriss-Daten importieren (einfaches JSON-Format) */
export function importFloorPlan(): Promise<void> {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return resolve();
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result as string);
          const fp = parseFloorPlan(data);
          if (fp) {
            store.setFloorPlan(fp);
          } else {
            alert('Ungültiges Grundriss-Format.');
          }
        } catch {
          alert('Fehler beim Laden der Grundrissdatei.');
        }
        resolve();
      };
      reader.readAsText(file);
    };
    input.click();
  });
}

/** Grundriss als SVG exportieren */
export function exportAsSVG() {
  const state = store.getState();
  const scale = state.floorPlan.scale;

  if (state.floorPlan.rooms.length === 0 && state.placedFurniture.length === 0) {
    alert('Der Grundriss ist leer. Bitte zuerst Räume zeichnen.');
    return;
  }

  // Bounding Box berechnen
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const room of state.floorPlan.rooms) {
    for (const wall of room.walls) {
      minX = Math.min(minX, wall.start.x, wall.end.x);
      minY = Math.min(minY, wall.start.y, wall.end.y);
      maxX = Math.max(maxX, wall.start.x, wall.end.x);
      maxY = Math.max(maxY, wall.start.y, wall.end.y);
    }
  }

  const padding = 40;
  const svgW = (maxX - minX) * scale + padding * 2;
  const svgH = (maxY - minY) * scale + padding * 2;
  const offsetX = -minX * scale + padding;
  const offsetY = -minY * scale + padding;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}">\n`;
  svg += `<rect width="100%" height="100%" fill="#f8f8f8"/>\n`;
  svg += `<g transform="translate(${offsetX},${offsetY})">\n`;

  // Räume
  for (const room of state.floorPlan.rooms) {
    const points = room.walls.map(w => `${w.start.x * scale},${w.start.y * scale}`).join(' ');
    svg += `  <polygon points="${points}" fill="${room.color}" stroke="#444" stroke-width="${room.walls[0]?.thickness * scale * 0.3 || 4}"/>\n`;

    // Raumname
    const cx = room.walls.reduce((s, w) => s + w.start.x, 0) / room.walls.length * scale;
    const cy = room.walls.reduce((s, w) => s + w.start.y, 0) / room.walls.length * scale;
    svg += `  <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle" font-size="12" fill="#666">${room.name}</text>\n`;
  }

  // Möbel
  for (const placed of state.placedFurniture) {
    const def = getDefinitionById(placed.definitionId);
    if (!def) continue;
    const pw = def.width * scale * placed.scaleX;
    const ph = def.height * scale * placed.scaleY;
    svg += `  <g transform="translate(${placed.x * scale},${placed.y * scale}) rotate(${placed.rotation})">\n`;
    svg += `    <rect x="${-pw / 2}" y="${-ph / 2}" width="${pw}" height="${ph}" fill="${def.color}" stroke="#00000030" stroke-width="1"/>\n`;
    svg += `    <text x="0" y="5" text-anchor="middle" font-size="${Math.min(pw, ph) * 0.12}" fill="#333">${def.name}</text>\n`;
    svg += `  </g>\n`;
  }

  svg += `</g>\n</svg>`;
  downloadFile(svg, `${state.floorPlan.name || 'raumplan'}.svg`, 'image/svg+xml');
}

function parseFloorPlan(data: any): FloorPlan | null {
  // Unterstützt sowohl unser internes Format als auch ein vereinfachtes Format
  if (data.rooms && Array.isArray(data.rooms)) {
    const rooms: Room[] = [];
    for (const r of data.rooms) {
      if (!r.walls && r.points) {
        // Vereinfachtes Format: Raum als Punkt-Array
        const walls: Wall[] = [];
        const pts = r.points as { x: number; y: number }[];
        for (let i = 0; i < pts.length; i++) {
          walls.push({
            start: pts[i],
            end: pts[(i + 1) % pts.length],
            thickness: r.wallThickness || 20,
          });
        }
        rooms.push({
          id: r.id || `room-${rooms.length}`,
          name: r.name || `Raum ${rooms.length + 1}`,
          walls,
          openings: r.openings || [],
          color: r.color || '#f5f5f5',
        });
      } else if (r.walls) {
        rooms.push({
          id: r.id || `room-${rooms.length}`,
          name: r.name || `Raum ${rooms.length + 1}`,
          walls: r.walls,
          openings: r.openings || [],
          color: r.color || '#f5f5f5',
        });
      }
    }
    if (rooms.length === 0) return null;
    return {
      id: data.id || 'imported',
      name: data.name || 'Importierter Grundriss',
      rooms,
      scale: data.scale || 2,
    };
  }
  return null;
}

/** Stückliste als HTML-Datei exportieren */
export function exportStueckliste() {
  const state = store.getState();
  const fp = state.floorPlan;

  if (fp.rooms.length === 0 && state.placedFurniture.length === 0) {
    alert('Der Grundriss ist leer. Bitte zuerst Räume einrichten.');
    return;
  }

  // Möbel pro Raum gruppieren
  const byRoom = new Map<string, PlacedFurniture[]>();
  const noRoom: PlacedFurniture[] = [];
  for (const pf of state.placedFurniture) {
    if (pf.roomId) {
      const arr = byRoom.get(pf.roomId) || [];
      arr.push(pf);
      byRoom.set(pf.roomId, arr);
    } else {
      noRoom.push(pf);
    }
  }

  // Möbel-Zählung: Häufigkeit gleicher Typen
  function countFurniture(list: PlacedFurniture[]): { name: string; category: string; count: number; dimW: number; dimH: number }[] {
    const counts = new Map<string, number>();
    for (const pf of list) {
      counts.set(pf.definitionId, (counts.get(pf.definitionId) || 0) + 1);
    }
    const result: { name: string; category: string; count: number; dimW: number; dimH: number }[] = [];
    for (const [defId, count] of counts) {
      const def = getDefinitionById(defId);
      if (!def) continue;
      result.push({
        name: def.name,
        category: CATEGORY_LABELS[def.category],
        count,
        dimW: def.width,
        dimH: def.height,
      });
    }
    return result.sort((a, b) => a.name.localeCompare(b.name, 'de'));
  }

  function calcRoomArea(room: Room): number {
    if (room.walls.length < 3) return 0;
    let area = 0;
    for (const wall of room.walls) {
      area += wall.start.x * wall.end.y - wall.end.x * wall.start.y;
    }
    return Math.abs(area) / 2 / 10000; // cm² -> m²
  }

  const dateStr = new Date().toLocaleDateString('de-DE');
  let html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<title>Stückliste – ${fp.name}</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 13px; color: #333; max-width: 900px; margin: 0 auto; padding: 20px; }
  h1 { font-size: 22px; color: #1a73e8; border-bottom: 2px solid #1a73e8; padding-bottom: 8px; }
  h2 { font-size: 16px; margin: 20px 0 6px; }
  .meta { color: #888; font-size: 12px; margin-bottom: 20px; }
  .room-header { display: flex; align-items: baseline; gap: 12px; background: #f0f4ff; padding: 8px 12px; border-radius: 6px; border-left: 4px solid #1a73e8; }
  .room-header h2 { margin: 0; }
  .room-meta { font-size: 11px; color: #888; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
  th { background: #e8f0fe; text-align: left; padding: 6px 10px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.3px; }
  td { padding: 5px 10px; border-bottom: 1px solid #eee; }
  tr:last-child td { border-bottom: none; }
  .count { font-weight: 600; color: #1a73e8; }
  .total { font-weight: 700; background: #f5f5f5; }
  .summary { background: #e8f0fe; border-radius: 8px; padding: 12px 16px; margin: 20px 0; }
  .summary h2 { margin: 0 0 10px; font-size: 15px; }
  .sum-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .sum-card { background: white; border-radius: 6px; padding: 10px; text-align: center; }
  .sum-card .val { font-size: 22px; font-weight: 700; color: #1a73e8; }
  .sum-card .lbl { font-size: 11px; color: #888; }
  @media print { .no-print { display: none; } }
</style>
</head>
<body>
<h1>Stückliste: ${fp.name}</h1>
<div class="meta">Erstellt am ${dateStr} · Maßstab 1:${Math.round(100 / fp.scale)} · ${fp.rooms.length} Räume · ${state.placedFurniture.length} Möbelstücke gesamt</div>`;

  // Gesamtzusammenfassung
  const totalFurn = state.placedFurniture.length;
  const totalArea = fp.rooms.reduce((s, r) => s + calcRoomArea(r), 0);
  const allCounts = countFurniture(state.placedFurniture);
  html += `
<div class="summary">
  <h2>Gesamtübersicht</h2>
  <div class="sum-grid">
    <div class="sum-card"><div class="val">${fp.rooms.length}</div><div class="lbl">Räume</div></div>
    <div class="sum-card"><div class="val">${totalFurn}</div><div class="lbl">Möbelstücke</div></div>
    <div class="sum-card"><div class="val">${totalArea.toFixed(0)} m²</div><div class="lbl">Gesamtfläche</div></div>
  </div>
</div>`;

  // Raumweise Auflistung
  for (const room of fp.rooms) {
    const roomFurniture = byRoom.get(room.id) || [];
    const area = calcRoomArea(room);
    const typeLabel = room.type && ROOM_TYPE_PRESETS[room.type] ? ROOM_TYPE_PRESETS[room.type].label : '';
    html += `
<div class="room-header">
  <h2>${room.name}</h2>
  <span class="room-meta">${typeLabel}${typeLabel ? ' · ' : ''}${area.toFixed(1)} m² · ${roomFurniture.length} Möbelstücke</span>
</div>`;

    if (roomFurniture.length === 0) {
      html += `<p style="color:#aaa;font-size:12px;padding:4px 0;">Keine Ausstattung in diesem Raum.</p>`;
      continue;
    }
    const counts = countFurniture(roomFurniture);
    html += `<table>
<tr><th>Möbel</th><th>Kategorie</th><th>Breite × Tiefe</th><th>Anz.</th></tr>`;
    for (const item of counts) {
      html += `<tr>
<td>${item.name}</td>
<td>${item.category}</td>
<td>${item.dimW} × ${item.dimH} cm</td>
<td class="count">${item.count}×</td>
</tr>`;
    }
    html += `<tr class="total"><td colspan="3">Gesamt</td><td>${roomFurniture.length}</td></tr></table>`;
  }

  // Möbel ohne Raumzuordnung
  if (noRoom.length > 0) {
    html += `<div class="room-header"><h2>Ohne Raumzuordnung</h2><span class="room-meta">${noRoom.length} Möbelstücke</span></div>`;
    const counts = countFurniture(noRoom);
    html += `<table><tr><th>Möbel</th><th>Kategorie</th><th>Breite × Tiefe</th><th>Anz.</th></tr>`;
    for (const item of counts) {
      html += `<tr><td>${item.name}</td><td>${item.category}</td><td>${item.dimW} × ${item.dimH} cm</td><td class="count">${item.count}×</td></tr>`;
    }
    html += `<tr class="total"><td colspan="3">Gesamt</td><td>${noRoom.length}</td></tr></table>`;
  }

  // Gesamte Möbelliste (alle Typen)
  if (allCounts.length > 0) {
    html += `<h2 style="margin-top:28px">Gesamte Möbelliste (alle Räume)</h2>
<table><tr><th>Möbel</th><th>Kategorie</th><th>Breite × Tiefe</th><th>Anz. gesamt</th></tr>`;
    for (const item of allCounts) {
      html += `<tr><td>${item.name}</td><td>${item.category}</td><td>${item.dimW} × ${item.dimH} cm</td><td class="count">${item.count}×</td></tr>`;
    }
    html += `<tr class="total"><td colspan="3">Gesamt Möbelstücke</td><td>${totalFurn}</td></tr></table>`;
  }

  html += `</body></html>`;
  downloadFile(html, `Stückliste_${fp.name || 'Raumplan'}.html`, 'text/html');
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
