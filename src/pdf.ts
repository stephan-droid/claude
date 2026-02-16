import { store } from './state';
import { getDefinitionById } from './catalog';
import { Room, PlacedFurniture } from './types';

/**
 * Exportiert den aktuellen Grundriss als PDF.
 * Verwendet einen offscreen Canvas und erzeugt daraus ein PDF über
 * eine minimale PDF-Erzeugung (keine externe Bibliothek nötig).
 */
export function exportAsPDF() {
  const state = store.getState();
  const scale = state.floorPlan.scale;

  // Bounding Box berechnen
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const room of state.floorPlan.rooms) {
    for (const wall of room.walls) {
      minX = Math.min(minX, wall.start.x, wall.end.x);
      minY = Math.min(minY, wall.start.y, wall.end.y);
      maxX = Math.max(maxX, wall.start.x, wall.end.x);
      maxY = Math.max(maxY, wall.start.y, wall.end.y);
    }
  }

  const padding = 60;
  const planW = (maxX - minX) * scale;
  const planH = (maxY - minY) * scale;

  // A4-Querformat in Punkten (595.28 x 841.89 -> quer: 841.89 x 595.28)
  const pageW = 841.89;
  const pageH = 595.28;

  const drawMargin = 50;
  const titleHeight = 60;
  const legendHeight = 40;
  const availW = pageW - drawMargin * 2;
  const availH = pageH - drawMargin * 2 - titleHeight - legendHeight;

  const drawScale = Math.min(availW / (planW + padding * 2), availH / (planH + padding * 2));

  // Offscreen-Canvas erstellen
  const canvasW = Math.ceil(planW + padding * 2);
  const canvasH = Math.ceil(planH + padding * 2);
  const offscreen = document.createElement('canvas');
  offscreen.width = canvasW * 2;  // 2x für schärfere Auflösung
  offscreen.height = canvasH * 2;
  const ctx = offscreen.getContext('2d')!;
  ctx.scale(2, 2);

  // Hintergrund
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvasW, canvasH);

  ctx.save();
  ctx.translate(padding - minX * scale, padding - minY * scale);

  // Raster zeichnen (fein)
  const gridPx = 50 * scale;
  ctx.strokeStyle = '#e8e8e8';
  ctx.lineWidth = 0.5;
  for (let x = Math.floor(minX * scale / gridPx) * gridPx; x <= maxX * scale; x += gridPx) {
    ctx.beginPath();
    ctx.moveTo(x, minY * scale);
    ctx.lineTo(x, maxY * scale);
    ctx.stroke();
  }
  for (let y = Math.floor(minY * scale / gridPx) * gridPx; y <= maxY * scale; y += gridPx) {
    ctx.beginPath();
    ctx.moveTo(minX * scale, y);
    ctx.lineTo(maxX * scale, y);
    ctx.stroke();
  }

  // Räume zeichnen
  for (const room of state.floorPlan.rooms) {
    drawRoomForPDF(ctx, room, scale);
  }

  // Möbel zeichnen
  for (const placed of state.placedFurniture) {
    drawFurnitureForPDF(ctx, placed, scale);
  }

  ctx.restore();

  // Canvas als JPEG-Daten holen
  const imgData = offscreen.toDataURL('image/jpeg', 0.95);

  // PDF erzeugen
  const pdf = buildPDF(imgData, canvasW * 2, canvasH * 2, pageW, pageH, {
    title: state.floorPlan.name,
    roomCount: state.floorPlan.rooms.length,
    furnitureCount: state.placedFurniture.length,
    drawMargin,
    titleHeight,
    drawScale,
    availW,
    availH,
    planW: canvasW,
    planH: canvasH,
  });

  // Download
  const blob = new Blob([pdf.buffer as ArrayBuffer], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${state.floorPlan.name || 'raumplan'}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function drawRoomForPDF(ctx: CanvasRenderingContext2D, room: Room, scale: number) {
  if (room.walls.length === 0) return;

  // Fläche
  ctx.beginPath();
  ctx.moveTo(room.walls[0].start.x * scale, room.walls[0].start.y * scale);
  for (const wall of room.walls) {
    ctx.lineTo(wall.end.x * scale, wall.end.y * scale);
  }
  ctx.closePath();
  ctx.fillStyle = room.color;
  ctx.fill();

  // Wände
  for (const wall of room.walls) {
    ctx.beginPath();
    ctx.moveTo(wall.start.x * scale, wall.start.y * scale);
    ctx.lineTo(wall.end.x * scale, wall.end.y * scale);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = wall.thickness * scale * 0.3;
    ctx.lineCap = 'round';
    ctx.stroke();
  }

  // Öffnungen
  for (const opening of room.openings) {
    const wall = room.walls[opening.wall];
    if (!wall) continue;
    const sx = wall.start.x * scale;
    const sy = wall.start.y * scale;
    const ex = wall.end.x * scale;
    const ey = wall.end.y * scale;
    const cx = sx + (ex - sx) * opening.position;
    const cy = sy + (ey - sy) * opening.position;
    const halfW = (opening.width * scale) / 2;
    const dx = ex - sx;
    const dy = ey - sy;
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = dx / len;
    const ny = dy / len;

    ctx.beginPath();
    ctx.moveTo(cx - nx * halfW, cy - ny * halfW);
    ctx.lineTo(cx + nx * halfW, cy + ny * halfW);
    ctx.strokeStyle = opening.type === 'door' ? room.color : '#e8f4ff';
    ctx.lineWidth = wall.thickness * scale * 0.35;
    ctx.stroke();

    if (opening.type === 'window') {
      const perpX = -ny;
      const perpY = nx;
      const off = wall.thickness * scale * 0.1;
      ctx.beginPath();
      ctx.moveTo(cx - nx * halfW + perpX * off, cy - ny * halfW + perpY * off);
      ctx.lineTo(cx + nx * halfW + perpX * off, cy + ny * halfW + perpY * off);
      ctx.moveTo(cx - nx * halfW - perpX * off, cy - ny * halfW - perpY * off);
      ctx.lineTo(cx + nx * halfW - perpX * off, cy + ny * halfW - perpY * off);
      ctx.strokeStyle = '#4a90d9';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  // Raumname
  let cxR = 0, cyR = 0;
  for (const w of room.walls) { cxR += w.start.x; cyR += w.start.y; }
  cxR = (cxR / room.walls.length) * scale;
  cyR = (cyR / room.walls.length) * scale;
  ctx.fillStyle = '#555';
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(room.name, cxR, cyR);
}

function drawFurnitureForPDF(ctx: CanvasRenderingContext2D, placed: PlacedFurniture, scale: number) {
  const def = getDefinitionById(placed.definitionId);
  if (!def) return;

  const px = placed.x * scale;
  const py = placed.y * scale;
  const pw = def.width * scale * placed.scaleX;
  const ph = def.height * scale * placed.scaleY;

  ctx.save();
  ctx.translate(px, py);
  ctx.rotate((placed.rotation * Math.PI) / 180);

  // Körper
  ctx.fillStyle = def.color;
  ctx.fillRect(-pw / 2, -ph / 2, pw, ph);
  ctx.strokeStyle = '#00000040';
  ctx.lineWidth = 0.8;
  ctx.strokeRect(-pw / 2, -ph / 2, pw, ph);

  // Name
  const fontSize = Math.max(6, Math.min(pw, ph) * 0.13);
  ctx.fillStyle = '#333';
  ctx.font = `${fontSize}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(def.name, 0, 0);

  ctx.restore();
}

interface PDFMeta {
  title: string;
  roomCount: number;
  furnitureCount: number;
  drawMargin: number;
  titleHeight: number;
  drawScale: number;
  availW: number;
  availH: number;
  planW: number;
  planH: number;
}

/**
 * Erzeugt ein minimales PDF mit eingebettetem JPEG-Bild.
 * Kein externes Library nötig – reines Uint8Array-PDF.
 */
function buildPDF(
  jpegDataUrl: string,
  imgW: number,
  imgH: number,
  pageW: number,
  pageH: number,
  meta: PDFMeta
): Uint8Array {
  // JPEG-Rohdaten aus Data-URL extrahieren
  const base64 = jpegDataUrl.split(',')[1];
  const binaryStr = atob(base64);
  const jpegBytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    jpegBytes[i] = binaryStr.charCodeAt(i);
  }

  // Bild skaliert in den verfügbaren Bereich
  const imgScale = Math.min(meta.availW / meta.planW, meta.availH / meta.planH);
  const drawW = meta.planW * imgScale;
  const drawH = meta.planH * imgScale;
  const drawX = meta.drawMargin + (meta.availW - drawW) / 2;
  const drawY = pageH - meta.drawMargin - meta.titleHeight - drawH;

  // PDF-Objekte aufbauen
  const objects: string[] = [];
  const offsets: number[] = [];
  let content = '';

  function addObj(obj: string): number {
    objects.push(obj);
    return objects.length;
  }

  // 1: Catalog
  addObj('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');

  // 2: Pages
  addObj('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');

  // Titel- und Fusstext
  const titleText = meta.title || 'Schulraumplan';
  const dateStr = new Date().toLocaleDateString('de-DE');
  const infoText = `${meta.roomCount} R\\344ume | ${meta.furnitureCount} M\\366belst\\374cke | Erstellt: ${dateStr}`;

  // 4: Font
  addObj('4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n');

  // 5: Bold Font
  addObj('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n');

  // 6: Image XObject
  const imgObj = `6 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgW} /Height ${imgH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`;
  addObj(imgObj); // Platzhalter – wird beim Schreiben speziell behandelt

  // Stream-Inhalt: Titel, Bild, Infozeile
  const stream = [
    'BT',
    '/F2 18 Tf',
    `${meta.drawMargin} ${pageH - meta.drawMargin - 20} Td`,
    `(${escapePDF(titleText)}) Tj`,
    'ET',
    'BT',
    '/F1 9 Tf',
    '0.4 0.4 0.4 rg',
    `${meta.drawMargin} ${pageH - meta.drawMargin - 38} Td`,
    `(${escapePDF(infoText)}) Tj`,
    '0 0 0 rg',
    'ET',
    'q',
    `${drawW} 0 0 ${drawH} ${drawX} ${drawY} cm`,
    '/Img1 Do',
    'Q',
    // Rahmen um Bild
    '0.8 0.8 0.8 RG',
    '0.5 w',
    `${drawX} ${drawY} ${drawW} ${drawH} re S`,
    // Fusszeile
    'BT',
    '/F1 8 Tf',
    '0.6 0.6 0.6 rg',
    `${meta.drawMargin} ${meta.drawMargin - 15} Td`,
    `(Schulraumplaner \\267 Ma\\337stab: 1:50 \\267 ${escapePDF(dateStr)}) Tj`,
    'ET',
  ].join('\n');

  const streamBytes = new TextEncoder().encode(stream);

  // 7: Content stream
  addObj(`7 0 obj\n<< /Length ${streamBytes.length} >>\nstream\n`);

  // 3: Page
  // Einfügen an Position 3 (Index 2)
  objects.splice(2, 0,
    `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Contents 7 0 R /Resources << /Font << /F1 4 0 R /F2 5 0 R >> /XObject << /Img1 6 0 R >> >> >>\nendobj\n`
  );

  // Jetzt alles binär zusammenbauen
  const parts: (string | Uint8Array)[] = [];
  parts.push('%PDF-1.4\n%\xFF\xFF\xFF\xFF\n');

  for (let i = 0; i < objects.length; i++) {
    offsets.push(calcLength(parts));
    parts.push(objects[i]);

    // Spezialbehandlung für Bild (Objekt 6 = Index 5 nach splice -> suchen nach "6 0 obj")
    if (objects[i].includes('/DCTDecode')) {
      parts.push(jpegBytes);
      parts.push('\nendstream\nendobj\n');
    }
    // Spezialbehandlung für Content-Stream (Objekt 7)
    if (objects[i].includes('7 0 obj') || (objects[i].includes('/Length') && !objects[i].includes('/DCTDecode') && !objects[i].includes('/Type'))) {
      if (objects[i].startsWith('7 0 obj')) {
        parts.push(streamBytes);
        parts.push(new TextEncoder().encode('\nendstream\nendobj\n'));
      }
    }
  }

  // xref
  const xrefOffset = calcLength(parts);
  parts.push(`xref\n0 ${objects.length + 1}\n`);
  parts.push('0000000000 65535 f \n');
  for (const off of offsets) {
    parts.push(String(off).padStart(10, '0') + ' 00000 n \n');
  }

  parts.push('trailer\n');
  parts.push(`<< /Size ${objects.length + 1} /Root 1 0 R >>\n`);
  parts.push('startxref\n');
  parts.push(`${xrefOffset}\n`);
  parts.push('%%EOF\n');

  // Alles zusammenführen
  return concatParts(parts);
}

function escapePDF(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function calcLength(parts: (string | Uint8Array)[]): number {
  let len = 0;
  for (const p of parts) {
    if (typeof p === 'string') {
      len += new TextEncoder().encode(p).length;
    } else {
      len += p.length;
    }
  }
  return len;
}

function concatParts(parts: (string | Uint8Array)[]): Uint8Array {
  const totalLen = calcLength(parts);
  const result = new Uint8Array(totalLen);
  let offset = 0;
  for (const p of parts) {
    const bytes = typeof p === 'string' ? new TextEncoder().encode(p) : p;
    result.set(bytes, offset);
    offset += bytes.length;
  }
  return result;
}
