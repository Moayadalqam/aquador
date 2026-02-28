'use client';

import { useMemo } from 'react';
import DOMPurify from 'dompurify';

interface BlogContentProps {
  content: string;
}

export default function BlogContent({ content }: BlogContentProps) {
  const sanitizedHTML = useMemo(() => DOMPurify.sanitize(content), [content]);

  return (
    <div
      className="blog-content prose prose-invert prose-gold max-w-none"
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
    />
  );
}
