/**
 * Shared focus-ring class strings for consistent, visible focus indicators.
 * Use these across all interactive elements to ensure WCAG AA compliance.
 */

/** For inputs, selects, textareas on dark admin backgrounds */
export const focusRingInput =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-1 focus-visible:ring-offset-gray-900';

/** For links and buttons on dark backgrounds */
export const focusRingLink =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2';

/** For links and buttons on light (#FAFAF8) backgrounds */
export const focusRingLinkLight =
  'focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-[#FAFAF8]';
