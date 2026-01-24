'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { AlertCircle } from 'lucide-react';

export default function CategoriesPage() {
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = createClient();

      try {
        const { data: products, error: queryError } = await supabase
          .from('products')
          .select('category');

        if (queryError) {
          throw queryError;
        }

        const counts = (products || []).reduce((acc, p: { category: string }) => {
          acc[p.category] = (acc[p.category] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        setCategoryCounts(counts);
      } catch (e) {
        console.error('Categories fetch error:', e);
        setError(e instanceof Error ? e.message : 'Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const categories = [
    { id: 'men', name: "Men's Collection", slug: 'men' },
    { id: 'women', name: "Women's Collection", slug: 'women' },
    { id: 'niche', name: 'Niche Collection', slug: 'niche' },
    { id: 'essence-oil', name: 'Essence Oil', slug: 'essence-oil' },
    { id: 'body-lotion', name: 'Body Lotion', slug: 'body-lotion' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Categories</h1>
        <p className="text-gray-400 mt-1">Product categories overview</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-medium">Error loading categories</p>
            <p className="text-red-400/70 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-gold/30 transition-colors"
          >
            <h3 className="text-lg font-semibold text-white">{category.name}</h3>
            <p className="text-gray-400 text-sm mt-1">/{category.slug}</p>
            <div className="mt-4 flex items-center justify-between">
              {loading ? (
                <div className="h-9 w-12 bg-gray-800 rounded animate-pulse"></div>
              ) : (
                <span className="text-3xl font-bold text-gold">
                  {categoryCounts[category.id] || 0}
                </span>
              )}
              <span className="text-gray-400 text-sm">products</span>
            </div>
            <a
              href={`/shop/${category.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 block text-center py-2 px-4 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
            >
              View Category →
            </a>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Category Management</h2>
        <p className="text-gray-400">
          Categories are currently fixed. To add or modify categories, please contact the development team.
        </p>
      </div>
    </div>
  );
}
