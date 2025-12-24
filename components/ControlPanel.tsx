import React from 'react';
import { ParticleSettings } from '../types';

interface ControlPanelProps {
  settings: ParticleSettings;
  setSettings: (s: ParticleSettings) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ settings, setSettings }) => {

  const updateSetting = (key: keyof ParticleSettings, value: number) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-[90%] max-w-xl 
                    bg-slate-900/60 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-6 shadow-2xl 
                    flex flex-col gap-4 z-50 transition-all duration-300">
      
      <div className="text-center mb-2 border-b border-white/5 pb-2">
        <h3 className="text-amber-100 font-serif tracking-wide text-lg">Settings</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        
        {/* Density (Gap) */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs text-amber-100/70 uppercase tracking-wider font-semibold">
            <span>Density</span>
            <span>{settings.gap < 4 ? 'High' : settings.gap > 6 ? 'Low' : 'Med'}</span>
          </div>
          <input
            type="range"
            min="2"
            max="12"
            step="1"
            value={settings.gap}
            onChange={(e) => updateSetting('gap', parseFloat(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
        </div>

        {/* Particle Size */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs text-amber-100/70 uppercase tracking-wider font-semibold">
            <span>Size</span>
            <span>{settings.size.toFixed(1)}px</span>
          </div>
          <input
            type="range"
            min="1"
            max="6"
            step="0.1"
            value={settings.size}
            onChange={(e) => updateSetting('size', parseFloat(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
        </div>

        {/* Breath Intensity (Replaces Force Field) */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs text-amber-100/70 uppercase tracking-wider font-semibold">
            <span>Breath</span>
            <span>{settings.breathIntensity}</span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={settings.breathIntensity}
            onChange={(e) => updateSetting('breathIntensity', parseFloat(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
        </div>

        {/* Flow (Still useful for how fast they return/drift) */}
         <div className="flex flex-col gap-1">
          <div className="flex justify-between text-xs text-amber-100/70 uppercase tracking-wider font-semibold">
             <span>Response</span>
            <span>{Math.round(settings.ease * 1000)}</span>
          </div>
          <input
            type="range"
            min="0.01"
            max="0.2"
            step="0.01"
            value={settings.ease}
            onChange={(e) => updateSetting('ease', parseFloat(e.target.value))}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
        </div>

      </div>
    </div>
  );
};

export default ControlPanel;