import { getFeaturedAquadorProducts, getFeaturedLattafaProducts } from '@/lib/supabase/product-service';
import dynamic from 'next/dynamic';
import Hero from '@/components/home/Hero';
import TrustBar from '@/components/home/TrustBar';
import Categories from '@/components/home/Categories';
import CreateSection from '@/components/home/CreateSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import { AnimationBudgetProvider } from '@/lib/performance/animation-budget';
import JsonLd from '@/components/seo/JsonLd';

const Hero3DScroll = dynamic(() => import('@/components/home/Hero3DScroll'), {
  ssr: false,
});

export const revalidate = 600;

export default async function Home() {
  const [aquadorData, lattafaData] = await Promise.all([
    getFeaturedAquadorProducts(6),
    getFeaturedLattafaProducts(6),
  ]);

  // Transform Supabase products to match expected interface
  const transformProducts = (data: typeof aquadorData) =>
    data.map(p => ({
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

  const aquadorProducts = transformProducts(aquadorData);
  const lattafaProducts = transformProducts(lattafaData);

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: "Aquad'or",
    url: 'https://aquadorcy.com',
    logo: 'https://aquadorcy.com/aquador.webp',
    description: "Cyprus's premier luxury fragrance house offering curated niche perfumes and bespoke fragrance creation.",
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Ledra 145',
      addressLocality: 'Nicosia',
      postalCode: '1011',
      addressCountry: 'CY',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+357-99-980809',
      contactType: 'customer service',
      email: 'info@aquadorcy.com',
      availableLanguage: ['English', 'Greek', 'Arabic'],
    },
    sameAs: [
      'https://instagram.com/aquadorcy',
      'https://facebook.com/aquadorcy',
    ],
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: "Aquad'or",
    url: 'https://aquadorcy.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://aquadorcy.com/shop?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  const localBusinessSchema = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: "Aquad'or",
    image: 'https://aquadorcy.com/aquador.webp',
    url: 'https://aquadorcy.com',
    telephone: '+357-99-980809',
    email: 'info@aquadorcy.com',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Ledra 145',
      addressLocality: 'Nicosia',
      postalCode: '1011',
      addressCountry: 'CY',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 35.1753,
      longitude: 33.3619,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '10:00',
        closes: '20:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Sunday',
        opens: '12:00',
        closes: '18:00',
      },
    ],
    priceRange: '€€',
  };

  return (
    <AnimationBudgetProvider>
      <JsonLd schema={organizationSchema} />
      <JsonLd schema={websiteSchema} />
      <JsonLd schema={localBusinessSchema} />
      <Hero />
      <Hero3DScroll />
      <TrustBar />
      <Categories />
      <CreateSection />
      <FeaturedProducts
        products={aquadorProducts}
        title="Featured Aquad'or Perfumes"
        subtitle="Our signature collection, crafted exclusively for Aquad'or."
        eyebrow="House Collection"
        viewAllHref="/shop"
        viewAllLabel="View All Aquad'or"
      />
      <FeaturedProducts
        products={lattafaProducts}
        title="Best-Selling Lattafa Originals"
        subtitle="Authentic Lattafa perfumes, curated and imported directly."
        eyebrow="Lattafa Collection"
        viewAllHref="/shop/lattafa"
        viewAllLabel="View All Lattafa"
      />
    </AnimationBudgetProvider>
  );
}
