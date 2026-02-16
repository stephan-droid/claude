import { FurnitureCategory, FurnitureDefinition } from './types';

export const CATEGORY_LABELS: Record<FurnitureCategory, string> = {
  sitzmoebel: 'Sitzmöbel',
  tische: 'Tische',
  schraenke: 'Schränke',
  betten: 'Betten',
  kueche: 'Küche',
  bad: 'Bad',
  elektronik: 'Elektronik',
  dekoration: 'Dekoration',
};

export const FURNITURE_CATALOG: FurnitureDefinition[] = [
  // Sitzmöbel
  { id: 'sofa-3', name: 'Sofa (3-Sitzer)', category: 'sitzmoebel', width: 220, height: 90, color: '#6b8cae', icon: '🛋️' },
  { id: 'sofa-2', name: 'Sofa (2-Sitzer)', category: 'sitzmoebel', width: 160, height: 85, color: '#7a9bb5', icon: '🛋️' },
  { id: 'sessel', name: 'Sessel', category: 'sitzmoebel', width: 85, height: 85, color: '#8baabf', icon: '🪑' },
  { id: 'stuhl', name: 'Stuhl', category: 'sitzmoebel', width: 45, height: 45, color: '#a0522d', icon: '🪑' },
  { id: 'hocker', name: 'Hocker', category: 'sitzmoebel', width: 40, height: 40, color: '#b8860b', icon: '🪑' },
  { id: 'ecksofa', name: 'Ecksofa', category: 'sitzmoebel', width: 260, height: 200, color: '#5a7a9a', icon: '🛋️' },

  // Tische
  { id: 'esstisch-6', name: 'Esstisch (6 Pers.)', category: 'tische', width: 180, height: 90, color: '#deb887', icon: '🪵' },
  { id: 'esstisch-4', name: 'Esstisch (4 Pers.)', category: 'tische', width: 120, height: 80, color: '#d2b48c', icon: '🪵' },
  { id: 'couchtisch', name: 'Couchtisch', category: 'tische', width: 120, height: 60, color: '#c4a882', icon: '🪵' },
  { id: 'schreibtisch', name: 'Schreibtisch', category: 'tische', width: 140, height: 70, color: '#b89e78', icon: '🖥️' },
  { id: 'beistelltisch', name: 'Beistelltisch', category: 'tische', width: 50, height: 50, color: '#cdb79e', icon: '🪵' },
  { id: 'stehtisch', name: 'Stehtisch', category: 'tische', width: 70, height: 70, color: '#c8a96e', icon: '🪵' },

  // Schränke
  { id: 'kleiderschrank-2', name: 'Kleiderschrank (2-türig)', category: 'schraenke', width: 100, height: 60, color: '#8b7355', icon: '🗄️' },
  { id: 'kleiderschrank-3', name: 'Kleiderschrank (3-türig)', category: 'schraenke', width: 150, height: 60, color: '#7d6548', icon: '🗄️' },
  { id: 'kommode', name: 'Kommode', category: 'schraenke', width: 80, height: 45, color: '#9b8b75', icon: '🗄️' },
  { id: 'regal', name: 'Bücherregal', category: 'schraenke', width: 80, height: 35, color: '#a0956b', icon: '📚' },
  { id: 'sideboard', name: 'Sideboard', category: 'schraenke', width: 160, height: 45, color: '#8b8068', icon: '🗄️' },
  { id: 'vitrine', name: 'Vitrine', category: 'schraenke', width: 80, height: 40, color: '#9e9080', icon: '🗄️' },

  // Betten
  { id: 'doppelbett', name: 'Doppelbett', category: 'betten', width: 180, height: 210, color: '#b0c4de', icon: '🛏️' },
  { id: 'einzelbett', name: 'Einzelbett', category: 'betten', width: 100, height: 210, color: '#a8b8cc', icon: '🛏️' },
  { id: 'kinderbett', name: 'Kinderbett', category: 'betten', width: 70, height: 140, color: '#c0d0e0', icon: '🛏️' },
  { id: 'nachttisch', name: 'Nachttisch', category: 'betten', width: 45, height: 40, color: '#9b8b75', icon: '🪵' },

  // Küche
  { id: 'kuechenzeile', name: 'Küchenzeile', category: 'kueche', width: 240, height: 60, color: '#c0c0c0', icon: '🍳' },
  { id: 'kuehlschrank', name: 'Kühlschrank', category: 'kueche', width: 60, height: 65, color: '#e8e8e8', icon: '🧊' },
  { id: 'herd', name: 'Herd/Ofen', category: 'kueche', width: 60, height: 60, color: '#404040', icon: '♨️' },
  { id: 'spuelmaschine', name: 'Spülmaschine', category: 'kueche', width: 60, height: 60, color: '#d0d0d0', icon: '🫧' },
  { id: 'kuecheninsel', name: 'Kücheninsel', category: 'kueche', width: 150, height: 80, color: '#b8b8b8', icon: '🍽️' },

  // Bad
  { id: 'badewanne', name: 'Badewanne', category: 'bad', width: 170, height: 75, color: '#e0f0ff', icon: '🛁' },
  { id: 'dusche', name: 'Duschkabine', category: 'bad', width: 90, height: 90, color: '#d0e8f8', icon: '🚿' },
  { id: 'waschbecken', name: 'Waschbecken', category: 'bad', width: 60, height: 45, color: '#f0f8ff', icon: '🚰' },
  { id: 'toilette', name: 'Toilette', category: 'bad', width: 40, height: 65, color: '#f5f5f5', icon: '🚽' },
  { id: 'waschmaschine', name: 'Waschmaschine', category: 'bad', width: 60, height: 60, color: '#e0e0e0', icon: '🫧' },

  // Elektronik
  { id: 'fernseher', name: 'TV / Fernseher', category: 'elektronik', width: 120, height: 10, color: '#2c2c2c', icon: '📺' },
  { id: 'tv-moebel', name: 'TV-Möbel', category: 'elektronik', width: 150, height: 45, color: '#5c5c5c', icon: '📺' },
  { id: 'pc-turm', name: 'PC-Tower', category: 'elektronik', width: 20, height: 45, color: '#3c3c3c', icon: '🖥️' },
  { id: 'drucker', name: 'Drucker', category: 'elektronik', width: 45, height: 35, color: '#4c4c4c', icon: '🖨️' },

  // Dekoration
  { id: 'teppich-gross', name: 'Teppich (groß)', category: 'dekoration', width: 200, height: 300, color: '#d4a574', icon: '🟫' },
  { id: 'teppich-klein', name: 'Teppich (klein)', category: 'dekoration', width: 120, height: 170, color: '#c89660', icon: '🟫' },
  { id: 'pflanze-gross', name: 'Pflanze (groß)', category: 'dekoration', width: 50, height: 50, color: '#228b22', icon: '🌿' },
  { id: 'pflanze-klein', name: 'Pflanze (klein)', category: 'dekoration', width: 30, height: 30, color: '#32cd32', icon: '🪴' },
  { id: 'stehlampe', name: 'Stehlampe', category: 'dekoration', width: 35, height: 35, color: '#ffd700', icon: '💡' },
];

export function getCatalogByCategory(): Map<FurnitureCategory, FurnitureDefinition[]> {
  const map = new Map<FurnitureCategory, FurnitureDefinition[]>();
  for (const item of FURNITURE_CATALOG) {
    const list = map.get(item.category) || [];
    list.push(item);
    map.set(item.category, list);
  }
  return map;
}

export function getDefinitionById(id: string): FurnitureDefinition | undefined {
  return FURNITURE_CATALOG.find(f => f.id === id);
}
