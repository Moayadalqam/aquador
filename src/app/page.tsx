import dynamic from 'next/dynamic';
import { getFeaturedProducts } from '@/lib/supabase/product-service';

const Hero = dynamic(() => import('@/components/home/Hero'), {
  ssr: true,
});

const Categories = dynamic(() => import('@/components/home/Categories'), {
  ssr: true,
});

const CreateSection = dynamic(() => import('@/components/home/CreateSection'), {
  ssr: true,
});

const FeaturedProducts = dynamic(() => import('@/components/home/FeaturedProducts'), {
  ssr: true,
  loading: () => (
    <div className="py-20 text-center">
      <div className="inline-block w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

const CTASection = dynamic(() => import('@/components/home/CTASection'), {
  ssr: true,
});

export const revalidate = 0;

export default async function Home() {
  const featuredProductsData = await getFeaturedProducts(6);

  // Transform Supabase products to match expected interface
  const featuredProducts = featuredProductsData.map(p => ({
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
      <Hero />
      <Categories />
      <CreateSection />
      <FeaturedProducts products={featuredProducts} />
      <CTASection />
    </>
  );
}
