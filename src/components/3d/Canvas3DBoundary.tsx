'use client';

import { Component, type ReactNode } from 'react';
import * as Sentry from '@sentry/nextjs';

interface Canvas3DBoundaryProps {
  children: ReactNode;
  /** UI to render if anything inside the Canvas throws. Typically a CSS/SVG fallback. */
  fallback: ReactNode;
  /** Optional tag for Sentry breadcrumbs — e.g. 'Hero3DScene' or 'PerfumeBottle3D'. */
  label?: string;
}

interface Canvas3DBoundaryState {
  hasError: boolean;
}

/**
 * Lightweight error boundary scoped to R3F `<Canvas>` subtrees.
 *
 * Why separate from the root `<ErrorBoundary>`:
 *   R3F runtime errors (shader failures, drei Suspense throws, missing assets)
 *   shouldn't take down the whole page. This boundary catches those and
 *   renders a CSS/SVG `fallback` in place of the broken 3D scene.
 *
 * Errors are captured to Sentry with the optional `label` for diagnosis.
 */
export class Canvas3DBoundary extends Component<Canvas3DBoundaryProps, Canvas3DBoundaryState> {
  state: Canvas3DBoundaryState = { hasError: false };

  static getDerivedStateFromError(): Canvas3DBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    Sentry.captureException(error, {
      tags: { boundary: 'canvas-3d', scene: this.props.label ?? 'unknown' },
      contexts: {
        react: { componentStack: errorInfo.componentStack },
      },
    });
  }

  render() {
    if (this.state.hasError) {
      return <>{this.props.fallback}</>;
    }
    return <>{this.props.children}</>;
  }
}
