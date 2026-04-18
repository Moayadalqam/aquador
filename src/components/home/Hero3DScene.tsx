'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls, ContactShadows } from '@react-three/drei';
import { Suspense, useRef, useMemo } from 'react';
import { useTransform } from 'motion/react';
import type { MotionValue } from 'motion/react';
import { Color, type Group } from 'three';
import { AquadorBottleGeometry } from '@/components/3d/AquadorBottleGeometry';

interface Props {
  scrollYProgress: MotionValue<number>;
}

/**
 * Floating gold particles around the bottle.
 * Small icosahedrons that orbit gently on each frame.
 */
function GoldParticles({ scrollYProgress }: Props) {
  const groupRef = useRef<Group>(null);
  const rotationOffset = useTransform(scrollYProgress, [0, 1], [0, Math.PI]);

  // Generate particle positions once
  const particles = useMemo(() => {
    const items: Array<{
      position: [number, number, number];
      scale: number;
      orbitSpeed: number;
      orbitRadius: number;
      phase: number;
    }> = [];
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const radius = 1.8 + Math.random() * 1.5;
      const y = (Math.random() - 0.5) * 3;
      items.push({
        position: [Math.cos(angle) * radius, y, Math.sin(angle) * radius],
        scale: 0.015 + Math.random() * 0.025,
        orbitSpeed: 0.2 + Math.random() * 0.3,
        orbitRadius: radius,
        phase: angle,
      });
    }
    return items;
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    const scrollRot = rotationOffset.get();

    groupRef.current.children.forEach((child, i) => {
      const p = particles[i];
      if (!p) return;
      const angle = p.phase + t * p.orbitSpeed + scrollRot * 0.5;
      child.position.x = Math.cos(angle) * p.orbitRadius;
      child.position.z = Math.sin(angle) * p.orbitRadius;
      child.position.y = p.position[1] + Math.sin(t * 0.5 + i) * 0.15;
    });
  });

  return (
    <group ref={groupRef}>
      {particles.map((p, i) => (
        <mesh key={i} position={p.position} scale={p.scale}>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial
            color="#FFD700"
            emissive="#D4AF37"
            emissiveIntensity={0.6}
            metalness={1}
            roughness={0.2}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Scroll-driven perfume bottle with gold metallic body.
 *
 * Scroll controls: scale, Y position, and X tilt.
 * Y rotation is handled by OrbitControls autoRotate (no conflict).
 */
function Bottle({ scrollYProgress }: Props) {
  const groupRef = useRef<Group>(null);

  // Map scroll progress to bottle transforms (no Y rotation — OrbitControls handles that)
  const rotationX = useTransform(scrollYProgress, [0, 0.5, 1], [0.15, 0, -0.15]);
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.6, 1], [0.75, 1.05, 1.1, 0.85]);
  const positionY = useTransform(scrollYProgress, [0, 0.5, 1], [-0.3, 0.15, 0.5]);

  // Apply scroll-driven scale, position, and tilt (not Y rotation)
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    groupRef.current.rotation.x = rotationX.get();
    const s = scale.get();
    groupRef.current.scale.set(s, s, s);
    groupRef.current.position.y = positionY.get() + Math.sin(t * 0.6) * 0.04;
  });

  // Clear glass body material — matches the reference photo (transparent bottle, gold logo painted on).
  const glassBodyMaterial = useMemo(
    () => (
      <meshPhysicalMaterial
        transmission={0.94}
        ior={1.5}
        roughness={0.04}
        thickness={0.45}
        clearcoat={1}
        clearcoatRoughness={0.08}
        metalness={0}
        color={new Color('#ffffff')}
        attenuationColor={new Color('#fdf8e6')}
        attenuationDistance={1.4}
      />
    ),
    []
  );

  return (
    <group ref={groupRef}>
      <AquadorBottleGeometry bodyMaterial={glassBodyMaterial} showLabel />
    </group>
  );
}

export default function Hero3DScene({ scrollYProgress }: Props) {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <Canvas
        shadows
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 1.75]}
      >
        <PerspectiveCamera makeDefault position={[0, 0.2, 5]} fov={35} />

        {/* Interactive drag rotation — zoom and pan disabled for simplicity */}
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

        {/* Lighting rig for luxury gold look — self-contained, no external HDRI */}
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
          <Bottle scrollYProgress={scrollYProgress} />
          <GoldParticles scrollYProgress={scrollYProgress} />
          {/* Contact shadow beneath the bottle for grounding — rendered once, not per-frame */}
          <ContactShadows
            position={[0, -1.5, 0]}
            opacity={0.5}
            scale={6}
            blur={2}
            far={2}
            frames={1}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
