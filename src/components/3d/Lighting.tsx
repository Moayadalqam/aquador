import { Environment, AccumulativeShadows, RandomizedLight } from '@react-three/drei';
import { LIGHTING_CONFIG } from '@/lib/three/config';

type LightingProps = {
  simplified?: boolean;
};

/**
 * Realistic lighting setup with HDRI environment and temporal shadows.
 *
 * Full mode (default):
 * - Environment preset="city" for HDRI-based realistic lighting
 * - AccumulativeShadows with temporal rendering (spread across 100 frames)
 * - RandomizedLight for soft, realistic shadow sampling
 *
 * Simplified mode (mobile optimization):
 * - Basic ambient + directional lights only
 * - No environment map or accumulative shadows
 *
 * @param simplified - Enable low-end device optimization (Plan 04)
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
      <Environment preset="city" background={false} />
      <ambientLight intensity={LIGHTING_CONFIG.ambientIntensity} />
      <directionalLight
        position={LIGHTING_CONFIG.directionalPosition}
        intensity={LIGHTING_CONFIG.directionalIntensity}
        castShadow
      />
      <AccumulativeShadows
        temporal
        frames={100}
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
