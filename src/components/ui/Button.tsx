'use client';

import { motion, HTMLMotionProps } from 'motion/react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { hoverVariants, tapVariants } from '@/lib/animations/micro-interactions';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'ref'> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading, children, disabled, ...props }, ref) => {
    const reducedMotion = useReducedMotion();
    const baseStyles = cn(
      'relative inline-flex items-center justify-center',
      'font-medium tracking-wide uppercase',
      'transition-all duration-300',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-white'
    );

    const styleVariants = {
      primary: cn(
        'bg-gold text-black',
        'hover:bg-gold-light',
        'shadow-[0_4px_24px_rgba(212,175,55,0.25)]',
        'hover:shadow-[0_8px_40px_rgba(212,175,55,0.45)]'
      ),
      secondary: cn(
        'bg-white text-black',
        'border border-gold/20',
        'hover:border-gold/40 hover:bg-gray-50'
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
      sm: 'px-5 py-2.5 text-xs min-h-[40px]',
      md: 'px-7 py-3 text-sm min-h-[44px]',
      lg: 'px-10 py-4 text-sm min-h-[56px]',
      icon: 'p-2 min-h-[44px] min-w-[44px]',
    };

    // Determine hover animation based on variant
    const getHoverVariant = () => {
      if (disabled || isLoading || reducedMotion) return undefined;

      switch (variant) {
        case 'primary':
          return hoverVariants.glow;
        case 'secondary':
        case 'outline':
          return hoverVariants.scale;
        case 'ghost':
          return { backgroundColor: 'rgba(212, 175, 55, 0.15)' };
        default:
          return hoverVariants.scale;
      }
    };

    const getTapVariant = () => {
      if (disabled || isLoading || reducedMotion) return undefined;
      return tapVariants.shrink;
    };

    return (
      <motion.button
        ref={ref}
        className={cn(
          baseStyles,
          styleVariants[variant],
          sizes[size],
          (disabled || isLoading) && 'opacity-50 cursor-not-allowed pointer-events-none',
          className
        )}
        disabled={disabled || isLoading}
        whileHover={getHoverVariant()}
        whileTap={getTapVariant()}
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
