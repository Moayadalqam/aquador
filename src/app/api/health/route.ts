import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { formatApiError } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET() {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'local',
    };

    return NextResponse.json(health, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      formatApiError(error, 'Health check failed'),
      { status: 500 }
    );
  }
}
