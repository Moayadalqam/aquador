'use client';

import { useEffect, useState } from 'react';

interface Heart {
  id: number;
  left: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
  rotation: number;
  color: string;
}

const HEART_COLORS = [
  'rgba(220, 60, 60,',    // red
  'rgba(200, 40, 80,',    // deep rose
  'rgba(180, 50, 50,',    // crimson
];

export default function ValentineHearts() {
  const [hearts, setHearts] = useState<Heart[]>([]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    setHearts(
      Array.from({ length: 20 }, (_, i) => {
        const opacity = 0.3 + Math.random() * 0.35;
        const colorBase = HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)];
        return {
          id: i,
          left: Math.random() * 100,
          size: 14 + Math.random() * 18,
          delay: Math.random() * 14,
          duration: 10 + Math.random() * 12,
          opacity,
          rotation: -25 + Math.random() * 50,
          color: `${colorBase} ${opacity})`,
        };
      })
    );
  }, []);

  if (hearts.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        overflow: 'hidden',
      }}
    >
      {hearts.map((h) => (
        <svg
          key={h.id}
          className="valentine-heart"
          viewBox="0 0 24 24"
          fill={h.color}
          width={h.size}
          height={h.size}
          style={{
            position: 'absolute',
            left: `${h.left}%`,
            top: 0,
            ['--heart-duration' as string]: `${h.duration}s`,
            ['--heart-delay' as string]: `${h.delay}s`,
            ['--heart-rotation' as string]: `${h.rotation}deg`,
            ['--heart-opacity' as string]: h.opacity,
            filter: `drop-shadow(0 0 6px ${h.color})`,
          }}
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
      ))}
    </div>
  );
}
