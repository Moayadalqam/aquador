'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = cn(
      'relative inline-flex items-center justify-center',
      'font-medium tracking-wide uppercase',
      'transition-all duration-300',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-dark'
    );

    const variants = {
      primary: cn(
        'bg-gold text-black',
        'hover:bg-gold-light',
        'shadow-[0_4px_20px_rgba(212,175,55,0.2)]',
        'hover:shadow-[0_4px_30px_rgba(212,175,55,0.3)]'
      ),
      secondary: cn(
        'bg-dark-light text-white',
        'border border-gold/20',
        'hover:border-gold/40 hover:bg-dark-lighter'
      ),
      outline: cn(
        'bg-transparent text-gold',
        'border border-gold/50',
        'hover:bg-gold hover:text-black hover:border-gold'
      ),
      ghost: cn(
        'bg-transparent text-gold',
        'hover:bg-gold/10'
      ),
    };

    const sizes = {
      sm: 'px-5 py-2.5 text-xs',
      md: 'px-7 py-3 text-sm',
      lg: 'px-9 py-4 text-sm',
    };

    return (
      <motion.button
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          (disabled || isLoading) && 'opacity-50 cursor-not-allowed pointer-events-none',
          className
        )}
        disabled={disabled || isLoading}
        whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        transition={{ duration: 0.15 }}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading</span>
          </span>
        ) : (
          children
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
