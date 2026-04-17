import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { getFeaturedPost } from '@/lib/blog';
import { formatApiError } from '@/lib/api-utils';

export async function GET() {
  try {
    const post = await getFeaturedPost();
    const response = NextResponse.json(post);
    response.headers.set('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=86400');
    return response;
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      formatApiError(error, 'Failed to fetch featured post'),
      { status: 500 }
    );
  }
}
