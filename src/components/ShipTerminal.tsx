import React, { useState } from 'react';
import { PlanetDef, ShipStatus } from '../types/game';
import { PLANETS } from '../game/PlanetData';
import { soundEngine } from '../audio/SoundEngine';
import {
  Rocket,
  Shield,
  Fuel,
  Compass,
  Thermometer,
  Wind,
  AlertOctagon,
  X,
  Wrench,
  Sparkles,
} from 'lucide-react';

interface ShipTerminalProps {
  currentPlanet: PlanetDef;
  ship: ShipStatus;
  inventory: Record<string, { quantity: number }>;
  onSelectPlanetForFlight: (planet: PlanetDef) => void;
  onRepairShip: () => void;
  onRefuelShip: () => void;
  onClose: () => void;
}

export const ShipTerminal: React.FC<ShipTerminalProps> = ({
  currentPlanet,
  ship,
  inventory,
  onSelectPlanetForFlight,
  onRepairShip,
  onRefuelShip,
  onClose,
}) => {
  const [selectedPlanetId, setSelectedPlanetId] = useState<string>(currentPlanet.id);
  const selectedPlanet = PLANETS[selectedPlanetId] || currentPlanet;
  const isCurrent = selectedPlanet.id === currentPlanet.id;

  const titaniumCount = inventory['titanium']?.quantity || 0;
  const crystalCount = inventory['energy_crystal']?.quantity || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/80 backdrop-blur-xl animate-fade-in font-mono-tech select-none">
      <div className="relative w-full max-w-5xl max-h-[92vh] flex flex-col bg-slate-900/95 border-2 border-sky-500/50 rounded-2xl shadow-2xl shadow-sky-500/10 overflow-hidden text-slate-100">
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-sky-500/30 px-6 py-4 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-950 border border-sky-500/40 text-sky-400">
              <Rocket className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="text-[11px] text-sky-400 uppercase tracking-widest">
                SCOUT VESSEL — NAV-COMPUTER v4.12
              </div>
              <div className="text-xl md:text-2xl font-bold font-orbitron tracking-wider text-white">
                STELLAR NAVIGATION CONSOLE
              </div>
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

        {/* Vessel Systems Status Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 py-3 bg-slate-950/40 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-slate-400">HULL INTEGRITY</div>
              <div className="text-emerald-300 font-bold font-orbitron">{Math.round(ship.integrity)}%</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Fuel className="w-5 h-5 text-sky-400" />
            <div>
              <div className="text-slate-400">HYPER-DRIVE FUEL</div>
              <div className="text-sky-300 font-bold font-orbitron">{Math.round(ship.fuel)}%</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Compass className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-slate-400">CURRENT ORBIT</div>
              <div className="text-amber-300 font-bold">{currentPlanet.name}</div>
            </div>
          </div>

          {/* Quick Ship Maintenance */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundEngine.playUiClick();
                onRepairShip();
              }}
              disabled={titaniumCount < 2 || ship.integrity >= 100}
              className="px-3 py-1.5 rounded bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 text-[11px] disabled:opacity-40 transition-all flex items-center gap-1"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>REPAIR (2 Titanium)</span>
            </button>

            <button
              onClick={() => {
                soundEngine.playUiClick();
                onRefuelShip();
              }}
              disabled={crystalCount < 2 || ship.fuel >= 100}
              className="px-3 py-1.5 rounded bg-sky-950/60 hover:bg-sky-900/80 border border-sky-500/40 text-sky-300 text-[11px] disabled:opacity-40 transition-all flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>REFUEL (2 Crystals)</span>
            </button>
          </div>
        </div>

        {/* Main Content: Left Planets List & Right Planet Detailed Specs */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Planet List */}
          <div className="md:col-span-5 border-r border-slate-800 p-4 overflow-y-auto space-y-2">
            <div className="text-xs text-sky-400 font-semibold tracking-wider mb-2">
              IDENTIFIED STELLAR BODIES (8/8)
            </div>

            {Object.values(PLANETS).map((p) => {
              const active = p.id === selectedPlanetId;
              const isHere = p.id === currentPlanet.id;

              return (
                <div
                  key={p.id}
                  onClick={() => {
                    soundEngine.playUiClick();
                    setSelectedPlanetId(p.id);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    active
                      ? 'bg-sky-950/60 border-sky-400 shadow-md shadow-sky-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center font-bold text-xs"
                      style={{ backgroundColor: p.skyColor }}
                    >
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: p.groundColor }}
                      />
                    </div>
                    <div>
                      <div className="font-orbitron font-bold text-sm text-white flex items-center gap-2">
                        {p.name}
                        {isHere && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-900/60 text-amber-300 border border-amber-500/30">
                            HERE
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">{p.type} Planet</div>
                    </div>
                  </div>

                  <div className="text-right text-xs">
                    <div
                      className={`font-semibold ${
                        p.dangerLevel === 'Low'
                          ? 'text-emerald-400'
                          : p.dangerLevel === 'Moderate'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {p.dangerLevel}
                    </div>
                    <div className="text-slate-500">{p.solarDistance} AU</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Planet Detailed View */}
          <div className="md:col-span-7 p-6 overflow-y-auto flex flex-col justify-between space-y-4">
            <div>
              {/* Name & Type */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-xs text-sky-400 uppercase tracking-widest">
                    TARGET SPECTRAL PROFILE
                  </div>
                  <h2 className="text-3xl font-bold font-orbitron tracking-wider text-white">
                    {selectedPlanet.name}
                  </h2>
                </div>
                <div className="text-right">
                  <span className="px-3 py-1 rounded bg-sky-950 text-sky-300 border border-sky-500/40 text-sm font-semibold">
                    {selectedPlanet.type} Biome
                  </span>
                </div>
              </div>

              {/* Description & Lore */}
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                {selectedPlanet.description}
              </p>

              {/* Physical Parameters Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950/60 p-4 rounded-xl border border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-amber-400" />
                  <div>
                    <span className="text-slate-400">SURFACE TEMP: </span>
                    <span className="text-white font-semibold">{selectedPlanet.temperature}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Wind className="w-4 h-4 text-emerald-400" />
                  <div>
                    <span className="text-slate-400">ATMOSPHERE: </span>
                    <span className="text-white font-semibold">{selectedPlanet.atmosphere}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-sky-400" />
                  <div>
                    <span className="text-slate-400">GRAVITY: </span>
                    <span className="text-white font-semibold">{selectedPlanet.gravity} G</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-rose-400" />
                  <div>
                    <span className="text-slate-400">THREAT LEVEL: </span>
                    <span
                      className={`font-semibold ${
                        selectedPlanet.dangerLevel === 'Low'
                          ? 'text-emerald-400'
                          : selectedPlanet.dangerLevel === 'Moderate'
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {selectedPlanet.dangerLevel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Primary Resources & Native Life */}
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-400">PRIMARY SURVEY DEPOSITS: </span>
                  <span className="text-sky-300">{selectedPlanet.primaryResources.join(', ')}</span>
                </div>
                <div>
                  <span className="text-slate-400">KNOWN BIOLOGICAL LIFE: </span>
                  <span className="text-emerald-300">
                    {[...selectedPlanet.nativeFlora, ...selectedPlanet.nativeFauna].join(', ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Launch / Travel Action */}
            <div className="border-t border-slate-800 pt-4 flex items-center justify-between">
              <div className="text-xs text-slate-400">
                FUEL REQUIREMENT: <span className="text-sky-300 font-bold">15%</span> &nbsp;|&nbsp;
                CURRENT FUEL: <span className="text-sky-300 font-bold">{Math.round(ship.fuel)}%</span>
              </div>

              {isCurrent ? (
                <button
                  onClick={() => {
                    soundEngine.playUiClick();
                    onClose();
                  }}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm transition-all border border-slate-700"
                >
                  DISEMBARK TO SURFACE
                </button>
              ) : (
                <button
                  onClick={() => {
                    soundEngine.playUiClick();
                    onSelectPlanetForFlight(selectedPlanet);
                  }}
                  disabled={ship.fuel < 15}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-500 hover:from-sky-500 hover:to-cyan-400 text-white font-bold font-orbitron tracking-wider text-sm shadow-lg shadow-sky-500/25 transition-all disabled:opacity-40 flex items-center gap-2"
                >
                  <Rocket className="w-4 h-4" />
                  <span>ENGAGE HYPER-DRIVE FLIGHT</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
