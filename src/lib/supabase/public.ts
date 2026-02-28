import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Public read-only client for SSG/ISR pages.
// Does NOT use cookies(), so it won't force dynamic rendering.
export function createPublicClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
