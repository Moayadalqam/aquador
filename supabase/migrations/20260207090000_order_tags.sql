-- Add tags column to orders table for gift set order tracking
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tags jsonb DEFAULT '{}'::jsonb;

-- Update RLS policies to include new column (existing policies cover it via table-level access)
