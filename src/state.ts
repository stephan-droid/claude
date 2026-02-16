import { AppState, FloorPlan, PlacedFurniture, FurnitureDefinition, Point } from './types';

type Listener = () => void;

/** Beispiel-Grundriss: L-förmige Wohnung */
function createDefaultFloorPlan(): FloorPlan {
  return {
    id: 'default',
    name: 'Beispielwohnung',
    scale: 2, // 2 Pixel pro cm
    rooms: [
      {
        id: 'wohnzimmer',
        name: 'Wohnzimmer',
        color: '#faf3e8',
        walls: [
          { start: { x: 0, y: 0 }, end: { x: 500, y: 0 }, thickness: 20 },
          { start: { x: 500, y: 0 }, end: { x: 500, y: 400 }, thickness: 20 },
          { start: { x: 500, y: 400 }, end: { x: 0, y: 400 }, thickness: 20 },
          { start: { x: 0, y: 400 }, end: { x: 0, y: 0 }, thickness: 20 },
        ],
        openings: [
          { type: 'door', wall: 1, position: 0.5, width: 90 },
          { type: 'window', wall: 0, position: 0.3, width: 120 },
          { type: 'window', wall: 0, position: 0.7, width: 120 },
        ],
      },
      {
        id: 'schlafzimmer',
        name: 'Schlafzimmer',
        color: '#e8eef5',
        walls: [
          { start: { x: 520, y: 0 }, end: { x: 880, y: 0 }, thickness: 20 },
          { start: { x: 880, y: 0 }, end: { x: 880, y: 350 }, thickness: 20 },
          { start: { x: 880, y: 350 }, end: { x: 520, y: 350 }, thickness: 20 },
          { start: { x: 520, y: 350 }, end: { x: 520, y: 0 }, thickness: 20 },
        ],
        openings: [
          { type: 'door', wall: 3, position: 0.4, width: 80 },
          { type: 'window', wall: 1, position: 0.5, width: 140 },
        ],
      },
      {
        id: 'kueche',
        name: 'Küche',
        color: '#eef5e8',
        walls: [
          { start: { x: 0, y: 420 }, end: { x: 300, y: 420 }, thickness: 20 },
          { start: { x: 300, y: 420 }, end: { x: 300, y: 620 }, thickness: 20 },
          { start: { x: 300, y: 620 }, end: { x: 0, y: 620 }, thickness: 20 },
          { start: { x: 0, y: 620 }, end: { x: 0, y: 420 }, thickness: 20 },
        ],
        openings: [
          { type: 'door', wall: 0, position: 0.6, width: 80 },
          { type: 'window', wall: 2, position: 0.5, width: 100 },
        ],
      },
      {
        id: 'bad',
        name: 'Bad',
        color: '#e8f0f5',
        walls: [
          { start: { x: 320, y: 420 }, end: { x: 500, y: 420 }, thickness: 20 },
          { start: { x: 500, y: 420 }, end: { x: 500, y: 620 }, thickness: 20 },
          { start: { x: 500, y: 620 }, end: { x: 320, y: 620 }, thickness: 20 },
          { start: { x: 320, y: 620 }, end: { x: 320, y: 420 }, thickness: 20 },
        ],
        openings: [
          { type: 'door', wall: 0, position: 0.4, width: 70 },
          { type: 'window', wall: 2, position: 0.5, width: 60 },
        ],
      },
      {
        id: 'flur',
        name: 'Flur',
        color: '#f0ece4',
        walls: [
          { start: { x: 520, y: 370 }, end: { x: 880, y: 370 }, thickness: 20 },
          { start: { x: 880, y: 370 }, end: { x: 880, y: 500 }, thickness: 20 },
          { start: { x: 880, y: 500 }, end: { x: 520, y: 500 }, thickness: 20 },
          { start: { x: 520, y: 500 }, end: { x: 520, y: 370 }, thickness: 20 },
        ],
        openings: [
          { type: 'door', wall: 2, position: 0.8, width: 90 },
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

  private snapValue(v: number): number {
    const g = this.state.gridSize;
    return Math.round(v / g) * g;
  }
}

export const store = new Store();
