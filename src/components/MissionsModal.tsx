import React, { useState } from 'react';
import { Mission, MissionDifficulty } from '../types/game';
import { soundEngine } from '../audio/SoundEngine';
import {
  Target,
  CheckCircle2,
  Gift,
  Sparkles,
  Shield,
  Zap,
  Heart,
  Radio,
  X,
  Flame,
  Compass,
  Award,
} from 'lucide-react';

interface MissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  missions: Mission[];
  onClaimReward: (missionId: string) => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({
  isOpen,
  onClose,
  missions,
  onClaimReward,
}) => {
  const [selectedTab, setSelectedTab] = useState<'all' | MissionDifficulty>('all');

  if (!isOpen) return null;

  const filteredMissions = missions.filter((m) => {
    if (selectedTab === 'all') return true;
    return m.category === selectedTab;
  });

  const completedCount = missions.filter((m) => m.completed).length;
  const unclaimedCount = missions.filter((m) => m.completed && !m.claimed).length;

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'health':
        return <Heart className="w-4 h-4 text-rose-400 fill-rose-500/30" />;
      case 'energy':
        return <Zap className="w-4 h-4 text-amber-400 fill-amber-500/30" />;
      case 'integrity':
        return <Shield className="w-4 h-4 text-cyan-400 fill-cyan-500/30" />;
      case 'clue':
        return <Radio className="w-4 h-4 text-sky-400 animate-pulse" />;
      default:
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
    }
  };

  const getCategoryBadge = (cat: MissionDifficulty) => {
    switch (cat) {
      case 'easy':
        return (
          <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
            ЛЕГКАЯ
          </span>
        );
      case 'medium':
        return (
          <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/40">
            СРЕДНЯЯ
          </span>
        );
      case 'hard':
        return (
          <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-500/40 flex items-center gap-1">
            <Flame className="w-3 h-3 text-rose-400" /> СЛОЖНАЯ
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/80 backdrop-blur-md pointer-events-auto select-none animate-fadeIn font-rajdhani">
      <div className="relative w-full max-w-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-cyan-500/50 rounded-2xl shadow-2xl p-5 md:p-7 text-slate-100 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3.5 mb-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/90 border border-cyan-400/50 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-cyan-300">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-cyan-400 uppercase tracking-widest font-mono-tech flex items-center gap-2">
                <span>ЖУРНАЛ СЮЖЕТНЫХ МИССИЙ</span>
                {unclaimedCount > 0 && (
                  <span className="bg-amber-500 text-slate-950 font-bold px-1.5 py-0.2 rounded-full text-[9px] animate-bounce">
                    +{unclaimedCount} НАГРАД
                  </span>
                )}
              </div>
              <h2 className="text-xl md:text-2xl font-bold font-orbitron text-white tracking-wider">
                ВЫЖИВАНИЕ НА ПЛАНЕТЕ
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-xs font-mono-tech bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
              <Award className="w-4 h-4 text-emerald-400" />
              <span>ВЫПОЛНЕНО:</span>
              <span className="text-emerald-400 font-bold font-orbitron">{completedCount}/{missions.length}</span>
            </div>

            <button
              onClick={() => {
                soundEngine.playUiClick();
                onClose();
              }}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 md:gap-2 mb-4 shrink-0 overflow-x-auto pb-1 text-xs font-mono-tech">
          <button
            onClick={() => {
              soundEngine.playUiClick();
              setSelectedTab('all');
            }}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
              selectedTab === 'all'
                ? 'bg-cyan-600 border-cyan-400 text-white font-bold shadow-md shadow-cyan-500/30'
                : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            ВСЕ ({missions.length})
          </button>

          <button
            onClick={() => {
              soundEngine.playUiClick();
              setSelectedTab('easy');
            }}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
              selectedTab === 'easy'
                ? 'bg-emerald-600 border-emerald-400 text-white font-bold shadow-md shadow-emerald-500/30'
                : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-emerald-300'
            }`}
          >
            ЛЕГКИЕ (3)
          </button>

          <button
            onClick={() => {
              soundEngine.playUiClick();
              setSelectedTab('medium');
            }}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
              selectedTab === 'medium'
                ? 'bg-amber-600 border-amber-400 text-white font-bold shadow-md shadow-amber-500/30'
                : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-amber-300'
            }`}
          >
            СРЕДНИЕ (3)
          </button>

          <button
            onClick={() => {
              soundEngine.playUiClick();
              setSelectedTab('hard');
            }}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer whitespace-nowrap ${
              selectedTab === 'hard'
                ? 'bg-rose-600 border-rose-400 text-white font-bold shadow-md shadow-rose-500/30'
                : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-rose-300'
            }`}
          >
            СЛОЖНЫЕ (3)
          </button>
        </div>

        {/* Missions Scrollable List */}
        <div className="space-y-3 overflow-y-auto pr-1 flex-1">
          {filteredMissions.map((m) => {
            const progress = Math.min(100, (m.currentCount / m.targetCount) * 100);

            return (
              <div
                key={m.id}
                className={`p-3.5 md:p-4 rounded-xl border transition-all ${
                  m.claimed
                    ? 'bg-slate-950/40 border-slate-800/80 opacity-75'
                    : m.completed
                    ? 'bg-gradient-to-r from-emerald-950/40 to-slate-900 border-emerald-500/50 shadow-lg shadow-emerald-950/30'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-2">
                  <div className="flex items-center gap-2">
                    {getCategoryBadge(m.category)}
                    <h4 className="font-bold font-orbitron text-sm md:text-base text-white tracking-wide">
                      {m.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 font-mono-tech text-xs">
                    <span className="text-slate-400">Прогресс:</span>
                    <span
                      className={`font-bold font-orbitron ${
                        m.completed ? 'text-emerald-400' : 'text-cyan-300'
                      }`}
                    >
                      {m.currentCount} / {m.targetCount}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-3 font-mono-tech">
                  {m.description}
                </p>

                {/* Progress Bar */}
                <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden mb-3 border border-slate-800">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      m.completed ? 'bg-emerald-400' : 'bg-cyan-400'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Reward Section & Action Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex items-center gap-2 text-slate-300 font-mono-tech">
                    {getRewardIcon(m.reward.type)}
                    <span className="text-slate-400">Награда:</span>
                    <span className="text-amber-300 font-semibold">{m.reward.title}</span>
                  </div>

                  {m.claimed ? (
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs font-mono-tech">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>НАГРАДА ПОЛУЧЕНА</span>
                    </div>
                  ) : m.completed ? (
                    <button
                      onClick={() => onClaimReward(m.id)}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold font-orbitron text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 animate-pulse"
                    >
                      <Gift className="w-4 h-4" />
                      <span>ЗАБРАТЬ НАГРАДУ</span>
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500 font-mono-tech">
                      В процессе выполнения...
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 text-center text-xs text-slate-400 font-mono-tech shrink-0 flex items-center justify-between">
          <span>Выполняйте сюжетные миссии для повышения живучести космонавта</span>
          <button
            onClick={onClose}
            className="text-cyan-400 hover:text-cyan-300 transition-colors font-semibold"
          >
            Закрыть [ESC]
          </button>
        </div>
      </div>
    </div>
  );
};
