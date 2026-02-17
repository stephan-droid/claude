import { AppState, Room, Wall, Opening, PlacedFurniture, Point } from './types';
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
    ctx.fillStyle = '#f8f8f8';
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
      this.drawRoom(ctx, room, scale);
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
      ctx.globalAlpha = 1;
    }

    ctx.restore();
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
  }

  private drawRoom(ctx: CanvasRenderingContext2D, room: Room, scale: number) {
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
        this.drawOpening(ctx, wall, opening, scale);
      }
    }

    // Raumname in der Mitte
    const center = this.getRoomCenter(room, scale);
    ctx.fillStyle = '#666';
    ctx.font = `${12}px system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(room.name, center.x, center.y);
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

  private drawOpening(ctx: CanvasRenderingContext2D, wall: Wall, opening: Opening, scale: number) {
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

    // Öffnung "durchbrechen" (weiß über Wand)
    ctx.beginPath();
    ctx.moveTo(cx - nx * halfW, cy - ny * halfW);
    ctx.lineTo(cx + nx * halfW, cy + ny * halfW);
    ctx.strokeStyle = opening.type === 'door' ? '#faf3e8' : '#e8f4ff';
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
      ctx.strokeStyle = '#999';
      ctx.lineWidth = 1;
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

    // Rand
    ctx.strokeStyle = selected ? '#2196F3' : '#00000030';
    ctx.lineWidth = selected ? 2.5 : 1;
    ctx.strokeRect(-pw / 2, -ph / 2, pw, ph);

    // Icon
    ctx.fillStyle = '#fff';
    ctx.font = `${Math.min(pw, ph) * 0.4}px system-ui`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(def.icon, 0, 0);

    // Name (klein)
    ctx.fillStyle = '#333';
    ctx.font = `${Math.max(8, Math.min(pw, ph) * 0.12)}px system-ui, sans-serif`;
    ctx.fillText(def.name, 0, ph / 2 + 10);

    // Selection-Handles
    if (selected) {
      this.drawSelectionHandles(ctx, pw, ph);
    }

    ctx.restore();
  }

  private drawSelectionHandles(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const handleSize = 8;
    ctx.fillStyle = '#2196F3';
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
    ctx.lineTo(0, -h / 2 - 20);
    ctx.strokeStyle = '#2196F3';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, -h / 2 - 24, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#2196F3';
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
        const label = `${Math.round(len)} cm`;
        ctx.save();
        ctx.fillStyle = '#1a73e8';
        ctx.font = 'bold 11px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        // Hintergrund
        const tw = ctx.measureText(label).width;
        ctx.fillStyle = 'rgba(255,255,255,0.85)';
        ctx.fillRect(midX - tw / 2 - 4, midY - 16, tw + 8, 16);
        ctx.fillStyle = '#1a73e8';
        ctx.fillText(label, midX, midY - 2);
        ctx.restore();
      }
    }
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

  /** Canvas-Koordinaten in Welt-cm umrechnen */
  canvasToWorld(state: AppState, canvasX: number, canvasY: number): Point {
    const scale = state.floorPlan.scale;
    return {
      x: (canvasX - state.panOffset.x) / state.zoom / scale,
      y: (canvasY - state.panOffset.y) / state.zoom / scale,
    };
  }
}
