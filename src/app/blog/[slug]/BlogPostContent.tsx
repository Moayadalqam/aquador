'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Clock, User } from 'lucide-react';
import type { BlogPost } from '@/lib/blog-types';
import { formatBlogDate } from '@/lib/blog-types';
import BlogContent from '@/components/blog/BlogContent';
import ShareButtons from '@/components/blog/ShareButtons';
import RelatedPosts from '@/components/blog/RelatedPosts';

interface BlogPostContentProps {
  post: BlogPost;
  relatedPosts: BlogPost[];
}

export default function BlogPostContent({ post, relatedPosts }: BlogPostContentProps) {
  const postUrl = typeof window !== 'undefined'
    ? window.location.href
    : `https://aquadorcy.com/blog/${post.slug}`;

  return (
    <div className="min-h-screen bg-gold-ambient">
      {/* Cover Image */}
      {post.cover_image && (
        <div className="relative w-full h-[50vh] md:h-[60vh]">
          <Image
            src={post.cover_image}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-black/20" />
        </div>
      )}

      {/* Content */}
      <div className="container-wide relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Breadcrumb */}
          <motion.nav
            className={`flex items-center gap-2 text-xs text-gray-500 ${
              post.cover_image ? '-mt-20 mb-8 relative z-10' : 'pt-32 mb-8'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Link href="/" className="hover:text-gold transition-colors">Home</Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-gold transition-colors">Blog</Link>
            <span>/</span>
            <span className="text-gray-400 truncate">{post.title}</span>
          </motion.nav>

          {/* Header */}
          <motion.header
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Category & Meta */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {post.category && (
                <span className="text-[10px] uppercase tracking-[0.2em] text-gold bg-gold/10 px-3 py-1">
                  {post.category}
                </span>
              )}
              {post.published_at && (
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Calendar className="w-3 h-3" />
                  {formatBlogDate(post.published_at)}
                </span>
              )}
              {post.read_time && (
                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {post.read_time} min read
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-playfair text-white mb-8 leading-tight">
              {post.title}
            </h1>

            {/* Author */}
            <div className="flex items-center justify-between flex-wrap gap-4 pb-8 border-b border-gold/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center overflow-hidden">
                  {post.author_avatar ? (
                    <Image
                      src={post.author_avatar}
                      alt={post.author_name}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  ) : (
                    <User className="w-4 h-4 text-gold" />
                  )}
                </div>
                <div>
                  <p className="text-sm text-white">{post.author_name}</p>
                  {post.author_role && (
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                      {post.author_role}
                    </p>
                  )}
                </div>
              </div>

              <ShareButtons url={postUrl} title={post.title} />
            </div>
          </motion.header>

          {/* Article Content */}
          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <BlogContent content={post.content} />
          </motion.article>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gold/10">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] uppercase tracking-[0.15em] text-gray-400 border border-gold/10 px-3 py-1.5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Back Link */}
          <div className="mt-12 mb-16">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-gold hover:text-gold-light transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Blog
            </Link>
          </div>
        </div>
      </div>

      {/* Related Posts */}
      <RelatedPosts posts={relatedPosts} />
    </div>
  );
}
