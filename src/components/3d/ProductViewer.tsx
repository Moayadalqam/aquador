'use client';

import { Suspense, useState, useRef, useCallback } from 'react';
import { Scene } from './Scene';
import { Lighting } from './Lighting';
import { PerfumeBottle } from './PerfumeBottle';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities';
import { ANGLE_PRESETS, type AnglePresetId } from '@/lib/three/config';
import { track3DInteraction } from '@/lib/analytics/engagement-tracker';

type ProductViewerProps = {
  productName?: string;
  className?: string;
};

function ProductViewer3DContent({ productName }: { productName: string }) {
  const { isMobile } = useDeviceCapabilities();
  const [activeAngle, setActiveAngle] = useState<AnglePresetId | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);

  const handleControlsReady = useCallback((ctrl: unknown) => {
    controlsRef.current = ctrl;
  }, []);

  const handleAngleSelect = useCallback((preset: typeof ANGLE_PRESETS[number]) => {
    const ctrl = controlsRef.current;
    if (!ctrl) return;

    ctrl.setAzimuthalAngle(preset.azimuth);
    ctrl.setPolarAngle(preset.polar);
    ctrl.update();

    setActiveAngle(preset.id);
    track3DInteraction('angle_preset', { productName, angle: preset.id });
  }, [productName]);

  return (
    <div className="relative">
      <Scene productName={productName} onControlsReady={handleControlsReady}>
        <PerfumeBottle position={[0, 0, 0]} />
        <Lighting simplified={isMobile} />
      </Scene>

      {/* Angle preset buttons */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {ANGLE_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handleAngleSelect(preset)}
            className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors duration-200 ${
              activeAngle === preset.id
                ? 'bg-gold-500 text-dark-900 border-gold-500'
                : 'border-gold-500/50 text-gold-500/80 hover:bg-gold-500/20'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function ProductViewer({
  productName = 'Product',
  className
}: ProductViewerProps) {
  return (
    <div className={className}>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-full bg-dark-900/50 backdrop-blur-sm rounded-lg">
            <LoadingSpinner
              size="lg"
              text={`Loading 3D view of ${productName}...`}
            />
          </div>
        }
      >
        <ProductViewer3DContent productName={productName} />
      </Suspense>
    </div>
  );
}
