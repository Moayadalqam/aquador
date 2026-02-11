'use client';

import { useMemo } from 'react';
import DOMPurify from 'dompurify';

interface RichDescriptionProps {
  description: string;
}

export default function RichDescription({ description }: RichDescriptionProps) {
  const isHTML = /<[a-z][\s\S]*>/i.test(description);

  const sanitizedHTML = useMemo(() => {
    if (!isHTML) return '';
    return DOMPurify.sanitize(description);
  }, [description, isHTML]);

  if (isHTML) {
    return (
      <div
        className="product-description"
        dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
      />
    );
  }

  return (
    <div className="space-y-2">
      {description.split('\n').filter(Boolean).map((para, i) => (
        <p key={i} className="text-gray-300 leading-relaxed">
          {para}
        </p>
      ))}
    </div>
  );
}
