/**
 * Loading state machine for progressive content disclosure
 *
 * Stages:
 * 1. Initial: Show shimmer indicator (0-300ms)
 * 2. Fetching: Data loading indicator (300ms-1s)
 * 3. Rendering: Content rendering (1s-2s)
 * 4. Interactive: Fully loaded and interactive (2s+)
 */

export type LoadingState = 'initial' | 'fetching' | 'rendering' | 'interactive';

export interface LoadingTransition {
  from: LoadingState;
  to: LoadingState;
  duration: number; // milliseconds
  easing: string;
}

export function getLoadingTransition(
  from: LoadingState,
  to: LoadingState
): LoadingTransition {
  const easing = 'cubic-bezier(0.25, 0.1, 0.25, 1)';
  const durations: Record<string, number> = {
    'initial-fetching': 300,
    'fetching-rendering': 400,
    'rendering-interactive': 500,
    'initial-interactive': 600,
  };
  const key = `${from}-${to}`;
  const duration = durations[key] || 400;
  return { from, to, duration, easing };
}

export interface LoadingStage {
  state: LoadingState;
  message: string;
  icon?: 'spinner' | 'shimmer' | 'none';
  delay: number;
}

export const DEFAULT_3D_STAGES: LoadingStage[] = [
  { state: 'initial',     message: 'Preparing 3D viewer...', icon: 'shimmer',  delay: 0    },
  { state: 'fetching',    message: 'Loading model...',       icon: 'spinner',  delay: 300  },
  { state: 'rendering',   message: 'Rendering scene...',     icon: 'spinner',  delay: 1000 },
  { state: 'interactive', message: 'Ready',                  icon: 'none',     delay: 2000 },
];

export const DEFAULT_PRODUCT_STAGES: LoadingStage[] = [
  { state: 'initial',     message: 'Loading product...',    icon: 'shimmer', delay: 0   },
  { state: 'fetching',    message: 'Fetching details...',   icon: 'spinner', delay: 200 },
  { state: 'interactive', message: 'Ready',                 icon: 'none',    delay: 800 },
];
