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

  return {
    title: post.meta_title || `${post.title} | Aquad'or Blog`,
    description: post.meta_description || post.excerpt || '',
    openGraph: {
      title: post.meta_title || post.title,
      description: post.meta_description || post.excerpt || '',
      type: 'article',
      publishedTime: post.published_at || undefined,
      authors: [post.author_name],
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

  // Structured data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
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
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogPostContent post={post} relatedPosts={relatedPosts} />
    </>
  );
}
