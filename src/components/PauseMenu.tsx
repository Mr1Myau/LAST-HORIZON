import React from 'react';
import { soundEngine } from '../audio/SoundEngine';
import { Play, RotateCcw, Volume2, VolumeX, Save, HelpCircle, X } from 'lucide-react';

interface PauseMenuProps {
  onClose: () => void;
  onResetGame: () => void;
  onSaveGame: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  onClose,
  onResetGame,
  onSaveGame,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-fade-in font-mono-tech select-none">
      <div className="relative w-full max-w-lg bg-slate-900/95 border-2 border-cyan-500/50 rounded-2xl shadow-2xl p-6 md:p-8 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4 mb-6">
          <div>
            <div className="text-[10px] text-cyan-400 uppercase tracking-widest">
              SYSTEM STANDBY MODE
            </div>
            <h2 className="text-2xl font-bold font-orbitron tracking-wider text-white">
              LAST HORIZON
            </h2>
          </div>
          <button
            onClick={() => {
              soundEngine.playUiClick();
              onClose();
            }}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Menu Buttons */}
        <div className="space-y-3 mb-6">
          <button
            onClick={() => {
              soundEngine.playUiClick();
              onClose();
            }}
            className="w-full p-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-500 hover:from-cyan-500 hover:to-sky-400 text-white font-bold font-orbitron text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/25"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>RESUME EXPEDITION</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playUiClick();
              onSaveGame();
            }}
            className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-cyan-400 text-sm font-semibold text-slate-200 hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4 text-cyan-400" />
            <span>SAVE PROGRESS (LOCAL STORAGE)</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playUiClick();
              onToggleMute();
            }}
            className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 hover:border-slate-500 text-sm font-semibold text-slate-200 transition-all flex items-center justify-center gap-2"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-4 h-4 text-rose-400" />
                <span>UNMUTE AUDIO (MUTED)</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-emerald-400" />
                <span>MUTE AUDIO (ACTIVE)</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              soundEngine.playUiClick();
              if (window.confirm('Reset all exploration data and restart the prologue?')) {
                onResetGame();
              }
            }}
            className="w-full p-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/40 text-sm font-semibold text-rose-300 transition-all flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESTART GAME / NEW GAME</span>
          </button>
        </div>

        {/* Quick Keyboard Guide */}
        <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 text-xs text-slate-300 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold mb-2">
            <HelpCircle className="w-4 h-4" />
            <span>ASTRONAUT OPERATING GUIDE</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div><span className="text-white font-bold">W, A, S, D</span>: Walk / Strafe</div>
            <div><span className="text-white font-bold">SHIFT</span>: Sprint</div>
            <div><span className="text-white font-bold">SPACE</span>: Jump / Jetpack</div>
            <div><span className="text-white font-bold">[E]</span>: Interact / Enter Ship</div>
            <div><span className="text-white font-bold">[F]</span>: Suit Scanner Beam</div>
            <div><span className="text-white font-bold">[L]</span>: Helmet Flashlight</div>
            <div><span className="text-white font-bold">[TAB]</span>: Codex Journal</div>
            <div><span className="text-white font-bold">MOUSE</span>: Orbit & Zoom Camera</div>
          </div>
        </div>
      </div>
    </div>
  );
};
