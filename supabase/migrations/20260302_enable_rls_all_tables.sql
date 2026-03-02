-- ============================================================
-- Phase 8: Enable RLS on All Tables
-- Purpose: Enable Row Level Security on all tables and create
--          appropriate policies to prevent anonymous access
--          to sensitive data (orders, customers, admin_users)
-- ============================================================

-- ============================================================
-- STEP 1: Enable RLS on all tables
-- ============================================================

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gift_set_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_visitors ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 2: Public tables - Anonymous + Authenticated READ
-- ============================================================

-- Products: public read access, admin write access
DROP POLICY IF EXISTS "Anon can read products" ON public.products;
CREATE POLICY "Anon can read products"
  ON public.products
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin can insert products" ON public.products;
CREATE POLICY "Admin can insert products"
  ON public.products
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can update products" ON public.products;
CREATE POLICY "Admin can update products"
  ON public.products
  FOR UPDATE
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can delete products" ON public.products;
CREATE POLICY "Admin can delete products"
  ON public.products
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Blog posts: public read (published only), admin write
DROP POLICY IF EXISTS "Anon can read published blog posts" ON public.blog_posts;
CREATE POLICY "Anon can read published blog posts"
  ON public.blog_posts
  FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

DROP POLICY IF EXISTS "Admin can insert blog posts" ON public.blog_posts;
CREATE POLICY "Admin can insert blog posts"
  ON public.blog_posts
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can update blog posts" ON public.blog_posts;
CREATE POLICY "Admin can update blog posts"
  ON public.blog_posts
  FOR UPDATE
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can delete blog posts" ON public.blog_posts;
CREATE POLICY "Admin can delete blog posts"
  ON public.blog_posts
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Blog categories: already has policy from 20260228 migration, skip to avoid duplicate
-- (Policy "Anon can read blog categories" already exists)

-- Product categories: already has policy from 20260228 migration, skip to avoid duplicate
-- (Policy "Anon can read active product categories" already exists)

-- Gift set inventory: public read (active only), admin write
DROP POLICY IF EXISTS "Anon can read active gift sets" ON public.gift_set_inventory;
CREATE POLICY "Anon can read active gift sets"
  ON public.gift_set_inventory
  FOR SELECT
  TO anon, authenticated
  USING (active = true);

DROP POLICY IF EXISTS "Admin can insert gift sets" ON public.gift_set_inventory;
CREATE POLICY "Admin can insert gift sets"
  ON public.gift_set_inventory
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admin can update gift sets" ON public.gift_set_inventory;
CREATE POLICY "Admin can update gift sets"
  ON public.gift_set_inventory
  FOR UPDATE
  TO authenticated
  USING (public.is_admin());

DROP POLICY IF EXISTS "Admin can delete gift sets" ON public.gift_set_inventory;
CREATE POLICY "Admin can delete gift sets"
  ON public.gift_set_inventory
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================================
-- STEP 3: Protected tables - Service role and Admin ONLY
-- ============================================================

-- Orders: service_role or admin access only
DROP POLICY IF EXISTS "Service role and admin can read orders" ON public.orders;
CREATE POLICY "Service role and admin can read orders"
  ON public.orders
  FOR SELECT
  TO authenticated, service_role
  USING (public.is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role and admin can insert orders" ON public.orders;
CREATE POLICY "Service role and admin can insert orders"
  ON public.orders
  FOR INSERT
  TO authenticated, service_role
  WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role and admin can update orders" ON public.orders;
CREATE POLICY "Service role and admin can update orders"
  ON public.orders
  FOR UPDATE
  TO authenticated, service_role
  USING (public.is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role and admin can delete orders" ON public.orders;
CREATE POLICY "Service role and admin can delete orders"
  ON public.orders
  FOR DELETE
  TO authenticated, service_role
  USING (public.is_admin() OR auth.role() = 'service_role');

-- Customers: service_role or admin access only
DROP POLICY IF EXISTS "Service role and admin can read customers" ON public.customers;
CREATE POLICY "Service role and admin can read customers"
  ON public.customers
  FOR SELECT
  TO authenticated, service_role
  USING (public.is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role and admin can insert customers" ON public.customers;
CREATE POLICY "Service role and admin can insert customers"
  ON public.customers
  FOR INSERT
  TO authenticated, service_role
  WITH CHECK (public.is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role and admin can update customers" ON public.customers;
CREATE POLICY "Service role and admin can update customers"
  ON public.customers
  FOR UPDATE
  TO authenticated, service_role
  USING (public.is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role and admin can delete customers" ON public.customers;
CREATE POLICY "Service role and admin can delete customers"
  ON public.customers
  FOR DELETE
  TO authenticated, service_role
  USING (public.is_admin() OR auth.role() = 'service_role');

-- Admin users: service_role for INSERT (already exists from 20260228), add SELECT policy
DROP POLICY IF EXISTS "Admin can read admin users" ON public.admin_users;
CREATE POLICY "Admin can read admin users"
  ON public.admin_users
  FOR SELECT
  TO authenticated, service_role
  USING (public.is_admin() OR auth.role() = 'service_role');

-- Site visitors: service_role or admin access only (analytics data)
DROP POLICY IF EXISTS "Service role and admin can read site visitors" ON public.site_visitors;
CREATE POLICY "Service role and admin can read site visitors"
  ON public.site_visitors
  FOR SELECT
  TO authenticated, service_role
  USING (public.is_admin() OR auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can insert site visitors" ON public.site_visitors;
CREATE POLICY "Service role can insert site visitors"
  ON public.site_visitors
  FOR INSERT
  TO service_role
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can update site visitors" ON public.site_visitors;
CREATE POLICY "Service role can update site visitors"
  ON public.site_visitors
  FOR UPDATE
  TO service_role
  USING (true);
