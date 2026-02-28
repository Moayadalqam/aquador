-- ============================================================
-- Phase 5: RLS Verification & Fix Migration
-- Fixes: is_admin() function, admin_users privilege escalation,
--         missing anon SELECT on category tables
-- ============================================================

-- 1. Fix is_admin() to check admin_users table instead of broken JWT role claim
-- Old: checked auth.jwt() ->> 'role' = 'admin' (never true for authenticated users)
-- New: checks admin_users table membership via auth.uid()
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_users WHERE id = (SELECT auth.uid())
  ) OR ((SELECT auth.role()) = 'service_role');
$$;

-- 2. Fix admin_users INSERT privilege escalation
-- Old: any authenticated user could insert (WITH CHECK auth.uid() IS NOT NULL)
-- New: only service_role can insert new admin users
DROP POLICY IF EXISTS "admin_users_insert" ON public.admin_users;
CREATE POLICY "admin_users_insert" ON public.admin_users
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- 3. Add anon SELECT for blog_categories (public blog pages need categories)
CREATE POLICY "Anon can read blog categories"
  ON public.blog_categories
  FOR SELECT
  TO anon
  USING (true);

-- 4. Add anon SELECT for product_categories (public shop pages may need categories)
CREATE POLICY "Anon can read active product categories"
  ON public.product_categories
  FOR SELECT
  TO anon
  USING (COALESCE(is_active, false));
