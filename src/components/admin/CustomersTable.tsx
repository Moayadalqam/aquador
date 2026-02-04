'use client';

import Link from 'next/link';
import type { Customer } from '@/lib/supabase/types';

interface CustomersTableProps {
  customers: Customer[];
}

export default function CustomersTable({ customers }: CustomersTableProps) {
  if (customers.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 text-lg">No customers yet</p>
        <p className="text-gray-500 text-sm mt-1">Customer data will appear after the first purchase</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-800">
            <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Customer</th>
            <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Orders</th>
            <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Total Spent</th>
            <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">First Order</th>
            <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3">Last Order</th>
            <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wider px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-800">
          {customers.map((customer) => (
            <tr key={customer.id} className="hover:bg-gray-800/50 transition-colors">
              <td className="px-4 py-4">
                <div>
                  <p className="text-white text-sm font-medium">{customer.name || 'N/A'}</p>
                  <p className="text-gray-500 text-xs">{customer.email}</p>
                </div>
              </td>
              <td className="px-4 py-4 text-right">
                <span className="text-white text-sm">{customer.total_orders}</span>
              </td>
              <td className="px-4 py-4 text-right">
                <span className="text-white font-medium">
                  &euro;{(customer.total_spent / 100).toFixed(2)}
                </span>
              </td>
              <td className="px-4 py-4">
                <span className="text-gray-400 text-sm">
                  {customer.first_order_at
                    ? new Date(customer.first_order_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '-'}
                </span>
              </td>
              <td className="px-4 py-4">
                <span className="text-gray-400 text-sm">
                  {customer.last_order_at
                    ? new Date(customer.last_order_at).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })
                    : '-'}
                </span>
              </td>
              <td className="px-4 py-4 text-right">
                <Link
                  href={`/admin/customers/${customer.id}`}
                  className="text-gold hover:text-amber-400 text-sm transition-colors"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
