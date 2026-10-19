import React, { useEffect, useState } from 'react';
import { soundEngine } from '../audio/SoundEngine';
import { FastForward } from 'lucide-react';

interface IntroCinematicProps {
  onComplete: () => void;
}

export const IntroCinematic: React.FC<IntroCinematicProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  useEffect(() => {
    soundEngine.init();

    // Sequence of dramatic narrative moments
    const t1 = setTimeout(() => setStep(1), 1200); // "My home is gone."
    const t2 = setTimeout(() => setStep(2), 4000); // "For decades, we believed our technology could save us."
    const t3 = setTimeout(() => setStep(3), 7500); // "We were wrong."
    const t4 = setTimeout(() => {
      soundEngine.playShipLaunch();
      setStep(4);
    }, 11000); // "SEARCHING FOR A NEW HOME..."
    const t5 = setTimeout(() => {
      onComplete();
    }, 15500); // Enter gameplay

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
    };
  }, [onComplete]);

  return (
    <div className="absolute inset-0 pointer-events-auto z-40 flex flex-col items-center justify-between p-8 bg-black/40 backdrop-blur-[2px] font-mono-tech select-none">
      {/* Skip button */}
      <div className="w-full flex justify-end">
        <button
          onClick={() => {
            soundEngine.playUiClick();
            onComplete();
          }}
          className="bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all"
        >
          <FastForward className="w-4 h-4" />
          <span>SKIP CINEMATIC</span>
        </button>
      </div>

      {/* Center Cinematic Narrative Quotes */}
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-2xl px-4">
        {step === 1 && (
          <div className="animate-fade-in text-2xl md:text-4xl font-orbitron font-bold tracking-widest text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]">
            “My home is gone.”
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in text-xl md:text-3xl font-orbitron font-semibold tracking-wider text-slate-200">
            “For decades, we believed our technology could save us.”
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in text-2xl md:text-4xl font-orbitron font-bold tracking-widest text-amber-400 drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]">
            “We were wrong.”
          </div>
        )}

        {step === 4 && (
          <div className="animate-fade-in space-y-4">
            <div className="text-3xl md:text-5xl font-orbitron font-black tracking-widest text-cyan-400 drop-shadow-[0_0_25px_rgba(6,182,212,0.8)]">
              LAST HORIZON
            </div>
            <div className="text-sm md:text-lg tracking-widest text-slate-300 uppercase animate-pulse">
              SEARCHING FOR A NEW HOME...
            </div>
          </div>
        )}
      </div>

      {/* Bottom hint */}
      <div className="text-xs text-slate-500 tracking-wider">
        HOMESHIP RECONNAISSANCE LOG — SECTOR 0
      </div>
    </div>
  );
};
