import { MetadataRoute } from 'next';
import { getAllProductSlugs } from '@/lib/product-service';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://aquadorcy.com';

  // Static pages
  const staticRoutes = [
    { route: '', priority: 1, changeFrequency: 'weekly' as const },
    { route: '/shop', priority: 0.9, changeFrequency: 'daily' as const },
    { route: '/shop/women', priority: 0.8, changeFrequency: 'daily' as const },
    { route: '/shop/men', priority: 0.8, changeFrequency: 'daily' as const },
    { route: '/shop/niche', priority: 0.8, changeFrequency: 'daily' as const },
    { route: '/create', priority: 0.8, changeFrequency: 'weekly' as const },
    { route: '/create-perfume', priority: 0.8, changeFrequency: 'weekly' as const },
    { route: '/about', priority: 0.6, changeFrequency: 'monthly' as const },
    { route: '/contact', priority: 0.6, changeFrequency: 'monthly' as const },
    { route: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
    { route: '/terms', priority: 0.3, changeFrequency: 'yearly' as const },
    { route: '/shipping', priority: 0.5, changeFrequency: 'monthly' as const },
  ];

  const staticPages = staticRoutes.map(({ route, priority, changeFrequency }) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));

  // Product pages
  const productSlugs = getAllProductSlugs();
  const productPages = productSlugs.map((slug) => ({
    url: `${baseUrl}/products/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  return [...staticPages, ...productPages];
}
