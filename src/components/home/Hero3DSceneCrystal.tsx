'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import {
  PerspectiveCamera,
  OrbitControls,
  ContactShadows,
  Environment,
  MeshTransmissionMaterial,
  Float,
} from '@react-three/drei';
import { Suspense, useRef, useMemo } from 'react';
import { useTransform, type MotionValue } from 'motion/react';
import * as THREE from 'three';

interface Props {
  scrollYProgress: MotionValue<number>;
}

// ─── Bottle geometry (procedural) ─────────────────────────────────────────────
function makeLotusLogoTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.CanvasTexture(canvas);
  const gold = '#c9a23a';

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = gold;
  ctx.strokeStyle = gold;
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  ctx.save();
  ctx.translate(512, 300);
  ctx.scale(1.05, 1.05);

  const petals = [
    { x: 0, y: -90, sx: 0.75, sy: 1.2, r: 0 },
    { x: -88, y: -52, sx: 0.65, sy: 1.05, r: -0.75 },
    { x: 88, y: -52, sx: 0.65, sy: 1.05, r: 0.75 },
    { x: -158, y: 15, sx: 0.55, sy: 0.9, r: -1.15 },
    { x: 158, y: 15, sx: 0.55, sy: 0.9, r: 1.15 },
    { x: -226, y: 80, sx: 0.45, sy: 0.75, r: -1.32 },
    { x: 226, y: 80, sx: 0.45, sy: 0.75, r: 1.32 },
  ];

  petals.forEach((p) => {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.r);
    ctx.scale(p.sx, p.sy);
    ctx.beginPath();
    ctx.moveTo(0, 94);
    ctx.bezierCurveTo(-78, 20, -50, -78, 0, -126);
    ctx.bezierCurveTo(50, -78, 78, 20, 0, 94);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  });

  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(-54, -18);
  ctx.lineTo(0, -88);
  ctx.lineTo(54, -18);
  ctx.moveTo(-34, -18);
  ctx.lineTo(34, -18);
  ctx.stroke();

  ctx.restore();

  ctx.textAlign = 'center';
  ctx.fillStyle = gold;
  ctx.font = "bold 92px Georgia, 'Times New Roman', serif";
  ctx.fillText("AQUAD'OR", 512, 560);
  ctx.font = 'bold 64px Arial, Helvetica, sans-serif';
  ctx.fillText('Cyprus', 512, 652);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 16;
  return texture;
}

function createBottleBodyGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.82, -1.95);
  shape.lineTo(0.82, -1.95);
  shape.lineTo(0.74, 0.72);
  shape.lineTo(0.56, 0.93);
  shape.lineTo(0.26, 1.08);
  shape.lineTo(-0.26, 1.08);
  shape.lineTo(-0.56, 0.93);
  shape.lineTo(-0.74, 0.72);
  shape.lineTo(-0.82, -1.95);
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.58,
    bevelEnabled: true,
    bevelSize: 0.075,
    bevelThickness: 0.12,
    bevelSegments: 8,
    curveSegments: 2,
  });
  geometry.center();
  geometry.rotateY(Math.PI / 2);
  geometry.computeVertexNormals();
  return geometry;
}

function createInnerPanelGeometry() {
  const shape = new THREE.Shape();
  shape.moveTo(-0.44, -1.15);
  shape.quadraticCurveTo(-0.52, -0.28, -0.42, 0.47);
  shape.quadraticCurveTo(-0.25, 0.76, 0, 0.79);
  shape.quadraticCurveTo(0.25, 0.76, 0.42, 0.47);
  shape.quadraticCurveTo(0.52, -0.28, 0.44, -1.15);
  shape.quadraticCurveTo(0.24, -1.34, 0, -1.35);
  shape.quadraticCurveTo(-0.24, -1.34, -0.44, -1.15);
  const geometry = new THREE.ShapeGeometry(shape, 64);
  geometry.computeVertexNormals();
  return geometry;
}

function GoldCylinder({
  position,
  radiusTop = 1,
  radiusBottom = 1,
  height = 1,
  segments = 96,
}: {
  position: [number, number, number];
  radiusTop?: number;
  radiusBottom?: number;
  height?: number;
  segments?: number;
}) {
  return (
    <mesh position={position} castShadow receiveShadow>
      <cylinderGeometry args={[radiusTop, radiusBottom, height, segments, 1, false]} />
      <meshStandardMaterial color="#d8aa2f" metalness={1} roughness={0.16} envMapIntensity={2.4} />
    </mesh>
  );
}

// ─── Drifting gold motes (refined: hexagons of varying sizes + vertical drift) ─
function GoldMotes({ scrollYProgress }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const rotation = useTransform(scrollYProgress, [0, 1], [0, Math.PI * 0.6]);

  const motes = useMemo(() => {
    const items: Array<{
      pos: [number, number, number];
      scale: number;
      speed: number;
      radius: number;
      phase: number;
      ySpeed: number;
      yRange: number;
    }> = [];
    for (let i = 0; i < 36; i++) {
      const angle = (i / 36) * Math.PI * 2;
      const radius = 1.9 + Math.random() * 2.6;
      const y = (Math.random() - 0.5) * 4.2;
      items.push({
        pos: [Math.cos(angle) * radius, y, Math.sin(angle) * radius],
        scale: 0.018 + Math.random() * 0.04,
        speed: 0.12 + Math.random() * 0.22,
        radius,
        phase: angle,
        ySpeed: 0.18 + Math.random() * 0.4,
        yRange: 0.6 + Math.random() * 1.2,
      });
    }
    return items;
  }, []);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    const scrollRot = rotation.get();
    groupRef.current.children.forEach((child, i) => {
      const m = motes[i];
      if (!m) return;
      const angle = m.phase + t * m.speed + scrollRot * 0.5;
      child.position.x = Math.cos(angle) * m.radius;
      child.position.z = Math.sin(angle) * m.radius;
      child.position.y = m.pos[1] + Math.sin(t * m.ySpeed + i) * m.yRange;
      child.rotation.x = t * 0.4 + i;
      child.rotation.z = t * 0.3 + i;
    });
  });

  return (
    <group ref={groupRef}>
      {motes.map((m, i) => (
        <mesh key={i} position={m.pos} scale={m.scale}>
          {/* Hex prism (cylinder with 6 sides) for refined gold flake look */}
          <cylinderGeometry args={[1, 1, 0.22, 6, 1, false]} />
          <meshStandardMaterial
            color="#FFD86A"
            emissive="#D4AF37"
            emissiveIntensity={1.1}
            metalness={1}
            roughness={0.3}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

// ─── The crystal bottle — same procedural mesh as /create-perfume ─────────────
function CrystalBottle({ scrollYProgress }: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyGeometry = useMemo(() => createBottleBodyGeometry(), []);
  const panelGeometry = useMemo(() => createInnerPanelGeometry(), []);
  const logoTexture = useMemo(() => makeLotusLogoTexture(), []);

  // Scroll-driven scale + Y position + subtle tilt
  const rotationX = useTransform(scrollYProgress, [0, 0.5, 1], [0.18, 0, -0.14]);
  const scale = useTransform(scrollYProgress, [0, 0.3, 0.6, 1], [0.78, 1.05, 1.1, 0.86]);
  const positionY = useTransform(scrollYProgress, [0, 0.5, 1], [-0.4, 0.05, 0.45]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.rotation.x = rotationX.get();
    const s = scale.get();
    groupRef.current.scale.set(s, s, s);
    groupRef.current.position.y = positionY.get() + Math.sin(t * 0.55) * 0.04;
  });

  return (
    <group ref={groupRef} position={[0, -0.1, 0]}>
      {/* Crystal-glass body */}
      <mesh geometry={bodyGeometry} castShadow receiveShadow>
        <MeshTransmissionMaterial
          backside
          samples={10}
          thickness={0.7}
          chromaticAberration={0.05}
          anisotropy={0.12}
          distortion={0.03}
          distortionScale={0.16}
          temporalDistortion={0.02}
          transmission={1}
          roughness={0.015}
          ior={1.52}
          color="#ffffff"
          attenuationColor="#fff7e0"
          attenuationDistance={1.8}
          clearcoat={1}
          envMapIntensity={2.6}
        />
      </mesh>

      {/* Inner raised front panel */}
      <mesh geometry={panelGeometry} position={[0, -0.14, 0.333]} castShadow>
        <MeshTransmissionMaterial
          backside
          samples={6}
          thickness={0.32}
          transmission={1}
          roughness={0.02}
          ior={1.5}
          color="#ffffff"
          attenuationColor="#ffffff"
          attenuationDistance={2}
          envMapIntensity={2.0}
        />
      </mesh>

      {/* Lotus + AQUAD'OR Cyprus brand decal */}
      <mesh position={[0, -0.18, 0.348]}>
        <planeGeometry args={[0.9, 0.9]} />
        <meshBasicMaterial map={logoTexture} transparent depthWrite={false} toneMapped={false} />
      </mesh>

      {/* Side bevel highlights */}
      {[-1, 1].map((side) => (
        <group key={side} scale={[side, 1, 1]}>
          <mesh position={[0.63, -0.42, 0.351]} rotation={[0, 0, -0.18]}>
            <boxGeometry args={[0.035, 1.95, 0.028]} />
            <meshPhysicalMaterial color="#ffffff" transparent opacity={0.42} roughness={0} transmission={0.7} />
          </mesh>
          <mesh position={[0.58, -0.72, 0.366]} rotation={[0, 0, 0.32]}>
            <boxGeometry args={[0.025, 1.35, 0.024]} />
            <meshPhysicalMaterial color="#ffffff" transparent opacity={0.34} roughness={0} transmission={0.75} />
          </mesh>
        </group>
      ))}

      {/* Thick clear base */}
      <mesh position={[0, -1.74, 0.02]} castShadow receiveShadow>
        <boxGeometry args={[1.36, 0.24, 0.62]} />
        <MeshTransmissionMaterial
          samples={6}
          thickness={0.5}
          transmission={1}
          roughness={0.01}
          ior={1.52}
          color="#ffffff"
          attenuationDistance={1.1}
          envMapIntensity={2.0}
        />
      </mesh>
      <mesh position={[0, -1.91, 0.34]}>
        <boxGeometry args={[0.64, 0.09, 0.04]} />
        <meshStandardMaterial color="#e7eef2" metalness={0} roughness={0.08} transparent opacity={0.52} />
      </mesh>

      {/* Gold neck rings + cap */}
      <GoldCylinder position={[0, 1.03, 0]} radiusTop={0.31} radiusBottom={0.31} height={0.18} />
      <GoldCylinder position={[0, 1.21, 0]} radiusTop={0.3} radiusBottom={0.3} height={0.22} />
      <GoldCylinder position={[0, 1.41, 0]} radiusTop={0.32} radiusBottom={0.32} height={0.12} />
      <GoldCylinder position={[0, 1.52, 0]} radiusTop={0.31} radiusBottom={0.31} height={0.12} />
      <GoldCylinder position={[0, 1.69, 0]} radiusTop={0.38} radiusBottom={0.3} height={0.26} />
      <GoldCylinder position={[0, 1.89, 0]} radiusTop={0.76} radiusBottom={0.46} height={0.28} />
      <GoldCylinder position={[0, 2.07, 0]} radiusTop={0.78} radiusBottom={0.78} height={0.18} />

      {/* Knurled cap top */}
      {Array.from({ length: 80 }).map((_, i) => {
        const angle = (i / 80) * Math.PI * 2;
        const x = Math.cos(angle) * 0.735;
        const z = Math.sin(angle) * 0.735;
        return (
          <mesh key={i} position={[x, 2.18, z]} rotation={[0, -angle, 0]}>
            <boxGeometry args={[0.015, 0.035, 0.034]} />
            <meshStandardMaterial color="#f0c94d" metalness={1} roughness={0.18} />
          </mesh>
        );
      })}
    </group>
  );
}

export default function Hero3DSceneCrystal({ scrollYProgress }: Props) {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <Canvas
        shadows
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.75]}
      >
        <PerspectiveCamera makeDefault position={[0, 0.55, 5.4]} fov={35} />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.55}
          autoRotate
          autoRotateSpeed={0.45}
          minPolarAngle={Math.PI * 0.28}
          maxPolarAngle={Math.PI * 0.72}
        />

        {/* Cinematic spotlight rig — keylight from above-front, fill from sides, warm rim from back */}
        <ambientLight intensity={0.32} color="#FFE6B5" />
        <spotLight
          position={[0, 7, 3]}
          target-position={[0, 0, 0]}
          angle={0.55}
          penumbra={0.8}
          intensity={6.5}
          color="#FFF1C9"
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
        <pointLight position={[-4, 2, 3]} intensity={1.6} color="#FFCB7A" />
        <pointLight position={[4, 1.5, 2]} intensity={1.2} color="#FFD86A" />
        <pointLight position={[0, 1, -4]} intensity={1.4} color="#B8860B" /> {/* warm rim from behind */}

        <Suspense fallback={null}>
          <Float speed={1.0} rotationIntensity={0.06} floatIntensity={0.1}>
            <CrystalBottle scrollYProgress={scrollYProgress} />
          </Float>
          <GoldMotes scrollYProgress={scrollYProgress} />
          <Environment preset="studio" />
          <ContactShadows
            position={[0, -2.05, 0]}
            opacity={0.55}
            scale={6}
            blur={2.4}
            far={3}
            frames={1}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
