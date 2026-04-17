'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { PerspectiveCamera, Environment } from '@react-three/drei';
import { Suspense, useRef, useMemo } from 'react';
import { useTransform } from 'framer-motion';
import type { MotionValue } from 'framer-motion';
import type { Group } from 'three';
import * as THREE from 'three';

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
    const items: Array<{ position: [number, number, number]; scale: number; orbitSpeed: number; orbitRadius: number; phase: number }> = [];
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
 * Scroll-driven perfume bottle with gold metallic materials.
 * Rotates, scales, and translates based on scroll progress.
 */
function Bottle({ scrollYProgress }: Props) {
  const groupRef = useRef<Group>(null);

  // Map scroll progress to bottle transforms
  const rotationY = useTransform(scrollYProgress, [0, 1], [0, Math.PI * 2]);
  const rotationX = useTransform(scrollYProgress, [0, 0.5, 1], [0.15, 0, -0.15]);
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.6, 1], [0.75, 1.05, 1.1, 0.85]);
  const positionY = useTransform(scrollYProgress, [0, 0.5, 1], [-0.3, 0.15, 0.5]);

  // Subtle continuous idle float
  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    groupRef.current.rotation.y = rotationY.get() + Math.sin(t * 0.3) * 0.05;
    groupRef.current.rotation.x = rotationX.get();
    const s = scale.get();
    groupRef.current.scale.set(s, s, s);
    groupRef.current.position.y = positionY.get() + Math.sin(t * 0.6) * 0.04;
  });

  // Shared gold material instances
  const bodyMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#D4AF37'),
        metalness: 0.92,
        roughness: 0.12,
        emissive: new THREE.Color('#3a2a00'),
        emissiveIntensity: 0.35,
      }),
    []
  );

  const darkGoldMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#B8860B'),
        metalness: 0.95,
        roughness: 0.08,
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

  const accentMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#FFD700'),
        metalness: 1,
        roughness: 0.05,
        emissive: new THREE.Color('#D4AF37'),
        emissiveIntensity: 0.2,
      }),
    []
  );

  return (
    <group ref={groupRef}>
      {/* Body - elongated capsule shape */}
      <mesh castShadow>
        <capsuleGeometry args={[0.65, 1.5, 8, 16]} />
        <primitive object={bodyMaterial} attach="material" />
      </mesh>

      {/* Shoulder taper */}
      <mesh position={[0, 1.05, 0]}>
        <cylinderGeometry args={[0.35, 0.55, 0.25, 16]} />
        <primitive object={darkGoldMaterial} attach="material" />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 1.32, 0]}>
        <cylinderGeometry args={[0.2, 0.26, 0.35, 16]} />
        <primitive object={darkGoldMaterial} attach="material" />
      </mesh>

      {/* Cap */}
      <mesh position={[0, 1.62, 0]} castShadow>
        <cylinderGeometry args={[0.3, 0.28, 0.3, 16]} />
        <primitive object={capMaterial} attach="material" />
      </mesh>

      {/* Cap top gold ring */}
      <mesh position={[0, 1.78, 0]}>
        <cylinderGeometry args={[0.26, 0.26, 0.04, 16]} />
        <primitive object={accentMaterial} attach="material" />
      </mesh>

      {/* Body gold band detail */}
      <mesh position={[0, -0.2, 0]}>
        <torusGeometry args={[0.66, 0.025, 8, 32]} />
        <primitive object={accentMaterial} attach="material" />
      </mesh>
    </group>
  );
}

export default function Hero3DScene({ scrollYProgress }: Props) {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <Canvas
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        dpr={[1, 1.5]}
      >
        <PerspectiveCamera makeDefault position={[0, 0.2, 5]} fov={35} />

        {/* Lighting rig for luxury gold look */}
        <ambientLight intensity={0.25} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1.3}
          color="#FFE1A8"
          castShadow
        />
        <directionalLight
          position={[-4, -2, 3]}
          intensity={0.5}
          color="#FFB347"
        />
        <pointLight position={[0, 2, 3]} intensity={0.7} color="#D4AF37" />
        <pointLight position={[-2, -1, 2]} intensity={0.3} color="#FFD700" />

        <Suspense fallback={null}>
          <Environment preset="sunset" />
          <Bottle scrollYProgress={scrollYProgress} />
          <GoldParticles scrollYProgress={scrollYProgress} />
        </Suspense>
      </Canvas>
    </div>
  );
}
