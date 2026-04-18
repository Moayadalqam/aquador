import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { checkRateLimit } from '@/lib/rate-limit';
import { createAdminClient } from '@/lib/supabase/admin';

export const maxDuration = 10;

const sendSchema = z.object({
  sessionId: z.string().uuid(),
  sessionSecret: z.string().min(1),
  text: z.string().min(1).max(2000),
});

export async function POST(request: NextRequest) {
  const rateLimitResponse = await checkRateLimit(request, 'live_chat');
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const body = await request.json();
    const parsed = sendSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid request' },
        { status: 400 }
      );
    }

    const { sessionId, sessionSecret, text } = parsed.data;
    const supabase = createAdminClient();

    const { data: session } = await supabase
      .from('live_chat_sessions')
      .select('id, session_secret, status')
      .eq('id', sessionId)
      .single();

    if (!session || session.session_secret !== sessionSecret) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (session.status === 'closed') {
      return NextResponse.json({ error: 'Session is closed' }, { status: 400 });
    }

    const { data: message, error } = await supabase
      .from('live_chat_messages')
      .insert({ session_id: sessionId, sender_type: 'visitor', content: text })
      .select('id, sender_type, content, created_at')
      .single();

    if (error || !message) {
      Sentry.captureException(error);
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    return NextResponse.json({ message });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
