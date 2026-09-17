import React, { useState, useRef, useEffect, useCallback } from 'react';
import { inputManager } from '../game/inputManager';

interface TouchControlsProps {
  visible: boolean;
  isLandscape?: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ visible, isLandscape = false }) => {
  if (!visible) return null;

  // Joystick state
  const [knobPos, setKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [activeDirections, setActiveDirections] = useState<{
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
  }>({ up: false, down: false, left: false, right: false });

  // Action buttons active states
  const [activeBtns, setActiveBtns] = useState<Record<string, boolean>>({});

  // Refs for touch tracking
  const joystickBaseRef = useRef<HTMLDivElement | null>(null);
  const joystickTouchIdRef = useRef<number | null>(null);
  const prevDirectionsRef = useRef<{ up: boolean; down: boolean; left: boolean; right: boolean }>({
    up: false,
    down: false,
    left: false,
    right: false,
  });

  const MAX_RADIUS = 46; // Max joystick knob displacement in pixels
  const DEADZONE = 12;   // Minimum displacement to trigger movement

  // Process coordinates to direction and knob visual
  const updateJoystick = useCallback((clientX: number, clientY: number) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    // Clamp knob position within maximum radius
    const clampedDist = Math.min(distance, MAX_RADIUS);
    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;
    setKnobPos({ x: knobX, y: knobY });

    if (distance < DEADZONE) {
      // Inside deadzone -> Neutral
      const neutral = { up: false, down: false, left: false, right: false };
      setActiveDirections(neutral);
      inputManager.setTouchInput(neutral);
      prevDirectionsRef.current = neutral;
      return;
    }

    // Convert angle to degrees [0, 360) where 0 is Right, 90 is Down, 180 is Left, 270 is Up
    const deg = (angle * (180 / Math.PI) + 360) % 360;

    // Smooth 8-way directional sector mapping:
    // Right: 337.5° - 22.5° | Down-Right: 22.5° - 67.5° | Down: 67.5° - 112.5° | Down-Left: 112.5° - 157.5°
    // Left: 157.5° - 202.5° | Up-Left: 202.5° - 247.5° | Up: 247.5° - 292.5° | Up-Right: 292.5° - 337.5°
    const isRight = deg <= 67.5 || deg >= 292.5;
    const isLeft = deg >= 112.5 && deg <= 247.5;
    const isDown = deg >= 22.5 && deg <= 157.5;
    const isUp = deg >= 202.5 && deg <= 337.5;

    const newDirs = { up: isUp, down: isDown, left: isLeft, right: isRight };

    // Haptic feedback on direction transition
    const prev = prevDirectionsRef.current || { up: false, down: false, left: false, right: false };
    if (
      newDirs.up !== prev.up ||
      newDirs.down !== prev.down ||
      newDirs.left !== prev.left ||
      newDirs.right !== prev.right
    ) {
      inputManager.vibrate(0, 15);
      prevDirectionsRef.current = newDirs;
    }

    setActiveDirections(newDirs);
    inputManager.setTouchInput(newDirs);
  }, []);

  const resetJoystick = useCallback(() => {
    joystickTouchIdRef.current = null;
    setIsDragging(false);
    setKnobPos({ x: 0, y: 0 });
    const neutral = { up: false, down: false, left: false, right: false };
    setActiveDirections(neutral);
    inputManager.setTouchInput(neutral);
    prevDirectionsRef.current = neutral;
  }, []);

  // Joystick Touch Events
  const handleJoystickTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (joystickTouchIdRef.current !== null) return; // already active
    const touch = e.changedTouches[0];
    joystickTouchIdRef.current = touch.identifier;
    setIsDragging(true);
    updateJoystick(touch.clientX, touch.clientY);
  };

  const handleJoystickTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (joystickTouchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joystickTouchIdRef.current) {
        updateJoystick(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleJoystickTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (joystickTouchIdRef.current === null) return;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === joystickTouchIdRef.current) {
        resetJoystick();
        break;
      }
    }
  };

  // Mouse fallback for desktop testing
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    updateJoystick(e.clientX, e.clientY);
  };

  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (isDragging && joystickTouchIdRef.current === null) {
        updateJoystick(e.clientX, e.clientY);
      }
    };
    const handleWindowMouseUp = () => {
      if (isDragging && joystickTouchIdRef.current === null) {
        resetJoystick();
      }
    };

    window.addEventListener('mousemove', handleWindowMouseMove);
    window.addEventListener('mouseup', handleWindowMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleWindowMouseMove);
      window.removeEventListener('mouseup', handleWindowMouseUp);
    };
  }, [isDragging, updateJoystick, resetJoystick]);

  // Clean up touches if component unmounts
  useEffect(() => {
    return () => {
      resetJoystick();
    };
  }, [resetJoystick]);

  // Action Button Touch Handling
  const handleBtnTouch = (btn: 'lp' | 'hp' | 'lk' | 'hk', active: boolean) => {
    setActiveBtns((prev) => ({ ...prev, [btn]: active }));
    inputManager.setTouchInput({ [btn]: active });
    if (active) {
      inputManager.vibrate(0, 30);
    }
  };

  // Special motion shortcut helper for mobile fighters:
  const triggerMotionShortcut = (type: 'qcf' | 'qcb' | 'bf') => {
    inputManager.vibrate(0, 40);
    if (type === 'qcf') {
      // Quarter Circle Forward (↓ ↘ →)
      inputManager.setTouchInput({ down: true, right: false, left: false });
      setTimeout(() => {
        inputManager.setTouchInput({ down: true, right: true });
        setTimeout(() => {
          inputManager.setTouchInput({ down: false, right: true });
          setTimeout(() => {
            inputManager.setTouchInput({ right: false });
          }, 60);
        }, 50);
      }, 50);
    } else if (type === 'qcb') {
      // Quarter Circle Back (↓ ↙ ←)
      inputManager.setTouchInput({ down: true, left: false, right: false });
      setTimeout(() => {
        inputManager.setTouchInput({ down: true, left: true });
        setTimeout(() => {
          inputManager.setTouchInput({ down: false, left: true });
          setTimeout(() => {
            inputManager.setTouchInput({ left: false });
          }, 60);
        }, 50);
      }, 50);
    } else if (type === 'bf') {
      // Charge Back, Forward (← →)
      inputManager.setTouchInput({ left: true });
      setTimeout(() => {
        inputManager.setTouchInput({ left: false, right: true });
        setTimeout(() => {
          inputManager.setTouchInput({ right: false });
        }, 80);
      }, 160);
    }
  };

  return (
    <div
      className={`select-none pointer-events-none transition-all ${
        isLandscape
          ? 'fixed inset-0 z-40 flex items-end justify-between p-3 sm:p-5'
          : 'w-full flex items-center justify-between px-3 py-2 pointer-events-auto bg-slate-950/80 border-t-2 border-slate-800'
      }`}
      style={{ touchAction: 'none' }}
    >
      {/* 1. FREE VIRTUAL ANALOG JOYSTICK (SERBEST ANALOG KONTROLCÜ) */}
      <div className="pointer-events-auto flex flex-col items-center gap-1">
        <div
          id="touch-analog-joystick"
          ref={joystickBaseRef}
          onTouchStart={handleJoystickTouchStart}
          onTouchMove={handleJoystickTouchMove}
          onTouchEnd={handleJoystickTouchEnd}
          onTouchCancel={handleJoystickTouchEnd}
          onMouseDown={handleMouseDown}
          className={`relative w-36 h-36 sm:w-40 sm:h-40 rounded-full border-4 shadow-2xl flex items-center justify-center cursor-pointer transition-colors ${
            isLandscape ? 'bg-slate-950/70 backdrop-blur-md border-amber-500/60' : 'bg-slate-900/90 border-slate-700'
          }`}
          style={{ touchAction: 'none' }}
        >
          {/* Compass Track Guidelines & Crosshairs */}
          <div className="absolute inset-2 rounded-full border border-dashed border-slate-700/60 pointer-events-none" />
          <div className="absolute w-full h-0.5 bg-slate-800/80 pointer-events-none" />
          <div className="absolute h-full w-0.5 bg-slate-800/80 pointer-events-none" />

          {/* Directional LED Indicators that light up when pushed */}
          {/* UP LED */}
          <div
            className={`absolute top-2 w-3 h-3 rounded-full transition-all duration-75 flex items-center justify-center text-[8px] font-arcade ${
              activeDirections.up
                ? 'bg-amber-400 text-slate-950 shadow-[0_0_10px_#f59e0b] scale-125'
                : 'bg-slate-800 text-slate-500'
            }`}
          >
            ▲
          </div>
          {/* DOWN LED */}
          <div
            className={`absolute bottom-2 w-3 h-3 rounded-full transition-all duration-75 flex items-center justify-center text-[8px] font-arcade ${
              activeDirections.down
                ? 'bg-amber-400 text-slate-950 shadow-[0_0_10px_#f59e0b] scale-125'
                : 'bg-slate-800 text-slate-500'
            }`}
          >
            ▼
          </div>
          {/* LEFT LED */}
          <div
            className={`absolute left-2 w-3 h-3 rounded-full transition-all duration-75 flex items-center justify-center text-[8px] font-arcade ${
              activeDirections.left
                ? 'bg-amber-400 text-slate-950 shadow-[0_0_10px_#f59e0b] scale-125'
                : 'bg-slate-800 text-slate-500'
            }`}
          >
            ◀
          </div>
          {/* RIGHT LED */}
          <div
            className={`absolute right-2 w-3 h-3 rounded-full transition-all duration-75 flex items-center justify-center text-[8px] font-arcade ${
              activeDirections.right
                ? 'bg-amber-400 text-slate-950 shadow-[0_0_10px_#f59e0b] scale-125'
                : 'bg-slate-800 text-slate-500'
            }`}
          >
            ▶
          </div>

          {/* Smooth Free Analog Joystick Knob */}
          <div
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-amber-200/90 shadow-xl flex items-center justify-center transition-transform ${
              isDragging
                ? 'bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 shadow-[0_0_16px_rgba(245,158,11,0.8)] scale-105'
                : 'bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 border-slate-500 duration-150'
            }`}
            style={{
              transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
              touchAction: 'none',
            }}
          >
            {/* Center Thumb Grip Texture */}
            <div className="w-6 h-6 rounded-full border border-amber-900/30 bg-black/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white/40" />
            </div>
          </div>
        </div>
        <span className="text-[9px] font-pixel text-slate-400 uppercase tracking-wider">
          {isLandscape ? 'ANALOG STICK' : 'SERBEST ANALOG'}
        </span>
      </div>

      {/* 2. SPECIAL MOVE SHORTCUT PILLS */}
      <div className="hidden sm:flex flex-col items-center gap-1 pointer-events-auto font-pixel text-[10px]">
        <span className="text-slate-400 text-center uppercase tracking-wider">Özel Komutlar</span>
        <div className="flex gap-2">
          <button
            id="btn-shortcut-qcf"
            type="button"
            onClick={() => triggerMotionShortcut('qcf')}
            className="px-2.5 py-1 rounded bg-slate-900/80 border border-slate-700 text-amber-300 active:bg-amber-500 active:text-black shadow transition-all active:scale-95"
          >
            ↓↘→ (QCF)
          </button>
          <button
            id="btn-shortcut-qcb"
            type="button"
            onClick={() => triggerMotionShortcut('qcb')}
            className="px-2.5 py-1 rounded bg-slate-900/80 border border-slate-700 text-amber-300 active:bg-amber-500 active:text-black shadow transition-all active:scale-95"
          >
            ↓↙← (QCB)
          </button>
          <button
            id="btn-shortcut-bf"
            type="button"
            onClick={() => triggerMotionShortcut('bf')}
            className="px-2.5 py-1 rounded bg-slate-900/80 border border-slate-700 text-amber-300 active:bg-amber-500 active:text-black shadow transition-all active:scale-95"
          >
            ← → (Charge)
          </button>
        </div>
      </div>

      {/* 3. ERGONOMIC ARCADE ACTION BUTTONS: LP, HP, LK, HK */}
      <div className="pointer-events-auto flex flex-col items-end gap-1.5">
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {/* LP (Light Punch) - Yellow */}
          <button
            id="btn-action-lp"
            type="button"
            onTouchStart={(e) => { e.preventDefault(); handleBtnTouch('lp', true); }}
            onTouchEnd={(e) => { e.preventDefault(); handleBtnTouch('lp', false); }}
            onTouchCancel={(e) => { e.preventDefault(); handleBtnTouch('lp', false); }}
            onMouseDown={() => handleBtnTouch('lp', true)}
            onMouseUp={() => handleBtnTouch('lp', false)}
            onMouseLeave={() => handleBtnTouch('lp', false)}
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-yellow-300 flex flex-col items-center justify-center font-arcade shadow-lg transition-transform active:scale-90 select-none ${
              activeBtns.lp ? 'bg-yellow-300 text-black shadow-inner scale-95' : 'bg-yellow-500 text-yellow-950'
            }`}
          >
            <span className="text-xs font-black">LP</span>
            <span className="text-[8px] font-pixel">Z.YUMRUK</span>
          </button>

          {/* HP (Heavy Punch) - Red */}
          <button
            id="btn-action-hp"
            type="button"
            onTouchStart={(e) => { e.preventDefault(); handleBtnTouch('hp', true); }}
            onTouchEnd={(e) => { e.preventDefault(); handleBtnTouch('hp', false); }}
            onTouchCancel={(e) => { e.preventDefault(); handleBtnTouch('hp', false); }}
            onMouseDown={() => handleBtnTouch('hp', true)}
            onMouseUp={() => handleBtnTouch('hp', false)}
            onMouseLeave={() => handleBtnTouch('hp', false)}
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-red-300 flex flex-col items-center justify-center font-arcade shadow-lg transition-transform active:scale-90 select-none ${
              activeBtns.hp ? 'bg-red-400 text-white shadow-inner scale-95' : 'bg-red-600 text-white'
            }`}
          >
            <span className="text-xs font-black">HP</span>
            <span className="text-[8px] font-pixel">G.YUMRUK</span>
          </button>

          {/* LK (Light Kick) - Green */}
          <button
            id="btn-action-lk"
            type="button"
            onTouchStart={(e) => { e.preventDefault(); handleBtnTouch('lk', true); }}
            onTouchEnd={(e) => { e.preventDefault(); handleBtnTouch('lk', false); }}
            onTouchCancel={(e) => { e.preventDefault(); handleBtnTouch('lk', false); }}
            onMouseDown={() => handleBtnTouch('lk', true)}
            onMouseUp={() => handleBtnTouch('lk', false)}
            onMouseLeave={() => handleBtnTouch('lk', false)}
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-emerald-300 flex flex-col items-center justify-center font-arcade shadow-lg transition-transform active:scale-90 select-none ${
              activeBtns.lk ? 'bg-emerald-300 text-black shadow-inner scale-95' : 'bg-emerald-600 text-white'
            }`}
          >
            <span className="text-xs font-black">LK</span>
            <span className="text-[8px] font-pixel">Z.TEKME</span>
          </button>

          {/* HK (Heavy Kick) - Blue */}
          <button
            id="btn-action-hk"
            type="button"
            onTouchStart={(e) => { e.preventDefault(); handleBtnTouch('hk', true); }}
            onTouchEnd={(e) => { e.preventDefault(); handleBtnTouch('hk', false); }}
            onTouchCancel={(e) => { e.preventDefault(); handleBtnTouch('hk', false); }}
            onMouseDown={() => handleBtnTouch('hk', true)}
            onMouseUp={() => handleBtnTouch('hk', false)}
            onMouseLeave={() => handleBtnTouch('hk', false)}
            className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full border-4 border-blue-300 flex flex-col items-center justify-center font-arcade shadow-lg transition-transform active:scale-90 select-none ${
              activeBtns.hk ? 'bg-blue-300 text-black shadow-inner scale-95' : 'bg-blue-600 text-white'
            }`}
          >
            <span className="text-xs font-black">HK</span>
            <span className="text-[8px] font-pixel">G.TEKME</span>
          </button>
        </div>

        {/* Mobile Landscape shortcut pills for phone users */}
        {isLandscape && (
          <div className="flex gap-1.5 font-pixel text-[9px]">
            <button
              type="button"
              onClick={() => triggerMotionShortcut('qcf')}
              className="px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700 text-amber-300 active:bg-amber-500 active:text-black"
            >
              ↓↘→ QCF
            </button>
            <button
              type="button"
              onClick={() => triggerMotionShortcut('qcb')}
              className="px-2 py-0.5 rounded bg-slate-900/80 border border-slate-700 text-amber-300 active:bg-amber-500 active:text-black"
            >
              ↓↙← QCB
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
