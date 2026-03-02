-- Performance Indexes Migration
-- Phase: 09-performance-polish
-- Plan: 01
-- Purpose: Add strategic indexes to optimize hot query paths for <200ms response times
-- Created: 2026-03-03

-- ============================================================================
-- PRODUCTS TABLE (3 indexes)
-- ============================================================================

-- Index 1: Category browsing
-- Used by: getProductsByCategory() - filters products by category
-- Query pattern: WHERE category = ? AND is_active = true ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_products_category
ON products(category);

-- Index 2: Featured products composite
-- Used by: getFeaturedProducts() - finds active, in-stock products
-- Query pattern: WHERE in_stock = true AND is_active = true ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_products_featured
ON products(in_stock, is_active, created_at DESC);

-- Index 3: Active products by category composite
-- Used by: getProductsByCategory(), getRelatedProducts() - filtered category queries
-- Query pattern: WHERE is_active = true AND category = ?
CREATE INDEX IF NOT EXISTS idx_products_active_category
ON products(is_active, category);

-- ============================================================================
-- BLOG_POSTS TABLE (3 indexes)
-- ============================================================================

-- Index 4: Blog post lookup by slug
-- Used by: getBlogPostBySlug() - single post retrieval
-- Query pattern: WHERE status = 'published' AND slug = ?
CREATE INDEX IF NOT EXISTS idx_blog_posts_status_slug
ON blog_posts(status, slug);

-- Index 5: Category listings composite
-- Used by: getBlogPosts() with category filter - category page queries
-- Query pattern: WHERE status = 'published' AND category = ? ORDER BY published_at DESC
CREATE INDEX IF NOT EXISTS idx_blog_posts_status_category
ON blog_posts(status, category, published_at DESC);

-- Index 6: Featured posts composite
-- Used by: getFeaturedPost(), getBlogPosts() with featured filter
-- Query pattern: WHERE status = 'published' AND featured = true ORDER BY published_at DESC
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured
ON blog_posts(status, featured, published_at DESC);

-- ============================================================================
-- ORDERS TABLE (2 indexes)
-- ============================================================================

-- Index 7: Recent orders sorting
-- Used by: Admin orders page - order listing with pagination
-- Query pattern: ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_orders_created_at
ON orders(created_at DESC);

-- Index 8: Customer order history
-- Used by: Customer detail page - fetch all orders for a customer
-- Query pattern: WHERE customer_email = ? ORDER BY created_at DESC
CREATE INDEX IF NOT EXISTS idx_orders_customer_id
ON orders(customer_email);

-- ============================================================================
-- INDEX SUMMARY
-- ============================================================================
-- Total indexes added: 8
-- Expected query performance improvement: Database queries <200ms (from 500-1500ms baseline)
-- Tables optimized: products (3), blog_posts (3), orders (2)
