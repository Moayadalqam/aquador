import { Metadata } from 'next';
import { getBlogPosts, getBlogCategories, getFeaturedPost } from '@/lib/blog';
import BlogListContent from './BlogListContent';

export const metadata: Metadata = {
  title: 'Blog | The Art of Scent | Aquad\'or Cyprus',
  description: 'Stories, guides, and inspiration from the world of luxury fragrance. Expert tips on perfumes, reviews, and scent stories from Aquad\'or Cyprus.',
  openGraph: {
    title: 'Blog | The Art of Scent | Aquad\'or Cyprus',
    description: 'Stories, guides, and inspiration from the world of luxury fragrance.',
    type: 'website',
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
