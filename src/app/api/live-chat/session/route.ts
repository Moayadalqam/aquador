import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import * as Sentry from '@sentry/nextjs';
import { checkRateLimit } from '@/lib/rate-limit';
import { createAdminClient } from '@/lib/supabase/admin';

export const maxDuration = 10;

const createSessionSchema = z.object({
  visitorId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  const rateLimitResponse = await checkRateLimit(request, 'contact');
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const parsed = createSessionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid request' },
        { status: 400 }
      );
    }

    const { visitorId } = parsed.data;
    const supabase = createAdminClient();

    const { data: existing } = await supabase
      .from('live_chat_sessions')
      .select('id, session_secret, status')
      .eq('visitor_id', visitorId)
      .in('status', ['waiting', 'active'])
      .order('created_at', { ascending: false })
      .limit(1);

    if (existing && existing.length > 0) {
      return NextResponse.json({
        sessionId: existing[0].id,
        sessionSecret: existing[0].session_secret,
        status: existing[0].status,
        resumed: true,
      });
    }

    const sessionSecret = crypto.randomBytes(32).toString('hex');

    const { data: session, error } = await supabase
      .from('live_chat_sessions')
      .insert({ visitor_id: visitorId, session_secret: sessionSecret })
      .select('id')
      .single();

    if (error || !session) {
      Sentry.captureException(error);
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }

    await supabase.from('live_chat_messages').insert({
      session_id: session.id,
      sender_type: 'system',
      content: 'You are now in the queue. An agent will be with you shortly.',
    });

    return NextResponse.json({
      sessionId: session.id,
      sessionSecret,
      status: 'waiting',
      resumed: false,
    });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
