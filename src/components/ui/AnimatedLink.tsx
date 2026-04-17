'use client';

import Link, { type LinkProps } from 'next/link';
import { forwardRef, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AnimatedLinkProps extends LinkProps {
  children: ReactNode;
  className?: string;
  underlineColor?: 'gold' | 'white' | 'current';
}

export const AnimatedLink = forwardRef<HTMLAnchorElement, AnimatedLinkProps>(
  ({ children, className, underlineColor = 'gold', ...linkProps }, ref) => {
    const colorClass = {
      gold: 'bg-gold',
      white: 'bg-white',
      current: 'bg-current',
    }[underlineColor];

    return (
      <Link
        ref={ref}
        {...linkProps}
        className={cn(
          'group relative inline-flex items-center transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2',
          className
        )}
      >
        <span className="relative">
          {children}
          <span
            className={cn(
              'absolute -bottom-0.5 left-0 right-0 h-px origin-left',
              'scale-x-0 group-hover:scale-x-100 group-focus-visible:scale-x-100',
              'transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]',
              colorClass
            )}
            aria-hidden="true"
          />
        </span>
      </Link>
    );
  }
);

AnimatedLink.displayName = 'AnimatedLink';
