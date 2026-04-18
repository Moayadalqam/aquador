'use client';

import { RoundedBox } from '@react-three/drei';
import { useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import { getAquadorLogoTexture } from './aquadorLogoTexture';

interface AquadorBottleGeometryProps {
  /** Material element to apply to the body — e.g. clear glass or gold metallic */
  bodyMaterial: ReactNode;
  /** Whether to show the AQUAD'OR logo on the label faces */
  showLabel?: boolean;
}

/**
 * Realistic Aquad'or luxury perfume bottle geometry.
 *
 * Structure (bottom to top):
 *   Base ring -> Rectangular body (RoundedBox) -> Logo labels ->
 *   Shoulder taper -> Neck -> Cap base ring -> Cap -> Cap top ring
 *
 * The body uses a flattened rectangular RoundedBox with chamfered corners,
 * matching the physical bottle's squared silhouette. The AQUAD'OR wordmark
 * with lotus icon and "Cyprus" is baked into a CanvasTexture and applied
 * as thin transparent decal planes on the front and back faces — visible
 * through the clear glass as gold text painted on the bottle.
 */
export function AquadorBottleGeometry({
  bodyMaterial,
  showLabel = true,
}: AquadorBottleGeometryProps) {
  // Logo texture is a singleton; safe to read per-render.
  const logoTexture = useMemo(() => (showLabel ? getAquadorLogoTexture() : null), [showLabel]);

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

      {/* ── AQUAD'OR logo decals (front + back of glass) ── */}
      {showLabel && logoTexture && (
        <group position={[0, -0.1, 0]}>
          {/* Front face — slightly in front of the glass surface */}
          <mesh position={[0, 0, 0.258]}>
            <planeGeometry args={[0.95, 0.95]} />
            <meshBasicMaterial
              map={logoTexture}
              transparent
              toneMapped={false}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
          {/* Back face — mirrored so it reads correctly from behind */}
          <mesh position={[0, 0, -0.258]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[0.95, 0.95]} />
            <meshBasicMaterial
              map={logoTexture}
              transparent
              toneMapped={false}
              side={THREE.DoubleSide}
              depthWrite={false}
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
