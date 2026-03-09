import { useState, useEffect } from 'react';

type DeviceCapabilities = {
  isMobile: boolean;
  isLowEnd: boolean;
  canHandle3D: boolean;
  recommendedDPR: number;
  memoryGB: number | null;
};

export function useDeviceCapabilities(): DeviceCapabilities {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    isMobile: false,
    isLowEnd: false,
    canHandle3D: true,
    recommendedDPR: 1.5,
    memoryGB: null,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
                    window.matchMedia('(max-width: 768px)').matches;

    // @ts-ignore - deviceMemory not in TypeScript DOM lib
    const memoryGB = (navigator.deviceMemory as number | undefined) || null;

    const isLowEnd = memoryGB !== null && memoryGB < 4;

    const recommendedDPR = isMobile
      ? (isLowEnd ? 1 : 1.5)
      : window.devicePixelRatio > 2 ? 2 : 1.5;

    const canHandle3D = !isLowEnd || memoryGB === null;

    setCapabilities({
      isMobile,
      isLowEnd,
      canHandle3D,
      recommendedDPR,
      memoryGB,
    });
  }, []);

  return capabilities;
}
