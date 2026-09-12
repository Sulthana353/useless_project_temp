import { extractMoon } from './extractMoon';
import { detectSpheres, DetectedSphere } from './detectSpheres';

export interface MoonifyResult {
  moonifiedCanvas: HTMLCanvasElement;
  count: number;
  spheres: DetectedSphere[];
  originalWidth: number;
  originalHeight: number;
}

/**
 * Aggressively replaces all detected spherical light sources with the identical Moon.
 * Preserves the original photograph everywhere else.
 */
export async function moonifyImage(sourceImage: HTMLImageElement): Promise<MoonifyResult> {
  const origW = sourceImage.naturalWidth || sourceImage.width;
  const origH = sourceImage.naturalHeight || sourceImage.height;

  // 1. Prepare transparent Moon sprite
  const moonSprite = await extractMoon();

  // 2. Deliberately permissive spherical light detection
  const spheres = await detectSpheres(sourceImage);

  // 3. Create full-resolution canvas matching original photo dimensions
  const canvas = document.createElement('canvas');
  canvas.width = origW;
  canvas.height = origH;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2d canvas context');

  // Draw original image
  ctx.drawImage(sourceImage, 0, 0, origW, origH);

  // Blit the exact same Moon sprite over every detected sphere
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  for (const s of spheres) {
    const diameter = Math.max(8, s.radius * 2);
    const destX = s.x - s.radius;
    const destY = s.y - s.radius;

    // Subtle edge glow blending
    ctx.save();
    const glowRadius = s.radius * 1.15;
    const gradient = ctx.createRadialGradient(s.x, s.y, s.radius * 0.7, s.x, s.y, glowRadius);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(0.6, 'rgba(200, 220, 255, 0.12)');
    gradient.addColorStop(1, 'rgba(100, 150, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(s.x, s.y, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    // Blit the Moon
    ctx.drawImage(moonSprite, destX, destY, diameter, diameter);
    ctx.restore();
  }

  return {
    moonifiedCanvas: canvas,
    count: spheres.length,
    spheres,
    originalWidth: origW,
    originalHeight: origH,
  };
}

/**
 * Downloads canvas as PNG without downscaling or compression.
 */
export function downloadCanvas(canvas: HTMLCanvasElement, filename: string = 'moonified.png') {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
