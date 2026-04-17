-- Atomic customer upsert: eliminates read-then-write race condition
-- on concurrent orders from the same email.
--
-- Columns from customers table:
--   id (uuid), email (text), name (text), phone (text),
--   total_orders (int), total_spent (bigint), first_order_at (timestamptz),
--   last_order_at (timestamptz), shipping_addresses (jsonb),
--   created_at (timestamptz), updated_at (timestamptz)

-- Ensure email has a UNIQUE constraint (required for ON CONFLICT).
-- This is safe to run even if the constraint already exists.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.customers'::regclass
      AND contype = 'u'
      AND EXISTS (
        SELECT 1 FROM unnest(conkey) AS k
        JOIN pg_attribute a ON a.attrelid = conrelid AND a.attnum = k
        WHERE a.attname = 'email'
      )
  ) THEN
    ALTER TABLE public.customers ADD CONSTRAINT customers_email_unique UNIQUE (email);
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.upsert_customer_on_order(
  p_email TEXT,
  p_name TEXT DEFAULT NULL,
  p_phone TEXT DEFAULT NULL,
  p_order_total BIGINT DEFAULT 0,
  p_shipping JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
  v_now TIMESTAMPTZ := now();
BEGIN
  INSERT INTO customers (email, name, phone, total_orders, total_spent, first_order_at, last_order_at, shipping_addresses, created_at, updated_at)
  VALUES (
    p_email,
    p_name,
    p_phone,
    1,
    p_order_total,
    v_now,
    v_now,
    CASE WHEN p_shipping IS NOT NULL THEN jsonb_build_array(p_shipping) ELSE '[]'::jsonb END,
    v_now,
    v_now
  )
  ON CONFLICT (email) DO UPDATE SET
    name             = COALESCE(EXCLUDED.name, customers.name),
    phone            = COALESCE(EXCLUDED.phone, customers.phone),
    total_orders     = customers.total_orders + 1,
    total_spent      = customers.total_spent + p_order_total,
    last_order_at    = v_now,
    updated_at       = v_now,
    shipping_addresses = CASE
      WHEN p_shipping IS NOT NULL
        AND NOT customers.shipping_addresses @> jsonb_build_array(p_shipping)
      THEN customers.shipping_addresses || jsonb_build_array(p_shipping)
      ELSE customers.shipping_addresses
    END
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.upsert_customer_on_order(TEXT, TEXT, TEXT, BIGINT, JSONB) TO service_role;
