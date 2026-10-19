import React from 'react';
import { PlanetDef, SuitStatus, ShipStatus } from '../types/game';
import {
  Compass,
  Battery,
  Shield,
  Activity,
  Radio,
  Flashlight,
  BookOpen,
  Volume2,
  VolumeX,
  AlertTriangle,
  Navigation,
  Heart,
  Crosshair,
  Zap,
} from 'lucide-react';
import { soundEngine } from '../audio/SoundEngine';

interface HUDProps {
  planet: PlanetDef;
  suit: SuitStatus;
  ship: ShipStatus;
  interactPrompt: string | null;
  onOpenCodex: () => void;
  onOpenShipTerminal: () => void;
  onToggleFlashlight: () => void;
  onTriggerScan: () => void;
  onFireWeapon?: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  homeworldCluesFound: number;
  animationMode?: 'auto' | 'always' | 'idle';
  onToggleAnimationMode?: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  planet,
  suit,
  ship,
  interactPrompt,
  onOpenCodex,
  onOpenShipTerminal,
  onToggleFlashlight,
  onTriggerScan,
  onFireWeapon,
  isMuted,
  onToggleMute,
  homeworldCluesFound,
  animationMode = 'auto',
  onToggleAnimationMode,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-10 flex flex-col justify-between p-4 md:p-6 text-slate-200">
      {/* Low Health / Combat Damage Warning Vignette */}
      {suit.health < 60 && (
        <div
          className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300 animate-pulse"
          style={{
            boxShadow: `inset 0 0 ${Math.max(60, 140 - suit.health * 1.5)}px rgba(220, 38, 38, ${Math.min(
              0.65,
              (60 - suit.health) / 60
            )})`,
          }}
        />
      )}

      {/* Top Bar: Planet Diagnostics & Compass */}
      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Planet Diagnostics Header */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-cyan-500/30 rounded-lg px-4 py-2.5 flex items-center gap-6 shadow-lg shadow-cyan-950/20">
          <div>
            <div className="text-[10px] tracking-widest text-cyan-400 font-mono-tech uppercase">
              Current Planetary Body
            </div>
            <div className="text-xl md:text-2xl font-bold font-orbitron tracking-wider text-white flex items-center gap-2">
              <span>{planet.name}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-cyan-900/50 text-cyan-300 border border-cyan-500/40">
                {planet.type}
              </span>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-5 text-xs font-mono-tech border-l border-slate-700/60 pl-5">
            <div>
              <span className="text-slate-400">TEMP:</span>{' '}
              <span className="text-amber-300 font-semibold">{planet.temperature}</span>
            </div>
            <div>
              <span className="text-slate-400">ATMOS:</span>{' '}
              <span className="text-emerald-300 font-semibold">{planet.atmosphere}</span>
            </div>
            <div>
              <span className="text-slate-400">GRAV:</span>{' '}
              <span className="text-sky-300 font-semibold">{planet.gravity}G</span>
            </div>
            <div>
              <span className="text-slate-400">THREAT:</span>{' '}
              <span
                className={`font-semibold ${
                  planet.dangerLevel === 'Low'
                    ? 'text-emerald-400'
                    : planet.dangerLevel === 'Moderate'
                    ? 'text-amber-400'
                    : 'text-red-400'
                }`}
              >
                {planet.dangerLevel.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Top Right: Mission Status & Quick Buttons */}
        <div className="flex items-center gap-3 self-end md:self-auto">
          {/* Homeworld Clues Counter */}
          <div className="bg-slate-900/80 backdrop-blur-md border border-amber-500/30 rounded-lg px-3 py-2 flex items-center gap-2 text-xs font-mono-tech">
            <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="text-amber-200">HOMEWORLD CLUES:</span>
            <span className="text-amber-400 font-bold font-orbitron">{homeworldCluesFound}/5</span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <button
              onClick={() => {
                soundEngine.playUiClick();
                onOpenCodex();
              }}
              title="Open Codex Database [TAB]"
              className="bg-slate-900/80 hover:bg-slate-800 border border-cyan-500/40 hover:border-cyan-400 p-2.5 rounded-lg transition-all text-cyan-300 flex items-center gap-1.5 text-xs font-semibold"
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden md:inline font-mono-tech">CODEX [TAB]</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playUiClick();
                onOpenShipTerminal();
              }}
              title="Ship Navigation & Systems"
              className="bg-slate-900/80 hover:bg-slate-800 border border-sky-500/40 hover:border-sky-400 p-2.5 rounded-lg transition-all text-sky-300 flex items-center gap-1.5 text-xs font-semibold"
            >
              <Navigation className="w-4 h-4" />
              <span className="hidden md:inline font-mono-tech">NAV SYSTEM</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playUiClick();
                onToggleFlashlight();
              }}
              title="Toggle Flashlight [L]"
              className={`p-2.5 rounded-lg border transition-all ${
                suit.flashlight
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                  : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              <Flashlight className="w-4 h-4" />
            </button>

            {onToggleAnimationMode && (
              <button
                onClick={() => {
                  soundEngine.playUiClick();
                  onToggleAnimationMode();
                }}
                title="Toggle Animation: Auto (on move) vs Continuous Run"
                className="bg-slate-900/80 hover:bg-slate-800 border border-emerald-500/40 hover:border-emerald-400 p-2.5 rounded-lg transition-all text-emerald-300 flex items-center gap-1.5 text-xs font-semibold"
              >
                <Activity className="w-4 h-4 text-emerald-400" />
                <span className="hidden lg:inline font-mono-tech">
                  ANIM: {animationMode === 'always' ? 'CONTINUOUS' : 'AUTO (MOVE)'}
                </span>
              </button>
            )}

            <button
              onClick={onToggleMute}
              title="Mute / Unmute Audio"
              className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-700 hover:border-slate-500 text-slate-300 transition-all"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Center Reticle & Dynamic Interaction Prompt */}
      <div className="flex flex-col items-center justify-center -mt-8">
        {/* Reticle Crosshair */}
        <div className="relative w-8 h-8 flex items-center justify-center pointer-events-none opacity-60">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          <div className="absolute w-6 h-6 border border-cyan-400/50 rounded-full" />
        </div>

        {/* Interaction Prompt Bar */}
        {interactPrompt && (
          <div className="mt-4 pointer-events-auto bg-cyan-950/90 border border-cyan-400 text-cyan-200 px-5 py-2 rounded-full font-mono-tech text-sm tracking-wider shadow-lg shadow-cyan-500/20 animate-bounce flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            {interactPrompt}
          </div>
        )}

        {/* Environmental Hazard Alert Banner */}
        {suit.hazardWarning && (
          <div className="mt-3 bg-red-950/80 border border-red-500/70 text-red-200 px-4 py-1.5 rounded text-xs font-mono-tech flex items-center gap-2 tracking-wide animate-pulse">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span>{suit.hazardWarning}</span>
          </div>
        )}
      </div>

      {/* Bottom Bar: Suit Vital Diagnostics & Ship Waypoint */}
      <div className="flex flex-col sm:flex-row items-end sm:items-center justify-between gap-4">
        {/* Suit Vitals */}
        <div className="bg-slate-900/85 backdrop-blur-md border border-cyan-500/30 rounded-xl p-3.5 shadow-xl w-full sm:w-80 font-mono-tech">
          <div className="text-[10px] text-cyan-400 uppercase tracking-widest mb-2 flex items-center justify-between">
            <span>EXO-SUIT TELEMETRY</span>
            <span className="text-emerald-400 font-bold">ONLINE</span>
          </div>

          <div className="space-y-2 text-xs">
            {/* Hearts (HP) Vital Containers */}
            <div className="bg-slate-950/70 p-2.5 rounded-lg border border-red-500/30 shadow-inner">
              <div className="flex justify-between items-center mb-1.5 text-[11px]">
                <span className="flex items-center gap-1.5 text-red-400 font-bold tracking-wider">
                  <Heart className="w-3.5 h-3.5 fill-red-500 text-red-400" />
                  VITAL HEARTS (HP)
                </span>
                <span className="font-bold text-red-300 font-mono-tech">
                  {Math.max(0, Math.round(suit.health ?? 100))} / 100
                </span>
              </div>
              <div className="flex items-center gap-2 pt-0.5">
                {[0, 1, 2, 3, 4].map((i) => {
                  const hp = suit.health ?? 100;
                  const isFull = hp >= (i + 1) * 20;
                  const isHalf = !isFull && hp >= i * 20 + 10;
                  return (
                    <div
                      key={i}
                      className="relative flex items-center justify-center transition-all duration-300"
                    >
                      <Heart
                        className={`w-5 h-5 transition-transform ${
                          isFull
                            ? 'fill-red-500 text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.7)] scale-105'
                            : isHalf
                            ? 'fill-red-500/50 text-red-400'
                            : 'fill-transparent text-slate-700'
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Equipped Weapon System */}
            <div className="bg-slate-950/70 p-2 rounded-lg border border-cyan-500/30">
              <div className="flex justify-between items-center mb-1 text-[11px]">
                <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
                  <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
                  WEAPON ARMAMENT
                </span>
                {suit.weapon ? (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/50">
                    DMG: {suit.weapon.damage}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500 font-mono-tech">UNARMED</span>
                )}
              </div>
              {suit.weapon ? (
                <div className="flex items-center justify-between">
                  <div className="text-xs text-white font-bold tracking-wide">
                    {suit.weapon.name}
                  </div>
                  <div className="text-[10px] text-cyan-400 font-mono-tech">
                    [CLICK / Q TO FIRE]
                  </div>
                </div>
              ) : (
                <div className="text-[10px] text-slate-400 font-mono-tech italic">
                  Explore planet ruins to discover military weapons
                </div>
              )}
            </div>

            {/* Energy */}
            <div>
              <div className="flex justify-between items-center mb-1 text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Battery className="w-3.5 h-3.5 text-cyan-400" /> SUIT ENERGY
                </span>
                <span className="font-semibold text-cyan-300">{Math.round(suit.energy)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-300"
                  style={{ width: `${suit.energy}%` }}
                />
              </div>
            </div>

            {/* Suit Integrity */}
            <div>
              <div className="flex justify-between items-center mb-1 text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" /> SUIT INTEGRITY
                </span>
                <span className="font-semibold text-emerald-300">{Math.round(suit.integrity)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                <div
                  className={`h-full transition-all duration-300 ${
                    suit.integrity > 40
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-400'
                      : 'bg-gradient-to-r from-rose-600 to-rose-400'
                  }`}
                  style={{ width: `${suit.integrity}%` }}
                />
              </div>
            </div>

            {/* Life Support (Oxygen / Scrubbers) */}
            <div>
              <div className="flex justify-between items-center mb-1 text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-sky-400" /> LIFE SUPPORT
                </span>
                <span className="font-semibold text-sky-300">{Math.round(suit.lifeSupport)}%</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-sky-600 to-sky-400 transition-all duration-300"
                  style={{ width: `${suit.lifeSupport}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Center / Right: Ship Proximity & Keybinds reminder */}
        <div className="hidden lg:flex flex-col items-end gap-1.5 text-[11px] font-mono-tech text-slate-400 bg-slate-900/60 backdrop-blur-sm p-3 rounded-lg border border-slate-800">
          <div>
            <span className="text-cyan-400 font-semibold">W A S D</span> — MOVE &nbsp;|&nbsp;
            <span className="text-cyan-400 font-semibold">SPACE</span> — JUMP / JETPACK
          </div>
          <div>
            <span className="text-cyan-400 font-semibold">[E]</span> — INTERACT &nbsp;|&nbsp;
            <span className="text-cyan-400 font-semibold">[F]</span> — SCANNER &nbsp;|&nbsp;
            <span className="text-cyan-400 font-semibold">[L]</span> — FLASHLIGHT
          </div>
          <div>
            <span className="text-red-400 font-semibold">[L-CLICK / Q]</span> — FIRE WEAPON
          </div>
          <div className="text-slate-500">MOUSE DRAG OR SCROLL TO ROTATE & ZOOM CAMERA</div>
        </div>

        {/* Mobile quick action buttons trigger */}
        <div className="sm:hidden pointer-events-auto flex items-center gap-2">
          {suit.weapon && onFireWeapon && (
            <button
              onClick={() => {
                onFireWeapon();
              }}
              className="bg-red-600 hover:bg-red-500 text-white font-mono-tech text-xs px-4 py-2.5 rounded-lg shadow-lg shadow-red-600/40 font-bold flex items-center gap-1.5"
            >
              <Crosshair className="w-4 h-4" />
              FIRE
            </button>
          )}
          <button
            onClick={() => {
              soundEngine.playUiClick();
              onTriggerScan();
            }}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-mono-tech text-xs px-4 py-2.5 rounded-lg shadow-lg shadow-cyan-600/30 font-bold"
          >
            SCAN [F]
          </button>
        </div>
      </div>

      {/* Critical Health Screen Edge Pulse */}
      {(suit.health ?? 100) < 40 && (
        <div className="absolute inset-0 pointer-events-none border-[14px] border-red-600/35 animate-pulse" />
      )}
    </div>
  );
};
