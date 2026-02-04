'use client';

interface BlogContentProps {
  content: string;
}

export default function BlogContent({ content }: BlogContentProps) {
  return (
    <div
      className="blog-content prose prose-invert prose-gold max-w-none"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
