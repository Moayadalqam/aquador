import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getBlogPostBySlug, getRelatedPosts } from '@/lib/blog';
import BlogPostContent from './BlogPostContent';

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return { title: 'Post Not Found | Aquad\'or' };
  }

  const canonicalUrl = `https://aquadorcy.com/blog/${post.slug}`;

  return {
    title: post.meta_title || `${post.title} | Aquad'or Blog`,
    description: post.meta_description || post.excerpt || '',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt || '',
      type: 'article',
      url: canonicalUrl,
      siteName: 'Aquad\'or Cyprus',
      publishedTime: post.published_at || undefined,
      authors: [post.author_name],
      images: post.cover_image ? [{
        url: post.cover_image,
        width: 1200,
        height: 630,
        alt: post.title,
      }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt || '',
      images: post.cover_image ? [post.cover_image] : [],
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = post.category
    ? await getRelatedPosts(post.category, post.slug)
    : [];

  // Build structured data array
  const schemas: Record<string, unknown>[] = [];

  // Article schema
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt || post.meta_description,
    image: post.cover_image,
    datePublished: post.published_at,
    dateModified: post.updated_at,
    author: {
      '@type': 'Person',
      name: post.author_name,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Aquad\'or Cyprus',
      url: 'https://aquadorcy.com',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://aquadorcy.com/blog/${post.slug}`,
    },
  });

  // BreadcrumbList schema
  schemas.push({
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
        name: 'Blog',
        item: 'https://aquadorcy.com/blog',
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: post.title,
        item: `https://aquadorcy.com/blog/${post.slug}`,
      },
    ],
  });

  // FAQPage schema - detect FAQ sections in content
  const faqMatches = post.content.match(
    /<details[^>]*>\s*<summary[^>]*>([\s\S]*?)<\/summary>\s*<div[^>]*>([\s\S]*?)<\/div>\s*<\/details>/gi
  );
  if (faqMatches && faqMatches.length > 0) {
    const faqItems = faqMatches.map((match) => {
      const questionMatch = match.match(/<summary[^>]*>([\s\S]*?)<\/summary>/i);
      const answerMatch = match.match(/<div[^>]*>([\s\S]*?)<\/div>/i);
      return {
        '@type': 'Question',
        name: questionMatch?.[1]?.replace(/<[^>]*>/g, '').trim() || '',
        acceptedAnswer: {
          '@type': 'Answer',
          text: answerMatch?.[1]?.replace(/<[^>]*>/g, '').trim() || '',
        },
      };
    });

    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems,
    });
  }

  // LocalBusiness schema - detect store references
  if (post.content.includes('Ledra 145') || post.content.includes('Aquad\'or')) {
    schemas.push({
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      '@id': 'https://aquadorcy.com/#business',
      name: 'Aquad\'or',
      description: 'Cyprus\'s dedicated Arabian perfume boutique offering consultations, fragrance matching, and custom perfume creation.',
      url: 'https://aquadorcy.com',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Ledra 145',
        addressLocality: 'Nicosia',
        addressCountry: 'CY',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 35.1725,
        longitude: 33.3617,
      },
      priceRange: '$$',
      image: post.cover_image,
    });
  }

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <BlogPostContent post={post} relatedPosts={relatedPosts} />
    </>
  );
}
