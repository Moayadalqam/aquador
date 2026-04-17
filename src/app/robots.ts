import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/checkout/',
          '/maintenance',
          '/monitoring/',
          '/reorder/success',
          '/create-perfume/success',
          '/*?*utm_',
          '/*?*fbclid',
        ],
      },
      { userAgent: 'GPTBot', disallow: '/' },
      { userAgent: 'CCBot', disallow: '/' },
      { userAgent: 'Google-Extended', disallow: '/' },
    ],
    sitemap: 'https://aquadorcy.com/sitemap.xml',
    host: 'https://aquadorcy.com',
  };
}
