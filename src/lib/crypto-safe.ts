import { timingSafeEqual } from 'node:crypto';

/**
 * Constant-time string compare. Returns false on length mismatch or any error.
 * Use for comparing secrets/tokens to prevent timing side-channel attacks.
 *
 * NOTE: Node-runtime only. Do not import from edge-runtime routes.
 */
export function safeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}
