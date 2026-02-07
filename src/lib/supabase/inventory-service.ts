import { createClient } from './server';
import { createAdminClient } from './admin';

/**
 * Get current stock for a gift set (server-side, read-only)
 */
export async function getGiftSetStock(id: string): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('gift_set_inventory')
    .select('stock_quantity')
    .eq('id', id)
    .eq('active', true)
    .single();

  if (error || !data) {
    console.error('Error fetching gift set stock:', error);
    return 0;
  }

  return data.stock_quantity;
}

/**
 * Atomically decrement gift set stock (admin-only, uses RPC)
 * Returns true if stock was decremented, false if out of stock
 */
export async function decrementGiftSetStock(id: string): Promise<boolean> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc('decrement_gift_set_stock', {
    p_id: id,
  });

  if (error) {
    console.error('Error decrementing gift set stock:', error);
    return false;
  }

  return data === true;
}
