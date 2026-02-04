'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import BlogHero from '@/components/blog/BlogHero';
import FeaturedPost from '@/components/blog/FeaturedPost';
import BlogCard from '@/components/blog/BlogCard';
import CategoryFilter from '@/components/blog/CategoryFilter';
import type { BlogPost, BlogCategory } from '@/lib/blog-types';

interface BlogListContentProps {
  posts: BlogPost[];
  categories: BlogCategory[];
  featuredPost: BlogPost | null;
  currentPage: number;
  totalPages: number;
  activeCategory: string | null;
}

export default function BlogListContent({
  posts,
  categories,
  featuredPost,
  currentPage,
  totalPages,
  activeCategory,
}: BlogListContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleCategoryChange = (slug: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set('category', slug);
    } else {
      params.delete('category');
    }
    params.delete('page');
    router.push(`/blog?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page > 1) {
      params.set('page', page.toString());
    } else {
      params.delete('page');
    }
    router.push(`/blog?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gold-ambient">
      <BlogHero />

      {/* Featured Post */}
      {featuredPost && (
        <section className="section-sm">
          <div className="container-wide">
            <FeaturedPost post={featuredPost} />
          </div>
        </section>
      )}

      {/* Category Filter */}
      <section className="py-8">
        <div className="container-wide">
          <CategoryFilter
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={handleCategoryChange}
          />
        </div>
      </section>

      {/* Posts Grid */}
      <section className="section-sm">
        <div className="container-wide">
          {posts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
              {posts.map((post, index) => (
                <BlogCard key={post.id} post={post} index={index} />
              ))}
            </div>
          ) : (
            <motion.div
              className="text-center py-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-gray-400 text-lg font-playfair">
                No articles found
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Check back soon for new content
              </p>
            </motion.div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-16">
              {currentPage > 1 && (
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="btn-filter btn-filter-inactive"
                >
                  Previous
                </button>
              )}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`btn-filter ${
                    page === currentPage ? 'btn-filter-active' : 'btn-filter-inactive'
                  }`}
                >
                  {page}
                </button>
              ))}
              {currentPage < totalPages && (
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="btn-filter btn-filter-inactive"
                >
                  Next
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
