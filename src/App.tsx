/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CharacterId, StageId, GameMode, CpuDifficulty, FighterState } from './types/game';
import { FightingEngine } from './game/engine';
import { PixelRenderer } from './game/renderer';
import { inputManager } from './game/inputManager';
import { audio } from './audio/retroAudio';
import { ArcadeHeader } from './components/ArcadeHeader';
import { CharacterSelect } from './components/CharacterSelect';
import { FightHUD } from './components/FightHUD';
import { TouchControls } from './components/TouchControls';
import { MoveListModal } from './components/MoveListModal';
import { VictoryScreen } from './components/VictoryScreen';
import { Smartphone, Maximize2, Minimize2, BookOpen, Volume2, VolumeX, RotateCcw } from 'lucide-react';

export default function App() {
  // Game Setup States
  const [screen, setScreen] = useState<'select' | 'battle'>('select');
  const [p1Char, setP1Char] = useState<CharacterId>('kasumi');
  const [p2Char, setP2Char] = useState<CharacterId>('kenzo');
  const [stage, setStage] = useState<StageId>('park');
  const [mode, setMode] = useState<GameMode>('versus');
  const [difficulty, setDifficulty] = useState<CpuDifficulty>('normal');

  // UI & Settings States
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [crtEnabled, setCrtEnabled] = useState<boolean>(false);
  const [showTouch, setShowTouch] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  });
  const [gamepadCount, setGamepadCount] = useState<number>(0);
  const [isMoveListOpen, setIsMoveListOpen] = useState<boolean>(false);

  // Smartphone Orientation & Fullscreen States
  const [isLandscape, setIsLandscape] = useState<boolean>(() => {
    return typeof window !== 'undefined' ? window.innerWidth > window.innerHeight : true;
  });
  const [isMobileDevice, setIsMobileDevice] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 900;
  });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [hideMobileTip, setHideMobileTip] = useState<boolean>(false);

  // In-Game Live HUD States
  const [hudData, setHudData] = useState<{
    f1: FighterState | null;
    f2: FighterState | null;
    timer: number;
    currentRound: number;
  }>({
    f1: null,
    f2: null,
    timer: 99,
    currentRound: 1,
  });

  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [specialBanner, setSpecialBanner] = useState<{ text: string; side: 'left' | 'right' } | null>(null);
  const [matchWinner, setMatchWinner] = useState<number | null>(null);

  // Arcade Mode Ladder Progression (5 Fights Total: 4 Standard + 1 Final Boss)
  const [arcadeFightIndex, setArcadeFightIndex] = useState<number>(0);

  // References for Engine and Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<FightingEngine | null>(null);
  const rendererRef = useRef<PixelRenderer | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lastFrameTimeRef = useRef<number | null>(null);
  const accumulatorRef = useRef<number>(0);

  // Track orientation, screen size and fullscreen status
  useEffect(() => {
    const handleOrientationOrResize = () => {
      if (typeof window === 'undefined') return;
      const landscape = window.innerWidth > window.innerHeight;
      setIsLandscape(landscape);
      const mobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || window.innerWidth < 900;
      setIsMobileDevice(mobile);
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    window.addEventListener('resize', handleOrientationOrResize);
    window.addEventListener('orientationchange', handleOrientationOrResize);
    document.addEventListener('fullscreenchange', handleOrientationOrResize);

    return () => {
      window.removeEventListener('resize', handleOrientationOrResize);
      window.removeEventListener('orientationchange', handleOrientationOrResize);
      document.removeEventListener('fullscreenchange', handleOrientationOrResize);
    };
  }, []);

  // Fullscreen / Landscape Request Handler
  const toggleLandscapeFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
        if (screen.orientation && 'lock' in screen.orientation) {
          await (screen.orientation as any).lock('landscape').catch(() => {});
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Orientation lock / fullscreen toggle:', err);
    }
  };

  // Poll Gamepad connections
  useEffect(() => {
    const interval = setInterval(() => {
      setGamepadCount(inputManager.getGamepadCount());
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Arcade Match Opponent Schedule
  const getArcadeSchedule = useCallback((playerChar: CharacterId) => {
    const standardRoster: CharacterId[] = ['kasumi', 'kenzo', 'roxie', 'marcus'];
    const opponents = standardRoster.filter((c) => c !== playerChar);
    if (opponents.length < 4) {
      const fallback = standardRoster.find((c) => c === playerChar) || 'kenzo';
      opponents.push(fallback);
    }
    return [
      { opponent: opponents[0], stage: 'park' as StageId },
      { opponent: opponents[1], stage: 'alley' as StageId },
      { opponent: opponents[2], stage: 'gym' as StageId },
      { opponent: opponents[3], stage: 'ring' as StageId },
      { opponent: 'raizen' as CharacterId, stage: 'throne' as StageId },
    ];
  }, []);

  // Cleanup loop
  const stopGameLoop = () => {
    if (animFrameIdRef.current !== null) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    lastFrameTimeRef.current = null;
    accumulatorRef.current = 0;
  };

  // Main Game Loop Handler with Fixed 60 FPS Timestep & Dynamic Canvas Binding
  const startGameLoop = useCallback(() => {
    stopGameLoop();

    const loop = (currentTime: number) => {
      animFrameIdRef.current = requestAnimationFrame(loop);

      const canvas = canvasRef.current;
      if (!canvas) return;

      // Ensure PixelRenderer is created and tied to the currently mounted canvas in the DOM
      if (!rendererRef.current || rendererRef.current.getCanvas() !== canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          rendererRef.current = new PixelRenderer(ctx, 800, 450);
        } else {
          return;
        }
      }

      const engine = engineRef.current;
      const renderer = rendererRef.current;
      if (!engine || !renderer || engine.fighters.length < 2) return;

      // Delta-time calculations for accurate 60 FPS arcade speed
      if (lastFrameTimeRef.current === null) {
        lastFrameTimeRef.current = currentTime;
      }

      let delta = currentTime - lastFrameTimeRef.current;
      lastFrameTimeRef.current = currentTime;

      // Cap delta to prevent huge jumps when switching tabs
      if (delta > 100) delta = 100;
      accumulatorRef.current += delta;

      // Standard 60.0 Hz Arcade Tick (16.667 ms per frame)
      const FIXED_TIMESTEP = 1000 / 60;
      let updates = 0;
      while (accumulatorRef.current >= FIXED_TIMESTEP && updates < 4) {
        const p1Input = inputManager.getP1Input();
        const p2Input = inputManager.getP2Input();
        engine.update(p1Input, p2Input);
        accumulatorRef.current -= FIXED_TIMESTEP;
        updates++;
      }

      // Render on current monitor refresh rate
      renderer.render(
        engine.stage,
        engine.fighters,
        engine.projectiles,
        engine.particles,
        engine.shakeX,
        engine.shakeY
      );

      // Sync live HUD data
      setHudData({
        f1: { ...engine.fighters[0] },
        f2: { ...engine.fighters[1] },
        timer: engine.roundTimer,
        currentRound: engine.currentRound,
      });

      // Check Match Victory state
      if (engine.state === 'match_over' && engine.matchWinner !== null) {
        setMatchWinner(engine.matchWinner);
      }
    };

    animFrameIdRef.current = requestAnimationFrame(loop);
  }, []);

  // Initialize and Launch Battle Match
  const startMatch = useCallback(
    (
      p1: CharacterId,
      p2: CharacterId,
      stg: StageId,
      gMode: GameMode,
      diff: CpuDifficulty
    ) => {
      stopGameLoop();
      rendererRef.current = null;
      setMatchWinner(null);
      setScreen('battle');

      // Initialize Game Engine with event callbacks
      const engine = new FightingEngine({
        onSpecial: (fighterIndex, moveName) => {
          setSpecialBanner({
            text: moveName,
            side: fighterIndex === 0 ? 'left' : 'right',
          });
          setTimeout(() => {
            setSpecialBanner((curr) => (curr?.text === moveName ? null : curr));
          }, 1200);
        },
        onAnnounce: (text) => {
          setAnnouncement(text);
          setTimeout(() => {
            setAnnouncement((curr) => (curr === text ? null : curr));
          }, 1400);
        },
        onMatchOver: (winnerIndex) => {
          setMatchWinner(winnerIndex);
        },
      });

      engine.initMatch(p1, p2, stg, gMode, diff);
      engineRef.current = engine;

      // Start Frame Loop
      startGameLoop();
    },
    [startGameLoop]
  );

  // Hook to attach renderer when canvas mounts
  useEffect(() => {
    if (screen === 'battle' && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        rendererRef.current = new PixelRenderer(ctx, 800, 450);
      }
    }
  }, [screen]);

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      stopGameLoop();
      audio.stopMusic();
    };
  }, []);

  const handleStartMatchFromSelect = () => {
    if (mode === 'arcade') {
      setArcadeFightIndex(0);
      const schedule = getArcadeSchedule(p1Char);
      const firstFight = schedule[0];
      setP2Char(firstFight.opponent);
      setStage(firstFight.stage);
      startMatch(p1Char, firstFight.opponent, firstFight.stage, mode, difficulty);
    } else {
      startMatch(p1Char, p2Char, stage, mode, difficulty);
    }
  };

  const handleNextArcadeOpponent = () => {
    stopGameLoop();
    rendererRef.current = null;
    inputManager.clearInputs();
    setMatchWinner(null);
    if (engineRef.current) {
      engineRef.current = null;
    }
    const nextIndex = arcadeFightIndex + 1;
    setArcadeFightIndex(nextIndex);
    const schedule = getArcadeSchedule(p1Char);
    const fight = schedule[nextIndex] || schedule[schedule.length - 1];
    setP2Char(fight.opponent);
    setStage(fight.stage);
    startMatch(p1Char, fight.opponent, fight.stage, 'arcade', difficulty);
  };

  const handleAcceptChallenge = (nextDiff: CpuDifficulty) => {
    stopGameLoop();
    rendererRef.current = null;
    inputManager.clearInputs();
    setMatchWinner(null);
    if (engineRef.current) {
      engineRef.current = null;
    }
    setDifficulty(nextDiff);
    setArcadeFightIndex(0);
    const schedule = getArcadeSchedule(p1Char);
    const firstFight = schedule[0];
    setP2Char(firstFight.opponent);
    setStage(firstFight.stage);
    startMatch(p1Char, firstFight.opponent, firstFight.stage, 'arcade', nextDiff);
  };

  const handleRematch = () => {
    stopGameLoop();
    rendererRef.current = null;
    inputManager.clearInputs();
    setMatchWinner(null);
    if (engineRef.current) {
      engineRef.current = null;
    }
    startMatch(p1Char, p2Char, stage, mode, difficulty);
  };

  const handleBackToSelect = () => {
    stopGameLoop();
    rendererRef.current = null;
    inputManager.clearInputs();
    audio.stopMusic();
    setMatchWinner(null);
    if (engineRef.current) {
      engineRef.current = null;
    }
    setArcadeFightIndex(0);
    setScreen('select');
  };

  const toggleMute = () => {
    const muted = audio.toggleMute();
    setIsMuted(muted);
  };

  // Check if we are in mobile landscape view
  const isMobileLandscape = isMobileDevice && isLandscape && (typeof window !== 'undefined' ? window.innerHeight < 600 : false);

  return (
    <div className={`min-h-screen flex flex-col bg-[#080a0f] text-slate-100 relative ${crtEnabled ? 'crt-overlay' : ''}`}>
      {/* Mobile Portrait Rotation Suggestion Banner */}
      {isMobileDevice && !isLandscape && !hideMobileTip && (
        <div className="w-full bg-amber-950/95 border-b-2 border-amber-600/80 px-3 py-1.5 flex items-center justify-between text-amber-200 text-xs font-pixel z-40 shadow-lg">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-amber-400 rotate-90 animate-pulse flex-shrink-0" />
            <span className="leading-tight text-[11px] sm:text-xs">
              Rahat kontrol ve geniş arena için cihazınızı <strong>YATAY</strong> çevirin!
            </span>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              id="btn-banner-landscape"
              type="button"
              onClick={toggleLandscapeFullscreen}
              className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 font-bold font-arcade text-[9px] sm:text-[10px] hover:bg-amber-400 active:scale-95 transition-all cursor-pointer"
            >
              YATAY MOD ⛶
            </button>
            <button
              type="button"
              onClick={() => setHideMobileTip(true)}
              className="px-1.5 py-0.5 text-slate-400 hover:text-white text-xs"
              title="Kapat"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Universal Retro Arcade Header (Collapsed or hidden in Mobile Landscape Battle to maximize view) */}
      {(!isMobileLandscape || screen === 'select') && (
        <ArcadeHeader
          isMuted={isMuted}
          onToggleMute={toggleMute}
          crtEnabled={crtEnabled}
          onToggleCrt={() => setCrtEnabled(!crtEnabled)}
          showTouch={showTouch}
          onToggleTouch={() => setShowTouch(!showTouch)}
          gamepadCount={gamepadCount}
          onOpenMoveList={() => setIsMoveListOpen(true)}
          onBackToSelect={handleBackToSelect}
          inGame={screen === 'battle'}
          isLandscape={isLandscape}
          isFullscreen={isFullscreen}
          onToggleLandscape={toggleLandscapeFullscreen}
        />
      )}

      {/* MAIN VIEW AREA */}
      <main className={`flex-1 flex flex-col items-center relative ${
        isMobileLandscape && screen === 'battle'
          ? 'p-0 w-full h-screen overflow-hidden justify-center'
          : screen === 'battle'
          ? 'p-2 sm:p-4 justify-center overflow-hidden w-full'
          : 'p-2 sm:p-4 justify-start w-full min-h-0'
      }`}>
        {screen === 'select' ? (
          <CharacterSelect
            p1Char={p1Char}
            setP1Char={setP1Char}
            p2Char={p2Char}
            setP2Char={setP2Char}
            stage={stage}
            setStage={setStage}
            mode={mode}
            setMode={setMode}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            onStartMatch={handleStartMatchFromSelect}
          />
        ) : isMobileLandscape ? (
          /* MOBILE LANDSCAPE BATTLE ARENA (FULLSCREEN DOCKED CONTROLS) */
          <div className="fixed inset-0 bg-black z-20 flex items-center justify-center overflow-hidden">
            {/* Centered 16:9 Canvas filling screen height */}
            <div className="relative w-full h-full max-h-screen flex items-center justify-center">
              <canvas
                ref={canvasRef}
                width={800}
                height={450}
                className="max-w-full max-h-full aspect-[16/9] object-contain pixelated"
              />

              {/* 16-Bit Fight HUD Overlay */}
              {hudData.f1 && hudData.f2 && (
                <FightHUD
                  f1={hudData.f1}
                  f2={hudData.f2}
                  timer={hudData.timer}
                  currentRound={hudData.currentRound}
                  announcement={announcement}
                  specialBanner={specialBanner}
                />
              )}
            </div>

            {/* Mobile Landscape Floating Top-Right Controls */}
            <div className="absolute top-2 right-2 z-50 flex items-center gap-1.5 text-xs font-pixel pointer-events-auto">
              <button
                type="button"
                onClick={() => setIsMoveListOpen(true)}
                className="p-1.5 rounded-full bg-slate-900/80 border border-slate-700 text-indigo-300 backdrop-blur-sm active:scale-95"
                title="Komut Listesi"
              >
                <BookOpen className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={toggleMute}
                className="p-1.5 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 backdrop-blur-sm active:scale-95"
                title="Ses Aç/Kapat"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
              </button>
              <button
                type="button"
                onClick={toggleLandscapeFullscreen}
                className="p-1.5 rounded-full bg-slate-900/80 border border-amber-600 text-amber-300 backdrop-blur-sm active:scale-95"
                title="Tam Ekran Yatay Mod"
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={handleBackToSelect}
                className="p-1.5 rounded-full bg-rose-950/80 border border-rose-600 text-rose-300 backdrop-blur-sm active:scale-95"
                title="Seçim Ekranına Dön"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Free Virtual Analog Controls Overlay in Mobile Landscape */}
            {showTouch && (
              <TouchControls visible={showTouch} isLandscape={true} />
            )}
          </div>
        ) : (
          /* STANDARD DESKTOP / TABLET / PORTRAIT BATTLE ARENA */
          <div className="w-full max-w-5xl flex flex-col items-center">
            <div className="relative w-full aspect-[16/9] max-h-[75vh] bg-black rounded-lg overflow-hidden border-4 border-slate-700 shadow-2xl arcade-border">
              {/* HTML5 Canvas Pixel Game Surface */}
              <canvas
                ref={canvasRef}
                width={800}
                height={450}
                className="w-full h-full object-contain pixelated"
              />

              {/* 16-Bit Fight HUD Overlay */}
              {hudData.f1 && hudData.f2 && (
                <FightHUD
                  f1={hudData.f1}
                  f2={hudData.f2}
                  timer={hudData.timer}
                  currentRound={hudData.currentRound}
                  announcement={announcement}
                  specialBanner={specialBanner}
                />
              )}
            </div>

            {/* Training Mode Quick Config Bar */}
            {mode === 'training' && engineRef.current && (
              <div className="w-full mt-2 bg-slate-950 p-2 rounded border border-slate-800 flex flex-wrap items-center justify-between text-xs font-pixel gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 font-bold">DUMMY HAREKETİ:</span>
                  {(['stand', 'crouch', 'jump', 'block', 'cpu'] as const).map((dst) => (
                    <button
                      key={dst}
                      id={`training-dummy-${dst}`}
                      type="button"
                      onClick={() => {
                        if (engineRef.current) engineRef.current.dummyState = dst;
                      }}
                      className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 capitalize text-slate-300"
                    >
                      {dst}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    id="btn-training-infinite-hp"
                    type="button"
                    onClick={() => {
                      if (engineRef.current) {
                        engineRef.current.infiniteHealth = !engineRef.current.infiniteHealth;
                      }
                    }}
                    className="px-2 py-0.5 rounded bg-amber-600/80 text-white font-bold"
                  >
                    ÖLÜMSÜZLÜK (ON/OFF)
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Standard Docked Touch Screen Virtual Arcade Controls (Bottom) when NOT in mobile landscape */}
      {screen === 'battle' && showTouch && !isMobileLandscape && (
        <TouchControls visible={showTouch} isLandscape={false} />
      )}

      {/* Move List Modal */}
      <MoveListModal
        isOpen={isMoveListOpen}
        onClose={() => setIsMoveListOpen(false)}
        selectedCharId={p1Char}
      />

      {/* Match Victory / K.O. Screen */}
      {matchWinner !== null && (
        <VictoryScreen
          winnerIndex={matchWinner}
          p1Char={p1Char}
          p2Char={p2Char}
          mode={mode}
          difficulty={difficulty}
          isArcadeComplete={mode === 'arcade' && matchWinner === 0 && arcadeFightIndex >= 4}
          arcadeFightIndex={arcadeFightIndex}
          totalArcadeFights={5}
          onRematch={handleRematch}
          onNextOpponent={mode === 'arcade' && arcadeFightIndex < 4 ? handleNextArcadeOpponent : undefined}
          onAcceptChallenge={handleAcceptChallenge}
          onSelectScreen={handleBackToSelect}
        />
      )}
    </div>
  );
}
