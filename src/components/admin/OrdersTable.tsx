'use client';

import type { Order, OrderStatus } from '@/lib/supabase/types';

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  confirmed: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  processing: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  shipped: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  delivered: 'bg-green-500/10 text-green-400 border-green-500/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  refunded: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
};

interface OrdersTableProps {
  orders: Order[];
  onStatusChange: (orderId: string, status: OrderStatus) => void;
}

export default function OrdersTable({ orders, onStatusChange }: OrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 text-lg">No orders found</p>
        <p className="text-gray-500 text-sm mt-1">Orders will appear here after customers purchase</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Order</th>
            <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Customer</th>
            <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Items</th>
            <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Total</th>
            <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Status</th>
            <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {orders.map((order) => {
            const items = Array.isArray(order.items) ? (order.items as Array<{ name?: string; quantity?: number; price?: number; productType?: string; metadata?: { giftSetSelections?: { perfumeName: string; lotionName: string } } }>) : [];
            const itemCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
            const tags = (order.tags && typeof order.tags === 'object' && !Array.isArray(order.tags)) ? order.tags as Record<string, string> : {};

            return (
              <tr key={order.id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-4 py-4">
                  <span className="text-white font-mono text-sm">
                    #{order.stripe_session_id.slice(-8).toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div>
                    <p className="text-white text-sm">{order.customer_name ?? 'N/A'}</p>
                    <p className="text-gray-500 text-xs">{order.customer_email}</p>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="text-gray-300 text-sm">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                </td>
                <td className="px-4 py-4 text-right">
                  <span className="text-white font-medium">
                    &euro;{(order.total / 100).toFixed(2)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <select
                    value={order.status}
                    onChange={(e) => onStatusChange(order.id, e.target.value as OrderStatus)}
                    className={`text-xs font-medium px-2.5 py-1 rounded-full border cursor-pointer bg-transparent ${STATUS_COLORS[order.status]}`}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </td>
                <td className="px-4 py-4">
                  <span className="text-gray-400 text-sm">
                    {new Date(order.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
