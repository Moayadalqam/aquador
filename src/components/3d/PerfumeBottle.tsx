'use client';

import { useRef } from 'react';
import { Mesh } from 'three';

type PerfumeBottleProps = {
  position?: [number, number, number];
  scale?: number;
};

/**
 * Procedural perfume bottle geometry placeholder.
 * Uses cylinder geometry with glass-like PBR material.
 *
 * TODO: Replace with optimized GLB model from Sketchfab
 * Requirements: <5MB, <50K vertices, CC0/CC-BY license
 */
export function PerfumeBottle({
  position = [0, 0, 0],
  scale = 1
}: PerfumeBottleProps) {
  const meshRef = useRef<Mesh>(null);

  return (
    <group position={position} scale={scale}>
      {/* Main bottle body */}
      <mesh ref={meshRef} castShadow receiveShadow>
        <cylinderGeometry args={[0.5, 0.5, 2, 32]} />
        <meshPhysicalMaterial
          transmission={0.95}
          thickness={0.1}
          roughness={0.05}
          color="#ffffff"
          metalness={0.1}
          clearcoat={1}
          clearcoatRoughness={0.1}
        />
      </mesh>

      {/* Cap */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.3, 0.4, 32]} />
        <meshPhysicalMaterial
          color="#D4AF37"
          metalness={0.9}
          roughness={0.1}
        />
      </mesh>

      {/* Liquid inside */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[0.45, 0.45, 1.5, 32]} />
        <meshPhysicalMaterial
          color="#FFD700"
          transmission={0.8}
          thickness={0.5}
          roughness={0.2}
          metalness={0.3}
        />
      </mesh>
    </group>
  );
}
