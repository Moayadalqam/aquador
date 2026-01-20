import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://aquadorcy.com';

  // Static pages
  const routes = [
    '',
    '/shop',
    '/shop/women',
    '/shop/men',
    '/shop/niche',
    '/create',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
  ];

  const staticPages = routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return staticPages;
}
