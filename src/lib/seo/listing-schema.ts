const BASE_URL = 'https://aquadorcy.com';

type ListingItem = {
  name: string;
  slug: string;
  image?: string;
  price?: number;
  inStock?: boolean;
  brand?: string;
};

export function buildCollectionPage(params: {
  name: string;
  description: string;
  url: string;
  items: ListingItem[];
  itemUrlPrefix: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    '@id': `${params.url}#collection`,
    name: params.name,
    description: params.description,
    url: params.url,
    isPartOf: { '@type': 'WebSite', '@id': `${BASE_URL}/#website` },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: params.items.length,
      itemListElement: params.items.slice(0, 30).map((item, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `${BASE_URL}${params.itemUrlPrefix}/${item.slug}`,
        name: item.name,
        ...(item.image && { image: item.image }),
      })),
    },
  };
}

export function buildBreadcrumbList(crumbs: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  };
}

export function buildBlogSchema(posts: Array<{ title: string; slug: string; cover_image?: string | null }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${BASE_URL}/blog#blog`,
    name: 'The Art of Scent',
    url: `${BASE_URL}/blog`,
    publisher: {
      '@type': 'Organization',
      name: "Aquad'or",
      url: BASE_URL,
    },
    blogPost: posts.slice(0, 20).map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      url: `${BASE_URL}/blog/${p.slug}`,
      ...(p.cover_image && { image: p.cover_image }),
    })),
  };
}

export function jsonLdScript(schema: Record<string, unknown> | Array<Record<string, unknown>>) {
  return JSON.stringify(schema).replace(/</g, '\\u003c');
}
