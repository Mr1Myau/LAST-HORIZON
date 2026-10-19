import React, { useState } from 'react';
import { CodexEntry } from '../types/game';
import { soundEngine } from '../audio/SoundEngine';
import {
  Globe,
  Bug,
  Landmark,
  Leaf,
  Boxes,
  Radio,
  Scroll,
  X,
  Lock,
} from 'lucide-react';

interface CodexModalProps {
  codex: Record<string, CodexEntry>;
  inventory: Record<string, { name: string; quantity: number; category: string }>;
  onClose: () => void;
}

export const CodexModal: React.FC<CodexModalProps> = ({ codex, inventory, onClose }) => {
  const [activeCategory, setActiveCategory] = useState<CodexEntry['category']>('planets');
  const [selectedEntryId, setSelectedEntryId] = useState<string | null>(null);

  const categories = [
    { id: 'planets', label: 'PLANETS', icon: Globe },
    { id: 'species', label: 'SPECIES', icon: Bug },
    { id: 'civilizations', label: 'CIVILIZATIONS', icon: Landmark },
    { id: 'flora', label: 'FLORA', icon: Leaf },
    { id: 'resources', label: 'RESOURCES', icon: Boxes },
    { id: 'signals', label: 'SIGNALS', icon: Radio },
    { id: 'story', label: 'STORY ARCHIVE', icon: Scroll },
  ] as const;

  const entries = Object.values(codex).filter((e) => e.category === activeCategory);
  const activeEntry = entries.find((e) => e.id === selectedEntryId) || entries[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/80 backdrop-blur-xl animate-fade-in font-mono-tech select-none">
      <div className="relative w-full max-w-5xl h-[88vh] flex flex-col bg-slate-900/95 border-2 border-cyan-500/40 rounded-2xl shadow-2xl shadow-cyan-500/10 overflow-hidden text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-cyan-500/30 px-6 py-4 bg-slate-950/70">
          <div>
            <div className="text-[11px] text-cyan-400 uppercase tracking-widest">
              COLONY EXPEDITION ARCHIVES
            </div>
            <div className="text-xl md:text-2xl font-bold font-orbitron tracking-wider text-white">
              LAST HORIZON — CODEX DATABASE
            </div>
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

        {/* Category Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-800 bg-slate-950/40 overflow-x-auto">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const active = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  soundEngine.playUiClick();
                  setActiveCategory(cat.id);
                  setSelectedEntryId(null);
                }}
                className={`px-3 py-2 rounded-lg flex items-center gap-2 text-xs font-semibold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body Grid: Left Index, Right Details */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Index List */}
          <div className="md:col-span-4 border-r border-slate-800 p-4 overflow-y-auto space-y-2">
            <div className="text-[11px] text-slate-400 uppercase tracking-wider mb-2">
              DISCOVERED RECORDS ({entries.filter((e) => e.discovered).length}/{entries.length})
            </div>

            {entries.map((item) => {
              const active = activeEntry?.id === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    soundEngine.playUiClick();
                    setSelectedEntryId(item.id);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    active
                      ? 'bg-cyan-950/60 border-cyan-400 text-white'
                      : 'bg-slate-900/40 border-slate-800 text-slate-300 hover:bg-slate-800/40 hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-semibold text-sm flex items-center gap-2">
                      {!item.discovered && <Lock className="w-3.5 h-3.5 text-slate-500" />}
                      <span>{item.discovered ? item.title : 'UNKNOWN DATA'}</span>
                    </div>
                    <div className="text-xs text-slate-400">
                      {item.discovered ? item.subtitle : 'Requires Surface Scan'}
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                      item.discovered
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.discovered ? 'ANALYZED' : 'LOCKED'}
                  </span>
                </div>
              );
            })}

            {/* Inventory Quick Glance when in Resources tab */}
            {activeCategory === 'resources' && (
              <div className="mt-6 pt-4 border-t border-slate-800">
                <div className="text-xs text-cyan-400 uppercase tracking-wider mb-3">
                  CARGO STORAGE CARRIED
                </div>
                <div className="space-y-2 text-xs">
                  {Object.values(inventory).map((res) => (
                    <div
                      key={res.name}
                      className="flex justify-between items-center bg-slate-950/60 p-2 rounded border border-slate-800"
                    >
                      <span className="text-slate-300">{res.name}</span>
                      <span className="font-orbitron font-bold text-cyan-400">{res.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Detailed View */}
          <div className="md:col-span-8 p-6 overflow-y-auto">
            {activeEntry ? (
              activeEntry.discovered ? (
                <div>
                  <div className="border-b border-slate-800 pb-4 mb-4">
                    <div className="text-xs text-cyan-400 uppercase tracking-widest">
                      {activeEntry.subtitle}
                    </div>
                    <h2 className="text-2xl md:text-3xl font-bold font-orbitron tracking-wider text-white">
                      {activeEntry.title}
                    </h2>
                  </div>

                  {/* Lore & Overview */}
                  <div className="prose prose-invert max-w-none text-slate-300 text-sm leading-relaxed mb-6">
                    <p>{activeEntry.lore}</p>
                  </div>

                  {/* Bullet Spec Points */}
                  {activeEntry.details && activeEntry.details.length > 0 && (
                    <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 mb-6">
                      <div className="text-xs text-cyan-400 font-semibold mb-2">
                        RECORDED OBSERVATIONS:
                      </div>
                      <ul className="space-y-1.5 text-xs text-slate-300 list-disc pl-4">
                        {activeEntry.details.map((detail, idx) => (
                          <li key={idx}>{detail}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Key Stats if available */}
                  {activeEntry.stats && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {Object.entries(activeEntry.stats).map(([k, v]) => (
                        <div
                          key={k}
                          className="bg-slate-950/40 p-3 rounded-lg border border-slate-800/80 text-xs"
                        >
                          <div className="text-slate-400 uppercase text-[10px]">{k}</div>
                          <div className="font-semibold text-white mt-0.5">{v}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                  <Lock className="w-12 h-12 text-slate-600 mb-4 animate-pulse" />
                  <h3 className="text-lg font-orbitron font-bold text-white mb-2">
                    ENCRYPTED DATA BLOCK
                  </h3>
                  <p className="text-sm max-w-md">
                    Target not yet scanned. Deploy your suit scanner with [F] near planetary features,
                    creatures, or ruins to unlock this telemetry entry.
                  </p>
                </div>
              )
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                Select an entry from the list
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
