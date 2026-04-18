'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { BlogPost } from '@/lib/blog-types';
import { formatBlogDate } from '@/lib/blog-types';

interface BlogCardProps {
  post: BlogPost;
  index?: number;
}

export default function BlogCard({ post, index = 0 }: BlogCardProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.3) }}
    >
      <Link href={`/blog/${post.slug}`} className="group block h-full">
        <article className="relative h-full bg-white border border-gray-200 p-6 sm:p-7 flex flex-col transition-all duration-500 group-hover:border-gold/40 group-hover:shadow-[0_8px_30px_-12px_rgba(212,175,55,0.15)]">
          {/* Gold accent line */}
          <div className="absolute top-0 left-0 w-0 h-[2px] bg-gradient-to-r from-gold to-gold-light transition-all duration-500 group-hover:w-full" />

          {/* Category & Date row */}
          <div className="flex items-center gap-3 mb-4">
            {post.category && (
              <span className="text-[10px] uppercase tracking-[0.2em] text-gold font-medium">
                {post.category}
              </span>
            )}
            {post.category && post.published_at && (
              <span className="w-1 h-1 rounded-full bg-gray-300" />
            )}
            {post.published_at && (
              <span className="text-[10px] uppercase tracking-[0.12em] text-gray-400">
                {formatBlogDate(post.published_at)}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg sm:text-xl font-playfair text-gray-900 leading-snug mb-3 group-hover:text-gold-dark transition-colors duration-300 line-clamp-3">
            {post.title}
          </h3>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-6 flex-1">
              {post.excerpt}
            </p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
            {post.read_time && (
              <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                {post.read_time} min read
              </span>
            )}
            <motion.span
              className="flex items-center gap-1.5 text-[10px] text-gold uppercase tracking-[0.15em] font-medium"
              whileHover={reducedMotion ? {} : { x: 3 }}
            >
              Read
              <ArrowUpRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </motion.span>
          </div>
        </article>
      </Link>
    </motion.div>
  );
}
