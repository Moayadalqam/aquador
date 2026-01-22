import { createClient } from '@/lib/supabase/server';

export default async function CategoriesPage() {
  const supabase = await createClient();

  // Get category counts
  const { data: products } = await supabase
    .from('products')
    .select('category');

  const categoryCounts = (products || []).reduce((acc, p: { category: string }) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-gray-900 rounded-xl border border-gray-800 p-6 hover:border-gold/30 transition-colors"
          >
            <h3 className="text-lg font-semibold text-white">{category.name}</h3>
            <p className="text-gray-400 text-sm mt-1">/{category.slug}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-3xl font-bold text-gold">
                {categoryCounts[category.id] || 0}
              </span>
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
