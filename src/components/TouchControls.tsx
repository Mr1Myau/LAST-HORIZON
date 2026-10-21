import React, { useRef, useState } from 'react';
import { ArrowUp, Hand, Scan, Flashlight, Crosshair, Sparkles, Target } from 'lucide-react';
import { soundEngine } from '../audio/SoundEngine';

interface TouchControlsProps {
  onJoystickMove: (x: number, y: number) => void;
  onJumpPress: (pressed: boolean) => void;
  onInteractPress: () => void;
  onScanPress: () => void;
  onFlashlightToggle: () => void;
  onFirePress?: () => void;
  hasWeapon?: boolean;
  onOpenMissions?: () => void;
  unclaimedMissionsCount?: number;
  onPetCompanion?: () => void;
  isCompanionNearby?: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onJoystickMove,
  onJumpPress,
  onInteractPress,
  onScanPress,
  onFlashlightToggle,
  onFirePress,
  hasWeapon,
  onOpenMissions,
  unclaimedMissionsCount = 0,
  onPetCompanion,
  isCompanionNearby,
}) => {
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const touchIdRef = useRef<number | null>(null);

  // Compact joystick radius suitable for smartphones
  const maxRadius = 36;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    updateJoystick(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        updateJoystick(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setKnobPos({ x: 0, y: 0 });
        onJoystickMove(0, 0);
        break;
      }
    }
  };

  const updateJoystick = (clientX: number, clientY: number) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.sqrt(dx * dx + dy * dy);

    let kx = dx;
    let ky = dy;

    if (dist > maxRadius) {
      kx = (dx / dist) * maxRadius;
      ky = (dy / dist) * maxRadius;
    }

    setKnobPos({ x: kx, y: ky });
    onJoystickMove(kx / maxRadius, ky / maxRadius);
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex justify-between items-end p-3 sm:p-5 select-none md:hidden">
      {/* Virtual Joystick (Left) - Compact 88px */}
      <div
        ref={joystickBaseRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="w-22 h-22 sm:w-24 sm:h-24 rounded-full bg-slate-900/50 border border-cyan-500/40 backdrop-blur-sm flex items-center justify-center pointer-events-auto touch-none relative shadow-lg shadow-cyan-950/40"
      >
        <div
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-cyan-500/80 border border-cyan-300 shadow-md shadow-cyan-500/30 transition-transform duration-75 flex items-center justify-center text-white"
          style={{
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          }}
        >
          <div className="w-3 h-3 rounded-full bg-white/70" />
        </div>
      </div>

      {/* Action Buttons (Right) - Streamlined, non-blocking */}
      <div className="flex flex-col gap-2 items-end pointer-events-auto">
        {/* Top Action Row (Missions, Pet, Weapon) */}
        <div className="flex items-center gap-1.5">
          {/* Mission Log Quick Button */}
          {onOpenMissions && (
            <button
              onTouchStart={() => {
                soundEngine.playUiClick();
                onOpenMissions();
              }}
              title="Миссии"
              className="relative w-10 h-10 rounded-full bg-slate-900/70 border border-amber-400/70 text-amber-300 flex items-center justify-center active:scale-95 shadow-md backdrop-blur-sm"
            >
              <Target className="w-5 h-5 text-amber-400" />
              {unclaimedMissionsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold font-mono-tech flex items-center justify-center animate-bounce">
                  {unclaimedMissionsCount}
                </span>
              )}
            </button>
          )}

          {/* Pet Companion Interaction Button */}
          {isCompanionNearby && onPetCompanion && (
            <button
              onTouchStart={() => {
                onPetCompanion();
              }}
              title="Погладить питомца"
              className="w-10 h-10 rounded-full bg-sky-900/80 border border-sky-400 text-sky-200 flex items-center justify-center active:scale-95 shadow-md shadow-sky-500/30 animate-pulse backdrop-blur-sm"
            >
              <Sparkles className="w-5 h-5 text-sky-300" />
            </button>
          )}

          {/* Weapon Fire Button */}
          {hasWeapon && onFirePress && (
            <button
              onTouchStart={() => {
                onFirePress();
              }}
              title="Огонь"
              className="w-11 h-11 rounded-full bg-red-950/80 border border-red-500 text-red-300 flex items-center justify-center active:scale-95 shadow-lg shadow-red-500/30 active:bg-red-700 animate-pulse"
            >
              <Crosshair className="w-5 h-5" />
            </button>
          )}

          {/* Flashlight */}
          <button
            onTouchStart={() => {
              soundEngine.playUiClick();
              onFlashlightToggle();
            }}
            title="Фонарь"
            className="w-10 h-10 rounded-full bg-slate-900/70 border border-amber-400/50 text-amber-300 flex items-center justify-center active:scale-95 shadow-md backdrop-blur-sm"
          >
            <Flashlight className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Action Row (Scan, Interact, Jump) */}
        <div className="flex items-center gap-2">
          {/* Scan Button */}
          <button
            onTouchStart={() => {
              soundEngine.playUiClick();
              onScanPress();
            }}
            title="Сканер [F]"
            className="w-11 h-11 rounded-full bg-sky-950/80 border border-sky-400/70 text-sky-300 flex items-center justify-center active:scale-95 shadow-md active:bg-sky-700 backdrop-blur-sm"
          >
            <Scan className="w-5 h-5" />
          </button>

          {/* Interact Button [E] */}
          <button
            onTouchStart={() => {
              soundEngine.playUiClick();
              onInteractPress();
            }}
            title="Взаимодействие [E]"
            className="w-12 h-12 rounded-full bg-emerald-950/85 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center active:scale-95 shadow-lg active:bg-emerald-700 font-bold backdrop-blur-sm"
          >
            <Hand className="w-6 h-6" />
          </button>

          {/* Jump / Jetpack Button [SPACE] */}
          <button
            onTouchStart={() => {
              onJumpPress(true);
            }}
            onTouchEnd={() => {
              onJumpPress(false);
            }}
            title="Прыжок / Джетпак"
            className="w-12 h-12 rounded-full bg-cyan-600/85 border-2 border-cyan-300 text-white flex items-center justify-center active:scale-95 shadow-lg shadow-cyan-500/30 active:bg-cyan-500 backdrop-blur-sm"
          >
            <ArrowUp className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
