import { AccumulativeShadows, RandomizedLight } from '@react-three/drei';
import { LIGHTING_CONFIG } from '@/lib/three/config';

type LightingProps = {
  simplified?: boolean;
};

/**
 * Lighting setup for the 3D bottle scene.
 *
 * Full mode: ambient + directional lights with accumulative soft shadows.
 * Environment preset removed — the clean-glass bottle renders well with
 * direct lights alone, and this avoids a CDN fetch for the HDRI map.
 *
 * Simplified mode (mobile): basic ambient + directional only.
 */
export function Lighting({ simplified = false }: LightingProps) {
  if (simplified) {
    return (
      <>
        <ambientLight intensity={LIGHTING_CONFIG.ambientIntensity * 1.6} />
        <directionalLight
          position={LIGHTING_CONFIG.directionalPosition}
          intensity={LIGHTING_CONFIG.directionalIntensity * 0.5}
        />
      </>
    );
  }

  return (
    <>
      <ambientLight intensity={LIGHTING_CONFIG.ambientIntensity} />
      <directionalLight
        position={LIGHTING_CONFIG.directionalPosition}
        intensity={LIGHTING_CONFIG.directionalIntensity}
        castShadow
      />
      <AccumulativeShadows
        temporal
        frames={40}
        color="#9d4b4b"
        colorBlend={0.5}
        alphaTest={0.9}
        scale={20}
        position={[0, -1, 0]}
      >
        <RandomizedLight
          amount={8}
          radius={4}
          position={[5, 5, -10]}
        />
      </AccumulativeShadows>
    </>
  );
}
