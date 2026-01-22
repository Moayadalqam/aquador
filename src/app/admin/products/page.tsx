import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import ProductsTable from '@/components/admin/ProductsTable';
import type { ProductCategory, Product } from '@/lib/supabase/types';

interface SearchParams {
  search?: string;
  category?: string;
  page?: string;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const page = parseInt(params.page || '1');
  const perPage = 20;
  const offset = (page - 1) * perPage;

  let query = supabase
    .from('products')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + perPage - 1);

  if (params.search) {
    query = query.ilike('name', `%${params.search}%`);
  }

  if (params.category) {
    query = query.eq('category', params.category as ProductCategory);
  }

  const { data: products, count } = await query;
  const typedProducts = (products || []) as Product[];
  const totalPages = Math.ceil((count || 0) / perPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Products</h1>
          <p className="text-gray-400 mt-1">{count || 0} total products</p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gold text-black font-medium rounded-lg hover:bg-amber-500 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <form className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            name="search"
            defaultValue={params.search}
            placeholder="Search products..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors"
          />
        </form>
        <form>
          <select
            name="category"
            defaultValue={params.category || ''}
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
      <ProductsTable products={typedProducts} />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/products?page=${p}${params.search ? `&search=${params.search}` : ''}${params.category ? `&category=${params.category}` : ''}`}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                p === page
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
