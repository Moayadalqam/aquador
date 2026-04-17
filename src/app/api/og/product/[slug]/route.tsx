import { ImageResponse } from 'next/og';
import { getProductBySlug } from '@/lib/supabase/product-service';
import { OG_COLORS } from '@/lib/og-colors';

export const runtime = 'nodejs';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return new Response('Not found', { status: 404 });
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: OG_COLORS.bg,
          color: OG_COLORS.gold,
        }}
      >
        <div
          style={{
            width: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 40,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={product.name}
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
          />
        </div>
        <div
          style={{
            width: '50%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: 60,
          }}
        >
          <div style={{ fontSize: 24, color: OG_COLORS.textMuted, textTransform: 'uppercase', letterSpacing: 4 }}>
            {product.brand || "Aquad'or"}
          </div>
          <div style={{ fontSize: 64, fontWeight: 700, marginTop: 12, lineHeight: 1.1 }}>
            {product.name}
          </div>
          <div style={{ fontSize: 40, color: OG_COLORS.goldLight, marginTop: 24 }}>
            €{Number(product.price).toFixed(2)}
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
