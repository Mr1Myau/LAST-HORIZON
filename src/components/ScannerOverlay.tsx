import React, { useEffect, useState } from 'react';
import { InteractableObject, CreatureEntity } from '../types/game';
import { Scan, ShieldAlert, CheckCircle, Database } from 'lucide-react';

interface ScannerOverlayProps {
  target: InteractableObject | CreatureEntity | null;
  onClose: () => void;
}

export const ScannerOverlay: React.FC<ScannerOverlayProps> = ({ target, onClose }) => {
  const [animProgress, setAnimProgress] = useState(0);

  useEffect(() => {
    setAnimProgress(0);
    const interval = setInterval(() => {
      setAnimProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 25;
      });
    }, 60);

    const timer = setTimeout(() => {
      onClose();
    }, 4500);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [target, onClose]);

  if (!target) {
    return (
      <div className="absolute top-24 left-1/2 -translate-x-1/2 pointer-events-none z-20">
        <div className="bg-slate-900/90 border border-cyan-500/50 rounded-lg px-6 py-3 font-mono-tech text-cyan-300 text-sm flex items-center gap-3 backdrop-blur-md shadow-2xl animate-fade-in">
          <Scan className="w-5 h-5 text-cyan-400 animate-spin" />
          <span>SUIT SCANNER ACTIVATED: NO ANOMALY WITHIN RANGE (25M)</span>
        </div>
      </div>
    );
  }

  const isCreature = 'health' in target;
  const threatLevel = isCreature ? target.danger : target.details.threat;
  const classification = isCreature ? `Fauna (${target.type})` : target.details.classification;
  const composition = isCreature ? 'Organic Biomass / Chitin' : target.details.composition;
  const origin = isCreature ? 'Indigenous Biosphere' : target.details.origin;
  const notes = isCreature ? target.description : target.details.notes;

  return (
    <div className="absolute top-20 right-6 pointer-events-none z-20 max-w-sm w-full animate-fade-in">
      <div className="bg-slate-950/90 border-2 border-cyan-500 rounded-xl p-5 backdrop-blur-lg shadow-2xl shadow-cyan-500/20 text-slate-100 font-mono-tech relative overflow-hidden">
        {/* Holographic scanning scanline */}
        <div
          className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent transition-all duration-300 pointer-events-none"
          style={{ top: `${animProgress}%` }}
        />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span className="text-xs uppercase tracking-widest text-cyan-400">SPECTRAL ANALYSIS</span>
          </div>
          <span className="text-xs px-2 py-0.5 rounded bg-cyan-900/60 text-cyan-300 border border-cyan-500/30">
            {animProgress}%
          </span>
        </div>

        {/* Target Name */}
        <div className="text-lg font-bold font-orbitron tracking-wider text-white mb-3">
          {target.name.toUpperCase()}
        </div>

        {/* Details Grid */}
        <div className="space-y-2 text-xs mb-4">
          <div className="flex justify-between border-b border-slate-800/80 pb-1">
            <span className="text-slate-400">CLASSIFICATION:</span>
            <span className="text-cyan-300 font-semibold">{classification}</span>
          </div>

          <div className="flex justify-between border-b border-slate-800/80 pb-1">
            <span className="text-slate-400">THREAT LEVEL:</span>
            <span
              className={`font-semibold ${
                threatLevel === 'Low' || threatLevel === 'None'
                  ? 'text-emerald-400'
                  : threatLevel === 'Medium' || threatLevel === 'Moderate'
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {threatLevel.toUpperCase()}
            </span>
          </div>

          <div className="flex justify-between border-b border-slate-800/80 pb-1">
            <span className="text-slate-400">COMPOSITION:</span>
            <span className="text-slate-200 text-right max-w-[200px] truncate">{composition}</span>
          </div>

          <div className="flex justify-between border-b border-slate-800/80 pb-1">
            <span className="text-slate-400">ORIGIN:</span>
            <span className="text-slate-200">{origin}</span>
          </div>
        </div>

        {/* Tactical Notes */}
        <div className="bg-slate-900/80 rounded-lg p-3 text-xs text-slate-300 border border-slate-800 mb-3">
          <span className="text-[10px] text-slate-400 block mb-1">TACTICAL ARCHIVE:</span>
          <p className="leading-relaxed">{notes}</p>
        </div>

        {/* Codex Added Confirmation Badge */}
        <div className="flex items-center justify-between text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-500/40 rounded px-3 py-1.5">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>RECORD ADDED TO CODEX</span>
          </div>
          <Database className="w-3.5 h-3.5 text-emerald-400" />
        </div>
      </div>
    </div>
  );
};
