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

export type RoomType =
  | 'klassenzimmer'
  | 'physik'
  | 'chemie'
  | 'biologie'
  | 'technik'
  | 'aes'
  | 'kunst'
  | 'musik'
  | 'informatik'
  | 'sport'
  | 'verwaltung'
  | 'lehrerzimmer'
  | 'bibliothek'
  | 'wc'
  | 'flur'
  | 'sonstiges';

export interface RoomTypePreset {
  label: string;
  color: string;
  suggestedCategory: FurnitureCategory | null;
}

export const ROOM_TYPE_PRESETS: Record<RoomType, RoomTypePreset> = {
  klassenzimmer: { label: 'Klassenzimmer', color: '#d6eaf8', suggestedCategory: 'allgemein' },
  physik:        { label: 'Fachraum Physik', color: '#d5f5e3', suggestedCategory: 'physik' },
  chemie:        { label: 'Fachraum Chemie', color: '#fef9e7', suggestedCategory: 'chemie' },
  biologie:      { label: 'Fachraum Biologie', color: '#e8f8f5', suggestedCategory: 'biologie' },
  technik:       { label: 'Fachraum Technik', color: '#fdebd0', suggestedCategory: 'technik' },
  aes:           { label: 'Fachraum AES', color: '#fdf2f8', suggestedCategory: 'aes' },
  kunst:         { label: 'Fachraum Kunst', color: '#f9f3e8', suggestedCategory: 'kunst' },
  musik:         { label: 'Fachraum Musik', color: '#f4ecf7', suggestedCategory: 'musik' },
  informatik:    { label: 'Fachraum Informatik', color: '#eaf4fb', suggestedCategory: 'informatik' },
  sport:         { label: 'Sporthalle / Gym', color: '#fce4e4', suggestedCategory: 'sport' },
  verwaltung:    { label: 'Büro / Verwaltung', color: '#e8e8e8', suggestedCategory: 'verwaltung' },
  lehrerzimmer:  { label: 'Lehrerzimmer', color: '#d6dbdf', suggestedCategory: 'verwaltung' },
  bibliothek:    { label: 'Bibliothek / Mediothek', color: '#f5eef8', suggestedCategory: 'allgemein' },
  wc:            { label: 'WC / Sanitär', color: '#d4e6f1', suggestedCategory: null },
  flur:          { label: 'Flur / Treppenhaus', color: '#f8f9fa', suggestedCategory: null },
  sonstiges:     { label: 'Sonstiges', color: '#fdfefe', suggestedCategory: null },
};

export interface Room {
  id: string;
  name: string;
  type?: RoomType;
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
  | 'biologie'
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
  roomId?: string;
  label?: string;
}

export interface AppState {
  floorPlan: FloorPlan;
  placedFurniture: PlacedFurniture[];
  selectedFurnitureId: string | null;
  selectedRoomId: string | null;
  draggedDefinition: FurnitureDefinition | null;
  tool: 'select' | 'pan' | 'draw-wall';
  zoom: number;
  panOffset: Point;
  gridVisible: boolean;
  gridSize: number;
  snapToGrid: boolean;
  showMeasurements: boolean;
  showRuler: boolean;
}
