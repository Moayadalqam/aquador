'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type CustomPerfumeBottleProps = {
  topNoteColor?: string;
  heartNoteColor?: string;
  baseNoteColor?: string;
  autoRotate?: boolean;
};

/**
 * Procedural 3D perfume bottle with colored liquid based on fragrance note selection.
 *
 * Features:
 * - Glass bottle with transmission for realistic transparency
 * - Liquid color driven by heartNoteColor prop (primary visual element)
 * - Gold cap matching Phase 10 brand palette (#D4AF37)
 * - Auto-rotation for showcase effect
 * - Procedural geometry (no external GLB required)
 *
 * Integration: Used in /create-perfume page to visualize custom perfume composition in real-time.
 *
 * @param topNoteColor - Hex color from selected top note (reserved for future multi-layer liquid)
 * @param heartNoteColor - Hex color from selected heart note (primary liquid color)
 * @param baseNoteColor - Hex color from selected base note (reserved for future multi-layer liquid)
 * @param autoRotate - Enable continuous Y-axis rotation (default: true)
 */
export function CustomPerfumeBottle({
  topNoteColor = '#D4AF37',
  heartNoteColor = '#D4AF37',
  baseNoteColor = '#D4AF37',
  autoRotate = true
}: CustomPerfumeBottleProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Auto-rotation animation (0.3 rad/s for smooth showcase effect)
  useFrame((state, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.3;
    }
  });

  // Convert heart note color to Three.js Color object
  const liquidColor = new THREE.Color(heartNoteColor);

  return (
    <group ref={groupRef}>
      {/* Glass bottle with realistic transmission */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.5, 2, 32]} />
        <meshPhysicalMaterial
          transmission={0.95}
          thickness={0.1}
          roughness={0.05}
          envMapIntensity={1}
          color="#ffffff"
        />
      </mesh>

      {/* Colored liquid inside bottle (heart note color) */}
      <mesh position={[0, -0.3, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 1.4, 32]} />
        <meshStandardMaterial
          color={liquidColor}
          transparent
          opacity={0.8}
          metalness={0.1}
          roughness={0.2}
        />
      </mesh>

      {/* Gold cap (Phase 10 gold-500 #D4AF37) */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.35, 0.4, 32]} />
        <meshStandardMaterial
          color="#D4AF37"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Dark base/stand */}
      <mesh position={[0, -1.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.55, 0.6, 0.2, 32]} />
        <meshStandardMaterial
          color="#1a1a1a"
          metalness={0.3}
          roughness={0.7}
        />
      </mesh>
    </group>
  );
}
