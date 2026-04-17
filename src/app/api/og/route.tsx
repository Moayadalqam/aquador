import { ImageResponse } from 'next/og';
import { OG_COLORS } from '@/lib/og-colors';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: OG_COLORS.bgGradient,
          color: OG_COLORS.gold,
          fontFamily: 'serif',
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: -2 }}>Aquad&apos;or</div>
        <div style={{ fontSize: 32, color: OG_COLORS.goldLight, marginTop: 16, fontStyle: 'italic' }}>
          Scent of Luxury
        </div>
        <div style={{ fontSize: 24, color: OG_COLORS.textMuted, marginTop: 48 }}>
          Luxury Perfumes · Cyprus
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
