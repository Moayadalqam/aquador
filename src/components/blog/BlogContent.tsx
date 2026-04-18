'use client';

import { useState, useEffect } from 'react';

interface BlogContentProps {
  content: string;
}

export default function BlogContent({ content }: BlogContentProps) {
  const [sanitizedHTML, setSanitizedHTML] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const DOMPurify = (await import('dompurify')).default;
      if (!cancelled) {
        setSanitizedHTML(DOMPurify.sanitize(content));
      }
    })();
    return () => { cancelled = true; };
  }, [content]);

  if (sanitizedHTML === null) {
    return (
      <div className="blog-content prose prose-invert prose-gold max-w-none animate-pulse">
        <div className="h-4 bg-gold/5 rounded w-full mb-3" />
        <div className="h-4 bg-gold/5 rounded w-3/4 mb-3" />
        <div className="h-4 bg-gold/5 rounded w-5/6" />
      </div>
    );
  }

  return (
    <div
      className="blog-content prose prose-invert prose-gold max-w-none"
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
    />
  );
}
