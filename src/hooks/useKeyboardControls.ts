'use client';

import { useEffect, useCallback } from 'react';

/**
 * Options for the useKeyboardControls hook
 */
export interface KeyboardControlsOptions {
  /**
   * Whether keyboard controls are active
   * @default true
   */
  enabled?: boolean;

  /**
   * Rotation step in radians per keypress
   * @default 0.1
   */
  rotationStep?: number;

  /**
   * Zoom step per keypress (added to/subtracted from distance)
   * @default 0.5
   */
  zoomStep?: number;

  /**
   * Called with [deltaAzimuth, deltaPolar] when arrow keys are pressed
   * deltaAzimuth: horizontal rotation (ArrowLeft/ArrowRight)
   * deltaPolar: vertical rotation (ArrowUp/ArrowDown)
   */
  onRotate?: (deltaAzimuth: number, deltaPolar: number) => void;

  /**
   * Called with zoom delta (+1 for zoom in, -1 for zoom out) when +/- keys are pressed
   */
  onZoom?: (delta: number) => void;

  /**
   * Called when R key is pressed to reset the view
   */
  onReset?: () => void;
}

/**
 * useKeyboardControls — 3D scene keyboard navigation
 *
 * Provides full keyboard access to 3D scene controls as an alternative
 * to mouse drag and scroll. Follows WCAG 2.1 AA success criterion 2.1.1
 * (Keyboard: all functionality available via keyboard).
 *
 * Key bindings:
 * - ArrowLeft / ArrowRight: rotate horizontally (azimuth)
 * - ArrowUp / ArrowDown: rotate vertically (polar angle)
 * - + / = (unshifted plus) / NumpadAdd: zoom in
 * - - / NumpadSubtract: zoom out
 * - R / r: reset view to default position
 *
 * The hook fires callbacks rather than directly mutating refs so that
 * Scene.tsx can pass the deltas to OrbitControls via its API.
 *
 * @param options - Configuration and callback handlers
 *
 * @example
 * ```tsx
 * useKeyboardControls({
 *   onRotate: (dAz, dPolar) => { ... },
 *   onZoom: (delta) => { ... },
 *   onReset: () => { ... },
 * });
 * ```
 */
export function useKeyboardControls({
  enabled = true,
  rotationStep = 0.1,
  zoomStep = 0.5,
  onRotate,
  onZoom,
  onReset,
}: KeyboardControlsOptions = {}): void {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Ignore when focus is on an input / textarea / select
      const tag = (event.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          onRotate?.(-rotationStep, 0);
          break;

        case 'ArrowRight':
          event.preventDefault();
          onRotate?.(rotationStep, 0);
          break;

        case 'ArrowUp':
          event.preventDefault();
          onRotate?.(0, -rotationStep);
          break;

        case 'ArrowDown':
          event.preventDefault();
          onRotate?.(0, rotationStep);
          break;

        case '+':
        case '=':
        case 'Add':
          event.preventDefault();
          onZoom?.(zoomStep);
          break;

        case '-':
        case 'Subtract':
          event.preventDefault();
          onZoom?.(-zoomStep);
          break;

        case 'r':
        case 'R':
          event.preventDefault();
          onReset?.();
          break;

        default:
          break;
      }
    },
    [enabled, rotationStep, zoomStep, onRotate, onZoom, onReset]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);
}
