import React, { useRef, useState, useEffect } from 'react';
import { ArrowUp, Hand, Scan, Flashlight, Crosshair } from 'lucide-react';
import { soundEngine } from '../audio/SoundEngine';

interface TouchControlsProps {
  onJoystickMove: (x: number, y: number) => void;
  onJumpPress: (pressed: boolean) => void;
  onInteractPress: () => void;
  onScanPress: () => void;
  onFlashlightToggle: () => void;
  onFirePress?: () => void;
  hasWeapon?: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onJoystickMove,
  onJumpPress,
  onInteractPress,
  onScanPress,
  onFlashlightToggle,
  onFirePress,
  hasWeapon,
}) => {
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const touchIdRef = useRef<number | null>(null);

  const maxRadius = 45;

  const handleTouchStart = (e: React.TouchEvent) => {
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    setIsDragging(true);
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
        setIsDragging(false);
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
    <div className="absolute inset-0 pointer-events-none z-30 flex justify-between items-end p-6 select-none md:hidden">
      {/* Virtual Joystick (Left) */}
      <div
        ref={joystickBaseRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="w-32 h-32 rounded-full bg-slate-900/60 border-2 border-cyan-500/40 backdrop-blur-sm flex items-center justify-center pointer-events-auto touch-none relative"
      >
        <div
          className="w-14 h-14 rounded-full bg-cyan-500/70 border border-cyan-300 shadow-lg shadow-cyan-500/30 transition-transform duration-75 flex items-center justify-center text-white"
          style={{
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
          }}
        >
          <div className="w-4 h-4 rounded-full bg-white/60" />
        </div>
      </div>

      {/* Action Buttons (Right) */}
      <div className="flex flex-col gap-3 items-end pointer-events-auto">
        <div className="flex gap-2">
          {hasWeapon && onFirePress && (
            <button
              onTouchStart={() => {
                onFirePress();
              }}
              className="w-14 h-14 rounded-full bg-red-950/80 border-2 border-red-500 text-red-300 flex items-center justify-center active:scale-95 shadow-lg active:bg-red-700 animate-pulse"
            >
              <Crosshair className="w-7 h-7" />
            </button>
          )}

          {/* Scan Button */}
          <button
            onTouchStart={() => {
              soundEngine.playUiClick();
              onScanPress();
            }}
            className="w-14 h-14 rounded-full bg-sky-950/80 border-2 border-sky-400 text-sky-300 flex items-center justify-center active:scale-95 shadow-lg active:bg-sky-700"
          >
            <Scan className="w-6 h-6" />
          </button>

          {/* Flashlight */}
          <button
            onTouchStart={() => {
              soundEngine.playUiClick();
              onFlashlightToggle();
            }}
            className="w-14 h-14 rounded-full bg-slate-900/80 border-2 border-amber-400 text-amber-300 flex items-center justify-center active:scale-95 shadow-lg"
          >
            <Flashlight className="w-6 h-6" />
          </button>
        </div>

        <div className="flex gap-2">
          {/* Interact Button */}
          <button
            onTouchStart={() => {
              soundEngine.playUiClick();
              onInteractPress();
            }}
            className="w-16 h-16 rounded-full bg-emerald-950/80 border-2 border-emerald-400 text-emerald-300 flex items-center justify-center active:scale-95 shadow-lg font-bold font-mono-tech"
          >
            <Hand className="w-7 h-7" />
          </button>

          {/* Jump / Jetpack Button */}
          <button
            onTouchStart={() => {
              onJumpPress(true);
            }}
            onTouchEnd={() => {
              onJumpPress(false);
            }}
            className="w-16 h-16 rounded-full bg-cyan-600/80 border-2 border-cyan-300 text-white flex items-center justify-center active:scale-95 shadow-lg shadow-cyan-500/30"
          >
            <ArrowUp className="w-8 h-8" />
          </button>
        </div>
      </div>
    </div>
  );
};
