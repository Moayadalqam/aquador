'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { Suspense, useRef, useMemo } from 'react';
import * as THREE from 'three';
import type { Group, Mesh } from 'three';
import type { PerfumeComposition, FragranceCategory } from '@/lib/perfume/types';

type NoteLayer = 'top' | 'heart' | 'base';

interface PerfumeBottle3DProps {
  composition: PerfumeComposition;
  activeLayer: NoteLayer;
  className?: string;
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
      const yBase = 0.6 - note.index * 0.5; // vertical spread
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
 * The liquid inside the bottle.
 * Color morphs based on activeLayer; height grows with total notes selected.
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
  const currentScale = useRef(0.15);

  useFrame((_state, delta) => {
    if (!meshRef.current) return;

    // Count total notes
    const count = [composition.top, composition.heart, composition.base].filter(Boolean).length;
    // Map 0 notes -> 10% fill, 3 notes -> 90%
    const targetFill = 0.10 + (count / 3) * 0.80;

    // Lerp scale toward target
    currentScale.current = THREE.MathUtils.lerp(
      currentScale.current,
      targetFill,
      1 - Math.pow(0.05, delta)
    );

    // Lerp color toward target
    const targetColor = LAYER_COLORS[activeLayer];
    currentColor.current.lerp(targetColor, 1 - Math.pow(0.04, delta));

    // Apply: liquid cylinder is scaled on Y. Position it so it sits at the bottom of the bottle.
    const fillHeight = currentScale.current * 1.8; // max cylinder height ~1.8
    meshRef.current.scale.y = currentScale.current;
    meshRef.current.position.y = -0.9 + fillHeight * 0.5;

    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    mat.color.copy(currentColor.current);
    mat.emissive.copy(currentColor.current);
  });

  return (
    <mesh ref={meshRef}>
      <cylinderGeometry args={[0.42, 0.42, 1.8, 24]} />
      <meshStandardMaterial
        color={LAYER_COLORS[activeLayer]}
        emissive={LAYER_COLORS[activeLayer]}
        emissiveIntensity={0.25}
        transparent
        opacity={0.75}
        roughness={0.3}
        metalness={0.1}
      />
    </mesh>
  );
}

/**
 * Glass bottle body + gold cap + liquid + particles.
 * Auto-rotates slowly and has a subtle breathing scale.
 */
function BottleScene({
  composition,
  activeLayer,
}: {
  composition: PerfumeComposition;
  activeLayer: NoteLayer;
}) {
  const groupRef = useRef<Group>(null);

  // Shared materials (memoized so they aren't recreated each frame)
  const glassMaterial = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        transmission: 0.9,
        thickness: 0.5,
        roughness: 0.05,
        ior: 1.5,
        metalness: 0,
        color: new THREE.Color('#ffffff'),
        transparent: true,
        opacity: 0.35,
        clearcoat: 1,
        clearcoatRoughness: 0.1,
        envMapIntensity: 0.3,
      }),
    []
  );

  const capMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#1a1a1a'),
        metalness: 0.85,
        roughness: 0.25,
      }),
    []
  );

  const goldAccentMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#FFD700'),
        metalness: 1,
        roughness: 0.05,
        emissive: new THREE.Color('#D4AF37'),
        emissiveIntensity: 0.3,
      }),
    []
  );

  const neckMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#B8860B'),
        metalness: 0.95,
        roughness: 0.08,
      }),
    []
  );

  // Subtle auto-rotation + breathing scale
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.y = t * 0.2;
    const breathe = 1.0 + Math.sin(t * Math.PI) * 0.02; // 0.98-1.02 over ~2s
    groupRef.current.scale.set(breathe, breathe, breathe);
  });

  return (
    <group ref={groupRef}>
      {/* Glass bottle body - capsule shape */}
      <mesh castShadow receiveShadow>
        <capsuleGeometry args={[0.55, 1.5, 8, 24]} />
        <primitive object={glassMaterial} attach="material" />
      </mesh>

      {/* Shoulder taper */}
      <mesh position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.3, 0.48, 0.25, 24]} />
        <primitive object={neckMaterial} attach="material" />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.25, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.3, 24]} />
        <primitive object={neckMaterial} attach="material" />
      </mesh>

      {/* Cap (black) */}
      <mesh position={[0, 1.52, 0]} castShadow>
        <cylinderGeometry args={[0.26, 0.24, 0.3, 24]} />
        <primitive object={capMaterial} attach="material" />
      </mesh>

      {/* Cap gold ring accent */}
      <mesh position={[0, 1.68, 0]}>
        <cylinderGeometry args={[0.22, 0.22, 0.04, 24]} />
        <primitive object={goldAccentMaterial} attach="material" />
      </mesh>

      {/* Body gold band detail */}
      <mesh position={[0, -0.2, 0]}>
        <torusGeometry args={[0.56, 0.02, 8, 32]} />
        <primitive object={goldAccentMaterial} attach="material" />
      </mesh>

      {/* Base ring */}
      <mesh position={[0, -0.98, 0]}>
        <torusGeometry args={[0.48, 0.02, 8, 32]} />
        <primitive object={goldAccentMaterial} attach="material" />
      </mesh>

      {/* Liquid inside */}
      <Liquid composition={composition} activeLayer={activeLayer} />

      {/* Orbiting note particles */}
      <NoteParticles composition={composition} />
    </group>
  );
}

export default function PerfumeBottle3D({
  composition,
  activeLayer,
  className = '',
}: PerfumeBottle3DProps) {
  return (
    <div className={`relative ${className}`} style={{ minHeight: 320 }}>
      <Canvas
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 1.5]}
        style={{ width: '100%', height: '100%' }}
      >
        <PerspectiveCamera makeDefault position={[0, 0.3, 4.5]} fov={35} />

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
        </Suspense>
      </Canvas>
    </div>
  );
}
