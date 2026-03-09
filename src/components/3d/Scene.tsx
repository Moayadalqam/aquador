'use client';

import { Suspense, useState, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerformanceMonitor } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { CAMERA_CONFIG, ORBIT_CONFIG, KEYBOARD_CONFIG } from '@/lib/three/config';
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities';
import { useKeyboardControls } from '@/hooks/useKeyboardControls';
import { track3DInteraction } from '@/lib/analytics/engagement-tracker';
import { KeyboardHints } from '@/components/3d/KeyboardHints';
import {
  get3DSceneLabel,
  get3DStateAnnouncement,
  isHighContrastMode,
} from '@/lib/accessibility/aria-labels';

type SceneProps = {
  children: React.ReactNode;
  className?: string;
  /** Product name passed to analytics events */
  productName?: string;
};

export function Scene({
  children,
  className = 'w-full h-[600px]',
  productName,
}: SceneProps) {
  const capabilities = useDeviceCapabilities();
  const [dpr, setDpr] = useState(capabilities.recommendedDPR);
  const [announcement, setAnnouncement] = useState('');
  const rotateStartTimeRef = useRef<number | null>(null);
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const highContrast = isHighContrastMode();

  const handleRotateStart = useCallback(() => {
    rotateStartTimeRef.current = performance.now();
    track3DInteraction('rotate_start', { productName });
  }, [productName]);

  const handleRotateEnd = useCallback(() => {
    const durationMs =
      rotateStartTimeRef.current !== null
        ? performance.now() - rotateStartTimeRef.current
        : undefined;
    rotateStartTimeRef.current = null;
    track3DInteraction('rotate_end', { productName, durationMs });
  }, [productName]);

  // Keyboard rotation: adjust azimuth angle (spherical.theta) and polar angle (spherical.phi)
  const handleKeyRotate = useCallback((deltaAzimuth: number, deltaPolar: number) => {
    const controls = controlsRef.current;
    if (!controls) return;

    // Trigger a manual orbit delta by firing internal methods
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctrl = controls as any;
    if (typeof ctrl.getAzimuthalAngle === 'function') {
      const currentAzimuth = ctrl.getAzimuthalAngle();
      const currentPolar = ctrl.getPolarAngle();
      ctrl.setAzimuthalAngle(currentAzimuth + deltaAzimuth);
      ctrl.setPolarAngle(
        Math.max(ORBIT_CONFIG.minPolarAngle, Math.min(ORBIT_CONFIG.maxPolarAngle, currentPolar + deltaPolar))
      );
      ctrl.update();
      track3DInteraction('rotate_start', { productName });
      setAnnouncement(get3DStateAnnouncement('rotate', productName));
    }
  }, [productName]);

  // Keyboard zoom: step the camera distance
  const handleKeyZoom = useCallback((delta: number) => {
    const controls = controlsRef.current;
    if (!controls) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctrl = controls as any;
    // dollyIn / dollyOut are available on OrbitControls internals
    if (typeof ctrl.dollyIn === 'function' || typeof ctrl.dollyOut === 'function') {
      const scale = 1 + delta * 0.1; // 10% step per keypress
      if (delta > 0 && typeof ctrl.dollyIn === 'function') {
        ctrl.dollyIn(scale);
      } else if (delta < 0 && typeof ctrl.dollyOut === 'function') {
        ctrl.dollyOut(1 / scale);
      }
      ctrl.update();
    } else {
      // Fallback: move the camera position along Z
      const camera = ctrl.object;
      if (camera) {
        const newZ = Math.max(
          ORBIT_CONFIG.minDistance,
          Math.min(ORBIT_CONFIG.maxDistance, camera.position.z - delta * KEYBOARD_CONFIG.zoomStep)
        );
        camera.position.setZ(newZ);
        ctrl.update?.();
      }
    }
    const zoomAction = delta > 0 ? 'zoom_in' : 'zoom_out';
    track3DInteraction(zoomAction, { productName });
    setAnnouncement(get3DStateAnnouncement(zoomAction, productName));
  }, [productName]);

  // Keyboard reset: restore default camera position
  const handleKeyReset = useCallback(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ctrl = controls as any;
    ctrl.reset?.();
    track3DInteraction('reset', { productName });
    setAnnouncement(get3DStateAnnouncement('reset', productName));
  }, [productName]);

  // Register keyboard controls — arrow keys rotate, +/- zoom, R resets
  useKeyboardControls({
    rotationStep: KEYBOARD_CONFIG.rotationStep,
    zoomStep: KEYBOARD_CONFIG.zoomStep,
    onRotate: handleKeyRotate,
    onZoom: handleKeyZoom,
    onReset: handleKeyReset,
  });

  return (
    <div
      className={`${className} relative`}
      role="img"
      aria-label={get3DSceneLabel(productName)}
      style={highContrast ? { outline: '2px solid currentColor' } : undefined}
    >
      {/* Screen reader live region — announces keyboard interactions */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      >
        {announcement}
      </div>

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
            <OrbitControls
              ref={controlsRef}
              {...ORBIT_CONFIG}
              onStart={handleRotateStart}
              onEnd={handleRotateEnd}
            />
          </Suspense>
        </PerformanceMonitor>
      </Canvas>
      {/* DOM sibling — positioned absolutely over the Canvas */}
      <KeyboardHints />
    </div>
  );
}
