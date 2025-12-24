import React, { useRef, useEffect, useState } from 'react';
import { ParticleSettings } from '../types';

// Fallback if public/tree.jpg is missing
const FALLBACK_IMAGE_URL = "https://images.unsplash.com/photo-1543589077-47d81606c1bf?q=80&w=1200&auto=format&fit=crop";

interface ParticleCanvasProps {
  settings: ParticleSettings;
  variant: 'generative' | 'image';
  imageSrc?: string;
}

class Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  
  // 3D Properties
  z: number; // Depth (-1 to 1)
  
  color: string;
  baseSize: number;
  size: number;
  
  // Physics properties
  vx: number;
  vy: number;
  
  // Animation properties
  randomPhase: number;
  isOrnament: boolean;
  
  constructor(x: number, y: number, color: string, size: number, isOrnament: boolean = false) {
    this.originX = x;
    this.originY = y;
    
    // Assign a random depth for 3D effect
    // Positive Z is closer to camera, Negative Z is further
    this.z = (Math.random() - 0.5) * 2; 

    // Explode effect: Start scattered
    this.x = x + (Math.random() - 0.5) * window.innerWidth; 
    this.y = y + (Math.random() - 0.5) * window.innerHeight;
    
    this.vx = 0;
    this.vy = 0;
    
    this.color = color;
    this.baseSize = size;
    this.size = size;
    this.isOrnament = isOrnament;
    
    this.randomPhase = Math.random() * Math.PI * 2;
  }

  update(settings: ParticleSettings, time: number, mouse: { x: number; y: number; active: boolean }, canvasWidth: number, canvasHeight: number) {
    // 1. 3D Parallax & Breathing
    // Calculate Parallax Offset based on mouse position relative to center
    // Closer particles (high Z) move more than far particles
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    
    // If mouse is active, use it for parallax, otherwise slight drift
    const parallaxX = mouse.active ? (mouse.x - centerX) * 0.05 * this.z : Math.sin(time * 0.01) * 10 * this.z;
    const parallaxY = mouse.active ? (mouse.y - centerY) * 0.05 * this.z : Math.cos(time * 0.01) * 10 * this.z;

    // Breathing (Vertical/Horizontal tiny movements)
    // Much subtler now to fix "blurry" issue
    const breathRange = settings.breathIntensity; 
    const breathX = Math.sin(time * 0.02 + this.randomPhase) * breathRange;
    const breathY = Math.cos(time * 0.02 + this.randomPhase) * breathRange;

    const targetX = this.originX + parallaxX + breathX;
    const targetY = this.originY + parallaxY + breathY;

    // 2. Mouse Interaction (Repulsion) - "Force Field"
    let mouseForceX = 0;
    let mouseForceY = 0;

    if (mouse.active) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const distance = Math.hypot(dx, dy);
      const forceDistance = 100; // Smaller radius for more precision

      if (distance < forceDistance) {
        const force = (forceDistance - distance) / forceDistance;
        const angle = Math.atan2(dy, dx);
        const repulsionStrength = 30; // Strong snap

        mouseForceX = -Math.cos(angle) * force * repulsionStrength;
        mouseForceY = -Math.sin(angle) * force * repulsionStrength;
      }
    }

    // 3. Physics (Spring System)
    // Hooke's Law: Force = -k * displacement
    this.vx += (targetX - this.x) * settings.ease;
    this.vy += (targetY - this.y) * settings.ease;

    this.vx += mouseForceX;
    this.vy += mouseForceY;

    this.vx *= settings.friction; // Damping
    this.vy *= settings.friction;

    this.x += this.vx;
    this.y += this.vy;
    
    // 4. Visual Depth Scaling
    // Scale size based on Z-depth (Perspective)
    // z = 1 (close) -> larger, z = -1 (far) -> smaller
    const depthScale = 1 + this.z * 0.3; 
    this.size = Math.max(0.1, this.baseSize * depthScale);
  }

  draw(ctx: CanvasRenderingContext2D) {
    // 3D Lighting Effect:
    // Modify opacity based on Z-depth. Far particles are dimmer.
    ctx.globalAlpha = Math.max(0.2, Math.min(1, 0.8 + this.z * 0.4));
    
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Ornaments get a special glow
    if (this.isOrnament) {
       ctx.shadowBlur = 5;
       ctx.shadowColor = this.color;
       ctx.fill();
       ctx.shadowBlur = 0; 
    }
    
    ctx.globalAlpha = 1.0; // Reset
  }
}

const ParticleCanvas: React.FC<ParticleCanvasProps> = ({ settings, variant, imageSrc }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]); 
  const animationRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  
  // State for image handling fallback
  const [activeImageSrc, setActiveImageSrc] = useState(imageSrc || "tree.jpg");

  useEffect(() => {
    if (imageSrc) setActiveImageSrc(imageSrc);
  }, [imageSrc]);

  // Mouse Handlers
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.active = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
        // Only prevent default if we are interacting, to allow swipes if needed, 
        // but generally for canvas art we prevent default.
        e.preventDefault(); 
        const rect = canvas.getBoundingClientRect();
        if (e.touches[0]) {
            mouseRef.current.x = e.touches[0].clientX - rect.left;
            mouseRef.current.y = e.touches[0].clientY - rect.top;
            mouseRef.current.active = true;
        }
    };

    const handleEnd = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('mouseout', handleEnd); 
    window.addEventListener('touchend', handleEnd);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseout', handleEnd);
      window.removeEventListener('touchend', handleEnd);
    };
  }, []);

  // Initialization Logic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // --- GENERATIVE MODE (Christmas Tree) ---
    const initGenerativeTree = () => {
      const particles: Particle[] = [];
      const cx = canvas.width / 2;
      const cy = canvas.height * 0.85; 
      const treeHeight = Math.min(canvas.height * 0.7, 600);
      const maxRadius = Math.min(canvas.width * 0.35, 250);

      // 1. Tree Body (Reduced count for performance)
      const particleCount = 2000; 
      for (let i = 0; i < particleCount; i++) {
        const hPercent = 1 - Math.pow(Math.random(), 0.7); 
        const y = cy - hPercent * treeHeight;
        const levelFactor = 1 - hPercent;
        const branchWave = 1 + 0.15 * Math.sin(hPercent * 25);
        const radiusAtHeight = maxRadius * levelFactor * branchWave;
        const xOffset = (Math.random() - 0.5) * 2 * radiusAtHeight;
        
        if (Math.abs(xOffset) < radiusAtHeight) {
           const x = cx + xOffset;
           const r = 20 + Math.random() * 40;
           const g = 100 + Math.random() * 100;
           const b = 40 + Math.random() * 40;
           const alpha = 0.8 + Math.random() * 0.2; // Higher alpha for clarity
           const color = `rgba(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)}, ${alpha})`;
           particles.push(new Particle(x, y, color, settings.size, false));
        }
      }

      // 2. Ornaments
      const ornamentCount = 100;
      for (let i = 0; i < ornamentCount; i++) {
         const hPercent = Math.random() * 0.9;
         const y = cy - hPercent * treeHeight;
         const levelFactor = 1 - hPercent;
         const radiusAtHeight = maxRadius * levelFactor;
         const xOffset = (Math.random() - 0.5) * 2 * radiusAtHeight * 0.9;
         const x = cx + xOffset;
         const isGold = Math.random() > 0.6;
         const color = isGold ? `rgba(255, 215, 0, 1)` : `rgba(220, 40, 40, 1)`;
         particles.push(new Particle(x, y, color, settings.size * 1.5, true));
      }

      // 3. Star
      const starCount = 60;
      const topY = cy - treeHeight;
      for (let i = 0; i < starCount; i++) {
          const angle = Math.random() * Math.PI * 2;
          const dist = Math.random() * 15;
          const x = cx + Math.cos(angle) * dist;
          const y = topY + Math.sin(angle) * dist;
          particles.push(new Particle(x, y, 'rgba(255, 255, 200, 1)', settings.size * 1.2, true));
      }
      
      particlesRef.current = particles;
    };

    // --- IMAGE MODE ---
    const initFromImage = () => {
       const img = new Image();
       if (activeImageSrc.startsWith('http')) {
           img.crossOrigin = "Anonymous";
       }
       img.src = activeImageSrc;

       img.onload = () => {
          // Calculate scale to fit "contain"
          const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * 0.8; 
          const w = img.width * scale;
          const h = img.height * scale;
          const offsetX = (canvas.width - w) / 2;
          const offsetY = (canvas.height - h) / 2;

          // Draw image once to extract data
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, offsetX, offsetY, w, h);
          
          try {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear immediately

            const particles: Particle[] = [];
            // PERFORMANCE: Use settings.gap accurately. 
            // Ensure gap is at least 3 to prevent crashes on high-res screens.
            const gap = Math.max(3, Math.floor(settings.gap));

            for (let y = 0; y < canvas.height; y += gap) {
              for (let x = 0; x < canvas.width; x += gap) {
                const index = (y * canvas.width + x) * 4;
                const alpha = imageData.data[index + 3];

                // Skip transparent or near-transparent pixels
                if (alpha > 20) { 
                  const r = imageData.data[index];
                  const g = imageData.data[index + 1];
                  const b = imageData.data[index + 2];
                  
                  // Brightness calculation for "shininess"
                  const brightness = (r + g + b) / 3;
                  const isShiny = brightness > 230; 
                  
                  const color = `rgb(${r}, ${g}, ${b})`; // No alpha here, handled in draw()
                  
                  particles.push(new Particle(x, y, color, settings.size, isShiny));
                }
              }
            }
            particlesRef.current = particles;
          } catch (e) {
            console.error("Error reading image data", e);
          }
       };

       img.onerror = () => {
           if (activeImageSrc !== FALLBACK_IMAGE_URL) {
               console.warn("Fallback to network image");
               setActiveImageSrc(FALLBACK_IMAGE_URL);
           }
       };
    };

    // --- EXECUTE ---
    // Clear particles before switching to avoid visual noise during load
    particlesRef.current = [];
    
    // Short timeout to let the UI update before heavy processing
    const timer = setTimeout(() => {
        if (variant === 'generative') {
            initGenerativeTree();
        } else {
            initFromImage();
        }
    }, 10);

    const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        // Debounce resize
        if (variant === 'generative') initGenerativeTree();
        else initFromImage();
    };

    window.addEventListener('resize', handleResize);
    return () => {
        window.removeEventListener('resize', handleResize);
        clearTimeout(timer);
    };

  }, [variant, activeImageSrc, settings.gap]); 

  // Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const animate = () => {
      // Clear with trail effect - Darker background for better contrast
      ctx.fillStyle = 'rgba(2, 6, 23, 0.4)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (particlesRef.current.length > 0) {
          particlesRef.current.forEach(particle => {
            particle.update(settings, time, mouseRef.current, canvas.width, canvas.height);
            particle.draw(ctx);
          });
      }
      
      time++;
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animate();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [settings.friction, settings.ease, settings.size, settings.breathIntensity]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full"
    />
  );
};

export default ParticleCanvas;