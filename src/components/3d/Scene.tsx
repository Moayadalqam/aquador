'use client';

import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerformanceMonitor } from '@react-three/drei';
import { CAMERA_CONFIG, ORBIT_CONFIG } from '@/lib/three/config';
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities';

type SceneProps = {
  children: React.ReactNode;
  className?: string;
};

export function Scene({ children, className = 'w-full h-[600px]' }: SceneProps) {
  const capabilities = useDeviceCapabilities();
  const [dpr, setDpr] = useState(capabilities.recommendedDPR);

  return (
    <div className={className}>
      <Canvas
        camera={CAMERA_CONFIG}
        gl={{ preserveDrawingBuffer: true }}
        dpr={dpr}
      >
        <PerformanceMonitor
          onIncline={() => setDpr(prev => Math.min(prev + 0.5, 2))}
          onDecline={() => setDpr(prev => Math.max(prev - 0.5, 1))}
        >
          <Suspense fallback={null}>
            {children}
            <OrbitControls {...ORBIT_CONFIG} />
          </Suspense>
        </PerformanceMonitor>
      </Canvas>
    </div>
  );
}
