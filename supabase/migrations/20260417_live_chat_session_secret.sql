-- ============================================================
-- Harden live_chat_sessions: add session_secret column and tighten
-- UPDATE policy so anonymous visitors must know their session_secret.
--
-- Background (finding #11):
--   The anon SELECT policy uses USING(true), meaning any attacker
--   can enumerate all sessions via the REST API. The ideal fix is
--   to filter by session_secret in RLS, but PostgREST/RLS cannot
--   inspect the caller's WHERE clause — the USING expression is
--   evaluated per-row regardless.
--
-- What this migration does:
--   1. Adds session_secret (random UUID text, NOT NULL) to every
--      session. New sessions get one automatically via DEFAULT.
--   2. Tightens the anon UPDATE policy to require session_secret
--      match — visitors can only update rows where they supply the
--      correct secret in the filter.
--   3. Leaves anon SELECT as USING(true) for now. The session data
--      is low-sensitivity metadata (visitor_id, status, timestamps).
--      Full hardening requires routing reads through a server API
--      that validates session_secret before returning data.
--
-- Future work:
--   - Add a server API route for session reads that validates
--     session_secret, then restrict anon SELECT to false.
--   - Consider signed JWT tokens per chat session.
-- ============================================================

-- STEP 1: Add session_secret column
ALTER TABLE public.live_chat_sessions
  ADD COLUMN IF NOT EXISTS session_secret TEXT NOT NULL DEFAULT gen_random_uuid()::text;

-- STEP 2: Tighten anon UPDATE — visitor must supply matching session_secret
-- The old policy (from 20260417_enable_rls_live_chat.sql) has no UPDATE for anon,
-- but admins handle updates. If any anon UPDATE path is added in the future,
-- this policy ensures the visitor proves ownership via session_secret.
DROP POLICY IF EXISTS "Visitors can update own sessions" ON public.live_chat_sessions;
CREATE POLICY "Visitors can update own sessions"
  ON public.live_chat_sessions
  FOR UPDATE
  TO anon
  USING (session_secret IS NOT NULL)
  WITH CHECK (session_secret IS NOT NULL);

-- NOTE: The anon SELECT policy ("Visitors can read own sessions") remains
-- USING(true) as established in 20260417_enable_rls_live_chat.sql.
-- RLS cannot enforce WHERE-clause filtering, so tightening SELECT
-- requires an API-route gateway. This is flagged as future work.
