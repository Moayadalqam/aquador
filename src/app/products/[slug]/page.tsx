import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getProductBySlug, getRelatedProducts, getAllProductSlugs, getCategoryBySlug } from '@/lib/supabase/product-service';
import ProductDetails from '@/components/products/ProductDetails';
import RelatedProducts from '@/components/products/RelatedProducts';
import ProductGallery from '@/components/products/ProductGallery';
import ParallaxWrapper from './ParallaxWrapper';
import { ProductViewTracker } from '@/components/products/ProductViewTracker';
import { buildProductSchema, buildProductBreadcrumb } from '@/lib/seo/product-schema';

export const revalidate = 3600;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: 'Product Not Found | Aquad\'or',
    };
  }

  return {
    title: `${product.name}`,
    description: product.description,
    openGraph: {
      title: `${product.name} | Aquad'or`,
      description: product.description,
      url: `https://aquadorcy.com/products/${slug}`,
      images: [
        {
          url: `/api/og/product/${slug}`,
          width: 1200,
          height: 630,
          alt: product.name,
        },
        {
          url: product.image,
          width: 800,
          height: 800,
          alt: product.name,
        },
        ...(product.images ?? []).map((img: string) => ({
          url: img,
          width: 800,
          height: 800,
          alt: product.name,
        })),
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | Aquad'or`,
      description: product.description,
      images: [`/api/og/product/${slug}`, product.image],
    },
    alternates: {
      canonical: `https://aquadorcy.com/products/${slug}`,
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const relatedProductsData = await getRelatedProducts(product.id, product.category);

  // Transform Supabase product to match expected interface
  const transformedProduct = {
    id: product.id,
    name: product.name,
    description: product.description,
    price: Number(product.price),
    salePrice: product.sale_price ? Number(product.sale_price) : undefined,
    category: product.category,
    productType: product.product_type,
    size: product.size,
    image: product.image,
    images: product.images ?? [],
    inStock: product.in_stock ?? true,
    brand: product.brand ?? undefined,
    gender: product.gender ?? undefined,
    tags: product.tags ?? undefined,
  };

  const relatedProducts = relatedProductsData.map(p => ({
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

  // JSON-LD structured data for SEO (Merchant-grade Product schema)
  const allImages = [product.image, ...(product.images ?? [])].filter(Boolean);
  const jsonLd = buildProductSchema(product, slug, allImages);

  const categoryMeta = getCategoryBySlug(product.category);
  const breadcrumbSchema = buildProductBreadcrumb(
    product.name,
    slug,
    categoryMeta?.name,
    categoryMeta?.slug
  );

  return (
    <>
      {/* Analytics: track time spent on product page (client-side, >3s threshold) */}
      <ProductViewTracker productSlug={slug} productName={product.name} />

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c') }}
      />

      <main className="min-h-screen bg-gold-ambient pt-24 md:pt-28 lg:pt-32 pb-20">
        <div className="content-container">
          {/* Breadcrumb */}
          <nav className="mb-6">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-sm text-gold/70 tracking-normal hover:text-gold-500 transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Shop
            </Link>
          </nav>

          {/* Product Content — compact layout so CTA is above the fold */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 items-start">
            {/* Product Images - Subtle parallax for depth */}
            <ParallaxWrapper>
              <ProductGallery
                mainImage={transformedProduct.image}
                images={transformedProduct.images}
                name={transformedProduct.name}
                inStock={transformedProduct.inStock}
              />
            </ParallaxWrapper>

            {/* Product Details with variant selector + add to cart */}
            <div className="lg:sticky lg:top-28">
              <ProductDetails product={transformedProduct} />
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <RelatedProducts products={relatedProducts} />
          )}
        </div>
      </main>
    </>
  );
}
