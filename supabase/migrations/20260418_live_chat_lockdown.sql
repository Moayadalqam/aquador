-- Drop and replace all permissive anon policies on live_chat_sessions
-- and live_chat_messages with USING(false). All visitor access now
-- flows through server API routes that validate session_secret.

-- === live_chat_sessions: anon SELECT ===
DROP POLICY IF EXISTS "Visitors can read own sessions" ON public.live_chat_sessions;
CREATE POLICY "Visitors can read own sessions"
  ON public.live_chat_sessions
  FOR SELECT
  TO anon
  USING (false);

-- === live_chat_sessions: anon INSERT ===
DROP POLICY IF EXISTS "Visitors can create sessions" ON public.live_chat_sessions;
CREATE POLICY "Visitors can create sessions"
  ON public.live_chat_sessions
  FOR INSERT
  TO anon
  WITH CHECK (false);

-- === live_chat_sessions: anon UPDATE (broken session_secret policy) ===
DROP POLICY IF EXISTS "Visitors can update own sessions" ON public.live_chat_sessions;
CREATE POLICY "Visitors can update own sessions"
  ON public.live_chat_sessions
  FOR UPDATE
  TO anon
  USING (false)
  WITH CHECK (false);

-- === live_chat_messages: anon SELECT ===
DROP POLICY IF EXISTS "Visitors can read messages for accessible sessions" ON public.live_chat_messages;
CREATE POLICY "Visitors can read messages for accessible sessions"
  ON public.live_chat_messages
  FOR SELECT
  TO anon
  USING (false);

-- === live_chat_messages: anon INSERT ===
DROP POLICY IF EXISTS "Visitors can send messages" ON public.live_chat_messages;
CREATE POLICY "Visitors can send messages"
  ON public.live_chat_messages
  FOR INSERT
  TO anon
  WITH CHECK (false);
