-- Support manual order creation (phone, in-person, imports)
-- Rename stripe_session_id to order_reference and make it optional for manual orders
-- Add order_source to distinguish order origins

-- Add order_source column
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_source text NOT NULL DEFAULT 'stripe';

-- Allow null stripe_session_id for manual orders
ALTER TABLE orders ALTER COLUMN stripe_session_id DROP NOT NULL;

-- Add check constraint: stripe orders must have session ID
ALTER TABLE orders ADD CONSTRAINT orders_stripe_requires_session_id
  CHECK (order_source != 'stripe' OR stripe_session_id IS NOT NULL);

-- Index for quick lookups by source
CREATE INDEX IF NOT EXISTS idx_orders_source ON orders (order_source);
