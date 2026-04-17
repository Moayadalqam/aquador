import { getRelatedProducts } from '@/lib/supabase/product-service';
import type { ProductCategory } from '@/lib/supabase/types';
import type { LegacyProduct } from '@/types';
import RelatedProducts from './RelatedProducts';

interface RelatedProductsSectionProps {
  productId: string;
  category: string;
}

/**
 * Async server component that fetches related products and renders them.
 * Designed to be wrapped in <Suspense> so the main product content
 * streams immediately while related products load in the background.
 */
export default async function RelatedProductsSection({
  productId,
  category,
}: RelatedProductsSectionProps) {
  const relatedProductsData = await getRelatedProducts(
    productId,
    category as ProductCategory
  );

  if (relatedProductsData.length === 0) {
    return null;
  }

  // Transform Supabase Product rows to LegacyProduct format
  const relatedProducts: LegacyProduct[] = relatedProductsData.map((p) => ({
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

  return <RelatedProducts products={relatedProducts} />;
}
