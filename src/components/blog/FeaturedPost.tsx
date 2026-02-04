'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 overflow-hidden rounded-sm bg-dark-light border border-gold/10">
          <div className="relative aspect-[16/10] lg:aspect-auto overflow-hidden">
            {post.cover_image ? (
              <Image
                src={post.cover_image}
                alt={post.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-dark-light to-dark flex items-center justify-center">
                <span className="text-gold/20 font-playfair text-8xl">A</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent lg:hidden" />
          </div>

          <div className="p-8 lg:p-12 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
              {post.category && (
                <span className="text-[10px] uppercase tracking-[0.2em] text-gold bg-gold/10 px-3 py-1">
                  {post.category}
                </span>
              )}
              {post.published_at && (
                <span className="text-[10px] uppercase tracking-[0.15em] text-gray-500">
                  {formatBlogDate(post.published_at)}
                </span>
              )}
            </div>

            <h2 className="text-2xl lg:text-3xl font-playfair text-white mb-4 group-hover:text-gold transition-colors duration-300">
              {post.title}
            </h2>

            {post.excerpt && (
              <p className="text-gray-400 text-sm leading-relaxed mb-6 line-clamp-3">
                {post.excerpt}
              </p>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center">
                  <span className="text-gold text-xs font-medium">
                    {post.author_name?.charAt(0) || 'A'}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-white">{post.author_name}</p>
                  {post.read_time && (
                    <p className="text-[10px] text-gray-500">{post.read_time} min read</p>
                  )}
                </div>
              </div>

              <span className="flex items-center gap-2 text-xs text-gold uppercase tracking-wider group-hover:gap-3 transition-all duration-300">
                Read
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
