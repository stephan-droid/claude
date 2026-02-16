import { store } from './state';
import { Renderer } from './renderer';
import { FURNITURE_CATALOG, getCatalogByCategory, CATEGORY_LABELS, getDefinitionById } from './catalog';
import { FurnitureCategory, FurnitureDefinition, Point } from './types';
import { exportProject, importProject, importFloorPlan, exportAsSVG } from './io';

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

  /* ── Responsive ── */
  @media (max-width: 700px) {
    .sidebar { width: 220px; }
    .properties { width: 180px; }
  }
`;
document.head.appendChild(style);

// ─── App aufbauen ───────────────────────────────────────────
const app = document.getElementById('app')!;
app.innerHTML = `
  <div class="sidebar">
    <div class="sidebar-header">
      <h1>Raumplaner</h1>
      <p>Grundrisse virtuell einrichten</p>
    </div>
    <div class="sidebar-search">
      <input type="text" id="searchInput" placeholder="Möbel suchen..." />
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
      <button id="toggleGrid" class="${state.gridVisible ? 'active' : ''}" title="Raster an/aus">▦ Raster</button>
      <button id="toggleSnap" class="${state.snapToGrid ? 'active' : ''}" title="Am Raster einrasten">⊞ Einrasten</button>
    </div>
    <div class="toolbar-divider"></div>
    <div class="toolbar-group">
      <button id="importFloorPlan" title="Grundriss importieren">📐 Grundriss</button>
      <button id="importProject" title="Projekt laden">📂 Laden</button>
      <button id="exportProject" title="Projekt speichern">💾 Speichern</button>
      <button id="exportSVG" title="Als SVG exportieren">🖼 SVG</button>
    </div>
    <div class="toolbar-divider"></div>
    <div class="toolbar-group">
      <button id="clearAll" title="Alle Möbel entfernen">🗑 Leeren</button>
    </div>
  `;

  // Eventhandler
  toolbarEl.querySelectorAll('[data-tool]').forEach(btn => {
    btn.addEventListener('click', () => {
      store.setTool((btn as HTMLElement).dataset.tool as any);
    });
  });

  toolbarEl.querySelector('#zoomIn')?.addEventListener('click', () => store.setZoom(state.zoom + 0.1));
  toolbarEl.querySelector('#zoomOut')?.addEventListener('click', () => store.setZoom(state.zoom - 0.1));
  toolbarEl.querySelector('#zoomFit')?.addEventListener('click', fitZoom);
  toolbarEl.querySelector('#toggleGrid')?.addEventListener('click', () => store.toggleGrid());
  toolbarEl.querySelector('#toggleSnap')?.addEventListener('click', () => store.toggleSnap());
  toolbarEl.querySelector('#importFloorPlan')?.addEventListener('click', () => importFloorPlan());
  toolbarEl.querySelector('#importProject')?.addEventListener('click', () => importProject());
  toolbarEl.querySelector('#exportProject')?.addEventListener('click', () => exportProject());
  toolbarEl.querySelector('#exportSVG')?.addEventListener('click', () => exportAsSVG());
  toolbarEl.querySelector('#clearAll')?.addEventListener('click', () => {
    if (confirm('Alle platzierten Möbel entfernen?')) store.clearFurniture();
  });
}

// ─── Eigenschaftenpanel ─────────────────────────────────────
function renderProperties() {
  const state = store.getState();
  if (!state.selectedFurnitureId) {
    propertiesEl.innerHTML = '';
    return;
  }

  const placed = state.placedFurniture.find(f => f.id === state.selectedFurnitureId);
  if (!placed) { propertiesEl.innerHTML = ''; return; }
  const def = getDefinitionById(placed.definitionId);
  if (!def) { propertiesEl.innerHTML = ''; return; }

  propertiesEl.innerHTML = `
    <div class="properties">
      <h3>${def.icon} ${def.name}</h3>
      <div class="prop-row"><label>Position X:</label><span>${Math.round(placed.x)} cm</span></div>
      <div class="prop-row"><label>Position Y:</label><span>${Math.round(placed.y)} cm</span></div>
      <div class="prop-row"><label>Breite:</label><span>${Math.round(def.width * placed.scaleX)} cm</span></div>
      <div class="prop-row"><label>Tiefe:</label><span>${Math.round(def.height * placed.scaleY)} cm</span></div>
      <div class="prop-row"><label>Rotation:</label><span>${placed.rotation}°</span></div>
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
}

// ─── Statusleiste ───────────────────────────────────────────
function renderStatusbar() {
  const state = store.getState();
  const roomCount = state.floorPlan.rooms.length;
  const furnCount = state.placedFurniture.length;
  statusbarEl.innerHTML = `
    <span>Grundriss: ${state.floorPlan.name}</span>
    <span>Räume: ${roomCount}</span>
    <span>Möbel: ${furnCount}</span>
    <span>Zoom: ${Math.round(state.zoom * 100)}%</span>
    <span>Raster: ${state.snapToGrid ? 'Ein' : 'Aus'} (${state.gridSize}cm)</span>
  `;
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

  if (state.tool === 'select') {
    const hitId = renderer.hitTest(state, pos.x, pos.y);
    store.selectFurniture(hitId);

    if (hitId) {
      isDragging = true;
      dragTarget = hitId;
      const placed = state.placedFurniture.find(f => f.id === hitId)!;
      const worldPos = renderer.canvasToWorld(state, pos.x, pos.y);
      dragOffset = { x: placed.x - worldPos.x, y: placed.y - worldPos.y };
      canvas.style.cursor = 'move';
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

  // Cursor-Feedback
  if (state.tool === 'select') {
    const pos = getCanvasPos(e);
    const hitId = renderer.hitTest(state, pos.x, pos.y);
    canvas.style.cursor = hitId ? 'move' : 'default';
  } else if (state.tool === 'pan') {
    canvas.style.cursor = 'grab';
  }
});

canvas.addEventListener('mouseup', () => {
  isDragging = false;
  isPanning = false;
  dragTarget = null;
  const state = store.getState();
  canvas.style.cursor = state.tool === 'pan' ? 'grab' : 'default';
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
  store.placeFurniture(defId, worldPos.x, worldPos.y);
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
    case 'Escape':
      store.selectFurniture(null);
      break;
  }
});

// ─── Zoom einpassen ─────────────────────────────────────────
function fitZoom() {
  const state = store.getState();
  const scale = state.floorPlan.scale;
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
});

// ─── Initialisierung ────────────────────────────────────────
renderToolbar();
renderProperties();
renderStatusbar();
requestAnimationFrame(renderLoop);

// Beim Laden einpassen
setTimeout(fitZoom, 100);
