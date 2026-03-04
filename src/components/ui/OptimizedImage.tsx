/**
 * OptimizedImage component
 * Wraps Next.js Image with blur placeholders, responsive sizing, and URL normalization
 */

import Image from 'next/image';
import { cn } from '@/lib/utils';
import { getBlurDataURL, getImageUrl, generateImageSizes } from '@/lib/image-utils';

export interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  sizes?: string;
  sizeType?: 'product' | 'hero' | 'thumbnail' | 'full';
  priority?: boolean;
  className?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  aspectRatio?: string; // e.g., "4/5" or "16/9" - only used with fill
  quality?: number;
}

/**
 * Optimized image component with automatic blur placeholders and responsive sizing
 *
 * Usage:
 * - Fixed size: <OptimizedImage src="..." alt="..." width={400} height={500} />
 * - Fill mode: <OptimizedImage src="..." alt="..." fill aspectRatio="4/5" />
 * - With preset size type: <OptimizedImage src="..." alt="..." fill sizeType="product" />
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  sizes,
  sizeType,
  priority = false,
  className,
  objectFit = 'cover',
  aspectRatio,
  quality = 90,
}: OptimizedImageProps) {
  // Normalize the image URL
  const normalizedSrc = getImageUrl(src);

  // Generate blur placeholder if we have dimensions
  const blurDataURL = width && height ? getBlurDataURL(width, height) : undefined;

  // Determine sizes attribute
  const responsiveSizes = sizes || (sizeType ? generateImageSizes(sizeType) : undefined);

  // Build image props
  const imageProps = {
    src: normalizedSrc,
    alt,
    quality,
    priority,
    placeholder: blurDataURL ? ('blur' as const) : undefined,
    blurDataURL,
    className: cn(className),
    style: {
      objectFit,
    },
  };

  // Fill mode - wrap in a container with aspect ratio
  if (fill) {
    return (
      <div
        className="relative w-full h-full"
        style={aspectRatio ? { aspectRatio } : undefined}
      >
        <Image
          {...imageProps}
          fill
          sizes={responsiveSizes || '100vw'}
        />
      </div>
    );
  }

  // Fixed mode - requires width and height
  if (!width || !height) {
    console.warn('OptimizedImage: width and height are required when fill is false');
    return null;
  }

  return (
    <Image
      {...imageProps}
      width={width}
      height={height}
      sizes={responsiveSizes}
    />
  );
}
