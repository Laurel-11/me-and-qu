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
  color: string;
  size: number;
  
  // Physics properties
  vx: number;
  vy: number;
  
  // Animation properties
  randomPhase: number;
  oscillationSpeed: number;
  isOrnament: boolean;
  
  constructor(x: number, y: number, color: string, size: number, isOrnament: boolean = false) {
    this.originX = x;
    this.originY = y;
    
    // Start particles at random positions for an "assembling" effect
    // We use a larger spread for the "magic" effect
    this.x = x + (Math.random() - 0.5) * window.innerWidth * 1.5; 
    this.y = y + (Math.random() - 0.5) * window.innerHeight * 1.5;
    
    this.vx = 0;
    this.vy = 0;
    
    this.color = color;
    this.size = size;
    this.isOrnament = isOrnament;
    
    // Randomize the breathing cycle
    this.randomPhase = Math.random() * Math.PI * 2;
    this.oscillationSpeed = 0.001 + Math.random() * 0.002;
  }

  update(settings: ParticleSettings, time: number, mouse: { x: number; y: number; active: boolean }) {
    // 1. Calculate the "Breathing" Home Position
    const breathRange = this.isOrnament ? settings.breathIntensity * 1.5 : settings.breathIntensity;
    
    const homeX = this.originX + Math.sin(time * this.oscillationSpeed + this.randomPhase) * breathRange;
    const homeY = this.originY + Math.cos(time * this.oscillationSpeed + this.randomPhase) * breathRange;

    // 2. Mouse Interaction (Repulsion)
    let mouseForceX = 0;
    let mouseForceY = 0;

    if (mouse.active) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const distance = Math.hypot(dx, dy);
      const forceDistance = 150; // Interaction radius

      if (distance < forceDistance) {
        const force = (forceDistance - distance) / forceDistance;
        const angle = Math.atan2(dy, dx);
        const repulsionStrength = 25; 

        mouseForceX = -Math.cos(angle) * force * repulsionStrength;
        mouseForceY = -Math.sin(angle) * force * repulsionStrength;
      }
    }

    // 3. Physics Integration
    this.vx += (homeX - this.x) * settings.ease;
    this.vy += (homeY - this.y) * settings.ease;

    this.vx += mouseForceX;
    this.vy += mouseForceY;

    this.vx *= settings.friction;
    this.vy *= settings.friction;

    this.x += this.vx;
    this.y += this.vy;
    
    // 4. Visual Updates
    const speed = Math.hypot(this.vx, this.vy);
    const twinkle = Math.sin(time * 0.05 + this.randomPhase);
    
    // Ornaments or highlights twinkle more
    const sizeMultiplier = this.isOrnament ? 1.8 : 1.0;
    const dynamicSize = settings.size * sizeMultiplier * (0.8 + 0.3 * twinkle + Math.min(speed * 0.1, 0.4));
    this.size = dynamicSize;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Add glow for ornaments
    if (this.isOrnament) {
       ctx.shadowBlur = 8;
       ctx.shadowColor = this.color;
       ctx.fill();
       ctx.shadowBlur = 0; 
    }
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

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // --- GENERATIVE MODE (Christmas Tree) ---
    const initGenerativeTree = () => {
      const particles: Particle[] = [];
      const cx = canvas.width / 2;
      const cy = canvas.height * 0.85; 
      const treeHeight = Math.min(canvas.height * 0.7, 600);
      const maxRadius = Math.min(canvas.width * 0.35, 250);

      // 1. Tree Body
      const particleCount = 2800;
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
           const alpha = 0.6 + Math.random() * 0.4;
           const color = `rgba(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)}, ${alpha})`;
           particles.push(new Particle(x, y, color, settings.size, false));
        }
      }

      // 2. Ornaments
      const ornamentCount = 120;
      for (let i = 0; i < ornamentCount; i++) {
         const hPercent = Math.random() * 0.9;
         const y = cy - hPercent * treeHeight;
         const levelFactor = 1 - hPercent;
         const radiusAtHeight = maxRadius * levelFactor;
         const xOffset = (Math.random() - 0.5) * 2 * radiusAtHeight * 0.9;
         const x = cx + xOffset;
         const isGold = Math.random() > 0.6;
         const color = isGold ? `rgba(255, 215, 0, 0.9)` : `rgba(220, 40, 40, 0.9)`;
         particles.push(new Particle(x, y, color, settings.size * 1.5, true));
      }

      // 3. Star
      const starCount = 80;
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
          const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * 0.8; 
          const w = img.width * scale;
          const h = img.height * scale;
          const offsetX = (canvas.width - w) / 2;
          const offsetY = (canvas.height - h) / 2;

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, offsetX, offsetY, w, h);
          
          try {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear original image

            const particles: Particle[] = [];
            const gap = Math.max(1, Math.floor(settings.gap));

            for (let y = 0; y < canvas.height; y += gap) {
              for (let x = 0; x < canvas.width; x += gap) {
                const index = (y * canvas.width + x) * 4;
                const alpha = imageData.data[index + 3];

                if (alpha > 10) { 
                  const r = imageData.data[index];
                  const g = imageData.data[index + 1];
                  const b = imageData.data[index + 2];
                  const color = `rgba(${r}, ${g}, ${b}, ${alpha / 255})`;
                  
                  // Use brightness to determine if it should be treated as an "ornament" (more shiny)
                  const brightness = (r + g + b) / 3;
                  const isShiny = brightness > 220; 
                  
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
    if (variant === 'generative') {
        initGenerativeTree();
    } else {
        initFromImage();
    }

    const handleResize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        if (variant === 'generative') initGenerativeTree();
        else initFromImage();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);

  }, [variant, activeImageSrc, settings.gap]); // Re-run when mode changes or density changes

  // Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const animate = () => {
      // Clear with trail effect
      ctx.fillStyle = 'rgba(2, 6, 23, 0.25)'; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (particlesRef.current.length > 0) {
          particlesRef.current.forEach(particle => {
            particle.update(settings, time, mouseRef.current);
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