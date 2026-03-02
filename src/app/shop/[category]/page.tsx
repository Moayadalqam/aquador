import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductsByCategory, categories, getCategoryBySlug } from '@/lib/supabase/product-service';
import CategoryContent from './CategoryContent';

export const revalidate = 1800;

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
    title: `${category.name} Perfumes`,
    description: category.description,
    openGraph: {
      title: `${category.name} Perfumes | Aquad'or Cyprus`,
      description: category.description,
      url: `https://aquadorcy.com/shop/${categorySlug}`,
      images: [
        {
          url: category.image,
          width: 800,
          height: 600,
          alt: category.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${category.name} Perfumes | Aquad'or Cyprus`,
      description: category.description,
      images: [category.image],
    },
    alternates: {
      canonical: `https://aquadorcy.com/shop/${categorySlug}`,
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

  // BreadcrumbList structured data
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://aquadorcy.com',
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Shop',
        item: 'https://aquadorcy.com/shop',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: category.name,
        item: `https://aquadorcy.com/shop/${categorySlug}`,
      },
    ],
  };

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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c') }}
      />
      <CategoryContent category={category} products={transformedProducts} />
    </>
  );
}
