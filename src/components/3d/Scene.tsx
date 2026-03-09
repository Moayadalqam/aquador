'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { CAMERA_CONFIG, ORBIT_CONFIG } from '@/lib/three/config';

type SceneProps = {
  children: React.ReactNode;
  className?: string;
};

/**
 * SSR-safe 3D scene wrapper with Canvas and OrbitControls.
 *
 * Features:
 * - Client-side only rendering (Next.js App Router compatible)
 * - Suspense for async GLTF loading
 * - OrbitControls with damping and polar angle limits
 * - Phase 10 design system integration (gold loading spinner)
 *
 * @param children - 3D objects and lights to render
 * @param className - Tailwind classes for container sizing
 */
export function Scene({ children, className = 'w-full h-[600px]' }: SceneProps) {
  return (
    <div className={className}>
      <Canvas
        camera={CAMERA_CONFIG}
        gl={{ preserveDrawingBuffer: true }}
      >
        <Suspense fallback={null}>
          {children}
          <OrbitControls {...ORBIT_CONFIG} />
        </Suspense>
      </Canvas>
    </div>
  );
}
