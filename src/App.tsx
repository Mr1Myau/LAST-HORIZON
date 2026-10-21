import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameManager } from './game/GameManager';
import {
  PlanetDef,
  SuitStatus,
  ShipStatus,
  InteractableObject,
  CreatureEntity,
  GameState,
  CodexEntry,
  StoryEvent,
  StoryChoice,
} from './types/game';
import { PLANETS } from './game/PlanetData';
import { STORY_EVENTS } from './game/StoryEvents';
import { INITIAL_CODEX } from './game/DefaultCodex';
import { soundEngine } from './audio/SoundEngine';

import { HUD } from './components/HUD';
import { ScannerOverlay } from './components/ScannerOverlay';
import { ShipTerminal } from './components/ShipTerminal';
import { CodexModal } from './components/CodexModal';
import { EventModal } from './components/EventModal';
import { IntroCinematic } from './components/IntroCinematic';
import { TouchControls } from './components/TouchControls';
import { PauseMenu } from './components/PauseMenu';
import { PWAInstallModal } from './components/PWAInstallModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Sparkles, Trophy, RotateCcw } from 'lucide-react';

const SAVE_KEY = 'LAST_HORIZON_SAVE_V1';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameManagerRef = useRef<GameManager | null>(null);

  // Core Game State
  const [gameState, setGameState] = useState<GameState>('intro');
  const [currentPlanet, setCurrentPlanet] = useState<PlanetDef>(PLANETS.velora);
  const [suit, setSuit] = useState<SuitStatus>({
    health: 100,
    maxHealth: 100,
    energy: 100,
    integrity: 100,
    lifeSupport: 100,
    isScanning: false,
    hazardWarning: null,
    flashlight: false,
    weapon: null,
  });
  const [ship, setShip] = useState<ShipStatus>({
    integrity: 100,
    fuel: 85,
    warpDriveReady: true,
    cargoCapacity: 120,
  });

  // Inventory & Economy
  const [inventory, setInventory] = useState<
    Record<string, { name: string; quantity: number; category: string }>
  >({
    energy_crystal: { name: 'Energy Crystal', quantity: 3, category: 'energy' },
    titanium: { name: 'Titanium Ore', quantity: 2, category: 'mineral' },
    pure_water: { name: 'Oxygen Ice Canister', quantity: 1, category: 'oxygen' },
  });

  // Codex & Lore
  const [codex, setCodex] = useState<Record<string, CodexEntry>>(INITIAL_CODEX);
  const [homeworldCluesFound, setHomeworldCluesFound] = useState<number>(0);
  const [completedEvents, setCompletedEvents] = useState<string[]>([]);

  // UI Modals & Popups
  const [interactPrompt, setInteractPrompt] = useState<string | null>(null);
  const [scannedTarget, setScannedTarget] = useState<InteractableObject | CreatureEntity | null>(null);
  const [activeEvent, setActiveEvent] = useState<StoryEvent | null>(null);
  const [showShipTerminal, setShowShipTerminal] = useState(false);
  const [showCodex, setShowCodex] = useState(false);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showVictory, setShowVictory] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [animationMode, setAnimationMode] = useState<'auto' | 'always' | 'idle'>('auto');

  const toggleAnimationMode = useCallback(() => {
    setAnimationMode((prev) => {
      const next = prev === 'auto' ? 'always' : 'auto';
      if (gameManagerRef.current) {
        gameManagerRef.current.astronaut.setAnimationMode(next);
      }
      return next;
    });
  }, []);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  // Save System
  const saveGame = useCallback(() => {
    const data = {
      currentPlanetId: currentPlanet.id,
      suit,
      ship,
      inventory,
      codex,
      completedEvents,
      homeworldCluesFound,
      timestamp: Date.now(),
    };
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(data));
      showToast('EXPLORATION LOG PERSISTED TO LOCAL STORAGE');
    } catch {
      // Ignore quota error
    }
  }, [currentPlanet.id, suit, ship, inventory, codex, completedEvents, homeworldCluesFound, showToast]);

  const loadSave = useCallback(() => {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.currentPlanetId && PLANETS[data.currentPlanetId]) {
          setCurrentPlanet(PLANETS[data.currentPlanetId]);
        }
        if (data.suit) setSuit(data.suit);
        if (data.ship) setShip(data.ship);
        if (data.inventory) setInventory(data.inventory);
        if (data.codex) setCodex(data.codex);
        if (data.completedEvents) setCompletedEvents(data.completedEvents);
        if (typeof data.homeworldCluesFound === 'number') {
          setHomeworldCluesFound(data.homeworldCluesFound);
        }
        return true;
      }
    } catch {
      // Ignored
    }
    return false;
  }, []);

  const resetGame = useCallback(() => {
    try {
      localStorage.removeItem(SAVE_KEY);
    } catch {
      // Ignored
    }
    window.location.reload();
  }, []);

  // Initialize 3D Engine
  useEffect(() => {
    if (!containerRef.current) return;

    // Check existing save
    const hasSave = loadSave();

    const gm = new GameManager(containerRef.current, {
      onSuitUpdate: (updatedSuit) => {
        setSuit({ ...updatedSuit });
      },
      onShipUpdate: (updatedShip) => {
        setShip({ ...updatedShip });
      },
      onStateChange: (state) => {
        setGameState(state);
      },
      onInteractPrompt: (prompt) => {
        setInteractPrompt(prompt);
      },
      onScanResult: (target) => {
        setScannedTarget(target);
        if (target) {
          // Unlock matching codex entry!
          setCodex((prev) => {
            const next = { ...prev };
            // Auto match based on target name or type
            Object.keys(next).forEach((k) => {
              if (
                next[k].title.toLowerCase().includes(target.name.toLowerCase().slice(0, 5)) ||
                target.name.toLowerCase().includes(next[k].title.toLowerCase().slice(0, 5))
              ) {
                next[k] = { ...next[k], discovered: true };
              }
            });
            return next;
          });
        }
      },
      onTriggerEvent: (eventId) => {
        const ev = STORY_EVENTS.find((e) => e.id === eventId);
        if (ev && !completedEvents.includes(eventId)) {
          setActiveEvent(ev);
        }
      },
      onPlanetChange: (planet) => {
        setCurrentPlanet(planet);
        // Unlock planet in codex
        setCodex((prev) => {
          const next = { ...prev };
          const pKey = `codex_planet_${planet.id}`;
          if (next[pKey]) {
            next[pKey] = { ...next[pKey], discovered: true };
          }
          return next;
        });
      },
      onResourceCollected: (name, amount) => {
        showToast(`ACQUIRED +${amount} ${name.toUpperCase()}`);
        setInventory((prev) => {
          const key = name.toLowerCase().replace(/\s+/g, '_');
          const current = prev[key] || { name, quantity: 0, category: 'mineral' };
          return {
            ...prev,
            [key]: { ...current, quantity: current.quantity + amount },
          };
        });
      },
    });

    gameManagerRef.current = gm;

    if (!hasSave) {
      gm.startIntroCinematic();
    } else {
      gm.finishIntro();
    }

    // Global Key Listener for Tab (Codex) and Esc (Pause)
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Tab') {
        e.preventDefault();
        soundEngine.playUiClick();
        setShowCodex((prev) => !prev);
      }
      if (e.code === 'Escape') {
        soundEngine.playUiClick();
        setShowPauseMenu((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      window.removeEventListener('keydown', handleKey);
      gm.dispose();
    };
  }, [completedEvents, loadSave, showToast]);

  // Handle Event Choice selection
  const handleEventChoice = (choice: StoryChoice) => {
    if (!activeEvent) return;

    setCompletedEvents((prev) => [...prev, activeEvent.id]);

    // Apply effects
    if (choice.effect.suitDamage) {
      setSuit((prev) => ({
        ...prev,
        integrity: Math.min(100, Math.max(0, prev.integrity - (choice.effect.suitDamage || 0))),
      }));
    }

    if (choice.effect.suitEnergy) {
      setSuit((prev) => ({
        ...prev,
        energy: Math.min(100, Math.max(0, prev.energy + (choice.effect.suitEnergy || 0))),
      }));
    }

    if (choice.effect.shipFuel) {
      setShip((prev) => ({
        ...prev,
        fuel: Math.min(100, Math.max(0, prev.fuel + (choice.effect.shipFuel || 0))),
      }));
    }

    if (choice.effect.homeworldClueFound) {
      setHomeworldCluesFound((prev) => {
        const next = prev + 1;
        showToast(`CRITICAL LORE REVEALED: HOMEWORLD CLUE (${next}/5)`);
        if (next >= 5) {
          setTimeout(() => {
            setShowVictory(true);
          }, 3000);
        }
        return next;
      });
    }

    if (choice.effect.resources) {
      Object.entries(choice.effect.resources).forEach(([resKey, amt]) => {
        if (typeof amt === 'number') {
          setInventory((prev) => {
            const item = prev[resKey] || { name: resKey, quantity: 0, category: 'mineral' };
            return {
              ...prev,
              [resKey]: { ...item, quantity: item.quantity + amt },
            };
          });
        }
      });
    }
  };

  // Launch flight to another planet
  const handleFlightSelect = (targetPlanet: PlanetDef) => {
    setShowShipTerminal(false);
    if (gameManagerRef.current) {
      const ok = gameManagerRef.current.startFlightCinematic(targetPlanet);
      if (ok) {
        showToast(`WARP DRIVE ENGAGED: DESTINATION ${targetPlanet.name}`);
      }
    }
  };

  // Ship maintenance
  const handleRepairShip = () => {
    if ((inventory['titanium']?.quantity || 0) >= 2) {
      setInventory((prev) => ({
        ...prev,
        titanium: { ...prev.titanium, quantity: prev.titanium.quantity - 2 },
      }));
      setShip((prev) => ({ ...prev, integrity: Math.min(100, prev.integrity + 30) }));
      showToast('SHIP HULL REPAIRED (+30% INTEGRITY)');
    }
  };

  const handleRefuelShip = () => {
    if ((inventory['energy_crystal']?.quantity || 0) >= 2) {
      setInventory((prev) => ({
        ...prev,
        energy_crystal: { ...prev.energy_crystal, quantity: prev.energy_crystal.quantity - 2 },
      }));
      setShip((prev) => ({ ...prev, fuel: Math.min(100, prev.fuel + 35) }));
      showToast('ION PROPULSION RECHARGED (+35% HYPER-FUEL)');
    }
  };

  // Virtual Joystick & Touch actions
  const handleJoystickMove = (x: number, y: number) => {
    if (gameManagerRef.current) {
      gameManagerRef.current.joystickVector = { x, y };
    }
  };

  const handleJumpPress = (pressed: boolean) => {
    if (gameManagerRef.current) {
      gameManagerRef.current.mobileActions.jump = pressed;
    }
  };

  const handleInteractPress = () => {
    if (gameManagerRef.current) {
      gameManagerRef.current.triggerInteraction();
    }
  };

  const handleScanPress = () => {
    if (gameManagerRef.current) {
      gameManagerRef.current.triggerScanner();
    }
  };

  const handleFlashlightToggle = () => {
    if (gameManagerRef.current) {
      gameManagerRef.current.toggleFlashlight();
    }
  };

  const handleFireWeapon = useCallback(() => {
    if (gameManagerRef.current) {
      gameManagerRef.current.fireWeapon();
    }
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-crosshair" />

      {/* Atmospheric Scanlines & Vignette */}
      <div className="absolute inset-0 hud-scanline pointer-events-none z-10 opacity-30" />
      <div className="absolute inset-0 hud-vignette pointer-events-none z-10" />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-fade-in">
          <div className="bg-slate-900/95 border-2 border-cyan-400 text-cyan-200 px-6 py-2.5 rounded-full font-mono-tech text-xs tracking-wider shadow-xl shadow-cyan-500/25 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* 1. Opening Intro Cinematic */}
      {gameState === 'intro' && (
        <IntroCinematic
          onComplete={() => {
            if (gameManagerRef.current) {
              gameManagerRef.current.finishIntro();
            }
          }}
        />
      )}

      {/* 2. In-Game HUD (active during surface gameplay) */}
      {gameState === 'planet_surface' && (
        <>
          <HUD
            planet={currentPlanet}
            suit={suit}
            ship={ship}
            interactPrompt={interactPrompt}
            onOpenCodex={() => setShowCodex(true)}
            onOpenShipTerminal={() => {
              if (gameManagerRef.current) {
                gameManagerRef.current.openSpaceNavigation();
              }
              setShowShipTerminal(true);
            }}
            onToggleFlashlight={handleFlashlightToggle}
            onTriggerScan={handleScanPress}
            onFireWeapon={handleFireWeapon}
            isMuted={isMuted}
            onToggleMute={() => {
              const next = !isMuted;
              setIsMuted(next);
              soundEngine.setMuted(next);
            }}
            homeworldCluesFound={homeworldCluesFound}
            animationMode={animationMode}
            onToggleAnimationMode={toggleAnimationMode}
            onOpenInstallModal={() => setShowInstallModal(true)}
          />

          {/* Mobile Touch Virtual Controls */}
          <TouchControls
            onJoystickMove={handleJoystickMove}
            onJumpPress={handleJumpPress}
            onInteractPress={handleInteractPress}
            onScanPress={handleScanPress}
            onFlashlightToggle={handleFlashlightToggle}
            onFirePress={handleFireWeapon}
            hasWeapon={Boolean(suit.weapon)}
          />
        </>
      )}

      {/* 3. Scanner Output Card */}
      {scannedTarget && (
        <ScannerOverlay target={scannedTarget} onClose={() => setScannedTarget(null)} />
      )}

      {/* 4. Spaceship Navigation & Systems Terminal */}
      {(showShipTerminal || gameState === 'space_nav') && (
        <ShipTerminal
          currentPlanet={currentPlanet}
          ship={ship}
          inventory={inventory}
          onSelectPlanetForFlight={handleFlightSelect}
          onRepairShip={handleRepairShip}
          onRefuelShip={handleRefuelShip}
          onClose={() => {
            setShowShipTerminal(false);
            if (gameManagerRef.current && gameState === 'space_nav') {
              gameManagerRef.current.exitSpaceNavigation();
            }
          }}
        />
      )}

      {/* 5. Codex Database Modal */}
      {showCodex && (
        <CodexModal
          codex={codex}
          inventory={inventory}
          onClose={() => setShowCodex(false)}
        />
      )}

      {/* 6. Narrative Story Dilemma Modal */}
      {activeEvent && (
        <EventModal
          event={activeEvent}
          onChoiceSelected={handleEventChoice}
          onDismiss={() => setActiveEvent(null)}
        />
      )}

      {/* 7. System Pause Menu */}
      {showPauseMenu && (
        <PauseMenu
          onClose={() => setShowPauseMenu(false)}
          onResetGame={resetGame}
          onSaveGame={() => {
            saveGame();
            setShowPauseMenu(false);
          }}
          isMuted={isMuted}
          onToggleMute={() => {
            const next = !isMuted;
            setIsMuted(next);
            soundEngine.setMuted(next);
          }}
          onOpenInstallModal={() => setShowInstallModal(true)}
        />
      )}

      {/* PWA Mobile App Installation Modal */}
      <PWAInstallModal
        isOpen={showInstallModal}
        onClose={() => setShowInstallModal(false)}
      />

      {/* Offline Status Connectivity Badge */}
      <OfflineIndicator />

      {/* 8. Cinematic Hyperspace HUD Banner */}
      {gameState === 'cinematic_flight' && (
        <div className="absolute inset-0 pointer-events-none z-30 flex flex-col items-center justify-center p-8 bg-black/30 text-center font-mono-tech select-none">
          <div className="text-sm tracking-widest text-sky-400 uppercase animate-pulse mb-2">
            [SUBLIGHT ACCELERATION ENGAGED]
          </div>
          <div className="text-3xl md:text-5xl font-orbitron font-black tracking-widest text-white drop-shadow-[0_0_20px_rgba(56,189,248,0.7)]">
            HYPERSPACE TRANSIT
          </div>
          <div className="text-xs text-slate-400 mt-4 tracking-wider">
            SYNCHRONIZING GRAVITATIONAL ANCHOR & ATMOSPHERIC ENTRY VECTOR...
          </div>
        </div>
      )}

      {/* 9. Sanctuary Homeworld Discovered Victory Modal */}
      {showVictory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/90 backdrop-blur-2xl animate-fade-in font-mono-tech select-none">
          <div className="max-w-xl w-full bg-slate-900 border-2 border-emerald-400 rounded-3xl p-8 text-center text-slate-100 shadow-2xl shadow-emerald-500/20">
            <div className="w-16 h-16 rounded-full bg-emerald-950 border-2 border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <Trophy className="w-8 h-8" />
            </div>

            <div className="text-xs text-emerald-400 uppercase tracking-widest mb-1">
              MISSION OBJECTIVE FULFILLED
            </div>
            <h2 className="text-3xl font-bold font-orbitron tracking-wider text-white mb-4">
              A NEW HOME FOUND
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Through the desolate cosmic void, across volcanic peaks, toxic seas, and forgotten ruins,
              you gathered all 5 Homeworld Clues. You decoded the encrypted transponder frequency of
              Convoy Seven and verified an idyllic, fertile world ready to cradle the dawn of your civilization.
              <br /><br />
              Your people are not gone. The horizon is no longer the end — it is a beginning.
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowVictory(false)}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-orbitron font-bold text-sm transition-all shadow-lg"
              >
                CONTINUE EXPLORING
              </button>

              <button
                onClick={resetGame}
                className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-all flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>NEW EXPEDITION</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
