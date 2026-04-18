-- M20: Drop redundant permissive policies from the valentine migration.
-- The 20260302_enable_rls_all_tables migration added granular per-operation
-- policies (Anon can read, Admin can insert/update/delete), making these
-- original broad policies redundant and creating dual-permissive overlap.

DROP POLICY IF EXISTS "Allow public read gift_set_inventory" ON gift_set_inventory;
DROP POLICY IF EXISTS "Service role can modify gift_set_inventory" ON gift_set_inventory;
