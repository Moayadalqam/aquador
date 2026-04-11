'use client';

import { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';

interface BlogContentProps {
  content: string;
}

export default function BlogContent({ content }: BlogContentProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="blog-content prose prose-invert prose-gold max-w-none animate-pulse">
        <div className="h-4 bg-gold/5 rounded w-full mb-3" />
        <div className="h-4 bg-gold/5 rounded w-3/4 mb-3" />
        <div className="h-4 bg-gold/5 rounded w-5/6" />
      </div>
    );
  }

  const sanitizedHTML = DOMPurify.sanitize(content);

  return (
    <div
      className="blog-content prose prose-invert prose-gold max-w-none"
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
    />
  );
}
