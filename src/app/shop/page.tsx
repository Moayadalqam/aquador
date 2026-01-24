import { Suspense } from 'react';
import { getAllProducts, categories } from '@/lib/supabase/product-service';
import ShopContent from './ShopContent';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ShopPage() {
  const products = await getAllProducts();

  return (
    <Suspense fallback={<div className="pt-28 pb-20 bg-black min-h-screen" />}>
      <ShopContent products={products} categories={categories} />
    </Suspense>
  );
}
