-- Valentine Gift Set Inventory Table
CREATE TABLE IF NOT EXISTS gift_set_inventory (
  id text PRIMARY KEY,
  name text NOT NULL,
  stock_quantity integer NOT NULL DEFAULT 0,
  price numeric(10,2) NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE gift_set_inventory ENABLE ROW LEVEL SECURITY;

-- Allow public read access (stock check)
CREATE POLICY "Allow public read gift_set_inventory"
  ON gift_set_inventory FOR SELECT
  USING (true);

-- Only service role can modify
CREATE POLICY "Service role can modify gift_set_inventory"
  ON gift_set_inventory FOR ALL
  USING (auth.role() = 'service_role');

-- Seed Valentine gift set with 24 units
INSERT INTO gift_set_inventory (id, name, stock_quantity, price, active)
VALUES ('valentine-gift-set-2026', 'Written in Scent – Valentine Gift Set', 24, 64.99, true)
ON CONFLICT (id) DO NOTHING;

-- Atomic stock decrement function
CREATE OR REPLACE FUNCTION decrement_gift_set_stock(p_id text)
RETURNS boolean AS $$
DECLARE
  current_qty integer;
BEGIN
  SELECT stock_quantity INTO current_qty
  FROM gift_set_inventory
  WHERE id = p_id AND active = true
  FOR UPDATE;

  IF current_qty IS NULL OR current_qty <= 0 THEN
    RETURN false;
  END IF;

  UPDATE gift_set_inventory
  SET stock_quantity = stock_quantity - 1, updated_at = now()
  WHERE id = p_id;

  RETURN true;
END;
$$ LANGUAGE plpgsql;
