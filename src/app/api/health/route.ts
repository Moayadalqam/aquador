import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'local',
    environment: process.env.NODE_ENV,
    checks: {
      stripe: !!process.env.STRIPE_SECRET_KEY,
      resend: !!process.env.RESEND_API_KEY,
      sentry: !!process.env.SENTRY_DSN,
    },
  };

  return NextResponse.json(health, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
