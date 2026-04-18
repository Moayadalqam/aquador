import * as THREE from 'three';

let cachedTexture: THREE.CanvasTexture | null = null;

/**
 * Canvas-baked AQUAD'OR logo texture — stylized lotus + "AQUAD'OR" + "Cyprus".
 * Mirrors the label on the physical bottle (gold on clear glass).
 *
 * Singleton — the underlying canvas can be shared across all Three.js scenes.
 * SSR-safe: returns null when document is unavailable; callers render nothing.
 */
export function getAquadorLogoTexture(): THREE.CanvasTexture | null {
  if (typeof document === 'undefined') return null;
  if (cachedTexture) return cachedTexture;

  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.clearRect(0, 0, size, size);

  const gold = '#D4AF37';
  const goldBright = '#FFD700';

  const cx = size / 2;
  const cy = size / 2;

  // Stylized lotus icon — five thin petal outlines fanned upward.
  ctx.save();
  ctx.translate(cx, cy - 100);
  ctx.strokeStyle = gold;
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const petals = 5;
  const petalHeight = 58;
  const petalWidth = 14;
  for (let i = 0; i < petals; i++) {
    const angle = ((i - (petals - 1) / 2) * Math.PI) / 5.5;
    ctx.save();
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-petalWidth, -petalHeight * 0.3, -petalWidth, -petalHeight * 0.85, 0, -petalHeight);
    ctx.bezierCurveTo(petalWidth, -petalHeight * 0.85, petalWidth, -petalHeight * 0.3, 0, 0);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }
  // Base crescent under lotus
  ctx.beginPath();
  ctx.arc(0, 6, 22, 0, Math.PI);
  ctx.stroke();
  ctx.restore();

  // Main wordmark — use gold gradient for subtle shine
  const textGrad = ctx.createLinearGradient(cx - 160, cy - 20, cx + 160, cy + 20);
  textGrad.addColorStop(0, gold);
  textGrad.addColorStop(0.5, goldBright);
  textGrad.addColorStop(1, gold);
  ctx.fillStyle = textGrad;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '600 56px "Playfair Display", "Cormorant Garamond", Georgia, serif';
  ctx.fillText("AQUAD'OR", cx, cy + 14);

  // "Cyprus" subtitle
  ctx.fillStyle = gold;
  ctx.font = '400 italic 26px "Playfair Display", Georgia, serif';
  ctx.fillText('Cyprus', cx, cy + 68);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 16;
  texture.needsUpdate = true;
  cachedTexture = texture;
  return texture;
}
