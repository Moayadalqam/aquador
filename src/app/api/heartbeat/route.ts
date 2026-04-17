import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { createAdminClient } from '@/lib/supabase/admin';
import { checkRateLimit } from '@/lib/rate-limit';
import { formatApiError } from '@/lib/api-utils';
import { z } from 'zod';

export const maxDuration = 10;

const heartbeatSchema = z.object({
  sessionId: z.string().min(1).max(128),
  page: z.string().max(512).optional(),
});

export async function POST(request: NextRequest) {
  const rateLimitResponse = await checkRateLimit(request, 'heartbeat');
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const result = heartbeatSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 400 });
    }
    const { sessionId, page } = result.data;

    const supabase = createAdminClient();

    // Hash the IP for privacy
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() || 'unknown';
    const encoder = new TextEncoder();
    const data = encoder.encode(ip + (process.env.HEARTBEAT_SALT || 'aquador'));
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const ipHash = Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const userAgent = request.headers.get('user-agent')?.slice(0, 256) || null;
    const country = request.headers.get('x-vercel-ip-country') || null;

    // Upsert visitor + probabilistic cleanup (~1% of requests)
    const upsertPromise = supabase.from('site_visitors').upsert(
      {
        session_id: sessionId,
        page: page || null,
        user_agent: userAgent,
        country,
        ip_hash: ipHash,
        last_seen: new Date().toISOString(),
      },
      { onConflict: 'session_id' }
    );

    const tasks: PromiseLike<unknown>[] = [upsertPromise];

    // Cleanup stale records (>24h old) — runs on ~1% of heartbeats
    if (Math.random() < 0.01) {
      const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      tasks.push(supabase.from('site_visitors').delete().lt('last_seen', cutoff));
    }

    await Promise.all(tasks);

    return NextResponse.json({ ok: true });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json(
      formatApiError(error, 'Heartbeat failed'),
      { status: 500 }
    );
  }
}
