/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Yemen Mechatronics Lab - High-Fidelity Circuit Snapshot & Diagram Capture Utility
 */

import { CircuitElement, WireConnection } from '../types/circuit';

export interface SnapshotOptions {
  theme?: 'dark' | 'light' | 'blueprint';
  padding?: number;
  scale?: number;
}

/**
 * Captures the current circuit diagram from SVG canvas or elements as a high-res PNG Data URL
 */
export async function captureCircuitSnapshot(
  elements: CircuitElement[],
  _wires: WireConnection[],
  options: SnapshotOptions = {}
): Promise<string> {
  const { theme = 'dark', padding = 80, scale = 2 } = options;

  if (elements.length === 0) {
    return generateEmptyCircuitPlaceholder();
  }

  try {
    const svgEl = document.getElementById('circuit-svg-canvas') as SVGSVGElement | null;

    // Calculate bounding box of all elements
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    for (const el of elements) {
      minX = Math.min(minX, el.x);
      minY = Math.min(minY, el.y);
      maxX = Math.max(maxX, el.x);
      maxY = Math.max(maxY, el.y);
    }

    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    let width = Math.max(640, maxX - minX);
    let height = Math.max(380, maxY - minY);

    // Keep pleasant aspect ratio (approx 16:9 or 16:10 for lab reports)
    if (width / height > 2.2) {
      height = width / 2;
    } else if (height / width > 1.4) {
      width = height * 1.4;
    }

    // Try extracting inner SVG elements (wires layer and components)
    let innerContent = '';
    if (svgEl) {
      // Find wires layer and components in the SVG
      const wireLayerEl = svgEl.querySelector('g.wire-layer, g[class*="wire"]') || svgEl.querySelector('g:nth-child(2)');
      // If we query all component groups
      const componentGroups = svgEl.querySelectorAll('g[onpointerdown]');
      
      // If found, clone and serialize them
      const parts: string[] = [];
      const serializer = new XMLSerializer();

      // Find the g that contains everything under the pan/zoom transform
      const mainPanGroup = svgEl.querySelector('g[transform*="translate"]');
      if (mainPanGroup) {
        // Clone and extract only the relevant children (wires and components, skip infinite background rects)
        const clonedMain = mainPanGroup.cloneNode(true) as SVGGElement;
        // Remove infinite background rects
        const bgRects = clonedMain.querySelectorAll('rect[width="8000"], image');
        bgRects.forEach(r => r.remove());
        // Remove origin cross if any
        parts.push(clonedMain.innerHTML);
      } else {
        componentGroups.forEach(cg => parts.push(serializer.serializeToString(cg)));
        if (wireLayerEl) parts.push(serializer.serializeToString(wireLayerEl));
      }
      innerContent = parts.join('\n');
    }

    // Background and stroke styling depending on theme
    const bgFill = theme === 'light' ? '#f8fafc' : theme === 'blueprint' ? '#0c2340' : '#090d16';
    const borderStroke = theme === 'light' ? '#cbd5e1' : theme === 'blueprint' ? '#1d4ed8' : '#1e293b';
    const gridDotFill = theme === 'light' ? '#94a3b8' : theme === 'blueprint' ? '#38bdf8' : '#334155';
    const labelFill = theme === 'light' ? '#334155' : '#94a3b8';

    const standaloneSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="${minX} ${minY} ${width} ${height}">
  <defs>
    <pattern id="report-grid-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
      <circle cx="10" cy="10" r="1.2" fill="${gridDotFill}" opacity="0.5"/>
    </pattern>
  </defs>
  
  <!-- Canvas Background -->
  <rect x="${minX}" y="${minY}" width="${width}" height="${height}" fill="${bgFill}" rx="12" />
  <rect x="${minX}" y="${minY}" width="${width}" height="${height}" fill="url(#report-grid-pattern)" />
  <rect x="${minX}" y="${minY}" width="${width}" height="${height}" fill="none" stroke="${borderStroke}" stroke-width="2" rx="12" />

  <!-- Watermark & Lab Branding in corner -->
  <g opacity="0.6">
    <text x="${minX + 16}" y="${minY + 24}" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="bold" fill="${labelFill}" direction="rtl">
      مختبر الميكاترونكس اليمني • مخطط المحاكاة المعملية
    </text>
  </g>

  <!-- Circuit Content -->
  <g>
    ${innerContent}
  </g>
</svg>
    `.trim();

    // Render SVG into HTML Canvas to produce high-resolution PNG
    return await new Promise<string>((resolve) => {
      const img = new Image();
      const svgBlob = new Blob([standaloneSvg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width * scale;
        canvas.height = height * scale;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/png');
          URL.revokeObjectURL(url);
          resolve(dataUrl);
        } else {
          URL.revokeObjectURL(url);
          resolve(generateEmptyCircuitPlaceholder());
        }
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        // Fallback to schematic canvas rendering
        resolve(renderSchematicToCanvasFallback(elements, width, height, minX, minY));
      };

      img.src = url;
    });
  } catch (err) {
    console.error('Error capturing circuit snapshot:', err);
    return generateEmptyCircuitPlaceholder();
  }
}

/**
 * Fallback schematic rendering directly via 2D Canvas if SVG serialization encounters limitations
 */
function renderSchematicToCanvasFallback(
  elements: CircuitElement[],
  width: number,
  height: number,
  minX: number,
  minY: number
): string {
  const canvas = document.createElement('canvas');
  canvas.width = width * 2;
  canvas.height = height * 2;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.scale(2, 2);
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, width, height);

  // Draw grid
  ctx.fillStyle = '#1e293b';
  for (let x = 0; x < width; x += 20) {
    for (let y = 0; y < height; y += 20) {
      ctx.fillRect(x, y, 1.5, 1.5);
    }
  }

  // Draw elements
  ctx.font = '12px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (const el of elements) {
    const rx = el.x - minX;
    const ry = el.y - minY;

    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(rx, ry, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillText(el.label || el.type, rx, ry - 30);
    ctx.font = '10px monospace';
    ctx.fillStyle = '#38bdf8';
    ctx.fillText(`${el.value} ${el.unit}`, rx, ry + 30);
  }

  return canvas.toDataURL('image/png');
}

/**
 * Generates an informative placeholder graphic when no components exist on the canvas
 */
export function generateEmptyCircuitPlaceholder(): string {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, 800, 400);

  // Border
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 4;
  ctx.strokeRect(10, 10, 780, 380);

  // Text
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('مختبر الميكاترونكس اليمني - مساحة العمل خالية', 400, 180);

  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px system-ui, sans-serif';
  ctx.fillText('قم بإضافة عناصر وتوصيلها في المختبر لتوليد مخطط الدائرة وتضمينه في التقرير', 400, 220);

  return canvas.toDataURL('image/png');
}
