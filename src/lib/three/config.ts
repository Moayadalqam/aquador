/**
 * Three.js and React Three Fiber configuration constants.
 * Centralized configuration for camera, lighting, and controls.
 */

export const CAMERA_CONFIG = {
  position: [0, 0, 5] as [number, number, number],
  fov: 50,
};

export const LIGHTING_CONFIG = {
  ambientIntensity: 0.5,
  directionalIntensity: 1,
  directionalPosition: [5, 5, 5] as [number, number, number],
};

export const ORBIT_CONFIG = {
  enableDamping: true,
  dampingFactor: 0.05,
  minDistance: 2,
  maxDistance: 10,
  minPolarAngle: Math.PI / 4,
  maxPolarAngle: Math.PI / 2,
};

/**
 * Keyboard navigation configuration for 3D scenes
 *
 * Controls the step size for arrow key rotation and +/- zoom.
 * These values are tuned for smooth, perceptible increments at 60fps.
 */
export const KEYBOARD_CONFIG = {
  /**
   * Radians to rotate per arrow key press
   * 0.1 rad ≈ 5.7° — one press is a clearly visible rotation step
   */
  rotationStep: 0.1,

  /**
   * Scene units to zoom per keypress
   * 0.5 = half a unit toward/away from the model
   */
  zoomStep: 0.5,
} as const;

/**
 * Preset camera angles for the angle-selector UI.
 * azimuth: spherical.theta (radians, 0 = front)
 * polar: spherical.phi (radians, clamped by ORBIT_CONFIG.minPolarAngle/maxPolarAngle)
 */
export const ANGLE_PRESETS = [
  { id: 'front', label: 'Front', azimuth: 0,           polar: Math.PI / 3 },
  { id: 'side',  label: 'Side',  azimuth: Math.PI / 2, polar: Math.PI / 3 },
  { id: 'back',  label: 'Back',  azimuth: Math.PI,     polar: Math.PI / 3 },
] as const;

export type AnglePresetId = typeof ANGLE_PRESETS[number]['id'];
