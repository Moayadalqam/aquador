import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Public read-only client for SSG/ISR pages.
// Does NOT use cookies(), so it won't force dynamic rendering.
// Cached at module scope — safe because this client is stateless and read-only.
let _client: ReturnType<typeof createClient<Database>> | null = null;

export function createPublicClient() {
  if (!_client) {
    _client = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
  }
  return _client;
}
