-- ============================================================
-- Defense-in-depth: explicit DELETE policy for site_visitors cleanup.
-- Currently only service_role can DELETE (implicit via bypass), but
-- no explicit policy exists. This enables admins OR service_role to
-- delete stale visitor records through standard RLS paths.
-- ============================================================

DROP POLICY IF EXISTS "Service role and admin can delete site visitors" ON public.site_visitors;
CREATE POLICY "Service role and admin can delete site visitors"
  ON public.site_visitors
  FOR DELETE
  TO authenticated, service_role
  USING (public.is_admin() OR auth.role() = 'service_role');
