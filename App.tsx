import React, { useState } from 'react';
import ParticleCanvas from './components/ParticleCanvas';
import { ParticleSettings } from './types';
import { MagicWandIcon, UploadIcon } from './components/Icons';

const App: React.FC = () => {
  const [showLoveMessage, setShowLoveMessage] = useState(false);
  const [bgImage, setBgImage] = useState<string>("tree.jpg");
  const [mode, setMode] = useState<'generative' | 'image'>('generative');
  
  // Settings for the particles
  const settings: ParticleSettings = {
    gap: 5,             
    size: 2.0,          
    friction: 0.90,     
    ease: 0.1,         
    breathIntensity: 0.5 
  };

  const handleScreenClick = (e: React.MouseEvent) => {
    // Prevent triggering if clicking controls
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('label')) return;
    setShowLoveMessage(true);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setBgImage(e.target.result as string);
          setMode('image'); // Switch to image mode to show particles of the photo
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div 
      className="relative w-full h-screen bg-slate-950 overflow-hidden flex flex-col cursor-pointer group"
      onClick={handleScreenClick}
    >
      
      {/* Layer 1: The Particle Canvas (Fades out when clicked) */}
      <div className={`absolute inset-0 z-0 transition-opacity duration-[1500ms] ease-in-out ${showLoveMessage ? 'opacity-0' : 'opacity-100'}`}>
         <div className="w-full h-full">
            <ParticleCanvas 
              settings={settings} 
              variant={mode}
              imageSrc={bgImage} 
            />
         </div>
      </div>

      {/* Layer 2: Intro Text & Controls (Fades out when clicked) */}
      <div className={`absolute top-0 left-0 w-full p-8 z-10 pointer-events-none select-none transition-all duration-1000 ${showLoveMessage ? 'opacity-0 translate-y-[-50px]' : 'opacity-100'}`}>
        <div className="max-w-7xl mx-auto flex flex-col items-center md:items-start text-center md:text-left">
           <div className="flex items-center gap-3 mb-2 animate-fade-in-down">
             <div className="p-2 bg-emerald-500/10 rounded-full backdrop-blur-md border border-emerald-500/20">
                <MagicWandIcon className="w-5 h-5 text-emerald-200" />
             </div>
             <h2 className="text-emerald-300/80 text-xs font-bold tracking-[0.3em] uppercase font-cinzel">Noël Dreamscape</h2>
           </div>
           <h1 className="font-serif text-5xl md:text-7xl text-white/90 drop-shadow-[0_0_25px_rgba(255,255,255,0.2)] animate-fade-in-up">
            Merry <span className="italic text-emerald-100">Christmas</span>
           </h1>
           <p className="mt-4 text-emerald-100/50 text-xs tracking-[0.2em] animate-pulse">
             TAP SCREEN TO OPEN
           </p>
        </div>
      </div>

      {/* Upload Button (Bottom Right) */}
      <div className={`absolute bottom-8 right-8 z-20 transition-all duration-500 ${showLoveMessage ? 'opacity-0 translate-y-10 pointer-events-none' : 'opacity-100'}`}>
        <label className="flex items-center gap-3 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full backdrop-blur-md cursor-pointer transition-all group-hover:border-emerald-500/30 shadow-lg shadow-emerald-900/20">
            <UploadIcon className="w-5 h-5 text-emerald-200" />
            <span className="text-xs tracking-widest uppercase text-emerald-100/80 font-semibold">Change Photo</span>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileUpload} 
              className="hidden" 
              onClick={(e) => e.stopPropagation()} 
            />
        </label>
      </div>

      {/* Layer 3: Love Message Overlay (Fades in when clicked) */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-[2000ms] ease-out ${showLoveMessage ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
         
         {/* Background Image: Highly blurred and darkened for text legibility */}
         <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] ease-out"
            style={{ 
                backgroundImage: `url('${bgImage}')`,
                transform: showLoveMessage ? 'scale(1.1)' : 'scale(1.0)',
                filter: 'blur(20px) brightness(0.5) saturate(1.1)'
            }}
         />

         {/* Content Card / Blessing Bar */}
         <div className={`relative z-10 px-12 py-16 md:px-20 md:py-24 max-w-5xl w-[90%] text-center transform transition-all duration-[1500ms] delay-300 ${showLoveMessage ? 'translate-y-0 opacity-100' : 'translate-y-[40px] opacity-0'}`}>
            
            {/* Glass Container Background */}
            <div className="absolute inset-0 rounded-[3rem] border border-white/10 bg-white/5 backdrop-blur-md -z-10 shadow-2xl"></div>

            {/* Decorative Top Element */}
            <div className="mb-8 flex justify-center">
              <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-amber-200/50 to-transparent"></div>
            </div>
            
            <div className="flex flex-col items-center justify-center gap-4">
              <h1 className="font-romantic text-7xl md:text-9xl text-amber-100/95 leading-tight drop-shadow-[0_0_30px_rgba(251,191,36,0.4)]">
                Love You
              </h1>
              <h1 className="font-serif italic text-4xl md:text-6xl text-white/90 tracking-[0.1em] leading-tight drop-shadow-lg">
                Forever
              </h1>
            </div>

            {/* Decorative Bottom Line & Subtext */}
            <div className="mt-12 flex flex-col items-center gap-6">
                <p className="font-serif text-white/70 text-lg md:text-xl italic max-w-2xl leading-relaxed tracking-wide">
                  "Every moment with you is my favorite gift."
                </p>
                
                <div className="flex items-center gap-4 opacity-70 mt-4">
                    <span className="h-px w-12 bg-gradient-to-r from-transparent to-amber-200/40"></span>
                    <span className="font-cinzel text-[10px] tracking-[0.4em] text-amber-200/80 font-semibold uppercase">Always</span>
                    <span className="h-px w-12 bg-gradient-to-l from-transparent to-amber-200/40"></span>
                </div>
            </div>
            
         </div>

      </div>
    </div>
  );
};

export default App;