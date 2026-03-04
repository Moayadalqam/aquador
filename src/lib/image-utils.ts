/**
 * Image optimization utilities for Aquador
 * Provides blur placeholders, responsive sizing, and image URL normalization
 */

/**
 * Standard image dimensions for consistent aspect ratios across the site
 */
export const IMAGE_DIMENSIONS = {
  productCard: { width: 400, height: 500 }, // 4:5 aspect ratio
  productDetail: { width: 600, height: 750 }, // 4:5 aspect ratio
  hero: { width: 1920, height: 800 }, // Wide banner
  thumbnail: { width: 120, height: 120 }, // Square
  blogFeatured: { width: 1200, height: 630 }, // Open Graph standard
} as const;

/**
 * Zoom configuration for ProductGallery image zoom functionality
 */
export const ZOOM_CONFIG = {
  maxZoom: 3,
  minZoom: 1,
  defaultZoom: 2,     // Default zoom level on click
  pinchThreshold: 20, // Minimum pixel distance change to trigger zoom
} as const;

/**
 * Generates a minimal SVG gradient as a blur placeholder
 * Creates a base64-encoded data URL for use with Next.js Image placeholder="blur"
 */
export function getBlurDataURL(width: number, height: number): string {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#1a1a1a;stop-opacity:1" />
          <stop offset="50%" style="stop-color:#2a2a2a;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#1a1a1a;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="${width}" height="${height}" fill="url(#g)" />
    </svg>
  `.trim();

  // Convert to base64 for data URL
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

/**
 * Generates responsive sizes attribute for Next.js Image component
 * Optimizes image loading based on viewport width and usage context
 */
export function generateImageSizes(
  type: 'product' | 'hero' | 'thumbnail' | 'full'
): string {
  switch (type) {
    case 'product':
      // Product cards: 100% on mobile, 50% on tablet, 33% on desktop, 25% on wide screens
      return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1536px) 33vw, 25vw';
    case 'hero':
      // Hero images: always full width
      return '100vw';
    case 'thumbnail':
      // Thumbnails: fixed small size
      return '120px';
    case 'full':
      // Detail pages: 100% on mobile, 60% on tablet, 50% on desktop
      return '(max-width: 768px) 100vw, (max-width: 1024px) 60vw, 50vw';
    default:
      return '100vw';
  }
}

/**
 * Normalizes image URLs from various sources
 * Handles Supabase storage URLs, external CDNs, and provides fallback
 */
export function getImageUrl(url: string | null | undefined, fallback?: string): string {
  if (!url) {
    return fallback || '/images/placeholder.jpg';
  }

  // Already a full URL
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // Supabase storage path - construct full URL
  if (url.startsWith('storage/')) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (supabaseUrl) {
      return `${supabaseUrl}/${url}`;
    }
  }

  // Relative path - use as-is
  if (url.startsWith('/')) {
    return url;
  }

  // Default: prepend /images/
  return `/images/${url}`;
}

/**
 * Generates srcset attribute for manual responsive image handling
 * Creates multiple image URLs with width descriptors for browser selection
 */
export function generateSrcSet(
  baseUrl: string,
  widths: number[] = [320, 640, 768, 1024, 1280, 1536, 1920]
): string {
  return widths
    .map((width) => {
      // For Next.js Image API format: /_next/image?url={url}&w={width}&q={quality}
      const encodedUrl = encodeURIComponent(baseUrl);
      return `/_next/image?url=${encodedUrl}&w=${width}&q=90 ${width}w`;
    })
    .join(', ');
}
