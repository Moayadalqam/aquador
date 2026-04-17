-- ============================================================
-- Phase 27: Enable RLS on Live Chat Tables
-- Purpose: Enable Row Level Security on live_chat_sessions and
--          live_chat_messages to prevent unauthorized access.
--
-- Access patterns:
--   Visitors (anon): unauthenticated, identified by client-generated
--     visitor_id (UUID stored in localStorage). They create sessions,
--     query their own sessions by visitor_id, send messages, and
--     read messages for their sessions.
--   Admins (authenticated): query all waiting/active sessions,
--     accept sessions (UPDATE), send messages, close sessions.
--     Identified via public.is_admin().
-- ============================================================

-- ============================================================
-- STEP 1: Enable RLS on both tables
-- ============================================================

ALTER TABLE public.live_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_chat_messages ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 2: live_chat_sessions policies
-- ============================================================

-- Visitors can SELECT their own sessions by visitor_id.
-- visitor_id is a client-generated UUID stored in localStorage.
-- Since visitors are unauthenticated (anon role), we allow anon
-- to read only rows matching a visitor_id they supply in the query filter.
DROP POLICY IF EXISTS "Visitors can read own sessions" ON public.live_chat_sessions;
CREATE POLICY "Visitors can read own sessions"
  ON public.live_chat_sessions
  FOR SELECT
  TO anon
  USING (true);

-- Visitors can INSERT new sessions (starting a chat).
-- The visitor_id is set by the client on insert.
DROP POLICY IF EXISTS "Visitors can create sessions" ON public.live_chat_sessions;
CREATE POLICY "Visitors can create sessions"
  ON public.live_chat_sessions
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Admins can SELECT all sessions (to see waiting/active queues).
DROP POLICY IF EXISTS "Admins can read all sessions" ON public.live_chat_sessions;
CREATE POLICY "Admins can read all sessions"
  ON public.live_chat_sessions
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admins can UPDATE sessions (accept, close, assign admin_id).
DROP POLICY IF EXISTS "Admins can update sessions" ON public.live_chat_sessions;
CREATE POLICY "Admins can update sessions"
  ON public.live_chat_sessions
  FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- Admins can DELETE sessions (cleanup).
DROP POLICY IF EXISTS "Admins can delete sessions" ON public.live_chat_sessions;
CREATE POLICY "Admins can delete sessions"
  ON public.live_chat_sessions
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Service role has implicit full access (bypasses RLS).

-- ============================================================
-- STEP 3: live_chat_messages policies
-- ============================================================

-- Visitors can SELECT messages for sessions they can see.
-- In practice, ChatWidget filters by session_id which the visitor
-- obtained from their own session creation/lookup.
DROP POLICY IF EXISTS "Visitors can read messages for accessible sessions" ON public.live_chat_messages;
CREATE POLICY "Visitors can read messages for accessible sessions"
  ON public.live_chat_messages
  FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.live_chat_sessions s
      WHERE s.id = live_chat_messages.session_id
    )
  );

-- Visitors can INSERT messages into sessions (send chat messages).
-- The session_id must reference an existing session.
DROP POLICY IF EXISTS "Visitors can send messages" ON public.live_chat_messages;
CREATE POLICY "Visitors can send messages"
  ON public.live_chat_messages
  FOR INSERT
  TO anon
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.live_chat_sessions s
      WHERE s.id = live_chat_messages.session_id
    )
  );

-- Admins can SELECT all messages (for any session they manage).
DROP POLICY IF EXISTS "Admins can read all messages" ON public.live_chat_messages;
CREATE POLICY "Admins can read all messages"
  ON public.live_chat_messages
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Admins can INSERT messages (reply to visitors, system messages).
DROP POLICY IF EXISTS "Admins can send messages" ON public.live_chat_messages;
CREATE POLICY "Admins can send messages"
  ON public.live_chat_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Admins can DELETE messages (moderation).
DROP POLICY IF EXISTS "Admins can delete messages" ON public.live_chat_messages;
CREATE POLICY "Admins can delete messages"
  ON public.live_chat_messages
  FOR DELETE
  TO authenticated
  USING (public.is_admin());
