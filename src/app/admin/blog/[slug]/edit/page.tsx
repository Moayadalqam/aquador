'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import BlogEditor from '@/components/admin/BlogEditor';
import type { BlogPost } from '@/lib/blog-types';

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/blog/${slug}`);
        if (!res.ok) throw new Error('Post not found');
        const data = await res.json();
        setPost(data as BlogPost);
      } catch {
        setError('Post not found');
      }
      setLoading(false);
    };

    fetchPost();
  }, [slug]);

  const handleSave = async (data: Record<string, unknown>) => {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch(`/api/blog/${slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to update post');
      }

      router.push('/admin/blog');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update post');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400">{error || 'Post not found'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">Edit Post</h1>
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      <BlogEditor post={post} onSave={handleSave} saving={saving} />
    </div>
  );
}
