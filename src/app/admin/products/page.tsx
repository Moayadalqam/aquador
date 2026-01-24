'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Plus, Search, AlertCircle } from 'lucide-react';
import ProductsTable from '@/components/admin/ProductsTable';
import type { ProductCategory, Product } from '@/lib/supabase/types';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchQuery = searchParams.get('search') || '';
  const categoryFilter = searchParams.get('category') || '';
  const currentPage = parseInt(searchParams.get('page') || '1');
  const perPage = 20;

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      const supabase = createClient();
      const offset = (currentPage - 1) * perPage;

      try {
        let query = supabase
          .from('products')
          .select('*', { count: 'exact' })
          .order('created_at', { ascending: false })
          .range(offset, offset + perPage - 1);

        if (searchQuery) {
          query = query.ilike('name', `%${searchQuery}%`);
        }

        if (categoryFilter) {
          query = query.eq('category', categoryFilter as ProductCategory);
        }

        const { data, count: productCount, error: queryError } = await query;

        if (queryError) {
          throw queryError;
        }

        setProducts((data || []) as Product[]);
        setCount(productCount || 0);
      } catch (e) {
        console.error('Products fetch error:', e);
        setError(e instanceof Error ? e.message : 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchQuery, categoryFilter, currentPage]);

  const totalPages = Math.ceil(count / perPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="text-gray-400 mt-1">{count} total products</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gold text-black font-medium rounded-lg hover:bg-amber-500 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Product
        </Link>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-medium">Error loading products</p>
            <p className="text-red-400/70 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form className="flex-1 relative" action="/admin/products">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            name="search"
            defaultValue={searchQuery}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors"
          />
        </form>
        <form action="/admin/products">
          <input type="hidden" name="search" value={searchQuery} />
          <select
            name="category"
            defaultValue={categoryFilter}
            onChange={(e) => {
              const form = e.target.form;
              if (form) form.submit();
            }}
            className="px-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold transition-colors"
          >
            <option value="">All Categories</option>
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="niche">Niche</option>
            <option value="essence-oil">Essence Oil</option>
            <option value="body-lotion">Body Lotion</option>
          </select>
        </form>
      </div>

      {/* Products Table */}
      {loading ? (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold mx-auto"></div>
          <p className="text-gray-400 mt-4">Loading products...</p>
        </div>
      ) : (
        <ProductsTable products={products} />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/products?page=${p}${searchQuery ? `&search=${searchQuery}` : ''}${categoryFilter ? `&category=${categoryFilter}` : ''}`}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                p === currentPage
                  ? 'bg-gold text-black'
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
