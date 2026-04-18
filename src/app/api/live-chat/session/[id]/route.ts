import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import * as Sentry from '@sentry/nextjs';
import { createAdminClient } from '@/lib/supabase/admin';

export const maxDuration = 10;

const paramsSchema = z.object({
  id: z.string().uuid(),
});

const querySchema = z.object({
  secret: z.string().min(1),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const paramsParsed = paramsSchema.safeParse(resolvedParams);
    if (!paramsParsed.success) {
      return NextResponse.json({ error: 'Invalid session ID' }, { status: 400 });
    }

    const secret = request.nextUrl.searchParams.get('secret');
    const queryParsed = querySchema.safeParse({ secret });
    if (!queryParsed.success) {
      return NextResponse.json({ error: 'Secret required' }, { status: 400 });
    }

    const supabase = createAdminClient();

    const { data: session } = await supabase
      .from('live_chat_sessions')
      .select('id, status, session_secret')
      .eq('id', paramsParsed.data.id)
      .single();

    if (!session || session.session_secret !== queryParsed.data.secret) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { data: messages } = await supabase
      .from('live_chat_messages')
      .select('id, sender_type, content, created_at')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true });

    return NextResponse.json({
      sessionId: session.id,
      status: session.status,
      messages: messages || [],
    });
  } catch (error) {
    Sentry.captureException(error);
    return NextResponse.json({ error: 'Failed to load session' }, { status: 500 });
  }
}
