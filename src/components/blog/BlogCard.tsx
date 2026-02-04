'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import type { BlogPost } from '@/lib/blog-types';
import { formatBlogDate } from '@/lib/blog-types';

interface BlogCardProps {
  post: BlogPost;
  index?: number;
}

export default function BlogCard({ post, index = 0 }: BlogCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
    >
      <Link href={`/blog/${post.slug}`} className="group block product-card">
        <div className="relative aspect-[3/4] overflow-hidden">
          {post.cover_image ? (
            <Image
              src={post.cover_image}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-dark-light to-dark flex items-center justify-center">
              <span className="text-gold/30 font-playfair text-4xl">A</span>
            </div>
          )}
          {post.category && (
            <span className="absolute top-3 left-3 bg-gold text-black text-[9px] uppercase tracking-wider px-2 py-1 font-medium">
              {post.category}
            </span>
          )}
        </div>

        <div className="p-4 bg-white">
          {post.published_at && (
            <p className="label-micro mb-1.5 truncate">
              {formatBlogDate(post.published_at)}
            </p>
          )}
          <h3 className="text-sm font-playfair text-gray-900 group-hover:text-gold-dark transition-colors mb-2 line-clamp-2">
            {post.title}
          </h3>

          <div className="pt-2 border-t border-gray-100">
            <div className="flex items-baseline justify-between">
              {post.excerpt && (
                <p className="text-xs text-gray-500 line-clamp-2">{post.excerpt}</p>
              )}
              {post.read_time && (
                <span className="text-[9px] text-gray-400 uppercase whitespace-nowrap ml-2">
                  {post.read_time} min read
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
