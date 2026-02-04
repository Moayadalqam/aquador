'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, AlertCircle, FileText, Eye, EyeOff, Star, Trash2, Pencil } from 'lucide-react';
import type { BlogPost } from '@/lib/blog-types';
import { formatBlogDate } from '@/lib/blog-types';

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/blog?limit=100&status=all');
      if (!res.ok) throw new Error('Failed to load posts');
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load posts');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleDelete = async (slug: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    setDeleting(slug);
    try {
      const res = await fetch(`/api/blog/${slug}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      await fetchPosts();
    } catch {
      setError('Failed to delete post');
    }
    setDeleting(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Blog Posts</h1>
          <p className="text-gray-400 mt-1">{posts.length} total posts</p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gold text-black font-medium rounded-lg hover:bg-amber-500 transition-colors"
        >
          <Plus className="h-5 w-5" />
          New Post
        </Link>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold mx-auto" />
          <p className="text-gray-400 mt-4">Loading posts...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-12 text-center">
          <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No posts yet</h3>
          <p className="text-gray-400 mb-6">Create your first blog post</p>
          <Link
            href="/admin/blog/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gold text-black font-medium rounded-lg hover:bg-amber-500 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Post
          </Link>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Title</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider hidden md:table-cell">Category</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider hidden sm:table-cell">Status</th>
                <th className="text-left px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider hidden lg:table-cell">Date</th>
                <th className="text-right px-6 py-4 text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {post.featured && <Star className="h-3.5 w-3.5 text-gold fill-gold flex-shrink-0" />}
                      <span className="text-white text-sm font-medium truncate max-w-[200px] lg:max-w-[300px]">
                        {post.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden md:table-cell">
                    <span className="text-gray-400 text-sm">{post.category || '—'}</span>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                      post.status === 'published'
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-yellow-500/10 text-yellow-400'
                    }`}>
                      {post.status === 'published' ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 hidden lg:table-cell">
                    <span className="text-gray-400 text-sm">
                      {post.published_at ? formatBlogDate(post.published_at) : formatBlogDate(post.created_at)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/blog/${post.slug}/edit`}
                        className="p-2 text-gray-400 hover:text-gold transition-colors rounded-lg hover:bg-gray-700"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(post.slug)}
                        disabled={deleting === post.slug}
                        className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-gray-700 disabled:opacity-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
