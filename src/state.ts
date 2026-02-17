import { AppState, FloorPlan, PlacedFurniture, FurnitureDefinition, Point, Room, Wall, Opening } from './types';

type Listener = () => void;

/** Beispiel-Grundriss: Schulgebäude (Erdgeschoss-Flügel) */
function createDefaultFloorPlan(): FloorPlan {
  return {
    id: 'default',
    name: 'Schulgebäude – EG Fachräume',
    scale: 1.5, // 1.5 Pixel pro cm
    rooms: [
      // ── Flur (durchgehend, mittig) ──
      {
        id: 'flur',
        name: 'Flur',
        color: '#f0ece4',
        walls: [
          { start: { x: 0, y: 350 }, end: { x: 1400, y: 350 }, thickness: 25 },
          { start: { x: 1400, y: 350 }, end: { x: 1400, y: 500 }, thickness: 25 },
          { start: { x: 1400, y: 500 }, end: { x: 0, y: 500 }, thickness: 25 },
          { start: { x: 0, y: 500 }, end: { x: 0, y: 350 }, thickness: 25 },
        ],
        openings: [
          { type: 'door', wall: 0, position: 0.03, width: 100 },
          { type: 'door', wall: 2, position: 0.97, width: 100 },
        ],
      },
      // ── Klassenzimmer 1 (oben links) ──
      {
        id: 'klasse-1',
        name: 'Klassenzimmer 1',
        color: '#faf3e8',
        walls: [
          { start: { x: 0, y: 0 }, end: { x: 450, y: 0 }, thickness: 25 },
          { start: { x: 450, y: 0 }, end: { x: 450, y: 330 }, thickness: 25 },
          { start: { x: 450, y: 330 }, end: { x: 0, y: 330 }, thickness: 25 },
          { start: { x: 0, y: 330 }, end: { x: 0, y: 0 }, thickness: 25 },
        ],
        openings: [
          { type: 'door', wall: 2, position: 0.85, width: 100 },
          { type: 'window', wall: 0, position: 0.25, width: 150 },
          { type: 'window', wall: 0, position: 0.65, width: 150 },
        ],
      },
      // ── Physikraum (oben mitte) ──
      {
        id: 'physik',
        name: 'Physikraum',
        color: '#e8eef5',
        walls: [
          { start: { x: 470, y: 0 }, end: { x: 950, y: 0 }, thickness: 25 },
          { start: { x: 950, y: 0 }, end: { x: 950, y: 330 }, thickness: 25 },
          { start: { x: 950, y: 330 }, end: { x: 470, y: 330 }, thickness: 25 },
          { start: { x: 470, y: 330 }, end: { x: 470, y: 0 }, thickness: 25 },
        ],
        openings: [
          { type: 'door', wall: 2, position: 0.12, width: 100 },
          { type: 'window', wall: 0, position: 0.3, width: 150 },
          { type: 'window', wall: 0, position: 0.7, width: 150 },
        ],
      },
      // ── Chemieraum (oben rechts) ──
      {
        id: 'chemie',
        name: 'Chemieraum',
        color: '#eef5e8',
        walls: [
          { start: { x: 970, y: 0 }, end: { x: 1400, y: 0 }, thickness: 25 },
          { start: { x: 1400, y: 0 }, end: { x: 1400, y: 330 }, thickness: 25 },
          { start: { x: 1400, y: 330 }, end: { x: 970, y: 330 }, thickness: 25 },
          { start: { x: 970, y: 330 }, end: { x: 970, y: 0 }, thickness: 25 },
        ],
        openings: [
          { type: 'door', wall: 2, position: 0.15, width: 100 },
          { type: 'window', wall: 1, position: 0.3, width: 150 },
          { type: 'window', wall: 1, position: 0.7, width: 150 },
        ],
      },
      // ── Kunstraum (unten links) ──
      {
        id: 'kunst',
        name: 'Kunstraum',
        color: '#f5eee8',
        walls: [
          { start: { x: 0, y: 520 }, end: { x: 450, y: 520 }, thickness: 25 },
          { start: { x: 450, y: 520 }, end: { x: 450, y: 850 }, thickness: 25 },
          { start: { x: 450, y: 850 }, end: { x: 0, y: 850 }, thickness: 25 },
          { start: { x: 0, y: 850 }, end: { x: 0, y: 520 }, thickness: 25 },
        ],
        openings: [
          { type: 'door', wall: 0, position: 0.85, width: 100 },
          { type: 'window', wall: 2, position: 0.25, width: 150 },
          { type: 'window', wall: 2, position: 0.65, width: 150 },
        ],
      },
      // ── Musikraum (unten mitte) ──
      {
        id: 'musik',
        name: 'Musikraum',
        color: '#f0e8f5',
        walls: [
          { start: { x: 470, y: 520 }, end: { x: 950, y: 520 }, thickness: 25 },
          { start: { x: 950, y: 520 }, end: { x: 950, y: 850 }, thickness: 25 },
          { start: { x: 950, y: 850 }, end: { x: 470, y: 850 }, thickness: 25 },
          { start: { x: 470, y: 850 }, end: { x: 470, y: 520 }, thickness: 25 },
        ],
        openings: [
          { type: 'door', wall: 0, position: 0.12, width: 100 },
          { type: 'window', wall: 2, position: 0.3, width: 150 },
          { type: 'window', wall: 2, position: 0.7, width: 150 },
        ],
      },
      // ── Informatikraum (unten rechts) ──
      {
        id: 'informatik',
        name: 'Informatikraum',
        color: '#e8f0f5',
        walls: [
          { start: { x: 970, y: 520 }, end: { x: 1400, y: 520 }, thickness: 25 },
          { start: { x: 1400, y: 520 }, end: { x: 1400, y: 850 }, thickness: 25 },
          { start: { x: 1400, y: 850 }, end: { x: 970, y: 850 }, thickness: 25 },
          { start: { x: 970, y: 850 }, end: { x: 970, y: 520 }, thickness: 25 },
        ],
        openings: [
          { type: 'door', wall: 0, position: 0.15, width: 100 },
          { type: 'window', wall: 1, position: 0.3, width: 150 },
          { type: 'window', wall: 1, position: 0.7, width: 150 },
        ],
      },
    ],
  };
}

class Store {
  private state: AppState;
  private listeners: Set<Listener> = new Set();

  constructor() {
    this.state = {
      floorPlan: createDefaultFloorPlan(),
      placedFurniture: [],
      selectedFurnitureId: null,
      draggedDefinition: null,
      tool: 'select',
      zoom: 1,
      panOffset: { x: 60, y: 60 },
      gridVisible: true,
      gridSize: 50,
      snapToGrid: true,
    };
  }

  getState(): AppState {
    return this.state;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    for (const l of this.listeners) l();
  }

  private update(partial: Partial<AppState>) {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  setTool(tool: AppState['tool']) {
    this.update({ tool, selectedFurnitureId: null });
  }

  setZoom(zoom: number) {
    this.update({ zoom: Math.max(0.2, Math.min(3, zoom)) });
  }

  setPanOffset(offset: Point) {
    this.update({ panOffset: offset });
  }

  toggleGrid() {
    this.update({ gridVisible: !this.state.gridVisible });
  }

  toggleSnap() {
    this.update({ snapToGrid: !this.state.snapToGrid });
  }

  setDraggedDefinition(def: FurnitureDefinition | null) {
    this.update({ draggedDefinition: def });
  }

  placeFurniture(definitionId: string, x: number, y: number): string {
    const id = `placed-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const item: PlacedFurniture = {
      id,
      definitionId,
      x: this.state.snapToGrid ? this.snapValue(x) : x,
      y: this.state.snapToGrid ? this.snapValue(y) : y,
      rotation: 0,
      scaleX: 1,
      scaleY: 1,
    };
    this.update({
      placedFurniture: [...this.state.placedFurniture, item],
      selectedFurnitureId: id,
      draggedDefinition: null,
    });
    return id;
  }

  selectFurniture(id: string | null) {
    this.update({ selectedFurnitureId: id });
  }

  moveFurniture(id: string, x: number, y: number) {
    const fx = this.state.snapToGrid ? this.snapValue(x) : x;
    const fy = this.state.snapToGrid ? this.snapValue(y) : y;
    this.update({
      placedFurniture: this.state.placedFurniture.map(f =>
        f.id === id ? { ...f, x: fx, y: fy } : f
      ),
    });
  }

  rotateFurniture(id: string, degrees: number) {
    this.update({
      placedFurniture: this.state.placedFurniture.map(f =>
        f.id === id ? { ...f, rotation: (f.rotation + degrees) % 360 } : f
      ),
    });
  }

  deleteFurniture(id: string) {
    this.update({
      placedFurniture: this.state.placedFurniture.filter(f => f.id !== id),
      selectedFurnitureId: this.state.selectedFurnitureId === id ? null : this.state.selectedFurnitureId,
    });
  }

  deleteSelected() {
    if (this.state.selectedFurnitureId) {
      this.deleteFurniture(this.state.selectedFurnitureId);
    }
  }

  duplicateSelected() {
    const sel = this.state.placedFurniture.find(f => f.id === this.state.selectedFurnitureId);
    if (!sel) return;
    const id = `placed-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const clone: PlacedFurniture = { ...sel, id, x: sel.x + 30, y: sel.y + 30 };
    this.update({
      placedFurniture: [...this.state.placedFurniture, clone],
      selectedFurnitureId: id,
    });
  }

  setFloorPlan(fp: FloorPlan) {
    this.update({ floorPlan: fp, placedFurniture: [], selectedFurnitureId: null });
  }

  loadProject(fp: FloorPlan, furniture: PlacedFurniture[]) {
    this.update({ floorPlan: fp, placedFurniture: furniture, selectedFurnitureId: null });
  }

  clearFurniture() {
    this.update({ placedFurniture: [], selectedFurnitureId: null });
  }

  // ── Grundriss-Bearbeitung ──

  updateFloorPlanName(name: string) {
    this.update({
      floorPlan: { ...this.state.floorPlan, name },
    });
  }

  addRoom(room: Room) {
    this.update({
      floorPlan: {
        ...this.state.floorPlan,
        rooms: [...this.state.floorPlan.rooms, room],
      },
    });
  }

  updateRoom(roomId: string, changes: Partial<Room>) {
    this.update({
      floorPlan: {
        ...this.state.floorPlan,
        rooms: this.state.floorPlan.rooms.map(r =>
          r.id === roomId ? { ...r, ...changes } : r
        ),
      },
    });
  }

  /** Update room geometry from a simple rectangle (x, y, w, h in cm) */
  updateRoomRect(roomId: string, x: number, y: number, w: number, h: number) {
    const room = this.state.floorPlan.rooms.find(r => r.id === roomId);
    if (!room) return;
    const thickness = room.walls[0]?.thickness ?? 25;
    const walls: Wall[] = [
      { start: { x, y }, end: { x: x + w, y }, thickness },
      { start: { x: x + w, y }, end: { x: x + w, y: y + h }, thickness },
      { start: { x: x + w, y: y + h }, end: { x, y: y + h }, thickness },
      { start: { x, y: y + h }, end: { x, y }, thickness },
    ];
    this.updateRoom(roomId, { walls });
  }

  removeRoom(roomId: string) {
    this.update({
      floorPlan: {
        ...this.state.floorPlan,
        rooms: this.state.floorPlan.rooms.filter(r => r.id !== roomId),
      },
    });
  }

  addOpening(roomId: string, opening: Opening) {
    const room = this.state.floorPlan.rooms.find(r => r.id === roomId);
    if (!room) return;
    this.updateRoom(roomId, { openings: [...room.openings, opening] });
  }

  removeOpening(roomId: string, index: number) {
    const room = this.state.floorPlan.rooms.find(r => r.id === roomId);
    if (!room) return;
    this.updateRoom(roomId, {
      openings: room.openings.filter((_, i) => i !== index),
    });
  }

  private snapValue(v: number): number {
    const g = this.state.gridSize;
    return Math.round(v / g) * g;
  }
}

export const store = new Store();
