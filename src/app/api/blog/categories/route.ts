import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { getBlogCategories } from '@/lib/blog';
import { formatApiError } from '@/lib/api-utils';
import { checkRateLimit } from '@/lib/rate-limit';

export async function GET(request: NextRequest) {
  try {
    const rateLimitResponse = await checkRateLimit(request, 'search');
    if (rateLimitResponse) return rateLimitResponse;

    const categories = await getBlogCategories();
    const response = NextResponse.json(categories);
    response.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=86400');
    return response;
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      formatApiError(error, 'Failed to fetch blog categories'),
      { status: 500 }
    );
  }
}
