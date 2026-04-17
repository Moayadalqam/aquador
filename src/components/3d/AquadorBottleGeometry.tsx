'use client';

import { RoundedBox, Text } from '@react-three/drei';
import type { ReactNode } from 'react';

interface AquadorBottleGeometryProps {
  /** Material element to apply to the body — e.g. gold metallic or clear glass */
  bodyMaterial: ReactNode;
  /** Whether to show the gold label band with "AQUAD'OR" text */
  showLabel?: boolean;
}

/**
 * Realistic Aquad'or luxury perfume bottle geometry.
 *
 * Structure (bottom to top):
 *   Base ring -> Rectangular body (RoundedBox) -> Label band ->
 *   Shoulder taper -> Neck -> Cap base ring -> Cap -> Cap top ring
 *
 * The body uses a flattened rectangular RoundedBox with chamfered corners,
 * matching the brand's characteristic squared silhouette.
 *
 * Accepts a `bodyMaterial` prop so the same geometry can render as
 * gold metallic (homepage) or clear glass (create-perfume builder).
 */
export function AquadorBottleGeometry({
  bodyMaterial,
  showLabel = true,
}: AquadorBottleGeometryProps) {
  return (
    <group>
      {/* ── Cap top gold ring ── */}
      <mesh position={[0, 1.78, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.04, 32]} />
        <meshStandardMaterial
          color="#FFD700"
          metalness={1}
          roughness={0.05}
        />
      </mesh>

      {/* ── Cap (black, slight taper) ── */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <cylinderGeometry args={[0.36, 0.4, 0.3, 32]} />
        <meshStandardMaterial
          color="#0a0a0a"
          metalness={0.9}
          roughness={0.2}
        />
      </mesh>

      {/* ── Cap base gold band ── */}
      <mesh position={[0, 1.44, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.05, 32]} />
        <meshStandardMaterial
          color="#B8860B"
          metalness={0.98}
          roughness={0.08}
        />
      </mesh>

      {/* ── Neck (tapered cylinder) ── */}
      <mesh position={[0, 1.25, 0]}>
        <cylinderGeometry args={[0.22, 0.3, 0.3, 24]} />
        <meshStandardMaterial
          color="#B8860B"
          metalness={0.98}
          roughness={0.08}
        />
      </mesh>

      {/* ── Shoulder (truncated cone) ── */}
      <mesh position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.35, 0.68, 0.25, 24]} />
        <meshStandardMaterial
          color="#B8860B"
          metalness={0.98}
          roughness={0.08}
        />
      </mesh>

      {/* ── Body (flattened rectangular with chamfered corners) ── */}
      <RoundedBox
        args={[1.2, 1.8, 0.5]}
        radius={0.12}
        smoothness={6}
        position={[0, -0.1, 0]}
        castShadow
        receiveShadow
      >
        {bodyMaterial}
      </RoundedBox>

      {/* ── Label band (front face) ── */}
      {showLabel && (
        <group position={[0, -0.1, 0]}>
          {/* Gold label backing */}
          <mesh position={[0, 0, 0.26]}>
            <boxGeometry args={[1.1, 0.35, 0.02]} />
            <meshStandardMaterial
              color="#D4AF37"
              metalness={0.9}
              roughness={0.12}
              emissive="#3a2a00"
              emissiveIntensity={0.2}
            />
          </mesh>
          {/* Brand text on label */}
          <Text
            position={[0, 0, 0.28]}
            fontSize={0.1}
            color="#1a1400"
            anchorX="center"
            anchorY="middle"
            letterSpacing={0.18}
          >
            {"AQUAD'OR"}
          </Text>
          {/* Gold label backing (rear face, for when bottle is rotated) */}
          <mesh position={[0, 0, -0.26]} rotation={[0, Math.PI, 0]}>
            <boxGeometry args={[1.1, 0.35, 0.02]} />
            <meshStandardMaterial
              color="#D4AF37"
              metalness={0.9}
              roughness={0.12}
              emissive="#3a2a00"
              emissiveIntensity={0.2}
            />
          </mesh>
        </group>
      )}

      {/* ── Base ring ── */}
      <mesh position={[0, -1.05, 0]}>
        <cylinderGeometry args={[0.55, 0.58, 0.05, 32]} />
        <meshStandardMaterial
          color="#B8860B"
          metalness={0.98}
          roughness={0.08}
        />
      </mesh>
    </group>
  );
}
