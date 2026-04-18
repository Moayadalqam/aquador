import { Metadata } from 'next';
import { getBlogPosts, getBlogCategories, getFeaturedPost } from '@/lib/blog';
import { buildBlogSchema, buildBreadcrumbList } from '@/lib/seo/listing-schema';
import JsonLd from '@/components/seo/JsonLd';
import BlogListContent from './BlogListContent';

export const revalidate = 300; // Revalidate every 5 minutes (ISR)

export const metadata: Metadata = {
  title: 'Blog | The Art of Scent',
  description: 'Stories, guides, and inspiration from the world of luxury fragrance. Expert tips on perfumes, reviews, and scent stories from Aquad\'or Cyprus.',
  openGraph: {
    title: 'Blog | The Art of Scent | Aquad\'or Cyprus',
    description: 'Stories, guides, and inspiration from the world of luxury fragrance.',
    url: 'https://aquadorcy.com/blog',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog | The Art of Scent | Aquad\'or Cyprus',
    description: 'Stories, guides, and inspiration from the world of luxury fragrance.',
    images: ['/aquador-logo.png'],
  },
  alternates: {
    canonical: 'https://aquadorcy.com/blog',
  },
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const params = await searchParams;
  const category = params.category || undefined;
  const page = parseInt(params.page || '1');

  const [{ posts, totalPages }, categories, featuredPost] = await Promise.all([
    getBlogPosts({ page, category }),
    getBlogCategories(),
    !category && page === 1 ? getFeaturedPost() : Promise.resolve(null),
  ]);

  const breadcrumbSchema = buildBreadcrumbList([
    { name: 'Home', url: 'https://aquadorcy.com' },
    { name: 'Blog', url: 'https://aquadorcy.com/blog' },
  ]);

  const blogSchema = buildBlogSchema(
    posts.map(p => ({
      title: p.title,
      slug: p.slug,
      cover_image: p.cover_image,
    }))
  );

  return (
    <>
      <JsonLd schema={breadcrumbSchema} />
      <JsonLd schema={blogSchema} />
      <BlogListContent
        posts={posts}
        categories={categories}
        featuredPost={featuredPost}
        currentPage={page}
        totalPages={totalPages}
        activeCategory={category || null}
      />
    </>
  );
}
