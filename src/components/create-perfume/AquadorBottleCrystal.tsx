'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import {
  OrbitControls,
  ContactShadows,
  Environment,
  Lightformer,
  MeshTransmissionMaterial,
  Float,
  RoundedBox,
} from '@react-three/drei';
import { Suspense, useMemo, useRef, useState, useEffect, type ReactNode } from 'react';
import * as THREE from 'three';
import type { PerfumeComposition, FragranceCategory } from '@/lib/perfume/types';
import { Canvas3DBoundary } from '@/components/3d/Canvas3DBoundary';
import { useDeviceCapabilities } from '@/hooks/useDeviceCapabilities';
import { useReducedMotion } from '@/hooks/useReducedMotion';

type NoteLayer = 'top' | 'heart' | 'base';

interface AquadorBottleCrystalProps {
  composition: PerfumeComposition;
  activeLayer: NoteLayer;
  className?: string;
  fallback: ReactNode;
}

const CATEGORY_COLORS: Record<FragranceCategory, string> = {
  floral: '#F8B8D4',
  fruity: '#F4A460',
  woody: '#8B4513',
  oriental: '#CD853F',
  gourmand: '#D2B48C',
};

const LAYER_COLORS: Record<NoteLayer, THREE.Color> = {
  top: new THREE.Color('#FFD700'),
  heart: new THREE.Color('#D4AF37'),
  base: new THREE.Color('#8B6914'),
};

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

  // A-shaped emblem inside the central petal
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

/**
 * Liquid that fills the bottle as the user composes. Color morphs to the
 * active layer; height eases toward target across notes-added.
 */
function Liquid({
  composition,
  activeLayer,
}: {
  composition: PerfumeComposition;
  activeLayer: NoteLayer;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const currentColor = useRef(new THREE.Color(LAYER_COLORS[activeLayer]));
  const currentFill = useRef(0.12);

  // Inside-the-extrude liquid envelope (slightly inset from outer body)
  const innerWidth = 1.42;
  const innerDepth = 0.5;
  const innerHeight = 2.55; // bottle interior height
  const bottomY = -1.8;

  useFrame((_, delta) => {
    if (!meshRef.current || !matRef.current) return;

    const count = [composition.top, composition.heart, composition.base].filter(Boolean).length;
    const targetFill = 0.12 + (count / 3) * 0.78;

    currentFill.current = THREE.MathUtils.lerp(
      currentFill.current,
      targetFill,
      1 - Math.pow(0.05, delta),
    );

    const targetColor = LAYER_COLORS[activeLayer];
    currentColor.current.lerp(targetColor, 1 - Math.pow(0.04, delta));

    const fillHeight = currentFill.current * innerHeight;
    meshRef.current.scale.y = currentFill.current;
    meshRef.current.position.y = bottomY + fillHeight * 0.5;

    matRef.current.color.copy(currentColor.current);
    matRef.current.emissive.copy(currentColor.current);
  });

  return (
    <RoundedBox ref={meshRef} args={[innerWidth, innerHeight, innerDepth]} radius={0.06} smoothness={4}>
      <meshStandardMaterial
        ref={matRef}
        color={LAYER_COLORS[activeLayer]}
        emissive={LAYER_COLORS[activeLayer]}
        emissiveIntensity={0.55}
        transparent
        opacity={0.78}
        roughness={0.18}
        metalness={0.12}
      />
    </RoundedBox>
  );
}

/** Selected-note motes orbiting the bottle. */
function NoteMotes({ composition }: { composition: PerfumeComposition }) {
  const groupRef = useRef<THREE.Group>(null);
  const notes = useMemo(() => {
    const out: Array<{ name: string; category: FragranceCategory; index: number }> = [];
    (['base', 'heart', 'top'] as NoteLayer[]).forEach((layer) => {
      const note = composition[layer];
      if (note) out.push({ name: note.name, category: note.category, index: out.length });
    });
    return out;
  }, [composition]);

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();
    groupRef.current.children.forEach((child, i) => {
      const note = notes[i];
      if (!note) return;
      const total = Math.max(notes.length, 1);
      const baseAngle = (note.index / total) * Math.PI * 2;
      const angle = baseAngle + t * 0.32;
      const orbitRadius = 1.85;
      const yBase = 0.55 - note.index * 0.6;
      child.position.x = Math.cos(angle) * orbitRadius;
      child.position.z = Math.sin(angle) * orbitRadius;
      child.position.y = yBase + Math.sin(t * 0.7 + note.index * 1.4) * 0.18;
    });
  });

  if (notes.length === 0) return null;

  return (
    <group ref={groupRef}>
      {notes.map((note) => (
        <mesh key={`${note.name}-${note.index}`} scale={0.07}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial
            color={CATEGORY_COLORS[note.category]}
            emissive={CATEGORY_COLORS[note.category]}
            emissiveIntensity={1.1}
            metalness={0.35}
            roughness={0.4}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Cursor-tracking subtle tilt — bottle leans gently toward pointer while idle.
 * Resets when user grabs orbit controls.
 */
function CursorTilt({
  enabled,
  groupRef,
}: {
  enabled: boolean;
  groupRef: React.RefObject<THREE.Group>;
}) {
  const target = useRef({ x: 0, y: 0 });
  const { size } = useThree();

  useEffect(() => {
    if (!enabled) return;
    const onMove = (e: PointerEvent) => {
      const rect = (e.target as HTMLElement).getBoundingClientRect?.();
      if (!rect) return;
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      target.current.x = nx * 0.18;
      target.current.y = ny * 0.12;
    };
    const onLeave = () => {
      target.current.x = 0;
      target.current.y = 0;
    };
    const el = document.querySelector('[data-bottle-canvas]');
    el?.addEventListener('pointermove', onMove as EventListener);
    el?.addEventListener('pointerleave', onLeave as EventListener);
    return () => {
      el?.removeEventListener('pointermove', onMove as EventListener);
      el?.removeEventListener('pointerleave', onLeave as EventListener);
    };
  }, [enabled, size]);

  useFrame((_, delta) => {
    if (!enabled || !groupRef.current) return;
    const k = 1 - Math.pow(0.04, delta);
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      target.current.x,
      k,
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      -target.current.y,
      k,
    );
  });

  return null;
}

function Bottle({
  composition,
  activeLayer,
  onUserInteract,
}: {
  composition: PerfumeComposition;
  activeLayer: NoteLayer;
  onUserInteract: () => void;
}) {
  const group = useRef<THREE.Group>(null);
  const tiltGroup = useRef<THREE.Group>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [hovered, setHovered] = useState(false);

  const bodyGeometry = useMemo(() => createBottleBodyGeometry(), []);
  const panelGeometry = useMemo(() => createInnerPanelGeometry(), []);
  const logoTexture = useMemo(() => makeLotusLogoTexture(), []);

  // Spring scale that bumps slightly each time a note is added
  const noteCount = [composition.top, composition.heart, composition.base].filter(Boolean).length;
  const targetScale = useRef(1);
  const currentScale = useRef(1);
  useEffect(() => {
    targetScale.current = 1 + Math.min(noteCount, 3) * 0.012;
  }, [noteCount]);

  useFrame((_, delta) => {
    if (autoRotate && !hovered && group.current) {
      group.current.rotation.y += delta * 0.18;
    }
    if (group.current) {
      const k = 1 - Math.pow(0.06, delta);
      currentScale.current = THREE.MathUtils.lerp(currentScale.current, targetScale.current, k);
      group.current.scale.setScalar(currentScale.current);
    }
  });

  return (
    <group
      ref={tiltGroup}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onPointerDown={() => {
        setAutoRotate(false);
        onUserInteract();
      }}
    >
      <CursorTilt enabled={autoRotate && !hovered} groupRef={tiltGroup} />
      <group ref={group} position={[0, -0.1, 0]}>
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
            attenuationColor="#ffffff"
            attenuationDistance={1.8}
            clearcoat={1}
            envMapIntensity={2.4}
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

        {/* Liquid that fills as composition completes */}
        <Liquid composition={composition} activeLayer={activeLayer} />

        {/* Lotus + brand decal on the front panel */}
        <mesh position={[0, -0.18, 0.348]}>
          <planeGeometry args={[0.9, 0.9]} />
          <meshBasicMaterial map={logoTexture} transparent depthWrite={false} toneMapped={false} />
        </mesh>

        {/* Side bevel highlights — V-cut facet glints */}
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

        {/* Thick clear base prism */}
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

        {/* Gold neck rings + cap silhouette */}
        <GoldCylinder position={[0, 1.03, 0]} radiusTop={0.31} radiusBottom={0.31} height={0.18} />
        <GoldCylinder position={[0, 1.21, 0]} radiusTop={0.3} radiusBottom={0.3} height={0.22} />
        <GoldCylinder position={[0, 1.41, 0]} radiusTop={0.32} radiusBottom={0.32} height={0.12} />
        <GoldCylinder position={[0, 1.52, 0]} radiusTop={0.31} radiusBottom={0.31} height={0.12} />
        <GoldCylinder position={[0, 1.69, 0]} radiusTop={0.38} radiusBottom={0.3} height={0.26} />
        <GoldCylinder position={[0, 1.89, 0]} radiusTop={0.76} radiusBottom={0.46} height={0.28} />
        <GoldCylinder position={[0, 2.07, 0]} radiusTop={0.78} radiusBottom={0.78} height={0.18} />

        {/* Ridged knurl on cap top */}
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

        {/* Selected-note motes orbiting the bottle */}
        <NoteMotes composition={composition} />
      </group>
    </group>
  );
}

function StudioLights() {
  return (
    <>
      <ambientLight intensity={0.55} color="#FFF6E0" />
      <spotLight
        position={[4.5, 6, 4]}
        angle={0.35}
        penumbra={0.75}
        intensity={4.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <pointLight position={[-3.8, 3.3, 3]} intensity={1.6} color="#FFE1A8" />
      <pointLight position={[3, 2.8, -2.5]} intensity={0.9} color="#FFD700" />
    </>
  );
}

export default function AquadorBottleCrystal({
  composition,
  activeLayer,
  className = '',
  fallback,
}: AquadorBottleCrystalProps) {
  const { supports3D } = useDeviceCapabilities();
  const reducedMotion = useReducedMotion();
  const [, setHasInteracted] = useState(false);

  if (!supports3D || reducedMotion) {
    return <>{fallback}</>;
  }

  return (
    <Canvas3DBoundary label="AquadorBottleCrystal" fallback={fallback}>
      <div data-bottle-canvas className={`relative min-h-[340px] ${className}`}>
        <Canvas
          shadows
          dpr={[1, 1.75]}
          camera={{ position: [0, 0.55, 5.4], fov: 35 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          style={{ width: '100%', height: '100%' }}
        >
          <Suspense fallback={null}>
            <StudioLights />
            <Float speed={1.1} rotationIntensity={0.08} floatIntensity={0.12}>
              <Bottle
                composition={composition}
                activeLayer={activeLayer}
                onUserInteract={() => setHasInteracted(true)}
              />
            </Float>
            {/* Synthetic studio environment via Lightformers — keeps gold reflections sharp without fetching an external HDR (CSP-friendly). */}
            <Environment resolution={256} frames={1}>
              <color attach="background" args={['#f4f1ea']} />
              <Lightformer position={[5, 5, 2]} scale={[8, 4, 1]} intensity={1.6} color="#fff5d8" />
              <Lightformer position={[-5, 3, -1]} scale={[6, 6, 1]} intensity={1.2} color="#ffe1a8" />
              <Lightformer position={[0, -3, 4]} scale={[5, 5, 1]} intensity={0.6} color="#ffd9a8" />
              <Lightformer
                position={[3, -2, -3]}
                rotation={[0, Math.PI, 0]}
                scale={[4, 4, 1]}
                intensity={0.8}
                color="#fff6d8"
              />
            </Environment>
            <ContactShadows
              position={[0, -2.18, 0]}
              opacity={0.32}
              scale={4.5}
              blur={2.2}
              far={4}
              frames={1}
            />
            <OrbitControls
              enablePan={false}
              enableZoom={false}
              enableDamping
              dampingFactor={0.06}
              minDistance={3.4}
              maxDistance={7.2}
              minPolarAngle={Math.PI * 0.28}
              maxPolarAngle={Math.PI * 0.72}
              rotateSpeed={0.65}
            />
          </Suspense>
        </Canvas>
      </div>
    </Canvas3DBoundary>
  );
}
