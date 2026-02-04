'use client';

import { useState, useEffect } from 'react';
import { generateSlug, estimateReadTime } from '@/lib/blog-types';
import type { BlogPost, BlogCategory } from '@/lib/blog-types';
import { Save, Eye, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface BlogEditorProps {
  post?: BlogPost;
  onSave: (data: Record<string, unknown>) => Promise<void>;
  saving: boolean;
}

export default function BlogEditor({ post, onSave, saving }: BlogEditorProps) {
  const [title, setTitle] = useState(post?.title || '');
  const [slug, setSlug] = useState(post?.slug || '');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [content, setContent] = useState(post?.content || '');
  const [coverImage, setCoverImage] = useState(post?.cover_image || '');
  const [category, setCategory] = useState(post?.category || '');
  const [tags, setTags] = useState(post?.tags?.join(', ') || '');
  const [authorName, setAuthorName] = useState(post?.author_name || "Aquad'or");
  const [authorRole, setAuthorRole] = useState(post?.author_role || 'Fragrance Expert');
  const [featured, setFeatured] = useState(post?.featured || false);
  const [status, setStatus] = useState(post?.status || 'draft');
  const [metaTitle, setMetaTitle] = useState(post?.meta_title || '');
  const [metaDescription, setMetaDescription] = useState(post?.meta_description || '');
  const [featuredProducts, setFeaturedProducts] = useState(post?.featured_products?.join(', ') || '');
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!post);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/blog/categories');
        if (res.ok) {
          const data = await res.json();
          setCategories(data as BlogCategory[]);
        }
      } catch {
        // Categories will remain empty
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!slugManuallyEdited && title) {
      setSlug(generateSlug(title));
    }
  }, [title, slugManuallyEdited]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const data: Record<string, unknown> = {
      title,
      slug,
      excerpt: excerpt || null,
      content,
      cover_image: coverImage || null,
      category: category || null,
      tags: tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      author_name: authorName,
      author_role: authorRole,
      featured,
      status,
      meta_title: metaTitle || null,
      meta_description: metaDescription || null,
      featured_products: featuredProducts
        ? featuredProducts.split(',').map((p) => p.trim()).filter(Boolean)
        : [],
      read_time: estimateReadTime(content),
    };

    if (status === 'published' && !post?.published_at) {
      data.published_at = new Date().toISOString();
    }

    await onSave(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors"
              placeholder="Post title"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setSlug(e.target.value);
                setSlugManuallyEdited(true);
              }}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors font-mono text-sm"
              placeholder="post-slug"
            />
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Excerpt</label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={2}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors resize-none"
              placeholder="Brief description for listings..."
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Content * (HTML)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={20}
              className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors resize-y font-mono text-sm"
              placeholder="<h2>Your heading</h2><p>Your content here...</p>"
            />
            <p className="text-xs text-gray-500 mt-1">
              Supports HTML: h2, h3, p, blockquote, img, ul, ol, a, strong, em
            </p>
          </div>

          {/* SEO */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-4">
            <h3 className="text-sm font-medium text-white">SEO</h3>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Meta Title</label>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors"
                placeholder="SEO title (defaults to post title)"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Meta Description</label>
              <textarea
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={2}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors resize-none"
                placeholder="SEO description (defaults to excerpt)"
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Actions */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-4">
            <h3 className="text-sm font-medium text-white">Publish</h3>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold transition-colors"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-gold focus:ring-gold"
              />
              <span className="text-sm text-gray-300">Featured post</span>
            </label>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gold text-black font-medium rounded-lg hover:bg-amber-500 transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {saving ? 'Saving...' : 'Save'}
              </button>
              {post && (
                <Link
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>

          {/* Cover Image */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-4">
            <h3 className="text-sm font-medium text-white">Cover Image</h3>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors text-sm"
              placeholder="https://..."
            />
            {coverImage && (
              <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          {/* Category */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-4">
            <h3 className="text-sm font-medium text-white">Category</h3>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-gold transition-colors"
            >
              <option value="">No category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-4">
            <h3 className="text-sm font-medium text-white">Tags</h3>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors text-sm"
              placeholder="tag1, tag2, tag3"
            />
            <p className="text-xs text-gray-500">Comma separated</p>
          </div>

          {/* Author */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-4">
            <h3 className="text-sm font-medium text-white">Author</h3>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Name</label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-gold transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Role</label>
              <input
                type="text"
                value={authorRole}
                onChange={(e) => setAuthorRole(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-gold transition-colors"
              />
            </div>
          </div>

          {/* Featured Products */}
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 space-y-4">
            <h3 className="text-sm font-medium text-white">Featured Products</h3>
            <input
              type="text"
              value={featuredProducts}
              onChange={(e) => setFeaturedProducts(e.target.value)}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold transition-colors text-sm"
              placeholder="product-id-1, product-id-2"
            />
            <p className="text-xs text-gray-500">Comma-separated product IDs</p>
          </div>
        </div>
      </div>
    </form>
  );
}
