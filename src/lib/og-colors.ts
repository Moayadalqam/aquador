/**
 * Shared color constants for OG image generation routes.
 * ImageResponse does not support CSS variables or Tailwind,
 * so hex values are intentional here.
 */
export const OG_COLORS = {
  bg: '#0a0a0a',
  bgGradient: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
  gold: '#D4AF37',
  goldLight: '#FFD700',
  textMuted: '#888',
} as const;
