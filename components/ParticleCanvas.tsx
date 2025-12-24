import React, { useRef, useEffect, useState } from 'react';
import { ParticleSettings } from '../types';

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
    this.z = (Math.random() - 0.5) * 2; 

    // STABILITY FIX:
    // Previously: window.innerWidth (Full screen explosion)
    // Now: window.innerWidth * 0.15 (Localized spawn)
    // Particles spawn much closer to their target. This prevents them from building up
    // massive velocity as they fly in, stopping them from "overshooting" and jittering.
    const scatterRange = Math.min(window.innerWidth, window.innerHeight) * 0.15;
    this.x = x + (Math.random() - 0.5) * scatterRange; 
    this.y = y + (Math.random() - 0.5) * scatterRange;
    
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
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    
    // Smooth 3D parallax
    const parallaxX = mouse.active ? (mouse.x - centerX) * 0.05 * this.z : Math.sin(time * 0.01) * 10 * this.z;
    const parallaxY = mouse.active ? (mouse.y - centerY) * 0.05 * this.z : Math.cos(time * 0.01) * 10 * this.z;

    const breathRange = settings.breathIntensity; 
    const breathX = Math.sin(time * 0.02 + this.randomPhase) * breathRange;
    const breathY = Math.cos(time * 0.02 + this.randomPhase) * breathRange;

    const targetX = this.originX + parallaxX + breathX;
    const targetY = this.originY + parallaxY + breathY;

    // 2. Mouse Interaction (Repulsion)
    let mouseForceX = 0;
    let mouseForceY = 0;

    if (mouse.active) {
      const dx = mouse.x - this.x;
      const dy = mouse.y - this.y;
      const distance = Math.hypot(dx, dy);
      const forceDistance = 80; // Slightly tighter interaction radius

      if (distance < forceDistance) {
        const force = (forceDistance - distance) / forceDistance;
        const angle = Math.atan2(dy, dx);
        const repulsionStrength = 20; 

        mouseForceX = -Math.cos(angle) * force * repulsionStrength;
        mouseForceY = -Math.sin(angle) * force * repulsionStrength;
      }
    }

    // 3. Physics (Spring System)
    // Standard spring physics: Acceleration = Force / Mass
    this.vx += (targetX - this.x) * settings.ease;
    this.vy += (targetY - this.y) * settings.ease;

    this.vx += mouseForceX;
    this.vy += mouseForceY;

    // Friction application (Velocity Damping)
    this.vx *= settings.friction; 
    this.vy *= settings.friction;

    this.x += this.vx;
    this.y += this.vy;
    
    // 4. Visual Depth Scaling
    const depthScale = 1 + this.z * 0.3; 
    this.size = Math.max(0.1, this.baseSize * depthScale);
  }

  draw(ctx: CanvasRenderingContext2D) {
    // 3D Lighting Effect
    ctx.globalAlpha = Math.max(0.2, Math.min(1, 0.8 + this.z * 0.4));
    
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    
    if (this.isOrnament) {
       ctx.shadowBlur = 5;
       ctx.shadowColor = this.color;
       ctx.fill();
       ctx.shadowBlur = 0; 
    }
    
    ctx.globalAlpha = 1.0; 
  }
}

const ParticleCanvas: React.FC<ParticleCanvasProps> = ({ settings, variant, imageSrc }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]); 
  const animationRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  
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
           const alpha = 0.8 + Math.random() * 0.2; 
           const color = `rgba(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)}, ${alpha})`;
           particles.push(new Particle(x, y, color, settings.size, false));
        }
      }

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
          const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * 0.8; 
          const w = img.width * scale;
          const h = img.height * scale;
          const offsetX = (canvas.width - w) / 2;
          const offsetY = (canvas.height - h) / 2;

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, offsetX, offsetY, w, h);
          
          try {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const particles: Particle[] = [];
            const gap = Math.max(3, Math.floor(settings.gap));

            for (let y = 0; y < canvas.height; y += gap) {
              for (let x = 0; x < canvas.width; x += gap) {
                const index = (y * canvas.width + x) * 4;
                const alpha = imageData.data[index + 3];

                if (alpha > 20) { 
                  const r = imageData.data[index];
                  const g = imageData.data[index + 1];
                  const b = imageData.data[index + 2];
                  
                  const brightness = (r + g + b) / 3;
                  const isShiny = brightness > 230; 
                  
                  const color = `rgb(${r}, ${g}, ${b})`;
                  
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
           console.error("Failed to load image:", activeImageSrc);
           // Fallback logic removed as requested
       };
    };

    // --- EXECUTE ---
    particlesRef.current = [];
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