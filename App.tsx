import React, { useState } from 'react';
import ParticleCanvas from './components/ParticleCanvas';
import ControlPanel from './components/ControlPanel';
import { ParticleSettings } from './types';
import { MagicWandIcon, PhotoIcon } from './components/Icons';

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'intro' | 'image'>('intro');
  const [showControls, setShowControls] = useState(false);
  
  const [settings, setSettings] = useState<ParticleSettings>({
    gap: 4,             // Density for image mode
    size: 2.0,          // Base particle size
    friction: 0.94,     // Physics friction
    ease: 0.08,         // Return speed
    breathIntensity: 3  // Breathing range
  });

  const handleScreenClick = () => {
    if (viewMode === 'intro') {
      setViewMode('image');
    } else {
      setShowControls(prev => !prev);
    }
  };

  return (
    <div 
      className="relative w-full h-screen bg-slate-950 overflow-hidden flex flex-col cursor-pointer"
      onClick={handleScreenClick}
    >
      
      {/* Background/Canvas Layer */}
      <div className="absolute inset-0 z-0">
         <div className="w-full h-full">
            <ParticleCanvas 
              settings={settings} 
              variant={viewMode === 'intro' ? 'generative' : 'image'}
              imageSrc="tree.jpg" 
            />
         </div>
      </div>

      {/* Header Overlay */}
      <div className={`absolute top-0 left-0 w-full p-8 z-10 pointer-events-none select-none transition-all duration-1000 ${viewMode === 'image' ? 'opacity-0 translate-y-[-20px]' : 'opacity-100'}`}>
        <div className="max-w-7xl mx-auto flex flex-col items-center md:items-start text-center md:text-left">
           <div className="flex items-center gap-3 mb-2 animate-fade-in-down">
             <div className="p-2 bg-emerald-500/10 rounded-full backdrop-blur-md border border-emerald-500/20">
                <MagicWandIcon className="w-5 h-5 text-emerald-200" />
             </div>
             <h2 className="text-emerald-300/80 text-xs font-bold tracking-[0.3em] uppercase">Generative Art</h2>
           </div>
           <h1 className="font-serif text-4xl md:text-6xl text-white/90 drop-shadow-[0_0_25px_rgba(255,255,255,0.2)] animate-fade-in-up">
            Merry <span className="italic text-emerald-100">Christmas</span>
           </h1>
           <p className="mt-3 text-slate-400/60 max-w-md text-xs tracking-wider font-light animate-fade-in-up delay-100">
             TOUCH SCREEN TO REVEAL PHOTO
           </p>
        </div>
      </div>

      {/* Image Mode Overlay (Subtle hint) */}
      <div className={`absolute top-0 left-0 w-full p-8 z-10 pointer-events-none select-none transition-all duration-1000 ${viewMode === 'intro' ? 'opacity-0 translate-y-[20px]' : 'opacity-100'}`}>
         <div className="max-w-7xl mx-auto flex flex-col items-end text-right">
             <div className="flex items-center gap-2 text-white/30 text-xs tracking-widest uppercase">
                 <PhotoIcon className="w-4 h-4" />
                 <span>Particle Memory</span>
             </div>
         </div>
      </div>

      {/* Controls Overlay (Conditional) */}
      {showControls && viewMode === 'image' && (
        <div onClick={(e) => e.stopPropagation()} className="animate-fade-in-up z-50">
          <ControlPanel 
            settings={settings} 
            setSettings={setSettings} 
          />
        </div>
      )}
    </div>
  );
};

export default App;