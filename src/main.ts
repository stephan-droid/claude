import { store } from './state';
import { Renderer, DrawingState } from './renderer';
import { FURNITURE_CATALOG, getCatalogByCategory, CATEGORY_LABELS, getDefinitionById } from './catalog';
import { FurnitureCategory, FurnitureDefinition, Point, Room, Wall, Opening, RoomType, ROOM_TYPE_PRESETS } from './types';
import { exportProject, importProject, importFloorPlan, exportAsSVG, exportStueckliste } from './io';
import { exportAsPDF } from './pdf';

// ─── CSS einfügen ───────────────────────────────────────────
const style = document.createElement('style');
style.textContent = `
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
    overflow: hidden;
    height: 100vh;
    color: #333;
  }

  #app {
    display: flex;
    height: 100vh;
  }

  /* ── Seitenleiste ── */
  .sidebar {
    width: 280px;
    background: #fff;
    border-right: 1px solid #e0e0e0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex-shrink: 0;
  }

  .sidebar-header {
    padding: 16px;
    background: #1a73e8;
    color: #fff;
  }

  .sidebar-header h1 {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 2px;
  }

  .sidebar-header p {
    font-size: 11px;
    opacity: 0.85;
  }

  .sidebar-search {
    padding: 8px 12px;
    border-bottom: 1px solid #e0e0e0;
  }

  .sidebar-search input {
    width: 100%;
    padding: 8px 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 13px;
    outline: none;
  }

  .sidebar-search input:focus {
    border-color: #1a73e8;
    box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.15);
  }

  .catalog {
    flex: 1;
    overflow-y: auto;
    padding: 4px 0;
  }

  .category-group {
    margin-bottom: 2px;
  }

  .category-header {
    padding: 8px 14px;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    color: #888;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    user-select: none;
  }

  .category-header:hover { background: #f5f5f5; }

  .category-header .arrow {
    transition: transform 0.2s;
    font-size: 10px;
  }

  .category-header.collapsed .arrow { transform: rotate(-90deg); }

  .category-items { padding: 0 8px 4px; }

  .category-items.hidden { display: none; }

  .catalog-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border-radius: 6px;
    cursor: grab;
    transition: background 0.15s;
    font-size: 13px;
    user-select: none;
  }

  .catalog-item:hover { background: #e8f0fe; }
  .catalog-item:active { cursor: grabbing; }

  .catalog-item .icon {
    font-size: 20px;
    width: 28px;
    text-align: center;
    flex-shrink: 0;
  }

  .catalog-item .info {
    flex: 1;
    min-width: 0;
  }

  .catalog-item .name {
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .catalog-item .dims {
    font-size: 10px;
    color: #999;
  }

  .catalog-item .color-dot {
    width: 12px;
    height: 12px;
    border-radius: 3px;
    flex-shrink: 0;
  }

  /* ── Hauptbereich ── */
  .main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  /* ── Toolbar ── */
  .toolbar {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 12px;
    background: #fff;
    border-bottom: 1px solid #e0e0e0;
    flex-wrap: wrap;
  }

  .toolbar-group {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .toolbar-divider {
    width: 1px;
    height: 24px;
    background: #e0e0e0;
    margin: 0 6px;
  }

  .toolbar button, .toolbar select {
    padding: 6px 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    background: #fff;
    cursor: pointer;
    font-size: 13px;
    color: #333;
    transition: all 0.15s;
    white-space: nowrap;
  }

  .toolbar button:hover { background: #f0f0f0; }
  .toolbar button.active { background: #e8f0fe; border-color: #1a73e8; color: #1a73e8; }

  .toolbar .zoom-display {
    font-size: 12px;
    min-width: 45px;
    text-align: center;
    color: #666;
    user-select: none;
  }

  /* ── Canvas ── */
  .canvas-container {
    flex: 1;
    position: relative;
    overflow: hidden;
    background: #f0f0f0;
  }

  .canvas-container canvas {
    display: block;
  }

  /* ── Eigenschaftenpanel ── */
  .properties {
    position: absolute;
    top: 8px;
    right: 8px;
    width: 220px;
    background: #fff;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.1);
    padding: 12px;
    font-size: 13px;
  }

  .properties h3 {
    font-size: 13px;
    margin-bottom: 8px;
    color: #1a73e8;
  }

  .prop-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
  }

  .prop-row label { color: #666; font-size: 12px; }
  .prop-row span { font-weight: 500; }

  .prop-actions {
    display: flex;
    gap: 4px;
    margin-top: 8px;
    flex-wrap: wrap;
  }

  .prop-actions button {
    flex: 1;
    padding: 6px 8px;
    border: 1px solid #ddd;
    border-radius: 6px;
    background: #fff;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.15s;
    white-space: nowrap;
  }

  .prop-actions button:hover { background: #f0f0f0; }
  .prop-actions button.danger { color: #d32f2f; border-color: #ffcdd2; }
  .prop-actions button.danger:hover { background: #ffebee; }

  .prop-label-row {
    display: flex;
    flex-direction: column;
    gap: 3px;
    margin-bottom: 6px;
  }

  .prop-label-row label { color: #666; font-size: 12px; }

  .prop-label-row input {
    width: 100%;
    padding: 5px 8px;
    border: 1px solid #ddd;
    border-radius: 5px;
    font-size: 12px;
    outline: none;
  }

  .prop-label-row input:focus {
    border-color: #1a73e8;
    box-shadow: 0 0 0 2px rgba(26,115,232,0.15);
  }

  /* ── Statusleiste ── */
  .statusbar {
    padding: 4px 12px;
    background: #fff;
    border-top: 1px solid #e0e0e0;
    font-size: 11px;
    color: #999;
    display: flex;
    gap: 16px;
  }

  /* ── Drag ghost ── */
  .drag-ghost {
    position: fixed;
    pointer-events: none;
    z-index: 9999;
    opacity: 0.8;
    padding: 4px 8px;
    background: #e8f0fe;
    border: 1px solid #1a73e8;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
  }

  /* ── Scrollbar ── */
  .catalog::-webkit-scrollbar { width: 6px; }
  .catalog::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
  .catalog::-webkit-scrollbar-thumb:hover { background: #aaa; }

  /* ── Willkommens-Hinweis ── */
  .welcome-hint {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    color: #999;
    pointer-events: none;
    user-select: none;
    z-index: 10;
  }

  .welcome-hint h2 {
    font-size: 22px;
    font-weight: 600;
    color: #888;
    margin-bottom: 12px;
  }

  .welcome-hint p {
    font-size: 14px;
    line-height: 1.8;
    color: #aaa;
  }

  .welcome-hint .shortcut {
    display: inline-block;
    background: #e8e8e8;
    color: #666;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-family: monospace;
    margin: 0 2px;
  }

  /* ── Zeichenmodus-Banner ── */
  .drawing-banner {
    position: absolute;
    top: 8px;
    left: 50%;
    transform: translateX(-50%);
    background: #1a73e8;
    color: #fff;
    padding: 8px 20px;
    border-radius: 8px;
    font-size: 13px;
    box-shadow: 0 2px 12px rgba(0,0,0,0.15);
    z-index: 100;
    display: flex;
    align-items: center;
    gap: 12px;
    white-space: nowrap;
  }

  .drawing-banner .hint {
    opacity: 0.9;
    font-size: 12px;
  }

  .drawing-banner button {
    padding: 4px 12px;
    border: 1px solid rgba(255,255,255,0.3);
    border-radius: 4px;
    background: rgba(255,255,255,0.15);
    color: #fff;
    cursor: pointer;
    font-size: 12px;
  }

  .drawing-banner button:hover {
    background: rgba(255,255,255,0.25);
  }

  /* ── Grundriss-Editor Modal ── */
  .modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.45);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .modal {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 8px 40px rgba(0,0,0,0.2);
    width: 820px;
    max-width: 95vw;
    max-height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid #e0e0e0;
    background: #fafafa;
  }

  .modal-header h2 {
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }

  .modal-close {
    background: none;
    border: none;
    font-size: 22px;
    cursor: pointer;
    color: #666;
    padding: 4px 8px;
    border-radius: 4px;
  }

  .modal-close:hover { background: #eee; }

  .modal-body {
    display: flex;
    flex: 1;
    overflow: hidden;
    min-height: 400px;
  }

  .room-list {
    width: 220px;
    border-right: 1px solid #e0e0e0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    flex-shrink: 0;
  }

  .room-list-header {
    padding: 10px 12px;
    border-bottom: 1px solid #e0e0e0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;
    font-weight: 600;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .room-list-items {
    flex: 1;
    overflow-y: auto;
    padding: 4px;
  }

  .room-list-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    transition: background 0.15s;
  }

  .room-list-item:hover { background: #f5f5f5; }
  .room-list-item.active { background: #e8f0fe; color: #1a73e8; font-weight: 500; }

  .room-list-item .room-color-swatch {
    width: 14px;
    height: 14px;
    border-radius: 3px;
    flex-shrink: 0;
    border: 1px solid #ddd;
  }

  .room-detail {
    flex: 1;
    padding: 16px 20px;
    overflow-y: auto;
  }

  .room-detail-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #999;
    font-size: 14px;
  }

  .room-detail h3 {
    font-size: 14px;
    margin-bottom: 14px;
    color: #1a73e8;
  }

  .form-group {
    margin-bottom: 14px;
  }

  .form-group label {
    display: block;
    font-size: 12px;
    color: #666;
    margin-bottom: 4px;
    font-weight: 500;
  }

  .form-group input[type="text"],
  .form-group input[type="number"],
  .form-group input[type="color"],
  .form-group select {
    width: 100%;
    padding: 7px 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 13px;
    outline: none;
  }

  .form-group input:focus,
  .form-group select:focus {
    border-color: #1a73e8;
    box-shadow: 0 0 0 2px rgba(26,115,232,0.15);
  }

  .form-group input[type="color"] {
    height: 36px;
    padding: 3px;
    cursor: pointer;
  }

  .form-row {
    display: flex;
    gap: 10px;
  }

  .form-row .form-group { flex: 1; }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 18px 0 8px;
    padding-bottom: 4px;
    border-bottom: 1px solid #eee;
  }

  .section-header h4 {
    font-size: 12px;
    font-weight: 600;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .btn-sm {
    padding: 4px 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: #fff;
    cursor: pointer;
    font-size: 12px;
    transition: all 0.15s;
  }

  .btn-sm:hover { background: #f0f0f0; }
  .btn-sm.primary { background: #1a73e8; color: #fff; border-color: #1a73e8; }
  .btn-sm.primary:hover { background: #1557b0; }
  .btn-sm.danger { color: #d32f2f; border-color: #ffcdd2; }
  .btn-sm.danger:hover { background: #ffebee; }

  .opening-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    background: #fafafa;
    border-radius: 6px;
    margin-bottom: 4px;
    font-size: 12px;
  }

  .opening-item select,
  .opening-item input {
    padding: 4px 6px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 12px;
    outline: none;
  }

  .opening-item select { width: 70px; }
  .opening-item input { width: 55px; }

  .opening-item .btn-remove {
    background: none;
    border: none;
    color: #d32f2f;
    cursor: pointer;
    font-size: 14px;
    padding: 2px 4px;
    border-radius: 3px;
    margin-left: auto;
  }

  .opening-item .btn-remove:hover { background: #ffebee; }

  .modal-footer {
    padding: 12px 20px;
    border-top: 1px solid #e0e0e0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: #fafafa;
  }

  .floorplan-name-input {
    padding: 6px 10px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 13px;
    width: 260px;
    outline: none;
  }

  .floorplan-name-input:focus {
    border-color: #1a73e8;
    box-shadow: 0 0 0 2px rgba(26,115,232,0.15);
  }

  /* ── Responsive ── */
  @media (max-width: 700px) {
    .sidebar { width: 220px; }
    .properties { width: 180px; }
    .modal { width: 95vw; }
    .room-list { width: 160px; }
  }
`;
document.head.appendChild(style);

// ─── App aufbauen ───────────────────────────────────────────
const app = document.getElementById('app')!;
app.innerHTML = `
  <div class="sidebar">
    <div class="sidebar-header">
      <h1>Schulraumplaner</h1>
      <p>Fachräume virtuell einrichten</p>
    </div>
    <div class="sidebar-search">
      <input type="text" id="searchInput" placeholder="Ausstattung suchen..." />
    </div>
    <div class="catalog" id="catalog"></div>
  </div>
  <div class="main">
    <div class="toolbar" id="toolbar"></div>
    <div class="canvas-container" id="canvasContainer">
      <canvas id="canvas"></canvas>
      <div id="propertiesPanel"></div>
    </div>
    <div class="statusbar" id="statusbar"></div>
  </div>
`;

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const canvasContainer = document.getElementById('canvasContainer')!;
const catalogEl = document.getElementById('catalog')!;
const toolbarEl = document.getElementById('toolbar')!;
const propertiesEl = document.getElementById('propertiesPanel')!;
const statusbarEl = document.getElementById('statusbar')!;
const searchInput = document.getElementById('searchInput') as HTMLInputElement;

const renderer = new Renderer(canvas);

// ─── Willkommens-Hinweis ─────────────────────────────────────
let welcomeHintEl: HTMLElement | null = null;

function updateWelcomeHint() {
  const state = store.getState();
  if (state.floorPlan.rooms.length === 0 && !isDrawing) {
    if (!welcomeHintEl) {
      welcomeHintEl = document.createElement('div');
      welcomeHintEl.className = 'welcome-hint';
      welcomeHintEl.innerHTML = `
        <h2>Leere Zeichenfl\u00e4che</h2>
        <p>
          Klicke <span class="shortcut">W</span> oder den Button <strong>\u270f Zeichnen</strong>, um R\u00e4ume zu zeichnen.<br>
          Oder nutze <strong>\u270f\ufe0f Grundriss</strong> im Men\u00fc, um R\u00e4ume \u00fcber das Formular anzulegen.<br>
          Du kannst auch einen bestehenden Grundriss \u00fcber <strong>\ud83d\udcd0 Import</strong> laden.
        </p>
      `;
      canvasContainer.appendChild(welcomeHintEl);
    }
  } else {
    if (welcomeHintEl) {
      welcomeHintEl.remove();
      welcomeHintEl = null;
    }
  }
}

// ─── Katalog rendern ────────────────────────────────────────
const collapsedCategories = new Set<FurnitureCategory>();

function renderCatalog(filter = '') {
  const byCategory = getCatalogByCategory();
  let html = '';
  const lowerFilter = filter.toLowerCase();

  for (const [cat, items] of byCategory) {
    const filtered = items.filter(i =>
      i.name.toLowerCase().includes(lowerFilter) ||
      CATEGORY_LABELS[cat].toLowerCase().includes(lowerFilter)
    );
    if (filtered.length === 0 && lowerFilter) continue;
    const displayItems = lowerFilter ? filtered : items;
    const collapsed = collapsedCategories.has(cat);

    html += `<div class="category-group">`;
    html += `<div class="category-header ${collapsed ? 'collapsed' : ''}" data-category="${cat}">
      <span>${CATEGORY_LABELS[cat]} (${displayItems.length})</span>
      <span class="arrow">▼</span>
    </div>`;
    html += `<div class="category-items ${collapsed ? 'hidden' : ''}">`;
    for (const item of displayItems) {
      html += `
        <div class="catalog-item" draggable="true" data-id="${item.id}">
          <span class="icon">${item.icon}</span>
          <div class="info">
            <div class="name">${item.name}</div>
            <div class="dims">${item.width} × ${item.height} cm</div>
          </div>
          <div class="color-dot" style="background:${item.color}"></div>
        </div>`;
    }
    html += `</div></div>`;
  }
  catalogEl.innerHTML = html;
  attachCatalogEvents();
}

function attachCatalogEvents() {
  // Kategorie-Header klappen
  catalogEl.querySelectorAll('.category-header').forEach(el => {
    el.addEventListener('click', () => {
      const cat = el.getAttribute('data-category') as FurnitureCategory;
      if (collapsedCategories.has(cat)) {
        collapsedCategories.delete(cat);
      } else {
        collapsedCategories.add(cat);
      }
      renderCatalog(searchInput.value);
    });
  });

  // Drag-Start
  catalogEl.querySelectorAll('.catalog-item').forEach(el => {
    el.addEventListener('dragstart', (e) => {
      const id = (el as HTMLElement).dataset.id!;
      const def = getDefinitionById(id);
      if (!def) return;
      store.setDraggedDefinition(def);
      (e as DragEvent).dataTransfer!.setData('text/plain', id);
      (e as DragEvent).dataTransfer!.effectAllowed = 'copy';
    });

    el.addEventListener('dragend', () => {
      store.setDraggedDefinition(null);
      renderer.setGhostPosition(null);
    });
  });
}

searchInput.addEventListener('input', () => {
  renderCatalog(searchInput.value);
});

renderCatalog();

// ─── Toolbar rendern ────────────────────────────────────────
function renderToolbar() {
  const state = store.getState();
  toolbarEl.innerHTML = `
    <div class="toolbar-group">
      <button data-tool="select" class="${state.tool === 'select' ? 'active' : ''}" title="Auswählen (V)">↖ Auswahl</button>
      <button data-tool="pan" class="${state.tool === 'pan' ? 'active' : ''}" title="Verschieben (H)">✋ Hand</button>
      <button data-tool="draw-wall" class="${state.tool === 'draw-wall' ? 'active' : ''}" title="Raum zeichnen (W)">✏ Zeichnen</button>
    </div>
    <div class="toolbar-divider"></div>
    <div class="toolbar-group">
      <button id="zoomOut" title="Herauszoomen">−</button>
      <span class="zoom-display">${Math.round(state.zoom * 100)}%</span>
      <button id="zoomIn" title="Hineinzoomen">+</button>
      <button id="zoomFit" title="Einpassen">◻</button>
    </div>
    <div class="toolbar-divider"></div>
    <div class="toolbar-group">
      <button id="toggleGrid" class="${state.gridVisible ? 'active' : ''}" title="Raster an/aus (G)">▦ Raster</button>
      <button id="toggleSnap" class="${state.snapToGrid ? 'active' : ''}" title="Am Raster einrasten (S)">⊞ Einrasten</button>
      <button id="toggleMeasurements" class="${state.showMeasurements ? 'active' : ''}" title="Maße anzeigen">📏 Maße</button>
      <button id="toggleRuler" class="${state.showRuler ? 'active' : ''}" title="Lineal anzeigen">📐 Lineal</button>
    </div>
    <div class="toolbar-divider"></div>
    <div class="toolbar-group">
      <button id="editFloorPlan" title="Grundriss bearbeiten (E)">✏️ Grundriss</button>
      <button id="importFloorPlan" title="Grundriss importieren">📐 Import</button>
      <button id="importProject" title="Projekt laden">📂 Laden</button>
      <button id="exportProject" title="Projekt speichern (Strg+S)">💾 Speichern</button>
      <button id="exportSVG" title="Als SVG exportieren">🖼 SVG</button>
      <button id="exportPDF" title="Als PDF herunterladen">📄 PDF</button>
      <button id="exportStueckliste" title="Stückliste als HTML exportieren">📋 Stückliste</button>
    </div>
    <div class="toolbar-divider"></div>
    <div class="toolbar-group">
      <button id="clearAll" title="Alle Ausstattung entfernen">🗑 Leeren</button>
    </div>
  `;

  // Eventhandler
  toolbarEl.querySelectorAll('[data-tool]').forEach(btn => {
    btn.addEventListener('click', () => {
      const newTool = (btn as HTMLElement).dataset.tool as any;
      if (newTool === 'draw-wall') {
        if (!isDrawing) {
          store.setTool('draw-wall');
        }
      } else {
        if (isDrawing) cancelDrawing();
        store.setTool(newTool);
      }
    });
  });

  toolbarEl.querySelector('#zoomIn')?.addEventListener('click', () => store.setZoom(state.zoom + 0.1));
  toolbarEl.querySelector('#zoomOut')?.addEventListener('click', () => store.setZoom(state.zoom - 0.1));
  toolbarEl.querySelector('#zoomFit')?.addEventListener('click', fitZoom);
  toolbarEl.querySelector('#toggleGrid')?.addEventListener('click', () => store.toggleGrid());
  toolbarEl.querySelector('#toggleSnap')?.addEventListener('click', () => store.toggleSnap());
  toolbarEl.querySelector('#toggleMeasurements')?.addEventListener('click', () => store.toggleMeasurements());
  toolbarEl.querySelector('#toggleRuler')?.addEventListener('click', () => store.toggleRuler());
  toolbarEl.querySelector('#editFloorPlan')?.addEventListener('click', () => openFloorPlanEditor());
  toolbarEl.querySelector('#importFloorPlan')?.addEventListener('click', () => importFloorPlan());
  toolbarEl.querySelector('#importProject')?.addEventListener('click', () => importProject());
  toolbarEl.querySelector('#exportProject')?.addEventListener('click', () => exportProject());
  toolbarEl.querySelector('#exportSVG')?.addEventListener('click', () => exportAsSVG());
  toolbarEl.querySelector('#exportPDF')?.addEventListener('click', () => exportAsPDF());
  toolbarEl.querySelector('#exportStueckliste')?.addEventListener('click', () => exportStueckliste());
  toolbarEl.querySelector('#clearAll')?.addEventListener('click', () => {
    if (confirm('Alle platzierten Ausstattung entfernen?')) store.clearFurniture();
  });
}

// ─── Eigenschaftenpanel ─────────────────────────────────────
function renderProperties() {
  const state = store.getState();

  // Möbel ausgewählt
  if (state.selectedFurnitureId) {
    const placed = state.placedFurniture.find(f => f.id === state.selectedFurnitureId);
    if (!placed) { propertiesEl.innerHTML = ''; return; }
    const def = getDefinitionById(placed.definitionId);
    if (!def) { propertiesEl.innerHTML = ''; return; }

    const labelVal = placed.label || '';

    propertiesEl.innerHTML = `
      <div class="properties">
        <h3>${def.icon} ${def.name}</h3>
        <div class="prop-row"><label>Position X:</label><span>${Math.round(placed.x)} cm</span></div>
        <div class="prop-row"><label>Position Y:</label><span>${Math.round(placed.y)} cm</span></div>
        <div class="prop-row"><label>Breite:</label><span>${Math.round(def.width * placed.scaleX)} cm</span></div>
        <div class="prop-row"><label>Tiefe:</label><span>${Math.round(def.height * placed.scaleY)} cm</span></div>
        <div class="prop-row"><label>Rotation:</label><span>${placed.rotation}°</span></div>
        <div class="prop-label-row">
          <label>Beschriftung:</label>
          <input id="furnitureLabelInput" type="text" value="${labelVal}" placeholder="${def.name}" maxlength="30" />
        </div>
        <div class="prop-actions">
          <button id="rotLeft" title="90° links drehen">↺ 90°</button>
          <button id="rotRight" title="90° rechts drehen">↻ 90°</button>
          <button id="rot15Left" title="15° links drehen">↺ 15°</button>
          <button id="rot15Right" title="15° rechts drehen">↻ 15°</button>
        </div>
        <div class="prop-actions">
          <button id="duplicate">⎘ Kopieren</button>
          <button id="deleteFurn" class="danger">✕ Löschen</button>
        </div>
      </div>
    `;

    const id = placed.id;
    propertiesEl.querySelector('#rotLeft')?.addEventListener('click', () => store.rotateFurniture(id, -90));
    propertiesEl.querySelector('#rotRight')?.addEventListener('click', () => store.rotateFurniture(id, 90));
    propertiesEl.querySelector('#rot15Left')?.addEventListener('click', () => store.rotateFurniture(id, -15));
    propertiesEl.querySelector('#rot15Right')?.addEventListener('click', () => store.rotateFurniture(id, 15));
    propertiesEl.querySelector('#duplicate')?.addEventListener('click', () => store.duplicateSelected());
    propertiesEl.querySelector('#deleteFurn')?.addEventListener('click', () => store.deleteSelected());
    const labelInput = propertiesEl.querySelector('#furnitureLabelInput') as HTMLInputElement | null;
    labelInput?.addEventListener('change', () => {
      store.setFurnitureLabel(id, labelInput.value);
    });
    return;
  }

  // Raum ausgewählt
  if (state.selectedRoomId) {
    const room = state.floorPlan.rooms.find(r => r.id === state.selectedRoomId);
    if (!room) { propertiesEl.innerHTML = ''; return; }

    // Fläche berechnen
    let area = 0;
    if (room.walls.length >= 3) {
      for (const wall of room.walls) {
        area += wall.start.x * wall.end.y - wall.end.x * wall.start.y;
      }
      area = Math.abs(area) / 2 / 10000;
    }

    const typeOptions = Object.entries(ROOM_TYPE_PRESETS)
      .map(([key, preset]) => `<option value="${key}"${room.type === key ? ' selected' : ''}>${preset.label}</option>`)
      .join('');

    const furnInRoom = state.placedFurniture.filter(f => f.roomId === room.id).length;

    propertiesEl.innerHTML = `
      <div class="properties">
        <h3>Raum: ${room.name}</h3>
        <div class="prop-row"><label>Typ:</label>
          <select id="roomTypeSelect" style="font-size:11px;padding:2px 4px;border:1px solid #ddd;border-radius:4px;">
            <option value="">– kein Typ –</option>
            ${typeOptions}
          </select>
        </div>
        <div class="prop-row"><label>Fläche:</label><span>${area.toFixed(1)} m²</span></div>
        <div class="prop-row"><label>Möbel:</label><span>${furnInRoom}</span></div>
        <div class="prop-row"><label>Türen/Fenster:</label><span>${room.openings.length}</span></div>
        <div class="prop-actions">
          <button id="editRoom">✏️ Bearbeiten</button>
          <button id="deleteRoom" class="danger">✕ Löschen</button>
        </div>
      </div>
    `;

    const roomTypeSelect = propertiesEl.querySelector('#roomTypeSelect') as HTMLSelectElement;
    roomTypeSelect?.addEventListener('change', () => {
      const val = roomTypeSelect.value as RoomType;
      if (val) {
        store.setRoomType(room.id, val);
      } else {
        store.updateRoom(room.id, { type: undefined });
      }
    });

    propertiesEl.querySelector('#editRoom')?.addEventListener('click', () => {
      editorSelectedRoomId = room.id;
      openFloorPlanEditor();
    });
    propertiesEl.querySelector('#deleteRoom')?.addEventListener('click', () => {
      if (confirm(`"${room.name}" wirklich löschen?`)) {
        store.removeRoom(room.id);
        store.selectRoom(null);
      }
    });
    return;
  }

  propertiesEl.innerHTML = '';
}

// ─── Statusleiste ───────────────────────────────────────────
function renderStatusbar() {
  const state = store.getState();
  const roomCount = state.floorPlan.rooms.length;
  const furnCount = state.placedFurniture.length;
  const selectedRoom = state.selectedRoomId
    ? state.floorPlan.rooms.find(r => r.id === state.selectedRoomId)
    : null;
  const selectedFurn = state.selectedFurnitureId
    ? state.placedFurniture.find(f => f.id === state.selectedFurnitureId)
    : null;

  let selInfo = '';
  if (selectedRoom) selInfo = `· Raum: ${selectedRoom.name}`;
  else if (selectedFurn) {
    const def = getDefinitionById(selectedFurn.definitionId);
    if (def) selInfo = `· Möbel: ${def.name} (${Math.round(selectedFurn.x)}/${Math.round(selectedFurn.y)} cm)`;
  }

  statusbarEl.innerHTML = `
    <span>${state.floorPlan.name}</span>
    <span>Räume: ${roomCount}</span>
    <span>Ausstattung: ${furnCount}</span>
    <span>Zoom: ${Math.round(state.zoom * 100)}%</span>
    <span>Raster: ${state.snapToGrid ? 'An' : 'Aus'} (${state.gridSize} cm)</span>
    ${selInfo ? `<span style="color:#1a73e8">${selInfo}</span>` : ''}
    <span style="margin-left:auto;color:#bbb">W=Zeichnen · V=Auswahl · H=Verschieben · R=Drehen · Del=Löschen</span>
  `;
}

// ─── Grundriss-Editor Modal ──────────────────────────────────
let editorSelectedRoomId: string | null = null;

/** Hilfsfunktion: Bounding-Box eines Raums berechnen (in cm) */
function getRoomRect(room: Room): { x: number; y: number; w: number; h: number } {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const wall of room.walls) {
    minX = Math.min(minX, wall.start.x, wall.end.x);
    minY = Math.min(minY, wall.start.y, wall.end.y);
    maxX = Math.max(maxX, wall.start.x, wall.end.x);
    maxY = Math.max(maxY, wall.start.y, wall.end.y);
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

function openFloorPlanEditor() {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';

  function rerender() {
    overlay.innerHTML = '';
    overlay.appendChild(buildEditorModal());
  }

  function buildEditorModal(): HTMLElement {
    const state = store.getState();
    const fp = state.floorPlan;
    const rooms = fp.rooms;

    const modal = document.createElement('div');
    modal.className = 'modal';

    // ── Header
    const header = document.createElement('div');
    header.className = 'modal-header';
    header.innerHTML = `<h2>Grundriss bearbeiten</h2>`;
    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close';
    closeBtn.textContent = '\u00D7';
    closeBtn.addEventListener('click', () => overlay.remove());
    header.appendChild(closeBtn);
    modal.appendChild(header);

    // ── Body
    const body = document.createElement('div');
    body.className = 'modal-body';

    // -- Room list
    const listPane = document.createElement('div');
    listPane.className = 'room-list';

    const listHeader = document.createElement('div');
    listHeader.className = 'room-list-header';
    listHeader.innerHTML = `<span>R\u00e4ume (${rooms.length})</span>`;
    const addBtn = document.createElement('button');
    addBtn.className = 'btn-sm primary';
    addBtn.textContent = '+ Neu';
    addBtn.addEventListener('click', () => {
      // Neuen Raum unten rechts anf\u00fcgen
      let maxX = 0, maxY = 0;
      for (const r of rooms) {
        const rect = getRoomRect(r);
        maxX = Math.max(maxX, rect.x + rect.w);
        maxY = Math.max(maxY, rect.y + rect.h);
      }
      const newId = `room-${Date.now()}`;
      const newRoom: Room = {
        id: newId,
        name: 'Neuer Raum',
        color: '#f5f5f5',
        walls: [
          { start: { x: maxX + 50, y: 0 }, end: { x: maxX + 450, y: 0 }, thickness: 25 },
          { start: { x: maxX + 450, y: 0 }, end: { x: maxX + 450, y: 330 }, thickness: 25 },
          { start: { x: maxX + 450, y: 330 }, end: { x: maxX + 50, y: 330 }, thickness: 25 },
          { start: { x: maxX + 50, y: 330 }, end: { x: maxX + 50, y: 0 }, thickness: 25 },
        ],
        openings: [],
      };
      store.addRoom(newRoom);
      editorSelectedRoomId = newId;
      rerender();
    });
    listHeader.appendChild(addBtn);
    listPane.appendChild(listHeader);

    const listItems = document.createElement('div');
    listItems.className = 'room-list-items';
    for (const room of rooms) {
      const item = document.createElement('div');
      item.className = `room-list-item${room.id === editorSelectedRoomId ? ' active' : ''}`;
      item.innerHTML = `<div class="room-color-swatch" style="background:${room.color}"></div><span>${room.name}</span>`;
      item.addEventListener('click', () => {
        editorSelectedRoomId = room.id;
        rerender();
      });
      listItems.appendChild(item);
    }
    listPane.appendChild(listItems);
    body.appendChild(listPane);

    // -- Detail pane
    const detail = document.createElement('div');
    detail.className = 'room-detail';

    const selectedRoom = rooms.find(r => r.id === editorSelectedRoomId);
    if (!selectedRoom) {
      detail.innerHTML = '<div class="room-detail-empty">Raum ausw\u00e4hlen oder neuen erstellen</div>';
    } else {
      detail.appendChild(buildRoomEditor(selectedRoom, rerender, overlay));
    }

    body.appendChild(detail);
    modal.appendChild(body);

    // ── Footer
    const footer = document.createElement('div');
    footer.className = 'modal-footer';

    const nameInput = document.createElement('input');
    nameInput.className = 'floorplan-name-input';
    nameInput.type = 'text';
    nameInput.value = fp.name;
    nameInput.placeholder = 'Grundriss-Name...';
    nameInput.addEventListener('change', () => {
      store.updateFloorPlanName(nameInput.value);
    });

    const closeFooterBtn = document.createElement('button');
    closeFooterBtn.className = 'btn-sm primary';
    closeFooterBtn.textContent = 'Fertig';
    closeFooterBtn.addEventListener('click', () => overlay.remove());

    footer.appendChild(nameInput);
    footer.appendChild(closeFooterBtn);
    modal.appendChild(footer);

    return modal;
  }

  function buildRoomEditor(room: Room, rerender: () => void, overlay: HTMLElement): HTMLElement {
    const frag = document.createElement('div');
    const rect = getRoomRect(room);

    // ── Name & Farbe
    frag.innerHTML = `<h3>${room.name}</h3>`;

    const nameGroup = document.createElement('div');
    nameGroup.className = 'form-group';
    nameGroup.innerHTML = `<label>Raumname</label>`;
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameInput.value = room.name;
    nameInput.addEventListener('change', () => {
      store.updateRoom(room.id, { name: nameInput.value });
      rerender();
    });
    nameGroup.appendChild(nameInput);
    frag.appendChild(nameGroup);

    // Raumtyp
    const typeGroup = document.createElement('div');
    typeGroup.className = 'form-group';
    typeGroup.innerHTML = `<label>Raumtyp</label>`;
    const typeSelect = document.createElement('select');
    typeSelect.innerHTML = `<option value="">– kein Typ –</option>` +
      Object.entries(ROOM_TYPE_PRESETS)
        .map(([key, preset]) => `<option value="${key}"${room.type === key ? ' selected' : ''}>${preset.label}</option>`)
        .join('');
    typeSelect.addEventListener('change', () => {
      const val = typeSelect.value as RoomType;
      if (val) {
        store.setRoomType(room.id, val);
      } else {
        store.updateRoom(room.id, { type: undefined });
      }
      rerender();
    });
    typeGroup.appendChild(typeSelect);
    frag.appendChild(typeGroup);

    const colorGroup = document.createElement('div');
    colorGroup.className = 'form-group';
    colorGroup.innerHTML = `<label>Raumfarbe</label>`;
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = room.color;
    colorInput.addEventListener('change', () => {
      store.updateRoom(room.id, { color: colorInput.value });
      rerender();
    });
    colorGroup.appendChild(colorInput);
    frag.appendChild(colorGroup);

    // ── Position & Gr\u00f6\u00dfe
    const dimSection = document.createElement('div');
    dimSection.className = 'section-header';
    dimSection.innerHTML = `<h4>Position & Gr\u00f6\u00dfe (cm)</h4>`;
    frag.appendChild(dimSection);

    const row1 = document.createElement('div');
    row1.className = 'form-row';

    const xGroup = createNumberField('X', rect.x, (v) => {
      store.updateRoomRect(room.id, v, rect.y, rect.w, rect.h);
      rerender();
    });
    const yGroup = createNumberField('Y', rect.y, (v) => {
      store.updateRoomRect(room.id, rect.x, v, rect.w, rect.h);
      rerender();
    });
    row1.appendChild(xGroup);
    row1.appendChild(yGroup);
    frag.appendChild(row1);

    const row2 = document.createElement('div');
    row2.className = 'form-row';

    const wGroup = createNumberField('Breite', rect.w, (v) => {
      if (v < 50) return;
      store.updateRoomRect(room.id, rect.x, rect.y, v, rect.h);
      rerender();
    });
    const hGroup = createNumberField('Tiefe', rect.h, (v) => {
      if (v < 50) return;
      store.updateRoomRect(room.id, rect.x, rect.y, rect.w, v);
      rerender();
    });
    row2.appendChild(wGroup);
    row2.appendChild(hGroup);
    frag.appendChild(row2);

    // ── Wandst\u00e4rke
    const wallSection = document.createElement('div');
    wallSection.className = 'section-header';
    wallSection.innerHTML = `<h4>Wandst\u00e4rke</h4>`;
    frag.appendChild(wallSection);

    const thicknessGroup = createNumberField('Dicke (cm)', room.walls[0]?.thickness ?? 25, (v) => {
      if (v < 5 || v > 100) return;
      const newWalls = room.walls.map(w => ({ ...w, thickness: v }));
      store.updateRoom(room.id, { walls: newWalls });
      rerender();
    });
    frag.appendChild(thicknessGroup);

    // ── \u00d6ffnungen (T\u00fcren & Fenster)
    const openingSection = document.createElement('div');
    openingSection.className = 'section-header';
    openingSection.innerHTML = `<h4>T\u00fcren & Fenster</h4>`;
    const addOpeningBtn = document.createElement('button');
    addOpeningBtn.className = 'btn-sm';
    addOpeningBtn.textContent = '+ Hinzuf\u00fcgen';
    addOpeningBtn.addEventListener('click', () => {
      store.addOpening(room.id, { type: 'door', wall: 0, position: 0.5, width: 100 });
      rerender();
    });
    openingSection.appendChild(addOpeningBtn);
    frag.appendChild(openingSection);

    const wallLabels = room.walls.map((w, i) => {
      const dx = w.end.x - w.start.x;
      const dy = w.end.y - w.start.y;
      if (Math.abs(dx) > Math.abs(dy)) {
        return dy <= 0 ? `Wand ${i + 1} (oben)` : `Wand ${i + 1} (unten)`;
      } else {
        return dx >= 0 ? `Wand ${i + 1} (rechts)` : `Wand ${i + 1} (links)`;
      }
    });

    for (let i = 0; i < room.openings.length; i++) {
      const op = room.openings[i];
      const item = document.createElement('div');
      item.className = 'opening-item';

      // Typ
      const typeSelect = document.createElement('select');
      typeSelect.innerHTML = `<option value="door"${op.type === 'door' ? ' selected' : ''}>T\u00fcr</option><option value="window"${op.type === 'window' ? ' selected' : ''}>Fenster</option>`;
      typeSelect.addEventListener('change', () => {
        const newOpenings = [...room.openings];
        newOpenings[i] = { ...newOpenings[i], type: typeSelect.value as 'door' | 'window' };
        store.updateRoom(room.id, { openings: newOpenings });
        rerender();
      });

      // Wand
      const wallSelect = document.createElement('select');
      wallSelect.style.width = '110px';
      for (let wi = 0; wi < room.walls.length; wi++) {
        const opt = document.createElement('option');
        opt.value = String(wi);
        opt.textContent = wallLabels[wi];
        if (wi === op.wall) opt.selected = true;
        wallSelect.appendChild(opt);
      }
      wallSelect.addEventListener('change', () => {
        const newOpenings = [...room.openings];
        newOpenings[i] = { ...newOpenings[i], wall: parseInt(wallSelect.value) };
        store.updateRoom(room.id, { openings: newOpenings });
        rerender();
      });

      // Position
      const posLabel = document.createElement('span');
      posLabel.textContent = 'Pos:';
      posLabel.style.fontSize = '11px';
      posLabel.style.color = '#888';
      const posInput = document.createElement('input');
      posInput.type = 'number';
      posInput.min = '0';
      posInput.max = '1';
      posInput.step = '0.05';
      posInput.value = String(op.position);
      posInput.addEventListener('change', () => {
        const val = Math.max(0, Math.min(1, parseFloat(posInput.value) || 0));
        const newOpenings = [...room.openings];
        newOpenings[i] = { ...newOpenings[i], position: val };
        store.updateRoom(room.id, { openings: newOpenings });
        rerender();
      });

      // Breite
      const widthLabel = document.createElement('span');
      widthLabel.textContent = 'B:';
      widthLabel.style.fontSize = '11px';
      widthLabel.style.color = '#888';
      const widthInput = document.createElement('input');
      widthInput.type = 'number';
      widthInput.min = '30';
      widthInput.step = '10';
      widthInput.value = String(op.width);
      widthInput.addEventListener('change', () => {
        const val = Math.max(30, parseInt(widthInput.value) || 100);
        const newOpenings = [...room.openings];
        newOpenings[i] = { ...newOpenings[i], width: val };
        store.updateRoom(room.id, { openings: newOpenings });
        rerender();
      });

      // L\u00f6schen
      const removeBtn = document.createElement('button');
      removeBtn.className = 'btn-remove';
      removeBtn.textContent = '\u2715';
      removeBtn.addEventListener('click', () => {
        store.removeOpening(room.id, i);
        rerender();
      });

      item.appendChild(typeSelect);
      item.appendChild(wallSelect);
      item.appendChild(posLabel);
      item.appendChild(posInput);
      item.appendChild(widthLabel);
      item.appendChild(widthInput);
      item.appendChild(removeBtn);
      frag.appendChild(item);
    }

    if (room.openings.length === 0) {
      const empty = document.createElement('div');
      empty.style.cssText = 'color:#999;font-size:12px;padding:6px 0;';
      empty.textContent = 'Keine T\u00fcren oder Fenster. Klicke "+ Hinzuf\u00fcgen".';
      frag.appendChild(empty);
    }

    // ── Raum l\u00f6schen
    const deleteSection = document.createElement('div');
    deleteSection.style.cssText = 'margin-top:24px;padding-top:12px;border-top:1px solid #eee;';
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn-sm danger';
    deleteBtn.textContent = 'Raum l\u00f6schen';
    deleteBtn.addEventListener('click', () => {
      if (confirm(`"${room.name}" wirklich l\u00f6schen?`)) {
        store.removeRoom(room.id);
        editorSelectedRoomId = null;
        rerender();
      }
    });
    deleteSection.appendChild(deleteBtn);
    frag.appendChild(deleteSection);

    return frag;
  }

  rerender();
  document.body.appendChild(overlay);

  // Escape schlie\u00dft
  const escHandler = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      overlay.remove();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);
}

function createNumberField(label: string, value: number, onChange: (v: number) => void): HTMLElement {
  const group = document.createElement('div');
  group.className = 'form-group';
  const lbl = document.createElement('label');
  lbl.textContent = label;
  const input = document.createElement('input');
  input.type = 'number';
  input.value = String(Math.round(value));
  input.addEventListener('change', () => {
    const v = parseFloat(input.value);
    if (!isNaN(v)) onChange(v);
  });
  group.appendChild(lbl);
  group.appendChild(input);
  return group;
}

// ─── Raum-Zeichenmodus ──────────────────────────────────────
const drawingState: DrawingState = { points: [], cursorPos: null };
let isDrawing = false;
let drawingBannerEl: HTMLElement | null = null;

function startDrawing() {
  isDrawing = true;
  drawingState.points = [];
  drawingState.cursorPos = null;
  renderer.setDrawingState(drawingState);
  store.setTool('draw-wall');
  canvas.style.cursor = 'crosshair';
  showDrawingBanner();
  updateWelcomeHint();
}

function cancelDrawing() {
  isDrawing = false;
  drawingState.points = [];
  drawingState.cursorPos = null;
  renderer.setDrawingState(null);
  store.setTool('select');
  canvas.style.cursor = 'default';
  hideDrawingBanner();
  updateWelcomeHint();
}

function finishDrawing() {
  if (drawingState.points.length < 3) {
    cancelDrawing();
    return;
  }

  const pts = drawingState.points;
  // Raum-Name abfragen
  const name = prompt('Raumname:', 'Neuer Raum');
  if (!name) {
    cancelDrawing();
    return;
  }

  // Wände aus Punkten erstellen
  const walls: Wall[] = [];
  for (let i = 0; i < pts.length; i++) {
    walls.push({
      start: { x: pts[i].x, y: pts[i].y },
      end: { x: pts[(i + 1) % pts.length].x, y: pts[(i + 1) % pts.length].y },
      thickness: 25,
    });
  }

  // Zufällige Pastellfarbe
  const colors = ['#faf3e8', '#e8eef5', '#eef5e8', '#f5eee8', '#f0e8f5', '#e8f0f5', '#f5f0e8', '#e8f5f0'];
  const color = colors[Math.floor(Math.random() * colors.length)];

  const newRoom: Room = {
    id: `room-${Date.now()}`,
    name,
    color,
    walls,
    openings: [],
  };

  store.addRoom(newRoom);
  cancelDrawing();
  // Neuen Raum direkt auswählen
  store.selectRoom(newRoom.id);
}

function undoLastPoint() {
  if (drawingState.points.length > 0) {
    drawingState.points.pop();
    renderer.setDrawingState(drawingState);
    if (drawingState.points.length === 0) {
      cancelDrawing();
    }
  }
}

function showDrawingBanner() {
  hideDrawingBanner();
  drawingBannerEl = document.createElement('div');
  drawingBannerEl.className = 'drawing-banner';
  drawingBannerEl.innerHTML = `
    <span>Raum zeichnen</span>
    <span class="hint">Klicke, um Eckpunkte zu setzen. Klicke auf den Startpunkt (rot), um den Raum zu schlie\u00dfen.</span>
  `;
  const undoBtn = document.createElement('button');
  undoBtn.textContent = 'R\u00fcckg\u00e4ngig';
  undoBtn.addEventListener('click', undoLastPoint);
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Abbrechen';
  cancelBtn.addEventListener('click', cancelDrawing);
  drawingBannerEl.appendChild(undoBtn);
  drawingBannerEl.appendChild(cancelBtn);
  canvasContainer.appendChild(drawingBannerEl);
}

function hideDrawingBanner() {
  if (drawingBannerEl) {
    drawingBannerEl.remove();
    drawingBannerEl = null;
  }
}

function snapToGridValue(v: number): number {
  const state = store.getState();
  if (!state.snapToGrid) return v;
  const g = state.gridSize;
  return Math.round(v / g) * g;
}

// ─── Canvas Interaktion ─────────────────────────────────────
let isDragging = false;
let isPanning = false;
let dragTarget: string | null = null;
let dragOffset: Point = { x: 0, y: 0 };
let lastPanPos: Point = { x: 0, y: 0 };

function getCanvasPos(e: MouseEvent): Point {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

canvas.addEventListener('mousedown', (e) => {
  const pos = getCanvasPos(e);
  const state = store.getState();

  if (state.tool === 'pan' || e.button === 1) {
    isPanning = true;
    lastPanPos = { x: e.clientX, y: e.clientY };
    canvas.style.cursor = 'grabbing';
    return;
  }

  if (state.tool === 'draw-wall' && e.button === 0) {
    const worldPos = renderer.canvasToWorld(state, pos.x, pos.y);
    const sx = snapToGridValue(worldPos.x);
    const sy = snapToGridValue(worldPos.y);

    if (!isDrawing) {
      startDrawing();
    }

    // Prüfen ob wir den Startpunkt treffen (Raum schließen)
    if (drawingState.points.length >= 3) {
      const first = drawingState.points[0];
      const dist = Math.sqrt((sx - first.x) ** 2 + (sy - first.y) ** 2);
      if (dist < 30) {
        finishDrawing();
        return;
      }
    }

    drawingState.points.push({ x: sx, y: sy });
    renderer.setDrawingState(drawingState);
    return;
  }

  if (state.tool === 'select') {
    const hitFurnId = renderer.hitTest(state, pos.x, pos.y);
    if (hitFurnId) {
      store.selectFurniture(hitFurnId);
      isDragging = true;
      dragTarget = hitFurnId;
      const placed = state.placedFurniture.find(f => f.id === hitFurnId)!;
      const worldPos = renderer.canvasToWorld(state, pos.x, pos.y);
      dragOffset = { x: placed.x - worldPos.x, y: placed.y - worldPos.y };
      canvas.style.cursor = 'move';
    } else {
      // Raum auswählen oder Auswahl aufheben
      const hitRoomId = renderer.hitTestRoom(state, pos.x, pos.y);
      store.selectRoom(hitRoomId);
    }
  }
});

canvas.addEventListener('mousemove', (e) => {
  const state = store.getState();

  if (isPanning) {
    const dx = e.clientX - lastPanPos.x;
    const dy = e.clientY - lastPanPos.y;
    store.setPanOffset({ x: state.panOffset.x + dx, y: state.panOffset.y + dy });
    lastPanPos = { x: e.clientX, y: e.clientY };
    return;
  }

  if (isDragging && dragTarget) {
    const pos = getCanvasPos(e);
    const worldPos = renderer.canvasToWorld(state, pos.x, pos.y);
    store.moveFurniture(dragTarget, worldPos.x + dragOffset.x, worldPos.y + dragOffset.y);
    return;
  }

  // Zeichenmodus: Cursor-Position aktualisieren
  if (state.tool === 'draw-wall' && isDrawing) {
    const pos = getCanvasPos(e);
    const worldPos = renderer.canvasToWorld(state, pos.x, pos.y);
    drawingState.cursorPos = {
      x: snapToGridValue(worldPos.x),
      y: snapToGridValue(worldPos.y),
    };
    renderer.setDrawingState(drawingState);
    canvas.style.cursor = 'crosshair';
    return;
  }

  // Cursor-Feedback
  if (state.tool === 'select') {
    const pos = getCanvasPos(e);
    const hitId = renderer.hitTest(state, pos.x, pos.y);
    canvas.style.cursor = hitId ? 'move' : 'default';
  } else if (state.tool === 'pan') {
    canvas.style.cursor = 'grab';
  } else if (state.tool === 'draw-wall') {
    canvas.style.cursor = 'crosshair';
  }
});

canvas.addEventListener('mouseup', () => {
  isDragging = false;
  isPanning = false;
  dragTarget = null;
  const state = store.getState();
  if (state.tool === 'draw-wall') {
    canvas.style.cursor = 'crosshair';
  } else {
    canvas.style.cursor = state.tool === 'pan' ? 'grab' : 'default';
  }
});

canvas.addEventListener('dblclick', () => {
  const state = store.getState();
  if (state.tool === 'draw-wall' && isDrawing && drawingState.points.length >= 3) {
    // Letzten doppelklick-Punkt entfernen (wurde durch mousedown hinzugefügt)
    drawingState.points.pop();
    finishDrawing();
  }
});

canvas.addEventListener('mouseleave', () => {
  isDragging = false;
  isPanning = false;
  dragTarget = null;
});

// Zoom mit Mausrad
canvas.addEventListener('wheel', (e) => {
  e.preventDefault();
  const state = store.getState();
  const delta = e.deltaY > 0 ? -0.08 : 0.08;
  const newZoom = Math.max(0.2, Math.min(3, state.zoom + delta));

  // Zoom zum Mauszeiger
  const pos = getCanvasPos(e);
  const wx = (pos.x - state.panOffset.x) / state.zoom;
  const wy = (pos.y - state.panOffset.y) / state.zoom;

  store.setZoom(newZoom);
  store.setPanOffset({
    x: pos.x - wx * newZoom,
    y: pos.y - wy * newZoom,
  });
}, { passive: false });

// Drag & Drop vom Katalog auf Canvas
canvas.addEventListener('dragover', (e) => {
  e.preventDefault();
  e.dataTransfer!.dropEffect = 'copy';
  const pos = getCanvasPos(e);
  const state = store.getState();
  const worldPos = renderer.canvasToWorld(state, pos.x, pos.y);
  renderer.setGhostPosition({
    x: (pos.x - state.panOffset.x) / state.zoom,
    y: (pos.y - state.panOffset.y) / state.zoom,
  });
});

canvas.addEventListener('drop', (e) => {
  e.preventDefault();
  const defId = e.dataTransfer!.getData('text/plain');
  if (!defId) return;
  const pos = getCanvasPos(e);
  const state = store.getState();
  const worldPos = renderer.canvasToWorld(state, pos.x, pos.y);
  // Automatische Raumzuordnung
  const roomId = renderer.getRoomAtWorldPoint(state, worldPos.x, worldPos.y) ?? undefined;
  store.placeFurniture(defId, worldPos.x, worldPos.y, roomId);
  renderer.setGhostPosition(null);
});

canvas.addEventListener('dragleave', () => {
  renderer.setGhostPosition(null);
});

// ─── Tastaturkürzel ─────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  // Nicht reagieren wenn Suchfeld fokussiert
  if (document.activeElement === searchInput) return;

  const state = store.getState();

  switch (e.key) {
    case 'Delete':
    case 'Backspace':
      store.deleteSelected();
      break;
    case 'v':
    case 'V':
      store.setTool('select');
      break;
    case 'h':
    case 'H':
      store.setTool('pan');
      break;
    case 'g':
    case 'G':
      store.toggleGrid();
      break;
    case 's':
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        exportProject();
      } else {
        store.toggleSnap();
      }
      break;
    case 'r':
    case 'R':
      if (state.selectedFurnitureId) {
        store.rotateFurniture(state.selectedFurnitureId, e.shiftKey ? -15 : 15);
      }
      break;
    case 'd':
    case 'D':
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        store.duplicateSelected();
      }
      break;
    case '+':
    case '=':
      store.setZoom(state.zoom + 0.1);
      break;
    case '-':
      store.setZoom(state.zoom - 0.1);
      break;
    case '0':
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        fitZoom();
      }
      break;
    case 'w':
    case 'W':
      if (!e.ctrlKey && !e.metaKey) {
        if (isDrawing) {
          cancelDrawing();
        } else {
          store.setTool('draw-wall');
        }
      }
      break;
    case 'e':
    case 'E':
      if (!e.ctrlKey && !e.metaKey && !isDrawing) {
        openFloorPlanEditor();
      }
      break;
    case 'z':
    case 'Z':
      if ((e.ctrlKey || e.metaKey) && isDrawing) {
        e.preventDefault();
        undoLastPoint();
      }
      break;
    case 'Escape':
      if (isDrawing) {
        cancelDrawing();
      } else {
        store.selectFurniture(null);
        store.selectRoom(null);
      }
      break;
  }
});

// ─── Zoom einpassen ─────────────────────────────────────────
function fitZoom() {
  const state = store.getState();
  const scale = state.floorPlan.scale;

  if (state.floorPlan.rooms.length === 0) {
    // Leere Canvas: Standardansicht zentriert
    store.setZoom(1);
    store.setPanOffset({
      x: canvasContainer.clientWidth / 2,
      y: canvasContainer.clientHeight / 2,
    });
    return;
  }

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const room of state.floorPlan.rooms) {
    for (const wall of room.walls) {
      minX = Math.min(minX, wall.start.x, wall.end.x);
      minY = Math.min(minY, wall.start.y, wall.end.y);
      maxX = Math.max(maxX, wall.start.x, wall.end.x);
      maxY = Math.max(maxY, wall.start.y, wall.end.y);
    }
  }
  const planW = (maxX - minX) * scale;
  const planH = (maxY - minY) * scale;
  const cW = canvasContainer.clientWidth;
  const cH = canvasContainer.clientHeight;
  const pad = 80;
  const zoom = Math.min((cW - pad) / planW, (cH - pad) / planH, 2);
  store.setZoom(zoom);
  store.setPanOffset({
    x: (cW - planW * zoom) / 2 - minX * scale * zoom,
    y: (cH - planH * zoom) / 2 - minY * scale * zoom,
  });
}

// ─── Render Loop ────────────────────────────────────────────
function renderLoop() {
  renderer.resize();
  renderer.render(store.getState());
  requestAnimationFrame(renderLoop);
}

// ─── State abonnieren ───────────────────────────────────────
store.subscribe(() => {
  renderToolbar();
  renderProperties();
  renderStatusbar();
  updateWelcomeHint();
});

// ─── Initialisierung ────────────────────────────────────────
renderToolbar();
renderProperties();
renderStatusbar();
updateWelcomeHint();
requestAnimationFrame(renderLoop);

// Beim Laden einpassen
setTimeout(fitZoom, 100);
