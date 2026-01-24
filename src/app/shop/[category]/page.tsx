import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProductsByCategory, categories, getCategoryBySlug } from '@/lib/supabase/product-service';
import CategoryContent from './CategoryContent';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface CategoryPageProps {
  params: Promise<{ category: string }>;
}

// Generate static params for all categories
export async function generateStaticParams() {
  return categories.map((category) => ({
    category: category.slug,
  }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);

  if (!category) {
    return {
      title: 'Category Not Found | Aquad\'or',
    };
  }

  return {
    title: `${category.name} | Aquad'or`,
    description: category.description,
    openGraph: {
      title: `${category.name} | Aquad'or`,
      description: category.description,
      images: [
        {
          url: category.image,
          width: 800,
          height: 600,
          alt: category.name,
        },
      ],
    },
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: categorySlug } = await params;
  const category = getCategoryBySlug(categorySlug);

  if (!category) {
    notFound();
  }

  const products = await getProductsByCategory(categorySlug);

  // Custom not found for empty category
  if (products.length === 0) {
    return (
      <div className="pt-32 pb-16 min-h-screen bg-dark text-center">
        <h1 className="text-4xl font-playfair text-white">No products found</h1>
        <p className="text-gray-400 mt-4">This category is currently empty.</p>
        <Link href="/shop" className="text-gold mt-4 inline-block">
          &larr; Back to Shop
        </Link>
      </div>
    );
  }

  // Transform Supabase products to match the expected interface
  const transformedProducts = products.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description,
    price: Number(p.price),
    salePrice: p.sale_price ? Number(p.sale_price) : undefined,
    category: p.category,
    productType: p.product_type,
    size: p.size,
    image: p.image,
    inStock: p.in_stock ?? true,
    brand: p.brand ?? undefined,
    gender: p.gender ?? undefined,
    tags: p.tags ?? undefined,
  }));

  return <CategoryContent category={category} products={transformedProducts} />;
}
