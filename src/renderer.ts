import { AppState, Room, Wall, Opening, PlacedFurniture, Point, ROOM_TYPE_PRESETS } from './types';
import { getDefinitionById } from './catalog';

/** Zeichnungszustand für Raum-Zeichenmodus */
export interface DrawingState {
  points: Point[];
  cursorPos: Point | null; // aktuelle Mausposition in Welt-cm
}

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private drawingState: DrawingState | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  setDrawingState(state: DrawingState | null) {
    this.drawingState = state;
  }

  resize() {
    const parent = this.canvas.parentElement!;
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = parent.clientWidth * dpr;
    this.canvas.height = parent.clientHeight * dpr;
    this.canvas.style.width = `${parent.clientWidth}px`;
    this.canvas.style.height = `${parent.clientHeight}px`;
    this.ctx.scale(dpr, dpr);
  }

  render(state: AppState) {
    const ctx = this.ctx;
    const w = this.canvas.clientWidth;
    const h = this.canvas.clientHeight;

    ctx.save();
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, w, h);

    // Transformation: Pan + Zoom
    ctx.translate(state.panOffset.x, state.panOffset.y);
    ctx.scale(state.zoom, state.zoom);

    const scale = state.floorPlan.scale;

    // Raster zeichnen
    if (state.gridVisible) {
      this.drawGrid(state, w, h, scale);
    }

    // Räume zeichnen
    for (const room of state.floorPlan.rooms) {
      const isSelected = room.id === state.selectedRoomId;
      this.drawRoom(ctx, room, scale, isSelected, state.showMeasurements, state.placedFurniture);
    }

    // Platzierte Möbel zeichnen
    for (const furniture of state.placedFurniture) {
      const isSelected = furniture.id === state.selectedFurnitureId;
      this.drawFurniture(ctx, furniture, scale, isSelected);
    }

    // Zeichenvorschau
    if (this.drawingState && this.drawingState.points.length > 0) {
      this.drawDrawingPreview(ctx, scale);
    }

    // Geistervorschau beim Draggen
    if (state.draggedDefinition && (this as any)._ghostPos) {
      const pos = (this as any)._ghostPos as Point;
      const def = state.draggedDefinition;
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = def.color;
      const pw = def.width * scale;
      const ph = def.height * scale;
      ctx.fillRect(pos.x - pw / 2, pos.y - ph / 2, pw, ph);
      ctx.strokeStyle = '#1a73e8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(pos.x - pw / 2, pos.y - ph / 2, pw, ph);
      ctx.globalAlpha = 1;
    }

    ctx.restore();

    // Lineal (wird außerhalb der Transformation gezeichnet)
    if (state.showRuler) {
      this.drawRuler(state, w, h);
    }
  }

  setGhostPosition(pos: Point | null) {
    (this as any)._ghostPos = pos;
  }

  private drawGrid(state: AppState, canvasW: number, canvasH: number, scale: number) {
    const ctx = this.ctx;
    const gridPx = state.gridSize * scale;
    const ox = -state.panOffset.x / state.zoom;
    const oy = -state.panOffset.y / state.zoom;
    const maxX = ox + canvasW / state.zoom;
    const maxY = oy + canvasH / state.zoom;

    // Feine Rasterlinie (alle 50cm)
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    ctx.beginPath();

    const startX = Math.floor(ox / gridPx) * gridPx;
    const startY = Math.floor(oy / gridPx) * gridPx;

    for (let x = startX; x <= maxX; x += gridPx) {
      ctx.moveTo(x, oy);
      ctx.lineTo(x, maxY);
    }
    for (let y = startY; y <= maxY; y += gridPx) {
      ctx.moveTo(ox, y);
      ctx.lineTo(maxX, y);
    }
    ctx.stroke();

    // Starke Rasterlinie (alle 1m = 2 Raster)
    const bigGridPx = gridPx * 2;
    ctx.strokeStyle = '#d0d0d0';
    ctx.lineWidth = 1;
    ctx.beginPath();
    const startXb = Math.floor(ox / bigGridPx) * bigGridPx;
    const startYb = Math.floor(oy / bigGridPx) * bigGridPx;
    for (let x = startXb; x <= maxX; x += bigGridPx) {
      ctx.moveTo(x, oy);
      ctx.lineTo(x, maxY);
    }
    for (let y = startYb; y <= maxY; y += bigGridPx) {
      ctx.moveTo(ox, y);
      ctx.lineTo(maxX, y);
    }
    ctx.stroke();
  }

  private drawRoom(
    ctx: CanvasRenderingContext2D,
    room: Room,
    scale: number,
    isSelected: boolean,
    showMeasurements: boolean,
    placedFurniture: PlacedFurniture[]
  ) {
    if (room.walls.length === 0) return;

    // Raum-Fläche füllen
    ctx.beginPath();
    ctx.moveTo(room.walls[0].start.x * scale, room.walls[0].start.y * scale);
    for (const wall of room.walls) {
      ctx.lineTo(wall.end.x * scale, wall.end.y * scale);
    }
    ctx.closePath();
    ctx.fillStyle = room.color;
    ctx.fill();

    // Wände zeichnen
    for (const wall of room.walls) {
      this.drawWall(ctx, wall, scale);
    }

    // Öffnungen zeichnen
    for (const opening of room.openings) {
      const wall = room.walls[opening.wall];
      if (wall) {
        this.drawOpening(ctx, wall, opening, scale, room.color);
      }
    }

    // Auswahl-Highlight
    if (isSelected) {
      ctx.beginPath();
      ctx.moveTo(room.walls[0].start.x * scale, room.walls[0].start.y * scale);
      for (const wall of room.walls) {
        ctx.lineTo(wall.end.x * scale, wall.end.y * scale);
      }
      ctx.closePath();
      ctx.strokeStyle = '#1a73e8';
      ctx.lineWidth = 3;
      ctx.setLineDash([8, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    const center = this.getRoomCenter(room, scale);

    // Raumname
    ctx.fillStyle = '#444';
    ctx.font = `bold ${13}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(room.name, center.x, center.y - 8);

    // Raumtyp-Label
    if (room.type && ROOM_TYPE_PRESETS[room.type]) {
      ctx.fillStyle = '#888';
      ctx.font = `${10}px system-ui, sans-serif`;
      ctx.fillText(ROOM_TYPE_PRESETS[room.type].label, center.x, center.y + 8);
    }

    // Fläche und Möbelanzahl
    if (showMeasurements) {
      const areaCm2 = this.calcRoomAreaCm2(room);
      const areaM2 = (areaCm2 / 10000).toFixed(1);
      const furnCount = placedFurniture.filter(f => f.roomId === room.id).length;
      let info = `${areaM2} m²`;
      if (furnCount > 0) info += ` · ${furnCount} Möbel`;
      ctx.fillStyle = '#aaa';
      ctx.font = `${9}px system-ui, sans-serif`;
      ctx.fillText(info, center.x, center.y + (room.type ? 22 : 10));
    }

    // Wandmaße anzeigen
    if (showMeasurements && isSelected) {
      this.drawWallMeasurements(ctx, room, scale);
    }
  }

  private drawWall(ctx: CanvasRenderingContext2D, wall: Wall, scale: number) {
    ctx.beginPath();
    ctx.moveTo(wall.start.x * scale, wall.start.y * scale);
    ctx.lineTo(wall.end.x * scale, wall.end.y * scale);
    ctx.strokeStyle = '#444';
    ctx.lineWidth = wall.thickness * scale * 0.3;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  private drawOpening(ctx: CanvasRenderingContext2D, wall: Wall, opening: Opening, scale: number, roomColor: string) {
    const sx = wall.start.x * scale;
    const sy = wall.start.y * scale;
    const ex = wall.end.x * scale;
    const ey = wall.end.y * scale;

    const pos = opening.position;
    const cx = sx + (ex - sx) * pos;
    const cy = sy + (ey - sy) * pos;
    const halfW = (opening.width * scale) / 2;

    // Wandrichtung normalisieren
    const dx = ex - sx;
    const dy = ey - sy;
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = dx / len;
    const ny = dy / len;

    // Öffnung "durchbrechen" (Raumfarbe über Wand)
    ctx.beginPath();
    ctx.moveTo(cx - nx * halfW, cy - ny * halfW);
    ctx.lineTo(cx + nx * halfW, cy + ny * halfW);
    ctx.strokeStyle = opening.type === 'door' ? roomColor : '#c8e6ff';
    ctx.lineWidth = wall.thickness * scale * 0.35;
    ctx.stroke();

    if (opening.type === 'door') {
      // Tür-Symbol: Bogen
      ctx.beginPath();
      const perpX = -ny;
      const perpY = nx;
      const doorR = halfW;
      const startAngle = Math.atan2(perpY, perpX);
      ctx.arc(cx - nx * halfW, cy - ny * halfW, doorR, startAngle, startAngle + Math.PI / 2, false);
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Türblatt
      ctx.beginPath();
      ctx.moveTo(cx - nx * halfW, cy - ny * halfW);
      ctx.lineTo(
        cx - nx * halfW + (-ny) * halfW,
        cy - ny * halfW + (nx) * halfW
      );
      ctx.strokeStyle = '#888';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else {
      // Fenster: doppelte Linie
      const perpX = -ny;
      const perpY = nx;
      const offset = wall.thickness * scale * 0.1;
      ctx.beginPath();
      ctx.moveTo(cx - nx * halfW + perpX * offset, cy - ny * halfW + perpY * offset);
      ctx.lineTo(cx + nx * halfW + perpX * offset, cy + ny * halfW + perpY * offset);
      ctx.moveTo(cx - nx * halfW - perpX * offset, cy - ny * halfW - perpY * offset);
      ctx.lineTo(cx + nx * halfW - perpX * offset, cy + ny * halfW - perpY * offset);
      ctx.strokeStyle = '#4a90d9';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  private drawWallMeasurements(ctx: CanvasRenderingContext2D, room: Room, scale: number) {
    for (const wall of room.walls) {
      const sx = wall.start.x * scale;
      const sy = wall.start.y * scale;
      const ex = wall.end.x * scale;
      const ey = wall.end.y * scale;
      const dx = ex - sx;
      const dy = ey - sy;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len < 10) continue;

      const midX = (sx + ex) / 2;
      const midY = (sy + ey) / 2;

      // Senkrecht zur Wand versetzt
      const nx = -dy / len;
      const ny = dx / len;
      const offset = 18;

      const labelX = midX + nx * offset;
      const labelY = midY + ny * offset;

      // Länge in Metern berechnen
      const wallLenCm = Math.sqrt(
        (wall.end.x - wall.start.x) ** 2 + (wall.end.y - wall.start.y) ** 2
      );
      const label = wallLenCm >= 100
        ? `${(wallLenCm / 100).toFixed(2)} m`
        : `${Math.round(wallLenCm)} cm`;

      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      const tw = ctx.measureText(label).width;
      ctx.fillRect(labelX - tw / 2 - 3, labelY - 8, tw + 6, 14);
      ctx.fillStyle = '#1a73e8';
      ctx.font = '10px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, labelX, labelY);
      ctx.restore();
    }
  }

  private drawFurniture(ctx: CanvasRenderingContext2D, placed: PlacedFurniture, scale: number, selected: boolean) {
    const def = getDefinitionById(placed.definitionId);
    if (!def) return;

    const px = placed.x * scale;
    const py = placed.y * scale;
    const pw = def.width * scale * placed.scaleX;
    const ph = def.height * scale * placed.scaleY;

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate((placed.rotation * Math.PI) / 180);

    // Möbelkörper
    ctx.fillStyle = def.color;
    ctx.fillRect(-pw / 2, -ph / 2, pw, ph);

    // Dezente innere Kontur
    ctx.strokeStyle = 'rgba(0,0,0,0.15)';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(-pw / 2 + 2, -ph / 2 + 2, pw - 4, ph - 4);

    // Rand
    ctx.strokeStyle = selected ? '#1a73e8' : 'rgba(0,0,0,0.25)';
    ctx.lineWidth = selected ? 2.5 : 1.2;
    ctx.strokeRect(-pw / 2, -ph / 2, pw, ph);

    // Label (benutzerdefiniert oder Standardname)
    const label = placed.label || def.name;
    const minDim = Math.min(pw, ph);

    // Icon
    const iconSize = Math.min(minDim * 0.38, 22);
    if (iconSize >= 8) {
      ctx.font = `${iconSize}px system-ui`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(def.icon, 0, -ph * 0.08);
    }

    // Name
    const nameFontSize = Math.max(7, Math.min(minDim * 0.13, 11));
    ctx.fillStyle = '#333';
    ctx.font = `${nameFontSize}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const maxNameWidth = pw - 4;
    const truncated = this.truncateText(ctx, label, maxNameWidth);
    if (iconSize >= 8) {
      ctx.fillText(truncated, 0, ph / 2 - nameFontSize - 2);
    } else {
      ctx.textBaseline = 'middle';
      ctx.fillText(truncated, 0, 0);
    }

    // Selection-Handles
    if (selected) {
      this.drawSelectionHandles(ctx, pw, ph);
    }

    ctx.restore();
  }

  private truncateText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
    if (ctx.measureText(text).width <= maxWidth) return text;
    let truncated = text;
    while (truncated.length > 0 && ctx.measureText(truncated + '…').width > maxWidth) {
      truncated = truncated.slice(0, -1);
    }
    return truncated + '…';
  }

  private drawSelectionHandles(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const handleSize = 7;
    ctx.fillStyle = '#1a73e8';
    const corners = [
      [-w / 2, -h / 2],
      [w / 2, -h / 2],
      [w / 2, h / 2],
      [-w / 2, h / 2],
    ];
    for (const [cx, cy] of corners) {
      ctx.fillRect(cx - handleSize / 2, cy - handleSize / 2, handleSize, handleSize);
    }

    // Rotation Handle
    ctx.beginPath();
    ctx.moveTo(0, -h / 2);
    ctx.lineTo(0, -h / 2 - 18);
    ctx.strokeStyle = '#1a73e8';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -h / 2 - 22, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#1a73e8';
    ctx.fill();
  }

  private getRoomCenter(room: Room, scale: number): Point {
    let cx = 0, cy = 0;
    for (const wall of room.walls) {
      cx += wall.start.x;
      cy += wall.start.y;
    }
    const n = room.walls.length;
    return { x: (cx / n) * scale, y: (cy / n) * scale };
  }

  /** Fläche des Raums in cm² (Shoelace-Formel) */
  private calcRoomAreaCm2(room: Room): number {
    if (room.walls.length < 3) return 0;
    let area = 0;
    for (const wall of room.walls) {
      area += wall.start.x * wall.end.y - wall.end.x * wall.start.y;
    }
    return Math.abs(area) / 2;
  }

  private drawDrawingPreview(ctx: CanvasRenderingContext2D, scale: number) {
    const ds = this.drawingState!;
    const pts = ds.points;

    // Geschlossene Fläche als Vorschau
    if (pts.length >= 2) {
      ctx.beginPath();
      ctx.moveTo(pts[0].x * scale, pts[0].y * scale);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].x * scale, pts[i].y * scale);
      }
      if (ds.cursorPos) {
        ctx.lineTo(ds.cursorPos.x * scale, ds.cursorPos.y * scale);
      }
      ctx.closePath();
      ctx.fillStyle = 'rgba(26, 115, 232, 0.08)';
      ctx.fill();
    }

    // Gesetzte Wände zeichnen
    ctx.strokeStyle = '#1a73e8';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.setLineDash([]);
    for (let i = 0; i < pts.length - 1; i++) {
      ctx.beginPath();
      ctx.moveTo(pts[i].x * scale, pts[i].y * scale);
      ctx.lineTo(pts[i + 1].x * scale, pts[i + 1].y * scale);
      ctx.stroke();
    }

    // Vorschau-Linie vom letzten Punkt zum Cursor
    if (ds.cursorPos && pts.length > 0) {
      const last = pts[pts.length - 1];
      ctx.setLineDash([6, 4]);
      ctx.strokeStyle = '#1a73e8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(last.x * scale, last.y * scale);
      ctx.lineTo(ds.cursorPos.x * scale, ds.cursorPos.y * scale);
      ctx.stroke();

      // Schließ-Vorschau: gestrichelt zum ersten Punkt
      if (pts.length >= 2) {
        ctx.strokeStyle = 'rgba(26, 115, 232, 0.4)';
        ctx.beginPath();
        ctx.moveTo(ds.cursorPos.x * scale, ds.cursorPos.y * scale);
        ctx.lineTo(pts[0].x * scale, pts[0].y * scale);
        ctx.stroke();
      }

      ctx.setLineDash([]);
    }

    // Punkte als Kreise
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      ctx.beginPath();
      ctx.arc(p.x * scale, p.y * scale, i === 0 ? 7 : 5, 0, Math.PI * 2);
      ctx.fillStyle = i === 0 ? '#ff5722' : '#1a73e8';
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // Snap-Indikator am ersten Punkt
    if (pts.length >= 3 && ds.cursorPos) {
      const first = pts[0];
      const dist = Math.sqrt(
        (ds.cursorPos.x - first.x) ** 2 + (ds.cursorPos.y - first.y) ** 2
      );
      if (dist < 30) {
        ctx.beginPath();
        ctx.arc(first.x * scale, first.y * scale, 12, 0, Math.PI * 2);
        ctx.strokeStyle = '#ff5722';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 3]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Maßanzeige für aktuelle Linie
    if (ds.cursorPos && pts.length > 0) {
      const last = pts[pts.length - 1];
      const dx = ds.cursorPos.x - last.x;
      const dy = ds.cursorPos.y - last.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      if (len > 20) {
        const midX = ((last.x + ds.cursorPos.x) / 2) * scale;
        const midY = ((last.y + ds.cursorPos.y) / 2) * scale;
        const label = len >= 100
          ? `${(len / 100).toFixed(2)} m`
          : `${Math.round(len)} cm`;
        ctx.save();
        const tw = ctx.measureText(label).width;
        ctx.fillStyle = 'rgba(255,255,255,0.92)';
        ctx.fillRect(midX - tw / 2 - 5, midY - 10, tw + 10, 18);
        ctx.strokeStyle = '#1a73e8';
        ctx.lineWidth = 1;
        ctx.strokeRect(midX - tw / 2 - 5, midY - 10, tw + 10, 18);
        ctx.fillStyle = '#1a73e8';
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, midX, midY - 1);
        ctx.restore();
      }
    }
  }

  /** Lineal am oberen und linken Rand */
  private drawRuler(state: AppState, canvasW: number, canvasH: number) {
    const ctx = this.ctx;
    const scale = state.floorPlan.scale;
    const rulerSize = 22;
    const cmPerMeter = 100;

    // Wie viele cm entsprechen 1 Pixel auf dem Canvas?
    // (panOffset.x + worldX * scale * zoom) = canvasX
    // => worldX (cm) = (canvasX - panOffset.x) / (scale * zoom)
    const pixPerCm = scale * state.zoom;

    ctx.save();

    // Hintergrund Lineal
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(rulerSize, 0, canvasW - rulerSize, rulerSize);
    ctx.fillRect(0, rulerSize, rulerSize, canvasH - rulerSize);

    // Ecke
    ctx.fillStyle = '#e8e8e8';
    ctx.fillRect(0, 0, rulerSize, rulerSize);

    // Trennlinien
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(rulerSize, rulerSize);
    ctx.lineTo(canvasW, rulerSize);
    ctx.moveTo(rulerSize, rulerSize);
    ctx.lineTo(rulerSize, canvasH);
    ctx.stroke();

    // Bestimme Schrittweite in cm (so dass Ticks sinnvoll verteilt sind)
    const targetTickPx = 60;
    let stepCm = 10; // start at 10cm
    const steps = [10, 25, 50, 100, 200, 500, 1000];
    for (const s of steps) {
      if (s * pixPerCm >= targetTickPx) { stepCm = s; break; }
    }

    ctx.fillStyle = '#666';
    ctx.font = '9px system-ui, monospace';
    ctx.textBaseline = 'top';
    ctx.textAlign = 'center';

    // Horizontales Lineal (X-Achse)
    const startCmX = Math.floor((-state.panOffset.x) / pixPerCm / stepCm) * stepCm;
    const endCmX = Math.ceil((canvasW - state.panOffset.x) / pixPerCm / stepCm) * stepCm;

    ctx.beginPath();
    for (let cm = startCmX; cm <= endCmX; cm += stepCm) {
      const px = state.panOffset.x + cm * pixPerCm;
      if (px < rulerSize || px > canvasW) continue;
      const isMeter = cm % cmPerMeter === 0;
      const tickH = isMeter ? 12 : 6;
      ctx.moveTo(px, rulerSize - tickH);
      ctx.lineTo(px, rulerSize);
    }
    ctx.strokeStyle = '#aaa';
    ctx.lineWidth = 1;
    ctx.stroke();

    for (let cm = startCmX; cm <= endCmX; cm += stepCm) {
      const px = state.panOffset.x + cm * pixPerCm;
      if (px < rulerSize + 2 || px > canvasW - 2) continue;
      const isMeter = cm % cmPerMeter === 0;
      if (isMeter) {
        ctx.fillStyle = '#555';
        ctx.font = 'bold 9px system-ui, monospace';
        ctx.fillText(`${cm / 100}m`, px, 2);
      } else if (stepCm <= 50) {
        ctx.fillStyle = '#999';
        ctx.font = '8px system-ui, monospace';
        ctx.fillText(`${cm}`, px, 5);
      }
    }

    // Vertikales Lineal (Y-Achse)
    const startCmY = Math.floor((-state.panOffset.y) / pixPerCm / stepCm) * stepCm;
    const endCmY = Math.ceil((canvasH - state.panOffset.y) / pixPerCm / stepCm) * stepCm;

    ctx.beginPath();
    for (let cm = startCmY; cm <= endCmY; cm += stepCm) {
      const py = state.panOffset.y + cm * pixPerCm;
      if (py < rulerSize || py > canvasH) continue;
      const isMeter = cm % cmPerMeter === 0;
      const tickW = isMeter ? 12 : 6;
      ctx.moveTo(rulerSize - tickW, py);
      ctx.lineTo(rulerSize, py);
    }
    ctx.stroke();

    ctx.save();
    ctx.translate(rulerSize / 2, rulerSize);
    ctx.rotate(-Math.PI / 2);
    for (let cm = startCmY; cm <= endCmY; cm += stepCm) {
      const py = state.panOffset.y + cm * pixPerCm;
      if (py < rulerSize + 2 || py > canvasH - 2) continue;
      const isMeter = cm % cmPerMeter === 0;
      if (isMeter) {
        ctx.fillStyle = '#555';
        ctx.font = 'bold 9px system-ui, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${cm / 100}m`, -(py - rulerSize), -2);
      } else if (stepCm <= 50) {
        ctx.fillStyle = '#999';
        ctx.font = '8px system-ui, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${cm}`, -(py - rulerSize), -4);
      }
    }
    ctx.restore();

    ctx.restore();
  }

  /** Ermittelt, welches Möbelstück an der Canvasposition liegt */
  hitTest(state: AppState, canvasX: number, canvasY: number): string | null {
    const scale = state.floorPlan.scale;
    // Rückwärts iterieren (oberstes Element zuerst)
    for (let i = state.placedFurniture.length - 1; i >= 0; i--) {
      const placed = state.placedFurniture[i];
      const def = getDefinitionById(placed.definitionId);
      if (!def) continue;

      // Canvas-Koordinaten in Weltkoordinaten
      const wx = (canvasX - state.panOffset.x) / state.zoom;
      const wy = (canvasY - state.panOffset.y) / state.zoom;

      // Position des Möbels in Pixeln
      const px = placed.x * scale;
      const py = placed.y * scale;

      // Rotation rückgängig machen
      const dx = wx - px;
      const dy = wy - py;
      const angle = (-placed.rotation * Math.PI) / 180;
      const rx = dx * Math.cos(angle) - dy * Math.sin(angle);
      const ry = dx * Math.sin(angle) + dy * Math.cos(angle);

      const hw = (def.width * scale * placed.scaleX) / 2;
      const hh = (def.height * scale * placed.scaleY) / 2;

      if (rx >= -hw && rx <= hw && ry >= -hh && ry <= hh) {
        return placed.id;
      }
    }
    return null;
  }

  /** Ermittelt, welcher Raum an der Canvasposition liegt */
  hitTestRoom(state: AppState, canvasX: number, canvasY: number): string | null {
    const scale = state.floorPlan.scale;
    const wx = (canvasX - state.panOffset.x) / state.zoom;
    const wy = (canvasY - state.panOffset.y) / state.zoom;

    // Rückwärts iterieren (zuletzt gezeichneter Raum oben)
    for (let i = state.floorPlan.rooms.length - 1; i >= 0; i--) {
      const room = state.floorPlan.rooms[i];
      if (room.walls.length < 3) continue;

      const pts = room.walls.map(w => ({ x: w.start.x * scale, y: w.start.y * scale }));
      if (this.pointInPolygon(wx, wy, pts)) {
        return room.id;
      }
    }
    return null;
  }

  /** Ray-Casting Algorithmus: Punkt in Polygon */
  private pointInPolygon(x: number, y: number, poly: Point[]): boolean {
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i].x, yi = poly[i].y;
      const xj = poly[j].x, yj = poly[j].y;
      const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  /** Ermittelt, in welchem Raum ein Weltpunkt liegt */
  getRoomAtWorldPoint(state: AppState, wx: number, wy: number): string | null {
    const scale = state.floorPlan.scale;
    for (let i = state.floorPlan.rooms.length - 1; i >= 0; i--) {
      const room = state.floorPlan.rooms[i];
      if (room.walls.length < 3) continue;
      const pts = room.walls.map(w => ({ x: w.start.x * scale, y: w.start.y * scale }));
      if (this.pointInPolygon(wx * scale, wy * scale, pts)) {
        return room.id;
      }
    }
    return null;
  }

  /** Canvas-Koordinaten in Welt-cm umrechnen */
  canvasToWorld(state: AppState, canvasX: number, canvasY: number): Point {
    const scale = state.floorPlan.scale;
    return {
      x: (canvasX - state.panOffset.x) / state.zoom / scale,
      y: (canvasY - state.panOffset.y) / state.zoom / scale,
    };
  }
}
