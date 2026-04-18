'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import type { BlogPost } from '@/lib/blog-types';
import { formatBlogDate } from '@/lib/blog-types';

interface FeaturedPostProps {
  post: BlogPost;
}

export default function FeaturedPost({ post }: FeaturedPostProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Link href={`/blog/${post.slug}`} className="group block">
        <article className="relative bg-white border border-gold/15 p-8 sm:p-10 lg:p-14 overflow-hidden transition-all duration-500 group-hover:border-gold/30 group-hover:shadow-[0_12px_40px_-15px_rgba(212,175,55,0.12)]">
          {/* Decorative corner accents */}
          <div className="absolute top-0 left-0 w-12 h-[2px] bg-gold" />
          <div className="absolute top-0 left-0 w-[2px] h-12 bg-gold" />
          <div className="absolute bottom-0 right-0 w-12 h-[2px] bg-gold" />
          <div className="absolute bottom-0 right-0 w-[2px] h-12 bg-gold" />

          {/* Featured badge */}
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-gold" />
            <span className="text-[10px] uppercase tracking-[0.25em] text-gold font-medium">
              Featured Article
            </span>
          </div>

          {/* Category & Meta */}
          <div className="flex flex-wrap items-center gap-3 mb-5">
            {post.category && (
              <span className="text-[10px] uppercase tracking-[0.2em] text-gold bg-gold/8 px-3 py-1.5 border border-gold/10">
                {post.category}
              </span>
            )}
            {post.published_at && (
              <span className="text-[10px] uppercase tracking-[0.15em] text-gray-500">
                {formatBlogDate(post.published_at)}
              </span>
            )}
            {post.read_time && (
              <span className="text-[10px] uppercase tracking-[0.15em] text-gray-400">
                {post.read_time} min read
              </span>
            )}
          </div>

          {/* Title */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-playfair text-black mb-5 leading-tight group-hover:text-gold-dark transition-colors duration-300 max-w-3xl">
            {post.title}
          </h2>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-gray-500 text-base sm:text-lg leading-relaxed mb-8 max-w-2xl line-clamp-3">
              {post.excerpt}
            </p>
          )}

          {/* Author + CTA */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-6 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                <span className="text-gold text-xs font-medium">
                  {post.author_name?.charAt(0) || 'A'}
                </span>
              </div>
              <div>
                <p className="text-sm text-black font-medium">{post.author_name}</p>
                {post.author_role && (
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                    {post.author_role}
                  </p>
                )}
              </div>
            </div>

            <span className="flex items-center gap-2 text-xs text-gold uppercase tracking-[0.15em] font-medium group-hover:gap-3 transition-all duration-300">
              Read Article
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
