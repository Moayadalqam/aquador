import { Metadata } from 'next';
import { getProductsByGender, getGenderLabel } from '@/lib/supabase/product-service';
import type { ProductGender } from '@/lib/supabase/types';
import { buildCollectionPage } from '@/lib/seo/listing-schema';
import JsonLd from '@/components/seo/JsonLd';
import GenderShopContent from '@/components/shop/GenderShopContent';

export function buildGenderMetadata(gender: ProductGender): Metadata {
  const label = getGenderLabel(gender);
  const url = `https://aquadorcy.com/shop/${gender}`;

  return {
    title: `${label} | Aquad'or Cyprus`,
    description: `Browse our curated collection of ${label.toLowerCase()}. Luxury perfumes from Dubai, delivered across Cyprus.`,
    openGraph: {
      title: `${label} | Aquad'or Cyprus`,
      description: `Browse our curated collection of ${label.toLowerCase()}. Luxury perfumes from Dubai.`,
      url,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${label} | Aquad'or Cyprus`,
      description: `Browse our curated collection of ${label.toLowerCase()}.`,
    },
    alternates: {
      canonical: url,
    },
  };
}

export async function renderGenderPage(gender: ProductGender) {
  const allProducts = await getProductsByGender(gender);
  // Only show perfumes — oils/lotions are variants on the product page, not separate listings
  const products = allProducts.filter((p) => p.product_type === 'perfume');

  const genderLabel = getGenderLabel(gender);
  const url = `https://aquadorcy.com/shop/${gender}`;

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://aquadorcy.com' },
      { '@type': 'ListItem', position: 2, name: 'Shop', item: 'https://aquadorcy.com/shop' },
      { '@type': 'ListItem', position: 3, name: genderLabel, item: url },
    ],
  };

  const collectionSchema = buildCollectionPage({
    name: genderLabel,
    description: `Curated collection of ${genderLabel.toLowerCase()} — luxury perfumes from Dubai, delivered across Cyprus.`,
    url,
    items: products.map((p) => ({
      name: p.name,
      slug: p.id,
      image: p.image,
    })),
    itemUrlPrefix: '/products',
  });

  return (
    <>
      <JsonLd schema={breadcrumbSchema} />
      <JsonLd schema={collectionSchema} />
      <GenderShopContent gender={gender} genderLabel={genderLabel} products={products} />
    </>
  );
}
