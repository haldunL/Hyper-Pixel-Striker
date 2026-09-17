import React, { useEffect, useRef } from 'react';
import { CharacterId, StageId, GameMode, CpuDifficulty } from '../types/game';
import { CHARACTERS, STAGES } from '../data/characters';
import { PixelRenderer } from '../game/renderer';
import { audio } from '../audio/retroAudio';
import {
  renderKasumiSprite,
  renderRoxieSprite,
  renderKenzoSprite,
  renderMarcusSprite,
} from '../game/fighterSprites';

interface CharacterSelectProps {
  p1Char: CharacterId;
  setP1Char: (id: CharacterId) => void;
  p2Char: CharacterId;
  setP2Char: (id: CharacterId) => void;
  stage: StageId;
  setStage: (stage: StageId) => void;
  mode: GameMode;
  setMode: (mode: GameMode) => void;
  difficulty: CpuDifficulty;
  setDifficulty: (diff: CpuDifficulty) => void;
  onStartMatch: () => void;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({
  p1Char,
  setP1Char,
  p2Char,
  setP2Char,
  stage,
  setStage,
  mode,
  setMode,
  difficulty,
  setDifficulty,
  onStartMatch,
}) => {
  // Mini pixel canvas for each character card preview
  const canvasRefs = {
    kasumi: useRef<HTMLCanvasElement>(null),
    roxie: useRef<HTMLCanvasElement>(null),
    kenzo: useRef<HTMLCanvasElement>(null),
    marcus: useRef<HTMLCanvasElement>(null),
  };

  const stageCanvasRefs = {
    park: useRef<HTMLCanvasElement>(null),
    alley: useRef<HTMLCanvasElement>(null),
    gym: useRef<HTMLCanvasElement>(null),
    ring: useRef<HTMLCanvasElement>(null),
  };

  useEffect(() => {
    let animId: number;
    let animTimer = 0;

    const charList: CharacterId[] = ['kasumi', 'roxie', 'kenzo', 'marcus'];

    const renderLoop = () => {
      animTimer += 0.05;

      charList.forEach((cid) => {
        const canvas = canvasRefs[cid].current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.imageSmoothingEnabled = false;

        const w = canvas.width;
        const h = canvas.height;

        ctx.clearRect(0, 0, w, h);

        // Character card theme background
        const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
        bgGrad.addColorStop(0, cid === 'kasumi' ? '#1e3a8a' : cid === 'roxie' ? '#881337' : cid === 'kenzo' ? '#854d0e' : '#7f1d1d');
        bgGrad.addColorStop(0.7, '#0f172a');
        bgGrad.addColorStop(1, '#050508');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, w, h);

        // Ground stage floor line
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, h - 22, w, 22);
        ctx.fillStyle = '#334155';
        ctx.fillRect(0, h - 22, w, 2);

        // Ground shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
        ctx.beginPath();
        ctx.ellipse(w / 2, h - 16, 36, 9, 0, 0, Math.PI * 2);
        ctx.fill();

        // Draw 16-bit SNES Fighter Sprite scaled to fit comfortably
        ctx.save();
        ctx.translate(w / 2, h - 18);
        ctx.scale(0.74, 0.74);

        const dummyFighter = {
          playerIndex: 0 as const,
          charId: cid,
          x: 0,
          y: 0,
          vx: 0,
          vy: 0,
          facingRight: cid === 'kasumi' || cid === 'roxie',
          health: 100,
          displayHealth: 100,
          isGrounded: true,
          isCrouching: false,
          isBlocking: false,
          state: 'idle' as const,
          currentAttack: null,
          attackFrame: 0,
          attackDuration: 0,
          hitConnected: false,
          hitstun: 0,
          blockstun: 0,
          knockdownTimer: 0,
          roundsWon: 0,
          comboCount: 0,
          comboDamage: 0,
          recentInputs: [],
          chargeBackTimer: 0,
        };

        if (cid === 'kasumi') renderKasumiSprite(ctx, dummyFighter, animTimer);
        else if (cid === 'roxie') renderRoxieSprite(ctx, dummyFighter, animTimer);
        else if (cid === 'kenzo') renderKenzoSprite(ctx, dummyFighter, animTimer);
        else if (cid === 'marcus') renderMarcusSprite(ctx, dummyFighter, animTimer);

        ctx.restore();
      });

      animId = requestAnimationFrame(renderLoop);
    };

    renderLoop();

    // Render mini stage thumbnails
    const stageList: StageId[] = ['park', 'alley', 'gym', 'ring'];
    stageList.forEach((sid) => {
      const canvas = stageCanvasRefs[sid].current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.imageSmoothingEnabled = false;

      const renderer = new PixelRenderer(ctx, 180, 80);
      renderer.setDimensions(180, 80);
      ctx.clearRect(0, 0, 180, 80);
      renderer.render(sid, [], [], []);
    });

    return () => {
      cancelAnimationFrame(animId);
    };
  }, []);

  const handleSelectP1 = (id: CharacterId) => {
    setP1Char(id);
    audio.playCursorSound();
  };

  const handleSelectP2 = (id: CharacterId) => {
    setP2Char(id);
    audio.playCursorSound();
  };

  const handleSelectStage = (sid: StageId) => {
    setStage(sid);
    audio.playCursorSound();
  };

  const handleStart = () => {
    audio.playSelectSound();
    onStartMatch();
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-5 pb-24 sm:pb-6 flex flex-col gap-4 font-pixel text-slate-150">
      {/* Title Header matching the reference art */}
      <div className="text-center flex flex-col items-center justify-center">
        <h1
          id="main-game-title"
          className="font-arcade text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-yellow-400 to-cyan-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] drop-shadow-[0_0_24px_rgba(234,179,8,0.35)] select-none"
        >
          HYPER PIXEL STRIKER
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 uppercase tracking-wider font-pixel">
          Created by Haldun Lenger
        </p>
      </div>

      {/* Game Mode Selector Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 p-2.5 rounded-lg border-2 border-slate-800">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">OYUN MODU:</span>
          {(['arcade', 'versus', 'pvp', 'training'] as GameMode[]).map((m) => (
            <button
              key={m}
              id={`mode-btn-${m}`}
              onClick={() => { setMode(m); audio.playCursorSound(); }}
              className={`px-3 py-1 rounded text-xs font-arcade transition-all cursor-pointer ${
                mode === m
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-[0_0_10px_#f59e0b]'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
              }`}
            >
              {m === 'arcade' && 'ARCADE LADDER'}
              {m === 'versus' && '1P VS CPU'}
              {m === 'pvp' && 'YEREL 2P (PVP)'}
              {m === 'training' && 'ANTRENMAN'}
            </button>
          ))}
        </div>

        {mode !== 'pvp' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-bold uppercase">CPU ZORLUK:</span>
            {(['easy', 'normal', 'hard', 'ultra'] as CpuDifficulty[]).map((d) => (
              <button
                key={d}
                id={`diff-btn-${d}`}
                onClick={() => { setDifficulty(d); audio.playCursorSound(); }}
                className={`px-2 py-0.5 rounded text-[11px] font-pixel cursor-pointer ${
                  difficulty === d
                    ? 'bg-red-600 text-white font-bold'
                    : 'bg-slate-900 text-slate-500 hover:text-slate-300'
                }`}
              >
                {d.toUpperCase()}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 4 CHARACTER CARDS GRID (2x2 Layout matching the uploaded reference image) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CHARACTER 1: KASUMI */}
        <div
          id="card-kasumi"
          onClick={() => handleSelectP1('kasumi')}
          className={`relative bg-slate-950/90 border-4 rounded-xl p-3 flex flex-col sm:flex-row gap-3 transition-all cursor-pointer ${
            p1Char === 'kasumi'
              ? 'border-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.5)]'
              : p2Char === 'kasumi'
              ? 'border-cyan-400'
              : 'border-slate-800 hover:border-slate-600'
          }`}
        >
          {/* Sprite Box */}
          <div className="w-full sm:w-36 h-36 bg-slate-900 rounded-lg overflow-hidden border-2 border-slate-700 relative shrink-0 flex items-center justify-center">
            <canvas ref={canvasRefs.kasumi} width={160} height={150} className="w-full h-full pixelated" />
            <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-arcade bg-blue-600/80 text-white">
              BALANCED
            </span>
          </div>
          {/* Moves Info */}
          <div className="flex-1 flex flex-col justify-between text-xs">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-arcade text-sm sm:text-base text-amber-300 font-bold">
                  {CHARACTERS.kasumi.name}
                </h3>
                <span className="text-[10px] text-slate-400 font-pixel">KADIN • ÇOK YÖNLÜ</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                {CHARACTERS.kasumi.description}
              </p>

              {/* Stat Meters */}
              <div className="grid grid-cols-3 gap-1.5 mt-1.5 bg-slate-900/60 p-1.5 rounded border border-slate-800 text-[10px]">
                <div>
                  <div className="flex justify-between text-slate-400"><span>HIZ</span><span className="text-amber-300">8/10</span></div>
                  <div className="h-1 bg-slate-800 rounded overflow-hidden mt-0.5"><div className="h-full bg-blue-500 w-[80%]" /></div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-400"><span>GÜÇ</span><span className="text-amber-300">7/10</span></div>
                  <div className="h-1 bg-slate-800 rounded overflow-hidden mt-0.5"><div className="h-full bg-rose-500 w-[70%]" /></div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-400"><span>DEFANS</span><span className="text-amber-300">7/10</span></div>
                  <div className="h-1 bg-slate-800 rounded overflow-hidden mt-0.5"><div className="h-full bg-emerald-500 w-[70%]" /></div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 mt-2 bg-slate-900/80 p-2 rounded border border-slate-800 text-[11px]">
              <div className="font-arcade text-[10px] text-amber-400 uppercase">ÖZEL HAREKETLER:</div>
              <div className="flex justify-between items-center text-slate-200">
                <span><strong className="text-amber-300">D, DF, F + P:</strong> CRIMSON FLARE</span>
                <span className="text-red-400 font-bold shrink-0">16% DMG</span>
              </div>
              <div className="flex justify-between items-center text-slate-200">
                <span><strong className="text-amber-300">D, DB, B + K:</strong> RISING MOON KICK (KD)</span>
                <span className="text-red-400 font-bold shrink-0">18% DMG</span>
              </div>
              <div className="flex justify-between items-center text-slate-200">
                <span><strong className="text-amber-300">B, F + K:</strong> SHADOW LUNGE KICK</span>
                <span className="text-red-400 font-bold shrink-0">16% DMG</span>
              </div>
            </div>
          </div>
        </div>

        {/* CHARACTER 3: KENZO (Top-Right in reference art) */}
        <div
          id="card-kenzo"
          onClick={() => handleSelectP1('kenzo')}
          className={`relative bg-slate-950/90 border-4 rounded-xl p-3 flex flex-col sm:flex-row gap-3 transition-all cursor-pointer ${
            p1Char === 'kenzo'
              ? 'border-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.5)]'
              : p2Char === 'kenzo'
              ? 'border-cyan-400'
              : 'border-slate-800 hover:border-slate-600'
          }`}
        >
          {/* Sprite Box */}
          <div className="w-full sm:w-36 h-36 bg-slate-900 rounded-lg overflow-hidden border-2 border-slate-700 relative shrink-0 flex items-center justify-center">
            <canvas ref={canvasRefs.kenzo} width={160} height={150} className="w-full h-full pixelated" />
            <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-arcade bg-yellow-600/80 text-white">
              DISCIPLINE
            </span>
          </div>
          {/* Moves Info */}
          <div className="flex-1 flex flex-col justify-between text-xs">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-arcade text-sm sm:text-base text-yellow-400 font-bold">
                  {CHARACTERS.kenzo.name}
                </h3>
                <span className="text-[10px] text-slate-400 font-pixel">ERKEK • KARATE USTASI</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                {CHARACTERS.kenzo.description}
              </p>

              {/* Stat Meters */}
              <div className="grid grid-cols-3 gap-1.5 mt-1.5 bg-slate-900/60 p-1.5 rounded border border-slate-800 text-[10px]">
                <div>
                  <div className="flex justify-between text-slate-400"><span>HIZ</span><span className="text-yellow-400">7/10</span></div>
                  <div className="h-1 bg-slate-800 rounded overflow-hidden mt-0.5"><div className="h-full bg-blue-500 w-[70%]" /></div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-400"><span>GÜÇ</span><span className="text-yellow-400">8/10</span></div>
                  <div className="h-1 bg-slate-800 rounded overflow-hidden mt-0.5"><div className="h-full bg-rose-500 w-[80%]" /></div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-400"><span>DEFANS</span><span className="text-yellow-400">8/10</span></div>
                  <div className="h-1 bg-slate-800 rounded overflow-hidden mt-0.5"><div className="h-full bg-emerald-500 w-[80%]" /></div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 mt-2 bg-slate-900/80 p-2 rounded border border-slate-800 text-[11px]">
              <div className="font-arcade text-[10px] text-yellow-400 uppercase">ÖZEL HAREKETLER:</div>
              <div className="flex justify-between items-center text-slate-200">
                <span><strong className="text-yellow-300">D, DF, F + P:</strong> DRAGON BLAST (İTME)</span>
                <span className="text-emerald-400 font-bold shrink-0">17% DMG</span>
              </div>
              <div className="flex justify-between items-center text-slate-200">
                <span><strong className="text-yellow-300">D, DB, B + P:</strong> RISING STRIKE (KD)</span>
                <span className="text-red-400 font-bold shrink-0">20% DMG</span>
              </div>
              <div className="flex justify-between items-center text-slate-200">
                <span><strong className="text-yellow-300">B, F + K:</strong> HURRICANE SPIRAL KICK</span>
                <span className="text-red-400 font-bold shrink-0">16% DMG</span>
              </div>
            </div>
          </div>
        </div>

        {/* CHARACTER 2: ROXIE (Bottom-Left in reference art) */}
        <div
          id="card-roxie"
          onClick={() => handleSelectP1('roxie')}
          className={`relative bg-slate-950/90 border-4 rounded-xl p-3 flex flex-col sm:flex-row gap-3 transition-all cursor-pointer ${
            p1Char === 'roxie'
              ? 'border-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.5)]'
              : p2Char === 'roxie'
              ? 'border-cyan-400'
              : 'border-slate-800 hover:border-slate-600'
          }`}
        >
          {/* Sprite Box */}
          <div className="w-full sm:w-36 h-36 bg-slate-900 rounded-lg overflow-hidden border-2 border-slate-700 relative shrink-0 flex items-center justify-center">
            <canvas ref={canvasRefs.roxie} width={160} height={150} className="w-full h-full pixelated" />
            <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-arcade bg-rose-600/80 text-white">
              SPEED & KICK
            </span>
          </div>
          {/* Moves Info */}
          <div className="flex-1 flex flex-col justify-between text-xs">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-arcade text-sm sm:text-base text-rose-400 font-bold">
                  {CHARACTERS.roxie.name}
                </h3>
                <span className="text-[10px] text-slate-400 font-pixel">KADIN • SERİ TEKME</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                {CHARACTERS.roxie.description}
              </p>

              {/* Stat Meters */}
              <div className="grid grid-cols-3 gap-1.5 mt-1.5 bg-slate-900/60 p-1.5 rounded border border-slate-800 text-[10px]">
                <div>
                  <div className="flex justify-between text-slate-400"><span>HIZ</span><span className="text-rose-400">9/10</span></div>
                  <div className="h-1 bg-slate-800 rounded overflow-hidden mt-0.5"><div className="h-full bg-blue-500 w-[90%]" /></div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-400"><span>TEKME</span><span className="text-rose-400">10/10</span></div>
                  <div className="h-1 bg-slate-800 rounded overflow-hidden mt-0.5"><div className="h-full bg-rose-500 w-[100%]" /></div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-400"><span>DEFANS</span><span className="text-rose-400">6/10</span></div>
                  <div className="h-1 bg-slate-800 rounded overflow-hidden mt-0.5"><div className="h-full bg-emerald-500 w-[60%]" /></div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 mt-2 bg-slate-900/80 p-2 rounded border border-slate-800 text-[11px]">
              <div className="font-arcade text-[10px] text-rose-400 uppercase">ÖZEL HAREKETLER:</div>
              <div className="flex justify-between items-center text-slate-200">
                <span><strong className="text-rose-300">D, DF, F + K:</strong> SPIN FLURRY (KD)</span>
                <span className="text-rose-400 font-bold shrink-0">21% DMG</span>
              </div>
              <div className="flex justify-between items-center text-slate-200">
                <span><strong className="text-rose-300">D, DB, B + K:</strong> COBRA THRUST KICK</span>
                <span className="text-red-400 font-bold shrink-0">16% DMG</span>
              </div>
              <div className="flex justify-between items-center text-slate-200">
                <span><strong className="text-rose-300">B, F + K:</strong> FLASH KICK (TAKLA)</span>
                <span className="text-red-400 font-bold shrink-0">19% DMG</span>
              </div>
            </div>
          </div>
        </div>

        {/* CHARACTER 4: MARCUS (Bottom-Right in reference art) */}
        <div
          id="card-marcus"
          onClick={() => handleSelectP1('marcus')}
          className={`relative bg-slate-950/90 border-4 rounded-xl p-3 flex flex-col sm:flex-row gap-3 transition-all cursor-pointer ${
            p1Char === 'marcus'
              ? 'border-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.5)]'
              : p2Char === 'marcus'
              ? 'border-cyan-400'
              : 'border-slate-800 hover:border-slate-600'
          }`}
        >
          {/* Sprite Box */}
          <div className="w-full sm:w-36 h-36 bg-slate-900 rounded-lg overflow-hidden border-2 border-slate-700 relative shrink-0 flex items-center justify-center">
            <canvas ref={canvasRefs.marcus} width={160} height={150} className="w-full h-full pixelated" />
            <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-arcade bg-red-700/90 text-white">
              HEAVYWEIGHT
            </span>
          </div>
          {/* Moves Info */}
          <div className="flex-1 flex flex-col justify-between text-xs">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="font-arcade text-sm sm:text-base text-red-400 font-bold">
                  {CHARACTERS.marcus.name}
                </h3>
                <span className="text-[10px] text-slate-400 font-pixel">ERKEK • BOKSÖR</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                {CHARACTERS.marcus.description}
              </p>

              {/* Stat Meters */}
              <div className="grid grid-cols-3 gap-1.5 mt-1.5 bg-slate-900/60 p-1.5 rounded border border-slate-800 text-[10px]">
                <div>
                  <div className="flex justify-between text-slate-400"><span>HIZ</span><span className="text-red-400">6/10</span></div>
                  <div className="h-1 bg-slate-800 rounded overflow-hidden mt-0.5"><div className="h-full bg-blue-500 w-[60%]" /></div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-400"><span>YUMRUK</span><span className="text-red-400">10/10</span></div>
                  <div className="h-1 bg-slate-800 rounded overflow-hidden mt-0.5"><div className="h-full bg-rose-500 w-[100%]" /></div>
                </div>
                <div>
                  <div className="flex justify-between text-slate-400"><span>DEFANS</span><span className="text-red-400">9/10</span></div>
                  <div className="h-1 bg-slate-800 rounded overflow-hidden mt-0.5"><div className="h-full bg-emerald-500 w-[90%]" /></div>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 mt-2 bg-slate-900/80 p-2 rounded border border-slate-800 text-[11px]">
              <div className="font-arcade text-[10px] text-red-400 uppercase">ÖZEL HAREKETLER:</div>
              <div className="flex justify-between items-center text-slate-200">
                <span><strong className="text-red-300">D, DF, F + P:</strong> DEMPSEY RUSH (KD)</span>
                <span className="text-red-400 font-bold shrink-0">22% DMG</span>
              </div>
              <div className="flex justify-between items-center text-slate-200">
                <span><strong className="text-red-300">D, DB, B + P:</strong> TITAN STRAIGHT</span>
                <span className="text-red-400 font-bold shrink-0">19% DMG</span>
              </div>
              <div className="flex justify-between items-center text-slate-200">
                <span><strong className="text-red-300">B, F + P:</strong> SKYBREAKER (KD)</span>
                <span className="text-amber-300 font-bold shrink-0">20% (25% Havada)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4 STAGES SELECTION GRID */}
      <div>
        <span className="font-arcade text-xs text-amber-400 uppercase tracking-wider block mb-2">
          ARENA SEÇİMİ:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(['park', 'alley', 'gym', 'ring'] as StageId[]).map((sid) => {
            const stg = STAGES[sid];
            const isSelected = stage === sid;
            return (
              <div
                key={sid}
                id={`stage-card-${sid}`}
                onClick={() => handleSelectStage(sid)}
                className={`group bg-slate-950/90 rounded-lg border-2 p-2 flex flex-col gap-1.5 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                    : 'border-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="h-16 w-full rounded overflow-hidden bg-black border border-slate-700">
                  <canvas ref={stageCanvasRefs[sid]} width={180} height={80} className="w-full h-full pixelated" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-arcade text-[11px] text-white group-hover:text-amber-300">
                    {stg.turkishName.toUpperCase()}
                  </span>
                  {isSelected && (
                    <span className="text-[9px] bg-amber-500 text-slate-950 px-1 rounded font-bold">
                      SEÇİLDİ
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTTOM ACTION BAR (Player Selection + START Button) */}
      <div className="bg-slate-950 border-4 border-slate-700 rounded-xl p-3 sm:p-4 flex flex-wrap items-center justify-between gap-4 arcade-border">
        {/* P1 Choice info */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-amber-400 font-arcade text-xs font-bold">PLAYER 1</span>
            <span className="text-sm font-bold text-white">{CHARACTERS[p1Char].name}</span>
          </div>
          {/* Button tokens */}
          <div className="flex gap-1 font-arcade text-[9px]">
            <span className="px-1.5 py-0.5 rounded bg-yellow-500 text-black font-bold">HP</span>
            <span className="px-1.5 py-0.5 rounded bg-yellow-400 text-black font-bold">LP</span>
            <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white font-bold">HK</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white font-bold">LK</span>
          </div>
        </div>

        {/* P2 Choice Switcher */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col text-right">
            <span className="text-cyan-400 font-arcade text-xs font-bold">
              {mode === 'pvp' ? 'PLAYER 2' : 'OPPONENT (CPU)'}
            </span>
            <span className="text-sm font-bold text-white">{CHARACTERS[p2Char].name}</span>
          </div>
          {/* Switch P2 character buttons */}
          <div className="flex gap-1">
            {(['kasumi', 'roxie', 'kenzo', 'marcus'] as CharacterId[]).map((cid) => (
              <button
                key={cid}
                id={`p2-select-${cid}`}
                onClick={() => handleSelectP2(cid)}
                className={`w-7 h-7 rounded text-[10px] font-arcade font-bold border cursor-pointer ${
                  p2Char === cid
                    ? 'bg-cyan-500 border-white text-slate-950 shadow'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                }`}
                title={`P2: ${CHARACTERS[cid].name}`}
              >
                {cid[0].toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* START BUTTON */}
        <button
          id="btn-start-match"
          onClick={handleStart}
          className="w-full sm:w-auto px-8 py-3 rounded-lg font-arcade text-base sm:text-lg font-black bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 border-2 border-white shadow-[0_0_20px_rgba(245,158,11,0.6)] hover:brightness-110 active:scale-95 transition-all cursor-pointer tracking-wider"
        >
          START FIGHT !
        </button>
      </div>

      {/* MOBILE STICKY BOTTOM QUICK START BAR (Ensures instant accessibility on any smartphone screen) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t-2 border-amber-500/80 p-2.5 backdrop-blur-md flex items-center justify-between shadow-2xl safe-area-bottom">
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="text-[10px] text-amber-400 font-bold font-arcade leading-tight">
              P1: {CHARACTERS[p1Char].name.toUpperCase()}
            </span>
            <span className="text-[9px] text-cyan-400 font-pixel leading-tight">
              VS {CHARACTERS[p2Char].name.toUpperCase()}
            </span>
          </div>
        </div>
        <button
          id="btn-mobile-quick-start"
          type="button"
          onClick={handleStart}
          className="px-5 py-2.5 rounded-lg font-arcade text-xs font-black bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 border border-white shadow-[0_0_12px_rgba(245,158,11,0.8)] active:scale-95 transition-all cursor-pointer"
        >
          START FIGHT ⚔️
        </button>
      </div>
    </div>
  );
};
