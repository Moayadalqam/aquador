/**
 * Engagement tracking utilities for Aquad'or analytics
 *
 * Centralized helpers for 3D interaction, scroll depth, and parallax
 * engagement tracking via Vercel Analytics. All calls are non-blocking
 * and fail silently when analytics is unavailable.
 *
 * Usage:
 * ```ts
 * import { track3DInteraction, trackScrollDepth, trackParallaxEngagement } from '@/lib/analytics/engagement-tracker';
 * ```
 */

import { track } from '@vercel/analytics';

// ─── Types ───────────────────────────────────────────────────────────────────

export type Interaction3DType =
  | 'rotate_start'
  | 'rotate_end'
  | 'zoom_in'
  | 'zoom_out'
  | 'reset';

export type ScrollDepthMilestone = 25 | 50 | 75 | 100;

export interface Track3DInteractionOptions {
  /** Product name for context (e.g. "Oud Royal") */
  productName?: string;
  /** Duration in milliseconds (for *_end events) */
  durationMs?: number;
}

// ─── Device Detection ─────────────────────────────────────────────────────────

/**
 * Returns the device type based on the current viewport width.
 *
 * @returns 'mobile' | 'tablet' | 'desktop'
 */
export function getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
  if (typeof window === 'undefined') return 'desktop';
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

// ─── 3D Interaction Tracking ─────────────────────────────────────────────────

/**
 * Track a 3D viewer interaction (rotate, zoom, reset).
 *
 * Non-blocking — never throws. Safe to call from Three.js event handlers.
 *
 * @param interactionType - Type of 3D interaction performed
 * @param options - Optional product name and duration for context
 *
 * @example
 * ```ts
 * track3DInteraction('rotate_end', { productName: 'Oud Royal', durationMs: 2340 });
 * ```
 */
export function track3DInteraction(
  interactionType: Interaction3DType,
  options: Track3DInteractionOptions = {}
): void {
  try {
    const { productName, durationMs } = options;
    track('3d_interaction', {
      interaction_type: interactionType,
      product_name: productName ?? 'unknown',
      device_type: getDeviceType(),
      ...(durationMs !== undefined && { duration_ms: Math.round(durationMs) }),
    });
  } catch {
    // Analytics must never break the 3D experience
  }
}

// ─── Scroll Depth Tracking ────────────────────────────────────────────────────

/**
 * Track a scroll depth milestone (25 / 50 / 75 / 100%).
 *
 * Non-blocking — never throws.
 *
 * @param milestone - Percentage milestone reached
 * @param pagePath - Current page path for context (defaults to window.location.pathname)
 *
 * @example
 * ```ts
 * trackScrollDepth(50, '/products/oud-royal');
 * ```
 */
export function trackScrollDepth(
  milestone: ScrollDepthMilestone,
  pagePath?: string
): void {
  try {
    track('scroll_depth', {
      milestone,
      page_path: pagePath ?? (typeof window !== 'undefined' ? window.location.pathname : 'unknown'),
      device_type: getDeviceType(),
    });
  } catch {
    // Analytics must never interrupt user experience
  }
}

// ─── Parallax Engagement Tracking ────────────────────────────────────────────

/**
 * Track parallax engagement when an element has been visible for >1 second.
 *
 * Non-blocking — never throws.
 *
 * @param elementId - Identifier for the parallax element (e.g. "hero-background")
 * @param durationMs - How long the element was visible in milliseconds
 *
 * @example
 * ```ts
 * trackParallaxEngagement('hero-background', 3200);
 * ```
 */
export function trackParallaxEngagement(
  elementId: string,
  durationMs: number
): void {
  try {
    if (durationMs < 1000) return; // Only track meaningful engagement (>1s)
    track('parallax_engagement', {
      element_id: elementId,
      duration_ms: Math.round(durationMs),
      device_type: getDeviceType(),
    });
  } catch {
    // Analytics must never interrupt user experience
  }
}
