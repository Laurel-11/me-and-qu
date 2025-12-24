export interface ParticleSettings {
  gap: number; // Pixel step (density). Lower number = more particles.
  size: number; // Particle radius
  friction: number; // Movement smoothing
  ease: number; // Return to home speed
  breathIntensity: number; // Replaces hoverRadius, controls the range of the breathing motion
}

export interface RGB {
  r: number;
  g: number;
  b: number;
}