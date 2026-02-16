import { AppState, Room, Wall, Opening, PlacedFurniture, Point } from './types';
import { getDefinitionById } from './catalog';

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
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
