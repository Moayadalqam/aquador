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
  variant: number;
}

export default function ValentineHearts() {
  const [hearts, setHearts] = useState<Heart[]>([]);

  useEffect(() => {
    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const generated: Heart[] = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 10 + Math.random() * 14,
      delay: Math.random() * 12,
      duration: 8 + Math.random() * 10,
      opacity: 0.08 + Math.random() * 0.15,
      rotation: -30 + Math.random() * 60,
      variant: Math.floor(Math.random() * 3),
    }));
    setHearts(generated);
  }, []);

  if (hearts.length === 0) return null;

  const colors = [
    'rgba(212, 175, 55, VAR)',      // gold
    'rgba(200, 130, 130, VAR)',     // muted rose
    'rgba(180, 140, 100, VAR)',     // warm bronze
  ];

  return (
    <div
      className="valentine-hearts"
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 50,
        overflow: 'hidden',
      }}
    >
      {hearts.map((heart) => {
        const color = colors[heart.variant].replace('VAR', String(heart.opacity));
        return (
          <div
            key={heart.id}
            className="valentine-heart"
            style={{
              position: 'absolute',
              left: `${heart.left}%`,
              top: '-5%',
              width: `${heart.size}px`,
              height: `${heart.size}px`,
              animationDelay: `${heart.delay}s`,
              animationDuration: `${heart.duration}s`,
              ['--heart-rotation' as string]: `${heart.rotation}deg`,
              ['--heart-color' as string]: color,
            }}
          >
            <svg
              viewBox="0 0 24 24"
              fill={color}
              width={heart.size}
              height={heart.size}
              style={{ filter: `drop-shadow(0 0 ${heart.size / 3}px ${color})` }}
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </div>
        );
      })}
    </div>
  );
}
