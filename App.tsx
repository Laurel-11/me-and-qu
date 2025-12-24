import React, { useState } from 'react';
import ParticleCanvas from './components/ParticleCanvas';
import { ParticleSettings } from './types';
import { MagicWandIcon } from './components/Icons';

const App: React.FC = () => {
  const [showLoveMessage, setShowLoveMessage] = useState(false);
  
  // Settings for the Christmas Tree (Generative Mode)
  // Kept static as we no longer need dynamic physics for image transformation
  const settings: ParticleSettings = {
    gap: 5,             
    size: 2.0,          
    friction: 0.90,     
    ease: 0.1,         
    breathIntensity: 0.5 
  };

  const handleScreenClick = () => {
    setShowLoveMessage(true);
  };

  return (
    <div 
      className="relative w-full h-screen bg-slate-950 overflow-hidden flex flex-col cursor-pointer group"
      onClick={handleScreenClick}
    >
      
      {/* Layer 1: The Particle Tree (Fades out when clicked) */}
      <div className={`absolute inset-0 z-0 transition-opacity duration-[1500ms] ease-in-out ${showLoveMessage ? 'opacity-0' : 'opacity-100'}`}>
         <div className="w-full h-full">
            {/* We force variant='generative' so it always stays as the tree */}
            <ParticleCanvas 
              settings={settings} 
              variant="generative"
              imageSrc="tree.jpg" 
            />
         </div>
      </div>

      {/* Layer 2: Intro Text (Fades out when clicked) */}
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
             TAP TO OPEN
           </p>
        </div>
      </div>

      {/* Layer 3: Love Message Overlay (Fades in when clicked) */}
      <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-[2000ms] ease-out ${showLoveMessage ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
         
         {/* Background Image: Blurred & Darkened */}
         {/* Uses scale-110 to hide blur edges */}
         <div 
            className="absolute inset-0 bg-cover bg-center transition-transform duration-[10s] ease-out"
            style={{ 
                backgroundImage: `url('tree.jpg')`,
                transform: showLoveMessage ? 'scale(1.1)' : 'scale(1.0)',
                filter: 'blur(16px) brightness(0.4) contrast(1.1)'
            }}
         />

         {/* Content Card / Blessing Bar */}
         <div className={`relative z-10 p-12 md:p-16 max-w-4xl text-center transform transition-all duration-[1500ms] delay-300 ${showLoveMessage ? 'translate-y-0 opacity-100' : 'translate-y-[40px] opacity-0'}`}>
            
            {/* Decorative Top Line */}
            <div className="w-px h-16 bg-gradient-to-b from-transparent via-amber-200/50 to-transparent mx-auto mb-8"></div>
            
            <h1 className="font-romantic text-6xl md:text-8xl lg:text-9xl text-white leading-tight drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]">
              Love You <br/>
              <span className="text-amber-100/90">Forever</span>
            </h1>

            {/* Decorative Bottom Line & Subtext */}
            <div className="mt-10 flex flex-col items-center gap-4">
                <div className="flex items-center gap-4 opacity-60">
                    <span className="h-px w-12 bg-white/40"></span>
                    <span className="font-cinzel text-xs tracking-[0.4em] text-white/80 uppercase">Best Wishes</span>
                    <span className="h-px w-12 bg-white/40"></span>
                </div>
            </div>
            
            {/* Subtle Glass Border */}
            <div className="absolute inset-0 rounded-3xl border border-white/5 bg-white/[0.02] -z-10 blur-sm"></div>
         </div>

      </div>
    </div>
  );
};

export default App;