import { ImageResponse } from 'next/og';

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
          background: 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
          color: '#D4AF37',
          fontFamily: 'serif',
        }}
      >
        <div style={{ fontSize: 96, fontWeight: 700, letterSpacing: -2 }}>Aquad&apos;or</div>
        <div style={{ fontSize: 32, color: '#FFD700', marginTop: 16, fontStyle: 'italic' }}>
          Scent of Luxury
        </div>
        <div style={{ fontSize: 24, color: '#888', marginTop: 48 }}>
          Luxury Perfumes · Cyprus
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
