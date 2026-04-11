import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductsByGender, getGenderLabel } from '@/lib/supabase/product-service';
import type { ProductGender } from '@/lib/supabase/types';
import GenderContent from './GenderContent';

export const revalidate = 1800;

const VALID_GENDERS: ProductGender[] = ['men', 'women', 'unisex'];

interface GenderPageProps {
  params: Promise<{ gender: string }>;
}

export async function generateStaticParams() {
  return [
    { gender: 'men' },
    { gender: 'women' },
    { gender: 'unisex' },
  ];
}

export async function generateMetadata({ params }: GenderPageProps): Promise<Metadata> {
  const { gender } = await params;

  if (!VALID_GENDERS.includes(gender as ProductGender)) {
    return {
      title: "Not Found | Aquad'or",
    };
  }

  const label = getGenderLabel(gender);

  return {
    title: `${label} | Aquad'or Cyprus`,
    description: `Browse our curated collection of ${label.toLowerCase()}. Luxury perfumes from Dubai, delivered across Cyprus.`,
    openGraph: {
      title: `${label} | Aquad'or Cyprus`,
      description: `Browse our curated collection of ${label.toLowerCase()}. Luxury perfumes from Dubai.`,
      url: `https://aquadorcy.com/shop/gender/${gender}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${label} | Aquad'or Cyprus`,
      description: `Browse our curated collection of ${label.toLowerCase()}.`,
    },
    alternates: {
      canonical: `https://aquadorcy.com/shop/gender/${gender}`,
    },
  };
}

export default async function GenderPage({ params }: GenderPageProps) {
  const { gender } = await params;

  if (!VALID_GENDERS.includes(gender as ProductGender)) {
    notFound();
  }

  const allProducts = await getProductsByGender(gender as ProductGender);
  // Only show perfumes — oils/lotions are variants on the product page, not separate listings
  const products = allProducts.filter(p => p.product_type === 'perfume');

  const genderLabel = getGenderLabel(gender);

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
        name: genderLabel,
        item: `https://aquadorcy.com/shop/gender/${gender}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c') }}
      />
      <GenderContent gender={gender} genderLabel={genderLabel} products={products} />
    </>
  );
}
