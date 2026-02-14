import { Metadata } from 'next';
import { getBlogPosts, getBlogCategories, getFeaturedPost } from '@/lib/blog';
import BlogListContent from './BlogListContent';

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
    images: ['/aquador.webp'],
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

  return (
    <BlogListContent
      posts={posts}
      categories={categories}
      featuredPost={featuredPost}
      currentPage={page}
      totalPages={totalPages}
      activeCategory={category || null}
    />
  );
}
