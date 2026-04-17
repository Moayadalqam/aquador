-- Enable trigram extension for fast ILIKE search on product fields
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN index for searching across name, brand, description
CREATE INDEX IF NOT EXISTS idx_products_search_trgm ON products USING GIN (
  (name || ' ' || COALESCE(brand, '') || ' ' || COALESCE(description, '')) gin_trgm_ops
);
