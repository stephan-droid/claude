/** 2D-Punkt */
export interface Point {
  x: number;
  y: number;
}

/** Eine Wand im Grundriss */
export interface Wall {
  start: Point;
  end: Point;
  thickness: number; // in cm
}

/** Tür- oder Fensteröffnung */
export interface Opening {
  type: 'door' | 'window';
  wall: number; // Index der zugehörigen Wand
  position: number; // 0-1 relative Position entlang der Wand
  width: number; // in cm
}

/** Ein Raum im Grundriss */
export interface Room {
  id: string;
  name: string;
  walls: Wall[];
  openings: Opening[];
  color: string;
}

/** Grundriss mit Räumen */
export interface FloorPlan {
  id: string;
  name: string;
  rooms: Room[];
  scale: number; // Pixel pro cm
}

/** Möbelkategorie */
export type FurnitureCategory =
  | 'allgemein'
  | 'physik'
  | 'chemie'
  | 'kunst'
  | 'musik'
  | 'informatik'
  | 'sport'
  | 'verwaltung';

/** Definition eines Möbelstücks im Katalog */
export interface FurnitureDefinition {
  id: string;
  name: string;
  category: FurnitureCategory;
  width: number;  // in cm
  height: number; // in cm (Tiefe im Grundriss)
  color: string;
  icon: string;   // Emoji oder Text-Icon
}

/** Platziertes Möbelstück auf dem Grundriss */
export interface PlacedFurniture {
  id: string;
  definitionId: string;
  x: number;
  y: number;
  rotation: number; // Grad
  scaleX: number;
  scaleY: number;
}

/** Aktueller Zustand der Anwendung */
export interface AppState {
  floorPlan: FloorPlan;
  placedFurniture: PlacedFurniture[];
  selectedFurnitureId: string | null;
  draggedDefinition: FurnitureDefinition | null;
  tool: 'select' | 'pan' | 'draw-wall';
  zoom: number;
  panOffset: Point;
  gridVisible: boolean;
  gridSize: number; // in cm
  snapToGrid: boolean;
}
