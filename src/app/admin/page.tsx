'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Package, DollarSign, ShoppingCart, TrendingUp, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { Product } from '@/lib/supabase/types';

interface Stats {
  totalProducts: number;
  inStockProducts: number;
  outOfStockProducts: number;
  categoryCount: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    inStockProducts: 0,
    outOfStockProducts: 0,
    categoryCount: 0,
  });
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();

      try {
        // Fetch stats
        const { count: totalProducts } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true });

        const { count: inStockProducts } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('in_stock', true);

        const { count: outOfStockProducts } = await supabase
          .from('products')
          .select('*', { count: 'exact', head: true })
          .eq('in_stock', false);

        const { data: categories } = await supabase
          .from('products')
          .select('category')
          .limit(1000);

        const categoryCount = new Set(categories?.map((p: { category: string }) => p.category)).size;

        setStats({
          totalProducts: totalProducts || 0,
          inStockProducts: inStockProducts || 0,
          outOfStockProducts: outOfStockProducts || 0,
          categoryCount,
        });

        // Fetch recent products
        const { data: products } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentProducts((products || []) as Product[]);
      } catch (e) {
        console.error('Dashboard error:', e);
        setError(e instanceof Error ? e.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

      {/* Stats Grid */}
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

      {/* Recent Products */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent Products</h2>
          <Link
            href="/admin/products"
            className="text-sm text-gold hover:text-amber-400 transition-colors"
          >
            View All →
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
                    {product.category.replace('-', ' ')} • {product.product_type.replace('-', ' ')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">€{product.price.toFixed(2)}</p>
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
          href="/admin/products"
          className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-gold/50 transition-colors group"
        >
          <ShoppingCart className="h-8 w-8 text-gold mb-4" />
          <h3 className="text-lg font-semibold text-white group-hover:text-gold transition-colors">
            Manage Products
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Edit, update, or remove products
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
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'gold';
}) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    gold: 'bg-gold/10 text-gold border-gold/20',
  };

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-xl border ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
