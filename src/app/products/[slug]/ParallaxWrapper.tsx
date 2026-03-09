'use client';

import { ReactNode } from 'react';
import { ParallaxSection } from '@/components/ui/ParallaxSection';

interface ParallaxWrapperProps {
  children: ReactNode;
}

/**
 * Client wrapper for parallax effects on product page
 * Separated from server component to enable Framer Motion animations
 */
export default function ParallaxWrapper({ children }: ParallaxWrapperProps) {
  return (
    <ParallaxSection speed={0.2} disableOnMobile={true}>
      {children}
    </ParallaxSection>
  );
}
