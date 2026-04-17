'use client';

import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import dynamic from 'next/dynamic';
import type { PerfumeComposition } from '@/lib/perfume/types';
import type { ReactNode } from 'react';

type NoteLayer = 'top' | 'heart' | 'base';

interface CreatePerfumeBottleWrapperProps {
  composition: PerfumeComposition;
  activeLayer: NoteLayer;
  className?: string;
  fallback: ReactNode;
}

const PerfumeBottle3D = dynamic(
  () => import('@/components/create-perfume/PerfumeBottle3D'),
  { ssr: false }
);

export default function CreatePerfumeBottleWrapper({
  composition,
  activeLayer,
  className,
  fallback,
}: CreatePerfumeBottleWrapperProps) {
  const { supports3D } = useDeviceCapabilities();
  const reducedMotion = useReducedMotion();

  if (!supports3D || reducedMotion) {
    return <>{fallback}</>;
  }

  return (
    <PerfumeBottle3D
      composition={composition}
      activeLayer={activeLayer}
      className={className}
    />
  );
}
