import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getProductBySlug, getRelatedProducts } from '@/lib/supabase/product-service';
import ProductInfo from '@/components/products/ProductInfo';
import AddToCartButton from '@/components/products/AddToCartButton';
import RelatedProducts from '@/components/products/RelatedProducts';
import ProductGallery from '@/components/products/ProductGallery';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// Dynamic rendering - skip static generation since we use dynamic data
// Products are fetched at request time from Supabase
export async function generateStaticParams() {
  // Return empty array to disable static generation
  // All product pages will be rendered on-demand
  return [];
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
      images: [product.image],
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

  const relatedProductsData = await getRelatedProducts(product.id);

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

  // JSON-LD structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: transformedProduct.name,
    description: transformedProduct.description,
    image: [transformedProduct.image, ...transformedProduct.images],
    brand: transformedProduct.brand ? {
      '@type': 'Brand',
      name: transformedProduct.brand,
    } : undefined,
    offers: {
      '@type': 'Offer',
      url: `https://aquadorcy.com/products/${slug}`,
      priceCurrency: 'EUR',
      price: transformedProduct.price,
      availability: transformedProduct.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Aquad\'or',
      },
    },
  };

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
        name: transformedProduct.name,
        item: `https://aquadorcy.com/products/${slug}`,
      },
    ],
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c') }}
      />

      <main className="min-h-screen bg-gold-ambient pt-28 pb-20">
        <div className="container-wide">
          {/* Breadcrumb */}
          <nav className="mb-8">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 text-sm text-gold/70 hover:text-gold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Shop
            </Link>
          </nav>

          {/* Product Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Product Images */}
            <ProductGallery
              mainImage={transformedProduct.image}
              images={transformedProduct.images}
              name={transformedProduct.name}
              inStock={transformedProduct.inStock}
            />

            {/* Product Details */}
            <div className="space-y-8">
              <ProductInfo product={transformedProduct} />
              <AddToCartButton product={transformedProduct} />

              {/* Additional Info */}
              <div className="pt-6 border-t border-gold/10 space-y-4">
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  <span>Free shipping on orders over &euro;100</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span>Secure checkout powered by Stripe</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Delivery within 3-7 business days</span>
                </div>
              </div>
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
