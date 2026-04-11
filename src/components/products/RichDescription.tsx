'use client';

import { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';

interface RichDescriptionProps {
  description: string;
}

export default function RichDescription({ description }: RichDescriptionProps) {
  const isHTML = /<[a-z][\s\S]*>/i.test(description);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isHTML) {
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

  if (!isClient) {
    return (
      <div className="space-y-2">
        {description.replace(/<[^>]*>/g, '').split('\n').filter(Boolean).map((para, i) => (
          <p key={i} className="text-gray-300 leading-relaxed">
            {para}
          </p>
        ))}
      </div>
    );
  }

  const sanitizedHTML = DOMPurify.sanitize(description);

  return (
    <div
      className="product-description"
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
    />
  );
}
