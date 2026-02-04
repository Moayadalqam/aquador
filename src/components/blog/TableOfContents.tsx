'use client';

import { useEffect, useState, useMemo } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>('');

  const headings = useMemo(() => {
    const items: TocItem[] = [];
    const regex = /<h([23])\s+id="([^"]+)"[^>]*>(.*?)<\/h[23]>/gi;
    let match;
    while ((match = regex.exec(content)) !== null) {
      items.push({
        level: parseInt(match[1]),
        id: match[2],
        text: match[3].replace(/<[^>]*>/g, ''),
      });
    }
    return items;
  }, [content]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    );

    headings.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="blog-toc" aria-label="Table of contents">
      <p className="text-[10px] uppercase tracking-[0.2em] text-gold mb-4">
        Contents
      </p>
      <ul className="space-y-1">
        {headings.map(({ id, text, level }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`block text-xs leading-relaxed py-1 transition-colors duration-200 ${
                level === 3 ? 'pl-3' : ''
              } ${
                activeId === id
                  ? 'text-gold'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
