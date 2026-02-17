import { FloorPlan, PlacedFurniture, Room, Wall } from './types';
import { getDefinitionById } from './catalog';
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
