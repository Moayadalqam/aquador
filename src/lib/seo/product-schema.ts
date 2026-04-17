import type { Product } from '@/lib/supabase/types';

const BASE_URL = 'https://aquadorcy.com';

export function buildProductSchema(product: Product, slug: string, imageUrls: string[]) {
  const price = product.sale_price ? Number(product.sale_price) : Number(product.price);
  const priceValidUntil = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${BASE_URL}/products/${slug}#product`,
    name: product.name,
    description: product.description,
    image: imageUrls,
    sku: product.id,
    mpn: product.id,
    ...(product.brand && {
      brand: { '@type': 'Brand', name: product.brand },
    }),
    ...(product.category && {
      category: product.category,
    }),
    offers: {
      '@type': 'Offer',
      '@id': `${BASE_URL}/products/${slug}#offer`,
      url: `${BASE_URL}/products/${slug}`,
      priceCurrency: 'EUR',
      price: price.toFixed(2),
      priceValidUntil,
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.in_stock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: "Aquad'or",
        url: BASE_URL,
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'CY',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 14,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: '0',
          currency: 'EUR',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'CY',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: {
            '@type': 'QuantitativeValue',
            minValue: 0,
            maxValue: 1,
            unitCode: 'DAY',
          },
          transitTime: {
            '@type': 'QuantitativeValue',
            minValue: 1,
            maxValue: 3,
            unitCode: 'DAY',
          },
        },
      },
    },
  };
}

export function buildProductBreadcrumb(
  productName: string,
  slug: string,
  categoryName?: string,
  categorySlug?: string
) {
  const items: Array<{ '@type': string; position: number; name: string; item: string }> = [
    { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
    { '@type': 'ListItem', position: 2, name: 'Shop', item: `${BASE_URL}/shop` },
  ];

  if (categoryName && categorySlug) {
    items.push({
      '@type': 'ListItem',
      position: 3,
      name: categoryName,
      item: `${BASE_URL}/shop/${categorySlug}`,
    });
    items.push({
      '@type': 'ListItem',
      position: 4,
      name: productName,
      item: `${BASE_URL}/products/${slug}`,
    });
  } else {
    items.push({
      '@type': 'ListItem',
      position: 3,
      name: productName,
      item: `${BASE_URL}/products/${slug}`,
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}
