/**
 * Moon Extraction and Circular Alpha Masking
 * Extracts the circular Moon disk from the supplied photograph,
 * removes the black background, and produces a transparent sprite
 * with preserved crater textures.
 */

let cachedMoonCanvas: HTMLCanvasElement | null = null;

export async function extractMoon(): Promise<HTMLCanvasElement> {
  if (cachedMoonCanvas) {
    return cachedMoonCanvas;
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;

        const offscreen = document.createElement('canvas');
        offscreen.width = w;
        offscreen.height = h;
        const ctx = offscreen.getContext('2d', { willReadFrequently: true });
        if (!ctx) throw new Error('Could not get 2d context for moon extraction');

        ctx.drawImage(img, 0, 0);
        const imgData = ctx.getImageData(0, 0, w, h);
        const data = imgData.data;

        // Find bounds and centroid of the lunar disk (skip black background)
        let minX = w, maxX = 0, minY = h, maxY = 0;
        let sumX = 0, sumY = 0, count = 0;

        for (let y = 0; y < h; y++) {
          for (let x = 0; x < w; x++) {
            const idx = (y * w + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const a = data[idx + 3];
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;

            if (a > 20 && lum > 15) {
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
              sumX += x;
              sumY += y;
              count++;
            }
          }
        }

        if (count === 0) {
          minX = 0; maxX = w; minY = 0; maxY = h;
          sumX = (w / 2) * (w * h); sumY = (h / 2) * (w * h); count = w * h;
        }

        const cx = sumX / count;
        const cy = sumY / count;
        const radX = (maxX - minX) / 2;
        const radY = (maxY - minY) / 2;
        const radius = Math.max(10, Math.round((radX + radY) / 2));

        const pad = 4;
        const size = (radius + pad) * 2;
        const outCanvas = document.createElement('canvas');
        outCanvas.width = size;
        outCanvas.height = size;
        const outCtx = outCanvas.getContext('2d', { willReadFrequently: true });
        if (!outCtx) throw new Error('Could not get result canvas context');

        const outCenter = size / 2;
        outCtx.drawImage(img, outCenter - cx, outCenter - cy);

        // Circular alpha feathering: keep crater details inside, smooth outer edge
        const outImgData = outCtx.getImageData(0, 0, size, size);
        const outData = outImgData.data;
        const feather = 2.0;

        for (let y = 0; y < size; y++) {
          for (let x = 0; x < size; x++) {
            const idx = (y * size + x) * 4;
            const dx = x - outCenter;
            const dy = y - outCenter;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist >= radius + feather) {
              outData[idx + 3] = 0;
            } else if (dist > radius - feather) {
              const factor = (radius + feather - dist) / (2 * feather);
              const smooth = Math.max(0, Math.min(1, factor * factor * (3 - 2 * factor)));
              outData[idx + 3] = Math.round(outData[idx + 3] * smooth);
            }
          }
        }

        outCtx.putImageData(outImgData, 0, 0);
        cachedMoonCanvas = outCanvas;
        resolve(outCanvas);
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error('Failed to load /moon.png'));
    img.src = '/moon.png';
  });
}
