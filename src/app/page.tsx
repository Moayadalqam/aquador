import dynamic from 'next/dynamic';

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

export default function Home() {
  return (
    <>
      <Hero />
      <Categories />
      <CreateSection />
      <FeaturedProducts />
      <CTASection />
    </>
  );
}
