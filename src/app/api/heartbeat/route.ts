import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sessionId = body.sessionId;
    const page = body.page;

    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'Invalid session' }, { status: 400 });
    }

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

    // Upsert visitor
    await supabase.from('site_visitors').upsert(
      {
        session_id: sessionId,
        page: typeof page === 'string' ? page.slice(0, 512) : null,
        user_agent: userAgent,
        country,
        ip_hash: ipHash,
        last_seen: new Date().toISOString(),
      },
      { onConflict: 'session_id' }
    );

    // Cleanup stale records (>24h old) — piggyback on heartbeat
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    await supabase.from('site_visitors').delete().lt('last_seen', cutoff);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
