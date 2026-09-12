/**
 * Deliberately Permissive Spherical Light Source Detection
 * Rule: “Is it remotely spherical and bright? Yes -> Moon.”
 * Favors false positives over false negatives.
 */

export interface DetectedSphere {
  x: number; // center X in full-resolution image
  y: number; // center Y in full-resolution image
  radius: number; // radius in full-resolution image
}

declare global {
  interface Window {
    cv?: any;
    isOpenCvReady?: boolean;
  }
}

function isOpenCvAvailable(): boolean {
  return typeof window !== 'undefined' && !!window.cv && !!window.isOpenCvReady && typeof window.cv.Mat === 'function';
}

/**
 * Detects spheres using OpenCV.js with permissive thresholds.
 */
function detectWithOpenCv(canvas: HTMLCanvasElement, scale: number): DetectedSphere[] {
  const cv = window.cv;
  const src = cv.imread(canvas);
  const gray = new cv.Mat();
  const blurred = new cv.Mat();
  const thresh = new cv.Mat();
  const contours = new cv.MatVector();
  const hierarchy = new cv.Mat();

  const spheres: DetectedSphere[] = [];

  try {
    cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
    cv.GaussianBlur(gray, blurred, new cv.Size(5, 5), 0, 0, cv.BORDER_DEFAULT);

    // Permissive multi-pass thresholds: catch both soft glow (155) and bright cores (205)
    const thresholdValues = [155, 205];

    for (const tv of thresholdValues) {
      cv.threshold(blurred, thresh, tv, 255, cv.THRESH_BINARY);
      cv.findContours(thresh, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

      for (let i = 0; i < contours.size(); i++) {
        const contour = contours.get(i);
        const area = cv.contourArea(contour);
        const perimeter = cv.arcLength(contour, true);

        if (area < 10 || perimeter < 8) {
          contour.delete();
          continue;
        }

        // Circularity: 4 * PI * Area / (Perimeter ^ 2)
        // Deliberately permissive: 0.38 threshold (favors false positives)
        const circularity = (4 * Math.PI * area) / (perimeter * perimeter);
        const rect = cv.boundingRect(contour);
        const aspect = Math.min(rect.width, rect.height) / Math.max(rect.width, rect.height);

        const circle = cv.minEnclosingCircle(contour);
        const fullRadius = circle.radius * scale;

        if (circularity >= 0.38 && aspect >= 0.45 && fullRadius >= 3 && fullRadius <= 800) {
          spheres.push({
            x: circle.center.x * scale,
            y: circle.center.y * scale,
            radius: fullRadius,
          });
        }
        contour.delete();
      }
    }
  } finally {
    src.delete();
    gray.delete();
    blurred.delete();
    thresh.delete();
    contours.delete();
    hierarchy.delete();
  }

  return spheres;
}

/**
 * Pure Canvas / JS fallback for instant, permissive spherical detection.
 */
function detectWithCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  scale: number
): DetectedSphere[] {
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Grayscale & Luminance
  const gray = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    gray[i] = Math.round(0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2]);
  }

  // Permissive threshold: 160 (catches streetlamps, headlights, reflection balls, round windows)
  const thresholdVal = 160;
  const binary = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    if (gray[i] >= thresholdVal) {
      binary[i] = 1;
    }
  }

  const visited = new Uint8Array(width * height);
  const queue = new Int32Array(width * height);
  const spheres: DetectedSphere[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const startIdx = y * width + x;
      if (binary[startIdx] === 0 || visited[startIdx] === 1) continue;

      let qHead = 0, qTail = 0;
      queue[qTail++] = startIdx;
      visited[startIdx] = 1;

      let minX = x, maxX = x, minY = y, maxY = y;
      let sumX = 0, sumY = 0;
      let area = 0;
      let perimeter = 0;

      while (qHead < qTail) {
        const curr = queue[qHead++];
        const cx = curr % width;
        const cy = Math.floor(curr / width);

        area++;
        sumX += cx;
        sumY += cy;

        if (cx < minX) minX = cx;
        if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy;
        if (cy > maxY) maxY = cy;

        const neighbors = [
          cx > 0 ? curr - 1 : -1,
          cx < width - 1 ? curr + 1 : -1,
          cy > 0 ? curr - width : -1,
          cy < height - 1 ? curr + width : -1,
        ];

        let isEdge = false;
        for (const n of neighbors) {
          if (n === -1 || binary[n] === 0) {
            isEdge = true;
          } else if (visited[n] === 0) {
            visited[n] = 1;
            queue[qTail++] = n;
          }
        }
        if (isEdge) perimeter++;
      }

      if (area < 8 || perimeter < 6) continue;

      const w = maxX - minX + 1;
      const h = maxY - minY + 1;
      const aspect = Math.min(w, h) / Math.max(w, h);

      // Permissive circularity metric
      const effectiveP = perimeter * 0.88;
      const circularity = Math.min(1.0, (4 * Math.PI * area) / (effectiveP * effectiveP));
      const approxRadius = Math.sqrt(area / Math.PI);
      const fullRadius = approxRadius * scale;

      // Intentionally permissive filter: circularity >= 0.38, aspect >= 0.45
      if (circularity >= 0.38 && aspect >= 0.45 && fullRadius >= 3 && fullRadius <= 800) {
        spheres.push({
          x: (sumX / area) * scale,
          y: (sumY / area) * scale,
          radius: fullRadius,
        });
      }
    }
  }

  return spheres;
}

/**
 * Deduplicate overlapping candidate detections.
 */
function deduplicate(spheres: DetectedSphere[]): DetectedSphere[] {
  spheres.sort((a, b) => b.radius - a.radius);
  const result: DetectedSphere[] = [];

  for (const s of spheres) {
    let duplicate = false;
    for (const r of result) {
      const dx = s.x - r.x;
      const dy = s.y - r.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < Math.max(s.radius, r.radius) * 0.75) {
        duplicate = true;
        break;
      }
    }
    if (!duplicate) {
      result.push(s);
    }
  }

  return result;
}

/**
 * Main detection export:
 * Finds any candidate that looks remotely spherical and bright.
 */
export async function detectSpheres(sourceImage: HTMLImageElement | HTMLCanvasElement): Promise<DetectedSphere[]> {
  const origW = (sourceImage as any).naturalWidth || (sourceImage as any).width;
  const origH = (sourceImage as any).naturalHeight || (sourceImage as any).height;

  // Process at scaled dimension for fluid client responsiveness
  const maxDim = 1200;
  let procW = origW;
  let procH = origH;
  let scale = 1.0;

  if (Math.max(origW, origH) > maxDim) {
    if (origW >= origH) {
      procW = maxDim;
      procH = Math.round((origH * maxDim) / origW);
    } else {
      procH = maxDim;
      procW = Math.round((origW * maxDim) / origH);
    }
    scale = origW / procW;
  }

  const offscreen = document.createElement('canvas');
  offscreen.width = procW;
  offscreen.height = procH;
  const ctx = offscreen.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [];

  ctx.drawImage(sourceImage, 0, 0, procW, procH);

  let raw: DetectedSphere[] = [];

  if (isOpenCvAvailable()) {
    try {
      raw = detectWithOpenCv(offscreen, scale);
    } catch (e) {
      console.warn('[Moonify] OpenCV fallback to Canvas:', e);
      raw = detectWithCanvas(ctx, procW, procH, scale);
    }
  } else {
    raw = detectWithCanvas(ctx, procW, procH, scale);
  }

  return deduplicate(raw);
}
