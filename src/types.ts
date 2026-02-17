export interface Point {
  x: number;
  y: number;
}

export interface Wall {
  start: Point;
  end: Point;
  thickness: number;
}

export interface Opening {
  type: 'door' | 'window';
  wall: number;
  position: number;
  width: number;
}

export interface Room {
  id: string;
  name: string;
  walls: Wall[];
  openings: Opening[];
  color: string;
}

export interface FloorPlan {
  id: string;
  name: string;
  rooms: Room[];
  scale: number;
}

export type FurnitureCategory =
  | 'allgemein'
  | 'physik'
  | 'chemie'
  | 'kunst'
  | 'musik'
  | 'informatik'
  | 'technik'
  | 'aes'
  | 'sport'
  | 'verwaltung';

export interface FurnitureDefinition {
  id: string;
  name: string;
  category: FurnitureCategory;
  width: number;
  height: number;
  color: string;
  icon: string;
}

export interface PlacedFurniture {
  id: string;
  definitionId: string;
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

export interface AppState {
  floorPlan: FloorPlan;
  placedFurniture: PlacedFurniture[];
  selectedFurnitureId: string | null;
  draggedDefinition: FurnitureDefinition | null;
  tool: 'select' | 'pan' | 'draw-wall';
  zoom: number;
  panOffset: Point;
  gridVisible: boolean;
  gridSize: number;
  snapToGrid: boolean;
}
