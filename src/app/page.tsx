import Hero from '@/components/home/Hero';
import Categories from '@/components/home/Categories';
import CreateSection from '@/components/home/CreateSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import CTASection from '@/components/home/CTASection';

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
