'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Package, DollarSign, ShoppingCart, TrendingUp, AlertCircle, ShoppingBag, Users, Eye } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product, Order } from '@/lib/supabase/types';

interface Stats {
  totalProducts: number;
  inStockProducts: number;
  outOfStockProducts: number;
  categoryCount: number;
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  liveVisitors: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    inStockProducts: 0,
    outOfStockProducts: 0,
    categoryCount: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    liveVisitors: 0,
  });
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    const fetchData = async () => {
      try {
        // Fetch product stats
        const [
          { count: totalProducts },
          { count: inStockProducts },
          { count: outOfStockProducts },
          { data: categories },
          { data: products },
          { count: totalOrders },
          { data: revenueData },
          { count: totalCustomers },
          { data: visitors },
          { data: latestOrders },
        ] = await Promise.all([
          supabase.from('products').select('*', { count: 'exact', head: true }),
          supabase.from('products').select('*', { count: 'exact', head: true }).eq('in_stock', true),
          supabase.from('products').select('*', { count: 'exact', head: true }).eq('in_stock', false),
          supabase.from('products').select('category').limit(1000),
          supabase.from('products').select('*').order('created_at', { ascending: false }).limit(5),
          supabase.from('orders').select('*', { count: 'exact', head: true }),
          supabase.from('orders').select('total'),
          supabase.from('customers').select('*', { count: 'exact', head: true }),
          supabase.from('site_visitors').select('id').gte('last_seen', new Date(Date.now() - 2 * 60 * 1000).toISOString()),
          supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
        ]);

        const categoryCount = new Set(categories?.map((p: { category: string }) => p.category)).size;
        const totalRevenue = (revenueData || []).reduce((sum: number, o: { total: number }) => sum + o.total, 0);

        setStats({
          totalProducts: totalProducts || 0,
          inStockProducts: inStockProducts || 0,
          outOfStockProducts: outOfStockProducts || 0,
          categoryCount,
          totalOrders: totalOrders || 0,
          totalRevenue,
          totalCustomers: totalCustomers || 0,
          liveVisitors: visitors?.length || 0,
        });

        setRecentProducts((products || []) as Product[]);
        setRecentOrders((latestOrders || []) as Order[]);
      } catch (e) {
        console.error('Dashboard error:', e);
        setError(e instanceof Error ? e.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Realtime subscription for live visitors
    const channel = supabase
      .channel('site_visitors_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_visitors' }, async () => {
        const { data } = await supabase
          .from('site_visitors')
          .select('id')
          .gte('last_seen', new Date(Date.now() - 2 * 60 * 1000).toISOString());
        setStats(prev => ({ ...prev, liveVisitors: data?.length || 0 }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Loading...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-900 rounded-xl border border-gray-800 p-6 animate-pulse">
              <div className="h-4 bg-gray-800 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-800 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Welcome to your store admin panel</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-medium">Error loading data</p>
            <p className="text-red-400/70 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon={<ShoppingBag className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          title="Revenue"
          value={`\u20AC${(stats.totalRevenue / 100).toFixed(0)}`}
          icon={<DollarSign className="h-6 w-6" />}
          color="gold"
        />
        <StatCard
          title="Customers"
          value={stats.totalCustomers}
          icon={<Users className="h-6 w-6" />}
          color="green"
        />
        <StatCard
          title="Live Visitors"
          value={stats.liveVisitors}
          icon={<Eye className="h-6 w-6" />}
          color="purple"
          pulse={stats.liveVisitors > 0}
        />
      </div>

      {/* Product Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon={<Package className="h-6 w-6" />}
          color="blue"
        />
        <StatCard
          title="In Stock"
          value={stats.inStockProducts}
          icon={<ShoppingCart className="h-6 w-6" />}
          color="green"
        />
        <StatCard
          title="Out of Stock"
          value={stats.outOfStockProducts}
          icon={<TrendingUp className="h-6 w-6" />}
          color="red"
        />
        <StatCard
          title="Categories"
          value={stats.categoryCount}
          icon={<DollarSign className="h-6 w-6" />}
          color="gold"
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent Orders</h2>
          <Link
            href="/admin/orders"
            className="text-sm text-gold hover:text-amber-400 transition-colors"
          >
            View All &rarr;
          </Link>
        </div>
        <div className="divide-y divide-gray-800">
          {recentOrders.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <ShoppingBag className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No orders yet</p>
              <p className="text-gray-500 text-sm mt-1">Orders will appear here after customers purchase</p>
            </div>
          ) : (
            recentOrders.map((order) => (
              <div key={order.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="text-white font-mono text-sm">
                    #{order.stripe_session_id.slice(-8).toUpperCase()}
                  </p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {order.customer_name || order.customer_email}
                    {' \u00B7 '}
                    {new Date(order.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">&euro;{(order.total / 100).toFixed(2)}</p>
                  <p className="text-xs text-gray-500 capitalize">{order.status}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Products */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent Products</h2>
          <Link
            href="/admin/products"
            className="text-sm text-gold hover:text-amber-400 transition-colors"
          >
            View All &rarr;
          </Link>
        </div>
        <div className="divide-y divide-gray-800">
          {recentProducts.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <Package className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No products yet</p>
              <Link
                href="/admin/products/new"
                className="inline-block mt-4 px-4 py-2 bg-gold text-black font-medium rounded-lg hover:bg-amber-500 transition-colors"
              >
                Add Your First Product
              </Link>
            </div>
          ) : (
            recentProducts.map((product) => (
              <div key={product.id} className="px-6 py-4 flex items-center gap-4">
                <div className="relative w-12 h-12 flex-shrink-0">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="rounded-lg object-cover bg-gray-800"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{product.name}</p>
                  <p className="text-sm text-gray-400 capitalize">
                    {product.category.replace('-', ' ')} &bull; {product.product_type.replace('-', ' ')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">&euro;{product.price.toFixed(2)}</p>
                  <p className={`text-xs ${product.in_stock ? 'text-green-400' : 'text-red-400'}`}>
                    {product.in_stock ? 'In Stock' : 'Out of Stock'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/products/new"
          className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-gold/50 transition-colors group"
        >
          <Package className="h-8 w-8 text-gold mb-4" />
          <h3 className="text-lg font-semibold text-white group-hover:text-gold transition-colors">
            Add New Product
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Create a new product listing
          </p>
        </Link>

        <Link
          href="/admin/orders"
          className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-gold/50 transition-colors group"
        >
          <ShoppingBag className="h-8 w-8 text-gold mb-4" />
          <h3 className="text-lg font-semibold text-white group-hover:text-gold transition-colors">
            Manage Orders
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            View and update order statuses
          </p>
        </Link>

        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-gold/50 transition-colors group"
        >
          <TrendingUp className="h-8 w-8 text-gold mb-4" />
          <h3 className="text-lg font-semibold text-white group-hover:text-gold transition-colors">
            View Store
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            See your live storefront
          </p>
        </a>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
  pulse,
}: {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'gold' | 'purple';
  pulse?: boolean;
}) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    gold: 'bg-gold/10 text-gold border-gold/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl border ${colorClasses[color]} ${pulse ? 'animate-pulse' : ''}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
