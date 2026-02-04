'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import BlogEditor from '@/components/admin/BlogEditor';

export default function NewBlogPostPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (data: Record<string, unknown>) => {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create post');
      }

      router.push('/admin/blog');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create post');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">New Blog Post</h1>
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}
      <BlogEditor onSave={handleSave} saving={saving} />
    </div>
  );
}
