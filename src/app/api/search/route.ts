import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { searchProducts } from '@/lib/supabase/product-service';
import { checkRateLimit } from '@/lib/rate-limit';
import { formatApiError } from '@/lib/api-utils';

export async function GET(request: NextRequest) {
  try {
    const rateLimitResponse = await checkRateLimit(request, 'search');
    if (rateLimitResponse) return rateLimitResponse;

    const { searchParams } = request.nextUrl;
    const query = searchParams.get('q');

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required and must be at least 2 characters' },
        { status: 400 }
      );
    }

    const products = await searchProducts(query.trim());
    const results = products.slice(0, 8);

    return NextResponse.json(
      { results },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        },
      }
    );
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      formatApiError(error, 'Failed to search products'),
      { status: 500 }
    );
  }
}
