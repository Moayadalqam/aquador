'use client';

import { useState } from 'react';
import { ChevronDown, Palette, Package, MapPin, MessageSquare } from 'lucide-react';
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

interface OrderItem {
  name?: string;
  quantity?: number;
  price?: number;
  productType?: string;
}

interface ShippingAddress {
  name?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    postal_code?: string;
    country?: string;
  };
}

interface OrderTags {
  'custom-perfume'?: string;
  composition?: string;
  volume?: string;
  'special-requests'?: string;
  [key: string]: string | undefined;
}

function parseComposition(compositionStr: string): { top: string; heart: string; base: string } | null {
  // Format: "Top: X, Heart: Y, Base: Z"
  const topMatch = compositionStr.match(/Top:\s*([^,]+)/);
  const heartMatch = compositionStr.match(/Heart:\s*([^,]+)/);
  const baseMatch = compositionStr.match(/Base:\s*(.+)/);
  if (topMatch && heartMatch && baseMatch) {
    return { top: topMatch[1].trim(), heart: heartMatch[1].trim(), base: baseMatch[1].trim() };
  }
  return null;
}

interface OrdersTableProps {
  orders: Order[];
  onStatusChange: (orderId: string, status: OrderStatus) => void;
}

export default function OrdersTable({ orders, onStatusChange }: OrdersTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

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
            <th className="w-8 px-2 py-3" />
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
            const items = Array.isArray(order.items) ? (order.items as unknown as OrderItem[]) : [];
            const itemCount = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
            const tags = (order.tags && typeof order.tags === 'object' && !Array.isArray(order.tags))
              ? (order.tags as unknown as OrderTags)
              : {} as OrderTags;
            const isCustomPerfume = tags['custom-perfume'] === 'true';
            const isExpanded = expandedId === order.id;
            const shipping = order.shipping_address as unknown as ShippingAddress | null;

            return (
              <tr key={order.id} className="group">
                {/* Main row */}
                <td
                  colSpan={7}
                  className="p-0"
                >
                  <div
                    className="cursor-pointer hover:bg-gray-800/50 transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  >
                    <div className="flex items-center">
                      <div className="w-8 px-2 py-4 flex items-center justify-center">
                        <ChevronDown
                          className={`h-4 w-4 text-gray-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                        />
                      </div>
                      <div className="px-4 py-4 flex-shrink-0" style={{ width: '140px' }}>
                        <span className="text-white font-mono text-sm">
                          #{order.stripe_session_id ? order.stripe_session_id.slice(-8).toUpperCase() : order.id.slice(0, 8).toUpperCase()}
                        </span>
                        {order.order_source === 'manual' && (
                          <span className="ml-2 text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            MANUAL
                          </span>
                        )}
                        {isCustomPerfume && (
                          <span className="ml-2 text-[10px] font-medium px-1.5 py-0.5 rounded bg-gold/10 text-gold border border-gold/20">
                            CUSTOM
                          </span>
                        )}
                      </div>
                      <div className="px-4 py-4 flex-1 min-w-0">
                        <p className="text-white text-sm truncate">{order.customer_name ?? 'N/A'}</p>
                        <p className="text-gray-500 text-xs truncate">{order.customer_email}</p>
                      </div>
                      <div className="px-4 py-4 flex-shrink-0" style={{ width: '80px' }}>
                        <span className="text-gray-300 text-sm">{itemCount} item{itemCount !== 1 ? 's' : ''}</span>
                      </div>
                      <div className="px-4 py-4 flex-shrink-0 text-right" style={{ width: '100px' }}>
                        <span className="text-white font-medium">
                          &euro;{(order.total / 100).toFixed(2)}
                        </span>
                      </div>
                      <div className="px-4 py-4 flex-shrink-0" style={{ width: '140px' }} onClick={(e) => e.stopPropagation()}>
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
                      </div>
                      <div className="px-4 py-4 flex-shrink-0" style={{ width: '120px' }}>
                        <span className="text-gray-400 text-sm">
                          {new Date(order.created_at).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded detail panel */}
                  {isExpanded && (
                    <div className="border-t border-gray-800 bg-gray-800/30 px-6 py-5 space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Items */}
                        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                          <div className="flex items-center gap-2 mb-3">
                            <Package className="h-4 w-4 text-gold" />
                            <h4 className="text-sm font-medium text-white">Items</h4>
                          </div>
                          {items.length > 0 ? (
                            <ul className="space-y-2">
                              {items.map((item, i) => (
                                <li key={i} className="flex items-start justify-between gap-2">
                                  <span className="text-gray-300 text-sm">{item.name || 'Unknown item'}</span>
                                  <span className="text-gray-400 text-xs whitespace-nowrap">
                                    x{item.quantity || 1} &middot; &euro;{(item.price || 0).toFixed(2)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-500 text-sm">No item details</p>
                          )}
                        </div>

                        {/* Custom Perfume Details */}
                        {isCustomPerfume && (
                          <div className="bg-gray-900/50 rounded-lg p-4 border border-gold/20">
                            <div className="flex items-center gap-2 mb-3">
                              <Palette className="h-4 w-4 text-gold" />
                              <h4 className="text-sm font-medium text-gold">Custom Perfume Details</h4>
                            </div>
                            {tags.composition && (() => {
                              const comp = parseComposition(tags.composition);
                              if (!comp) return <p className="text-gray-300 text-sm">{tags.composition}</p>;
                              return (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] uppercase tracking-wider text-gray-500 w-12">Top</span>
                                    <span className="text-gray-200 text-sm">{comp.top}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] uppercase tracking-wider text-gray-500 w-12">Heart</span>
                                    <span className="text-gray-200 text-sm">{comp.heart}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] uppercase tracking-wider text-gray-500 w-12">Base</span>
                                    <span className="text-gray-200 text-sm">{comp.base}</span>
                                  </div>
                                </div>
                              );
                            })()}
                            {tags.volume && (
                              <div className="mt-3 pt-3 border-t border-gray-700/50">
                                <span className="text-gray-500 text-xs">Volume: </span>
                                <span className="text-gray-200 text-sm font-medium">{tags.volume}</span>
                              </div>
                            )}
                            {tags['special-requests'] && (
                              <div className="mt-3 pt-3 border-t border-gray-700/50">
                                <div className="flex items-center gap-1.5 mb-1">
                                  <MessageSquare className="h-3 w-3 text-gray-500" />
                                  <span className="text-gray-500 text-xs">Special Requests</span>
                                </div>
                                <p className="text-gray-300 text-sm italic">&ldquo;{tags['special-requests']}&rdquo;</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Shipping Address */}
                        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700/50">
                          <div className="flex items-center gap-2 mb-3">
                            <MapPin className="h-4 w-4 text-gold" />
                            <h4 className="text-sm font-medium text-white">Shipping</h4>
                          </div>
                          {shipping?.address ? (
                            <div className="text-sm text-gray-300 space-y-0.5">
                              {shipping.name && <p className="text-white font-medium">{shipping.name}</p>}
                              {shipping.address.line1 && <p>{shipping.address.line1}</p>}
                              {shipping.address.line2 && <p>{shipping.address.line2}</p>}
                              <p>
                                {[shipping.address.city, shipping.address.postal_code].filter(Boolean).join(', ')}
                              </p>
                              {shipping.address.country && <p className="text-gray-400">{shipping.address.country}</p>}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm">No shipping address</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
