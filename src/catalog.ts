import { FurnitureCategory, FurnitureDefinition } from './types';

export const CATEGORY_LABELS: Record<FurnitureCategory, string> = {
  allgemein: 'Allgemein / Klassenzimmer',
  physik: 'Physik',
  chemie: 'Chemie',
  technik: 'Technik (Werken / Holz / Metall)',
  aes: 'AES (Ernährung / Textil / Soziales)',
  kunst: 'Kunst',
  musik: 'Musik',
  informatik: 'Informatik',
  sport: 'Sport / Turnhalle',
  verwaltung: 'Verwaltung / Lehrerzimmer',
};

export const FURNITURE_CATALOG: FurnitureDefinition[] = [
  // Allgemein / Klassenzimmer
  { id: 'schuelertisch-1', name: 'Schülertisch (Einzel)', category: 'allgemein', width: 70, height: 50, color: '#d2b48c', icon: '📐' },
  { id: 'schuelertisch-2', name: 'Schülertisch (Doppel)', category: 'allgemein', width: 130, height: 50, color: '#c4a882', icon: '📐' },
  { id: 'schuelerstuhl', name: 'Schülerstuhl', category: 'allgemein', width: 42, height: 42, color: '#4a90d9', icon: '🪑' },
  { id: 'lehrerpult', name: 'Lehrerpult', category: 'allgemein', width: 160, height: 70, color: '#8b7355', icon: '🏫' },
  { id: 'lehrerstuhl', name: 'Lehrerstuhl (Dreh)', category: 'allgemein', width: 50, height: 50, color: '#333', icon: '🪑' },
  { id: 'tafel', name: 'Schultafel', category: 'allgemein', width: 300, height: 15, color: '#2d5a27', icon: '📝' },
  { id: 'whiteboard', name: 'Whiteboard', category: 'allgemein', width: 240, height: 12, color: '#f0f0f0', icon: '🤍' },
  { id: 'smartboard', name: 'Smartboard / Digitaltafel', category: 'allgemein', width: 200, height: 15, color: '#2c2c2c', icon: '📺' },
  { id: 'beamer', name: 'Deckenbeamer', category: 'allgemein', width: 35, height: 30, color: '#555', icon: '📽️' },
  { id: 'buecherregal', name: 'Bücherregal', category: 'allgemein', width: 100, height: 35, color: '#a0956b', icon: '📚' },
  { id: 'materialschrank', name: 'Materialschrank', category: 'allgemein', width: 100, height: 50, color: '#8b8068', icon: '🗄️' },
  { id: 'garderobe', name: 'Garderobenhaken-Leiste', category: 'allgemein', width: 150, height: 10, color: '#999', icon: '🧥' },
  { id: 'papierkorb', name: 'Papierkorb', category: 'allgemein', width: 30, height: 30, color: '#666', icon: '🗑️' },
  { id: 'overheadprojektor', name: 'Overheadprojektor', category: 'allgemein', width: 40, height: 40, color: '#888', icon: '💡' },

  // Physik
  { id: 'physik-demo-tisch', name: 'Demonstrationstisch', category: 'physik', width: 200, height: 80, color: '#4a4a4a', icon: '🔬' },
  { id: 'physik-schuelertisch', name: 'Experimentiertisch', category: 'physik', width: 140, height: 70, color: '#5a5a5a', icon: '⚗️' },
  { id: 'physik-strom', name: 'Stromversorgung (Labortisch)', category: 'physik', width: 60, height: 40, color: '#e8c840', icon: '⚡' },
  { id: 'physik-schrank', name: 'Geräteschrank Physik', category: 'physik', width: 120, height: 55, color: '#7a7a7a', icon: '🗄️' },
  { id: 'physik-sammlung', name: 'Sammlungsschrank', category: 'physik', width: 100, height: 50, color: '#6a6a6a', icon: '🗄️' },
  { id: 'physik-waage', name: 'Feinwaage (Tischgerät)', category: 'physik', width: 30, height: 25, color: '#aaa', icon: '⚖️' },
  { id: 'physik-optikbank', name: 'Optische Bank', category: 'physik', width: 150, height: 15, color: '#888', icon: '🔭' },
  { id: 'physik-oszilloskop', name: 'Oszilloskop-Arbeitsplatz', category: 'physik', width: 60, height: 50, color: '#3a5a3a', icon: '📊' },
  { id: 'physik-verdunkelung', name: 'Verdunkelungsvorhang', category: 'physik', width: 200, height: 5, color: '#222', icon: '🌑' },

  // Chemie
  { id: 'chemie-demo-tisch', name: 'Demo-Tisch mit Abzug', category: 'chemie', width: 200, height: 90, color: '#3a3a3a', icon: '🧪' },
  { id: 'chemie-schuelertisch', name: 'Labortisch (Schüler)', category: 'chemie', width: 140, height: 70, color: '#4a5a4a', icon: '🧫' },
  { id: 'abzug', name: 'Abzugshaube', category: 'chemie', width: 120, height: 80, color: '#c0c0c0', icon: '🌬️' },
  { id: 'chemie-spuele', name: 'Laborspüle', category: 'chemie', width: 60, height: 50, color: '#b0c0d0', icon: '🚰' },
  { id: 'chemie-schrank', name: 'Chemikalienschrank', category: 'chemie', width: 100, height: 55, color: '#c8a030', icon: '☣️' },
  { id: 'chemie-saeuren', name: 'Säureschrank', category: 'chemie', width: 60, height: 55, color: '#d04040', icon: '⚠️' },
  { id: 'chemie-gasflasche', name: 'Gasflaschenschrank', category: 'chemie', width: 50, height: 50, color: '#4060a0', icon: '🔥' },
  { id: 'chemie-notdusche', name: 'Notdusche', category: 'chemie', width: 40, height: 40, color: '#40c040', icon: '🚿' },
  { id: 'chemie-augendusche', name: 'Augendusche', category: 'chemie', width: 25, height: 20, color: '#40a040', icon: '👁️' },
  { id: 'chemie-loescher', name: 'Feuerlöscher', category: 'chemie', width: 20, height: 20, color: '#e03030', icon: '🧯' },
  { id: 'chemie-glasgeraete', name: 'Glasgeräteschrank', category: 'chemie', width: 100, height: 45, color: '#a8b8c8', icon: '🧪' },

  // Technik (Werken / Holz / Metall)
  { id: 'tech-werkbank', name: 'Werkbank (Holz)', category: 'technik', width: 150, height: 70, color: '#a08050', icon: '🪚' },
  { id: 'tech-werkbank-metall', name: 'Werkbank (Metall)', category: 'technik', width: 150, height: 70, color: '#808890', icon: '🔩' },
  { id: 'tech-schraubstock', name: 'Schraubstock', category: 'technik', width: 25, height: 20, color: '#5a5a5a', icon: '🗜️' },
  { id: 'tech-bohrmaschine', name: 'Ständerbohrmaschine', category: 'technik', width: 50, height: 50, color: '#4a6a4a', icon: '🔧' },
  { id: 'tech-bandsaege', name: 'Bandsäge', category: 'technik', width: 60, height: 60, color: '#6a6a6a', icon: '🪚' },
  { id: 'tech-dekupiersaege', name: 'Dekupiersäge', category: 'technik', width: 45, height: 40, color: '#7a7a7a', icon: '🪚' },
  { id: 'tech-schleifmaschine', name: 'Bandschleifmaschine', category: 'technik', width: 50, height: 40, color: '#5a6a5a', icon: '🔧' },
  { id: 'tech-drechselbank', name: 'Drechselbank', category: 'technik', width: 120, height: 40, color: '#8a7a6a', icon: '🔧' },
  { id: 'tech-loetstation', name: 'Lötstation', category: 'technik', width: 40, height: 30, color: '#c08030', icon: '🔌' },
  { id: 'tech-werkzeugschrank', name: 'Werkzeugschrank', category: 'technik', width: 100, height: 55, color: '#707070', icon: '🗄️' },
  { id: 'tech-materialregal', name: 'Materialregal (Holz/Metall)', category: 'technik', width: 120, height: 50, color: '#8a8070', icon: '🗄️' },
  { id: 'tech-absauganlage', name: 'Absauganlage', category: 'technik', width: 60, height: 60, color: '#909090', icon: '🌬️' },
  { id: 'tech-erste-hilfe', name: 'Erste-Hilfe-Kasten', category: 'technik', width: 30, height: 10, color: '#e03030', icon: '🏥' },
  { id: 'tech-hocker', name: 'Werkstatthocker', category: 'technik', width: 35, height: 35, color: '#5a5a5a', icon: '🪑' },
  { id: 'tech-maschinentisch', name: 'Maschinentisch', category: 'technik', width: 80, height: 60, color: '#6a7a8a', icon: '🔧' },

  // AES (Alltagskultur, Ernährung, Soziales)
  { id: 'aes-kochzeile', name: 'Kochzeile (4er-Gruppe)', category: 'aes', width: 240, height: 65, color: '#c0c0c0', icon: '🍳' },
  { id: 'aes-herd', name: 'Herd (Ceranfeld)', category: 'aes', width: 60, height: 60, color: '#3a3a3a', icon: '🔥' },
  { id: 'aes-backofen', name: 'Backofen', category: 'aes', width: 60, height: 60, color: '#4a4a4a', icon: '🍞' },
  { id: 'aes-spuele', name: 'Spülbecken (doppelt)', category: 'aes', width: 80, height: 60, color: '#b0c0d0', icon: '🚰' },
  { id: 'aes-kuehlschrank', name: 'Kühlschrank', category: 'aes', width: 60, height: 60, color: '#e0e0e0', icon: '🧊' },
  { id: 'aes-arbeitstisch', name: 'Arbeitstisch (Küche)', category: 'aes', width: 120, height: 70, color: '#c8b898', icon: '🪵' },
  { id: 'aes-vorratsschrank', name: 'Vorratsschrank', category: 'aes', width: 80, height: 55, color: '#a09070', icon: '🗄️' },
  { id: 'aes-geschirrschrank', name: 'Geschirrschrank', category: 'aes', width: 100, height: 50, color: '#b0a090', icon: '🍽️' },
  { id: 'aes-naehmaschine', name: 'Nähmaschinentisch', category: 'aes', width: 100, height: 50, color: '#8a90a0', icon: '🧵' },
  { id: 'aes-buegelbrett', name: 'Bügelbrett', category: 'aes', width: 120, height: 35, color: '#c0c8d0', icon: '👕' },
  { id: 'aes-stoffregal', name: 'Stoffregal / Textilschrank', category: 'aes', width: 120, height: 45, color: '#a080a0', icon: '🧶' },
  { id: 'aes-spiegel', name: 'Standspiegel', category: 'aes', width: 60, height: 10, color: '#d0d8e0', icon: '🪞' },
  { id: 'aes-waschmaschine', name: 'Waschmaschine', category: 'aes', width: 60, height: 60, color: '#e0e0e0', icon: '🫧' },
  { id: 'aes-mikrowelle', name: 'Mikrowelle', category: 'aes', width: 45, height: 35, color: '#555', icon: '📡' },
  { id: 'aes-handtuchhalter', name: 'Handtuchhalter', category: 'aes', width: 60, height: 8, color: '#999', icon: '🧻' },

  // Kunst
  { id: 'kunst-staffelei', name: 'Staffelei', category: 'kunst', width: 60, height: 55, color: '#b8860b', icon: '🎨' },
  { id: 'kunst-arbeitstisch', name: 'Kunst-Arbeitstisch', category: 'kunst', width: 150, height: 80, color: '#c0a070', icon: '🖌️' },
  { id: 'kunst-hocker', name: 'Malhocker', category: 'kunst', width: 35, height: 35, color: '#a0522d', icon: '🪑' },
  { id: 'kunst-spuele', name: 'Waschbecken (Kunst)', category: 'kunst', width: 80, height: 50, color: '#b0c8e0', icon: '🚰' },
  { id: 'kunst-materialregal', name: 'Materialregal', category: 'kunst', width: 120, height: 40, color: '#a09060', icon: '🗄️' },
  { id: 'kunst-trockenregal', name: 'Trockenregal', category: 'kunst', width: 100, height: 50, color: '#b0a080', icon: '🖼️' },
  { id: 'kunst-brennofen', name: 'Brennofen (Keramik)', category: 'kunst', width: 70, height: 70, color: '#c84020', icon: '🔥' },
  { id: 'kunst-toepferscheibe', name: 'Töpferscheibe', category: 'kunst', width: 60, height: 60, color: '#8a7a6a', icon: '🏺' },
  { id: 'kunst-druckpresse', name: 'Druckpresse', category: 'kunst', width: 100, height: 70, color: '#5a5a5a', icon: '🖨️' },
  { id: 'kunst-schneidemaschine', name: 'Schneidemaschine', category: 'kunst', width: 80, height: 50, color: '#707070', icon: '✂️' },

  // Musik
  { id: 'musik-klavier', name: 'Klavier / Flügel', category: 'musik', width: 150, height: 160, color: '#1a1a1a', icon: '🎹' },
  { id: 'musik-keyboard', name: 'Keyboard (auf Ständer)', category: 'musik', width: 130, height: 40, color: '#2a2a2a', icon: '🎹' },
  { id: 'musik-stuhl', name: 'Musikstuhl (stapelbar)', category: 'musik', width: 42, height: 42, color: '#333', icon: '🪑' },
  { id: 'musik-notenstaender', name: 'Notenständer', category: 'musik', width: 25, height: 25, color: '#444', icon: '🎵' },
  { id: 'musik-schlagzeug', name: 'Schlagzeug', category: 'musik', width: 150, height: 130, color: '#8b0000', icon: '🥁' },
  { id: 'musik-instrumentenschrank', name: 'Instrumentenschrank', category: 'musik', width: 150, height: 55, color: '#6a5a4a', icon: '🎸' },
  { id: 'musik-notenschrank', name: 'Notenschrank', category: 'musik', width: 100, height: 45, color: '#7a6a5a', icon: '🎼' },
  { id: 'musik-dirigentenpult', name: 'Dirigentenpult', category: 'musik', width: 50, height: 45, color: '#5a4a3a', icon: '🎶' },

  // Informatik
  { id: 'info-pc-tisch', name: 'PC-Arbeitsplatz', category: 'informatik', width: 120, height: 70, color: '#6a7a8a', icon: '🖥️' },
  { id: 'info-monitor', name: 'Monitor', category: 'informatik', width: 55, height: 10, color: '#2a2a2a', icon: '🖥️' },
  { id: 'info-pc-tower', name: 'PC-Tower (unter Tisch)', category: 'informatik', width: 20, height: 45, color: '#3a3a3a', icon: '💻' },
  { id: 'info-drucker', name: 'Netzwerkdrucker', category: 'informatik', width: 50, height: 45, color: '#555', icon: '🖨️' },
  { id: 'info-serverschrank', name: 'Serverschrank', category: 'informatik', width: 60, height: 80, color: '#2a3a4a', icon: '🖧' },
  { id: 'info-laptop-wagen', name: 'Laptop-Ladewagen', category: 'informatik', width: 80, height: 55, color: '#5a6a7a', icon: '💻' },
  { id: 'info-3d-drucker', name: '3D-Drucker', category: 'informatik', width: 50, height: 50, color: '#4a5a6a', icon: '🖨️' },
  { id: 'info-switch', name: 'Netzwerk-Switch (Wandm.)', category: 'informatik', width: 50, height: 10, color: '#2a4a6a', icon: '🔌' },

  // Sport / Turnhalle
  { id: 'sport-turnmatte', name: 'Turnmatte', category: 'sport', width: 200, height: 125, color: '#2060c0', icon: '🤸' },
  { id: 'sport-weichboden', name: 'Weichbodenmatte', category: 'sport', width: 200, height: 150, color: '#c04040', icon: '🟥' },
  { id: 'sport-kasten', name: 'Sprungkasten', category: 'sport', width: 60, height: 110, color: '#a0522d', icon: '🏋️' },
  { id: 'sport-bank', name: 'Turnbank', category: 'sport', width: 30, height: 300, color: '#b8860b', icon: '🪵' },
  { id: 'sport-barren', name: 'Barren', category: 'sport', width: 70, height: 200, color: '#8b7355', icon: '🤸' },
  { id: 'sport-reck', name: 'Reck', category: 'sport', width: 30, height: 250, color: '#888', icon: '🤸' },
  { id: 'sport-tor', name: 'Handballtor', category: 'sport', width: 300, height: 30, color: '#d04040', icon: '🥅' },
  { id: 'sport-basketballkorb', name: 'Basketballkorb', category: 'sport', width: 120, height: 10, color: '#ff8c00', icon: '🏀' },
  { id: 'sport-geraetewagen', name: 'Gerätewagen', category: 'sport', width: 120, height: 60, color: '#666', icon: '🏐' },
  { id: 'sport-sprossenwand', name: 'Sprossenwand', category: 'sport', width: 250, height: 15, color: '#a0522d', icon: '🧗' },

  // Verwaltung / Lehrerzimmer
  { id: 'verw-schreibtisch', name: 'Büro-Schreibtisch', category: 'verwaltung', width: 160, height: 80, color: '#b89e78', icon: '🖥️' },
  { id: 'verw-stuhl', name: 'Bürostuhl', category: 'verwaltung', width: 55, height: 55, color: '#333', icon: '🪑' },
  { id: 'verw-aktenschrank', name: 'Aktenschrank', category: 'verwaltung', width: 80, height: 45, color: '#8b8068', icon: '🗄️' },
  { id: 'verw-kopierer', name: 'Kopierer / MFP', category: 'verwaltung', width: 60, height: 65, color: '#555', icon: '🖨️' },
  { id: 'verw-besprechungstisch', name: 'Besprechungstisch', category: 'verwaltung', width: 200, height: 100, color: '#c8b898', icon: '🪵' },
  { id: 'verw-postfaecher', name: 'Postfächerschrank', category: 'verwaltung', width: 100, height: 40, color: '#7a8a9a', icon: '📬' },
  { id: 'verw-kaffeeautomat', name: 'Kaffeemaschine / Automat', category: 'verwaltung', width: 40, height: 45, color: '#4a3a2a', icon: '☕' },
  { id: 'verw-kuechenzeile', name: 'Küchenzeile (Lehrerz.)', category: 'verwaltung', width: 180, height: 60, color: '#c0c0c0', icon: '🍽️' },
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
