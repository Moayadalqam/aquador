/**
 * CSS-only animated background
 * Replaced Three.js shader implementation to reduce bundle size (~600KB savings)
 */

interface AnimatedShaderBackgroundProps {
  className?: string;
}

export default function AnimatedShaderBackground({ className }: AnimatedShaderBackgroundProps) {
  return (
    <div
      className={`absolute inset-0 overflow-hidden bg-gradient-to-br from-black via-gray-900 to-black ${className || ''}`}
      aria-hidden="true"
    />
  );
}
