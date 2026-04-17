'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import {
  PerspectiveCamera,
  OrbitControls,
  ContactShadows,
  RoundedBox,
} from '@react-three/drei';
import { Suspense, useRef, useMemo, type ReactNode } from 'react';
import * as THREE from 'three';
import type { Group, Mesh } from 'three';
import type { PerfumeComposition, FragranceCategory } from '@/lib/perfume/types';
import { AquadorBottleGeometry } from '@/components/3d/AquadorBottleGeometry';
import { Canvas3DBoundary } from '@/components/3d/Canvas3DBoundary';
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type NoteLayer = 'top' | 'heart' | 'base';

interface PerfumeBottle3DProps {
  composition: PerfumeComposition;
  activeLayer: NoteLayer;
  className?: string;
  /**
   * Rendered when the device can't run the 3D scene (low-end, mobile, `prefers-reduced-motion`)
   * OR when the Canvas throws at runtime. Typically an SVG bottle.
   */
  fallback: ReactNode;
}

// Category-to-color mapping for orbiting note particles
const CATEGORY_COLORS: Record<FragranceCategory, string> = {
  floral: '#F8B8D4',
  fruity: '#F4A460',
  woody: '#8B4513',
  oriental: '#CD853F',
  gourmand: '#D2B48C',
};

// Layer-to-liquid-color mapping
const LAYER_COLORS: Record<NoteLayer, THREE.Color> = {
  top: new THREE.Color('#FFD700'),
  heart: new THREE.Color('#D4AF37'),
  base: new THREE.Color('#8B6914'),
};

// Collect all selected notes from composition
function getSelectedNotes(composition: PerfumeComposition) {
  const notes: Array<{ name: string; category: FragranceCategory; index: number }> = [];
  const layers: NoteLayer[] = ['base', 'heart', 'top'];
  layers.forEach((layer) => {
    const note = composition[layer];
    if (note) {
      notes.push({ name: note.name, category: note.category, index: notes.length });
    }
  });
  return notes;
}

/**
 * Orbiting particles that represent each selected note.
 * Distributed evenly around the bottle, color-coded by category.
 * These orbit in world space — OrbitControls moves the camera, not the scene.
 */
function NoteParticles({ composition }: { composition: PerfumeComposition }) {
  const groupRef = useRef<Group>(null);
  const notes = useMemo(() => getSelectedNotes(composition), [composition]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    groupRef.current.children.forEach((child, i) => {
      const note = notes[i];
      if (!note) return;
      const total = notes.length;
      const baseAngle = (note.index / Math.max(total, 1)) * Math.PI * 2;
      const speed = 0.35;
      const angle = baseAngle + t * speed;
      const orbitRadius = 1.3;
      const yBase = 0.6 - note.index * 0.5;
      child.position.x = Math.cos(angle) * orbitRadius;
      child.position.z = Math.sin(angle) * orbitRadius;
      child.position.y = yBase + Math.sin(t * 0.8 + note.index * 1.5) * 0.15;
    });
  });

  if (notes.length === 0) return null;

  return (
    <group ref={groupRef}>
      {notes.map((note) => {
        const color = CATEGORY_COLORS[note.category];
        return (
          <mesh key={note.name + note.index} scale={0.06}>
            <icosahedronGeometry args={[1, 1]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={0.8}
              metalness={0.3}
              roughness={0.4}
              toneMapped={false}
            />
          </mesh>
        );
      })}
    </group>
  );
}

/**
 * The liquid inside the glass bottle.
 * Reshaped to a flattened RoundedBox matching the rectangular body.
 * Color morphs based on activeLayer; height grows with total notes selected.
 *
 * Body inner dimensions: width ~1.1, depth ~0.42 (slightly inset from body).
 * Liquid fills from bottom of body (y ~ -1.0) up to y ~ 0.75 (max fill 90%).
 * Full body interior height is ~1.7 units.
 */
function Liquid({
  composition,
  activeLayer,
}: {
  composition: PerfumeComposition;
  activeLayer: NoteLayer;
}) {
  const meshRef = useRef<Mesh>(null);
  const currentColor = useRef(new THREE.Color(LAYER_COLORS[activeLayer]));
  const currentFill = useRef(0.15);

  // Body interior constants
  const bodyInnerHeight = 1.7;
  const bodyBottomY = -1.0; // bottom of the body interior

  useFrame((_state, delta) => {
    if (!meshRef.current) return;

    // Count total notes
    const count = [composition.top, composition.heart, composition.base].filter(Boolean).length;
    // Map 0 notes -> 10% fill, 3 notes -> 90%
    const targetFill = 0.10 + (count / 3) * 0.80;

    // Lerp fill toward target
    currentFill.current = THREE.MathUtils.lerp(
      currentFill.current,
      targetFill,
      1 - Math.pow(0.05, delta)
    );

    // Lerp color toward target
    const targetColor = LAYER_COLORS[activeLayer];
    currentColor.current.lerp(targetColor, 1 - Math.pow(0.04, delta));

    // Apply: scale the liquid height and position it at the bottom of the body
    const fillHeight = currentFill.current * bodyInnerHeight;
    meshRef.current.scale.y = currentFill.current;
    meshRef.current.position.y = bodyBottomY + fillHeight * 0.5;

    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.color.copy(currentColor.current);
    mat.emissive.copy(currentColor.current);
  });

  return (
    <RoundedBox
      ref={meshRef}
      args={[1.1, bodyInnerHeight, 0.42]}
      radius={0.08}
      smoothness={4}
    >
      <meshStandardMaterial
        color={LAYER_COLORS[activeLayer]}
        emissive={LAYER_COLORS[activeLayer]}
        emissiveIntensity={0.4}
        transparent
        opacity={0.85}
        roughness={0.15}
        metalness={0.1}
      />
    </RoundedBox>
  );
}

/**
 * Glass bottle body + liquid + note particles.
 * No auto-rotation via useFrame — OrbitControls handles camera orbiting.
 * Subtle breathing scale remains.
 */
function BottleScene({
  composition,
  activeLayer,
}: {
  composition: PerfumeComposition;
  activeLayer: NoteLayer;
}) {
  const groupRef = useRef<Group>(null);

  // Clear glass body material for the create-perfume builder
  const glassBodyMaterial = useMemo(
    () => (
      <meshPhysicalMaterial
        transmission={0.92}
        ior={1.5}
        roughness={0.05}
        thickness={0.4}
        clearcoat={1}
        clearcoatRoughness={0.1}
        metalness={0}
        color={new THREE.Color('#fef8e0')}
      />
    ),
    []
  );

  // Subtle breathing scale only (no Y rotation — OrbitControls handles it)
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    const breathe = 1.0 + Math.sin(t * Math.PI) * 0.02;
    groupRef.current.scale.set(breathe, breathe, breathe);
  });

  return (
    <group ref={groupRef}>
      {/* Realistic bottle geometry with clear glass body */}
      <AquadorBottleGeometry bodyMaterial={glassBodyMaterial} showLabel />

      {/* Liquid inside the glass body */}
      <Liquid composition={composition} activeLayer={activeLayer} />

      {/* Orbiting note particles — orbit in world space around stationary bottle */}
      <NoteParticles composition={composition} />
    </group>
  );
}

export default function PerfumeBottle3D({
  composition,
  activeLayer,
  className = '',
  fallback,
}: PerfumeBottle3DProps) {
  const { supports3D } = useDeviceCapabilities();
  const reducedMotion = useReducedMotion();

  // Device/motion gate — low-end devices, mobile, or reduced-motion users get the SVG fallback
  if (!supports3D || reducedMotion) {
    return <>{fallback}</>;
  }

  return (
    <Canvas3DBoundary label="PerfumeBottle3D" fallback={fallback}>
      <div className={`relative min-h-[320px] ${className}`}>
        <Canvas
        shadows
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 1.75]}
        style={{ width: '100%', height: '100%' }}
      >
        <PerspectiveCamera makeDefault position={[0, 0.3, 4.5]} fov={35} />

        {/* Interactive drag rotation — zoom and pan disabled */}
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableDamping
          dampingFactor={0.1}
          rotateSpeed={0.6}
          autoRotate
          autoRotateSpeed={0.4}
          minPolarAngle={Math.PI * 0.2}
          maxPolarAngle={Math.PI * 0.8}
        />

        {/* Lighting rig — self-contained, no external HDRI */}
        <ambientLight intensity={0.55} color="#FFF0D0" />
        <directionalLight
          position={[5, 5, 5]}
          intensity={2.0}
          color="#FFE1A8"
          castShadow
        />
        <directionalLight
          position={[-4, -2, 3]}
          intensity={0.9}
          color="#FFB347"
        />
        <directionalLight
          position={[0, -4, 2]}
          intensity={0.4}
          color="#FFD700"
        />
        <pointLight position={[0, 2, 3]} intensity={1.2} color="#D4AF37" />
        <pointLight position={[-2, -1, 2]} intensity={0.6} color="#FFD700" />
        <pointLight position={[3, 0, -2]} intensity={0.5} color="#FFF8DC" />

        <Suspense fallback={null}>
          <BottleScene composition={composition} activeLayer={activeLayer} />
          {/* Contact shadow beneath the bottle for grounding */}
          <ContactShadows
            position={[0, -1.5, 0]}
            opacity={0.5}
            scale={6}
            blur={2}
            far={2}
          />
        </Suspense>
      </Canvas>
      </div>
    </Canvas3DBoundary>
  );
}
