-- Two legacy INSERT policies from earlier migrations were still granting
-- anon writes, overriding the 20260418_live_chat_lockdown lockdown
-- (RLS is permissive — any matching policy grants access).
-- These were only discovered after applying the lockdown and inspecting
-- pg_policies on the live database.

DROP POLICY IF EXISTS "Anyone can create sessions" ON public.live_chat_sessions;
DROP POLICY IF EXISTS "Visitors can only insert as visitor" ON public.live_chat_messages;
