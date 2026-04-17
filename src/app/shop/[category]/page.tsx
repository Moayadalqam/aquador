import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductsByCategory, categories, getCategoryBySlug } from '@/lib/supabase/product-service';
import { buildCollectionPage, jsonLdScript } from '@/lib/seo/listing-schema';
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

  const allProducts = await getProductsByCategory(categorySlug);
  // Only show perfumes — oils/lotions are variants on the product page, not separate listings
  const products = allProducts.filter(p => p.product_type === 'perfume');

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

  const collectionSchema = buildCollectionPage({
    name: `${category.name} Perfumes`,
    description: category.description,
    url: `https://aquadorcy.com/shop/${categorySlug}`,
    items: products.map(p => ({
      name: p.name,
      slug: p.id,
      image: p.image,
    })),
    itemUrlPrefix: '/products',
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(collectionSchema) }}
      />
      <CategoryContent category={category} products={products} />
    </>
  );
}
