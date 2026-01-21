import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProductsByCategory, categories } from '@/lib/products';
import CategoryContent from './CategoryContent';

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
  const category = categories.find((c) => c.slug === categorySlug);

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
  const category = categories.find((c) => c.slug === categorySlug);

  if (!category) {
    notFound();
  }

  const products = getProductsByCategory(categorySlug);

  // Custom not found for empty category (shouldn't happen with our data)
  if (products.length === 0) {
    return (
      <div className="pt-32 pb-16 min-h-screen bg-dark text-center">
        <h1 className="text-4xl font-playfair text-white">No products found</h1>
        <p className="text-gray-400 mt-4">This category is currently empty.</p>
        <Link href="/shop" className="text-gold mt-4 inline-block">
          ← Back to Shop
        </Link>
      </div>
    );
  }

  return <CategoryContent category={category} products={products} />;
}
