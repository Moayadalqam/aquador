'use client';

import { useState, useEffect } from 'react';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import {
  LoadingState,
  LoadingStage,
  getLoadingTransition,
  DEFAULT_PRODUCT_STAGES,
} from '@/lib/loading/states';
import { LoadingSpinner } from './LoadingSpinner';

export interface ProgressiveLoaderProps {
  stages?: LoadingStage[];
  currentState?: LoadingState;
  onComplete?: () => void;
  className?: string;
}

export function ProgressiveLoader({
  stages = DEFAULT_PRODUCT_STAGES,
  currentState,
  onComplete,
  className = '',
}: ProgressiveLoaderProps) {
  const [stageIndex, setStageIndex] = useState(0);
  const reducedMotion = useReducedMotion();
  const currentStage = stages[stageIndex];
  const isControlled = currentState !== undefined;

  useEffect(() => {
    if (isControlled) return;
    const nextStage = stages[stageIndex + 1];
    if (!nextStage) { onComplete?.(); return; }
    const timer = setTimeout(() => {
      setStageIndex((prev) => prev + 1);
    }, nextStage.delay - currentStage.delay);
    return () => clearTimeout(timer);
  }, [stageIndex, stages, currentStage, isControlled, onComplete]);

  const transition = currentStage && stages[stageIndex - 1]
    ? getLoadingTransition(stages[stageIndex - 1].state, currentStage.state)
    : { duration: 400, easing: 'cubic-bezier(0.25, 0.1, 0.25, 1)' };

  if (!currentStage) return null;

  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 p-8 ${className}`}
      style={{
        transition: reducedMotion
          ? 'none'
          : `opacity ${transition.duration}ms ${transition.easing}`,
      }}
    >
      {currentStage.icon === 'shimmer' && (
        <div
          className="w-16 h-16 rounded-full"
          style={{
            background: reducedMotion
              ? 'oklch(0.15 0.01 85)'
              : 'linear-gradient(90deg, oklch(0.15 0.01 85) 25%, oklch(0.15 0.01 85 / 0.95) 37.5%, oklch(0.78 0.11 85 / 0.08) 50%, oklch(0.15 0.01 85 / 0.95) 62.5%, oklch(0.15 0.01 85) 75%)',
            backgroundSize: reducedMotion ? '100% 100%' : '200% 100%',
            animation: reducedMotion ? 'none' : 'luxuryShimmer 2s ease-in-out infinite',
          }}
          aria-hidden="true"
        />
      )}
      {currentStage.icon === 'spinner' && (
        <LoadingSpinner size="lg" />
      )}
      <p className="text-sm text-neutral-400 animate-pulse">
        {currentStage.message}
      </p>
      <div className="flex gap-2">
        {stages.map((stage, idx) => (
          <div
            key={idx}
            className={`h-1 w-8 rounded-full transition-colors duration-300 ${
              idx <= stageIndex ? 'bg-gold-500' : 'bg-neutral-800'
            }`}
            aria-hidden="true"
          />
        ))}
      </div>
      <div className="sr-only" role="status" aria-live="polite">
        {currentStage.message}
      </div>
    </div>
  );
}
