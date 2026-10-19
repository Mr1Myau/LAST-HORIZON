import React, { useState } from 'react';
import { StoryEvent, StoryChoice } from '../types/game';
import { soundEngine } from '../audio/SoundEngine';
import { Radio, AlertCircle, Check, ArrowRight } from 'lucide-react';

interface EventModalProps {
  event: StoryEvent;
  onChoiceSelected: (choice: StoryChoice) => void;
  onDismiss: () => void;
}

export const EventModal: React.FC<EventModalProps> = ({
  event,
  onChoiceSelected,
  onDismiss,
}) => {
  const [selectedChoice, setSelectedChoice] = useState<StoryChoice | null>(null);

  const handleChoose = (choice: StoryChoice) => {
    soundEngine.playUiClick();
    setSelectedChoice(choice);
    onChoiceSelected(choice);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-fade-in font-mono-tech select-none">
      <div className="relative w-full max-w-xl bg-slate-900/95 border-2 border-amber-500/50 rounded-2xl shadow-2xl shadow-amber-500/10 overflow-hidden text-slate-100 p-6 md:p-8">
        {/* Event Header */}
        <div className="flex items-center gap-3 border-b border-amber-500/30 pb-4 mb-4">
          <div className="p-2 rounded-lg bg-amber-950 border border-amber-500/40 text-amber-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] text-amber-400 uppercase tracking-widest">
              SURFACE ANOMALY TRANSMISSION
            </div>
            <h2 className="text-xl md:text-2xl font-bold font-orbitron tracking-wider text-white">
              {event.title}
            </h2>
          </div>
        </div>

        {/* Narrative Description */}
        <div className="text-slate-200 text-sm md:text-base leading-relaxed mb-6 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
          {event.description}
        </div>

        {/* Choices or Outcome */}
        {!selectedChoice ? (
          <div>
            <div className="text-xs text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>REQUIRED PROTOCOL DECISION:</span>
            </div>

            <div className="space-y-3">
              {event.choices.map((choice, idx) => (
                <button
                  key={idx}
                  onClick={() => handleChoose(choice)}
                  className="w-full text-left p-3.5 rounded-xl bg-slate-950/70 hover:bg-amber-950/30 border border-slate-700 hover:border-amber-400 text-sm text-slate-200 hover:text-white transition-all flex items-start gap-3 group"
                >
                  <span className="w-6 h-6 rounded-full bg-slate-800 group-hover:bg-amber-500/20 text-slate-400 group-hover:text-amber-300 border border-slate-600 group-hover:border-amber-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="flex-1 leading-snug">{choice.text}</span>
                  <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 shrink-0 mt-0.5" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 animate-fade-in">
            <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-xl p-4 text-sm text-emerald-200">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1">
                <Check className="w-4 h-4" />
                <span>DECISION RESOLUTION</span>
              </div>
              <p className="leading-relaxed">{selectedChoice.outcomeText}</p>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  soundEngine.playUiClick();
                  onDismiss();
                }}
                className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold font-orbitron text-sm transition-all shadow-lg shadow-cyan-600/30"
              >
                PROCEED EXPLORATION
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
