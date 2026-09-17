import React from 'react';
import { FighterState } from '../types/game';
import { CHARACTERS } from '../data/characters';

interface FightHUDProps {
  f1: FighterState;
  f2: FighterState;
  timer: number;
  currentRound: number;
  announcement: string | null;
  specialBanner: { text: string; side: 'left' | 'right' } | null;
}

export const FightHUD: React.FC<FightHUDProps> = ({
  f1,
  f2,
  timer,
  currentRound,
  announcement,
  specialBanner,
}) => {
  const char1 = CHARACTERS[f1.charId];
  const char2 = CHARACTERS[f2.charId];

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-3 sm:p-4">
      {/* Top HUD: Health Bars, Timer, Round Indicators */}
      <div className="w-full flex items-start justify-between gap-2 max-w-5xl mx-auto">
        {/* PLAYER 1 HEALTH BAR */}
        <div className="flex-1 flex flex-col items-start">
          <div className="w-full flex items-center justify-between text-xs font-arcade font-bold mb-1">
            <span className="text-amber-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              {char1.name}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-slate-300 font-pixel">
                {Math.ceil(f1.health)}%
              </span>
              {/* Round Win Tokens */}
              <div className="flex gap-1 ml-1">
                <div
                  className={`w-3 h-3 rounded-full border border-amber-300 ${
                    f1.roundsWon >= 1 ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' : 'bg-slate-900/80'
                  }`}
                />
                <div
                  className={`w-3 h-3 rounded-full border border-amber-300 ${
                    f1.roundsWon >= 2 ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' : 'bg-slate-900/80'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* 1P Health Bar Container */}
          <div className="w-full h-5 sm:h-6 bg-slate-950/90 border-2 border-slate-700 p-0.5 rounded-sm relative overflow-hidden shadow-md">
            {/* Trailing yellow chip damage bar */}
            <div
              className="absolute top-0.5 bottom-0.5 left-0.5 bg-amber-400 transition-all duration-300"
              style={{ width: `${Math.max(0, f1.displayHealth)}%` }}
            />
            {/* Active health gradient */}
            <div
              className={`absolute top-0.5 bottom-0.5 left-0.5 transition-all duration-75 ${
                f1.health > 40
                  ? 'bg-gradient-to-r from-emerald-500 via-emerald-400 to-green-300'
                  : f1.health > 20
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-300'
                  : 'bg-gradient-to-r from-red-600 to-rose-400'
              }`}
              style={{ width: `${Math.max(0, f1.health)}%` }}
            />
          </div>
        </div>

        {/* CENTER TIMER */}
        <div className="flex flex-col items-center justify-center px-3 sm:px-4">
          <div className="bg-slate-950/95 border-2 border-amber-500 px-3 py-1 rounded shadow-[0_0_12px_rgba(245,158,11,0.4)] text-center min-w-[58px]">
            <span
              className={`font-arcade text-lg sm:text-2xl font-black ${
                timer <= 15 ? 'text-red-500 animate-pulse' : 'text-amber-300'
              }`}
            >
              {timer.toString().padStart(2, '0')}
            </span>
          </div>
          <span className="text-[9px] font-pixel text-slate-300 mt-0.5 uppercase tracking-wider">
            ROUND {currentRound}
          </span>
        </div>

        {/* PLAYER 2 HEALTH BAR */}
        <div className="flex-1 flex flex-col items-end">
          <div className="w-full flex items-center justify-between text-xs font-arcade font-bold mb-1">
            <div className="flex items-center gap-1">
              <div className="flex gap-1 mr-1">
                <div
                  className={`w-3 h-3 rounded-full border border-amber-300 ${
                    f2.roundsWon >= 2 ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' : 'bg-slate-900/80'
                  }`}
                />
                <div
                  className={`w-3 h-3 rounded-full border border-amber-300 ${
                    f2.roundsWon >= 1 ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' : 'bg-slate-900/80'
                  }`}
                />
              </div>
              <span className="text-[10px] text-slate-300 font-pixel">
                {Math.ceil(f2.health)}%
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              {f2.charId === 'raizen' && (
                <span className="px-1.5 py-0.5 rounded bg-purple-900/90 text-purple-200 border border-purple-400 text-[9px] font-arcade animate-pulse shadow-[0_0_8px_#a855f7]">
                  ★ FINAL BOSS
                </span>
              )}
              <span className="text-cyan-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                {char2.name}
              </span>
            </div>
          </div>

          {/* 2P Health Bar Container (Right to left fill) */}
          <div className="w-full h-5 sm:h-6 bg-slate-950/90 border-2 border-slate-700 p-0.5 rounded-sm relative overflow-hidden shadow-md">
            {/* Trailing yellow chip damage bar */}
            <div
              className="absolute top-0.5 bottom-0.5 right-0.5 bg-amber-400 transition-all duration-300"
              style={{ width: `${Math.max(0, f2.displayHealth)}%` }}
            />
            {/* Active health gradient */}
            <div
              className={`absolute top-0.5 bottom-0.5 right-0.5 transition-all duration-75 ${
                f2.health > 40
                  ? 'bg-gradient-to-l from-emerald-500 via-emerald-400 to-green-300'
                  : f2.health > 20
                  ? 'bg-gradient-to-l from-amber-500 to-yellow-300'
                  : 'bg-gradient-to-l from-red-600 to-rose-400'
              }`}
              style={{ width: `${Math.max(0, f2.health)}%` }}
            />
          </div>
        </div>
      </div>

      {/* SPECIAL MOVE BANNER CALLOUTS */}
      {specialBanner && (
        <div
          className={`absolute top-16 ${
            specialBanner.side === 'left' ? 'left-8' : 'right-8'
          } animate-bounce pointer-events-none z-30`}
        >
          <div className="bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 text-slate-950 font-arcade text-xs sm:text-sm font-black px-3 py-1 rounded shadow-lg border-2 border-white uppercase tracking-wider">
            ★ {specialBanner.text} ★
          </div>
        </div>
      )}

      {/* COMBO COUNTERS */}
      <div className="w-full flex justify-between px-6 pointer-events-none">
        {f1.comboCount >= 2 && (
          <div className="bg-slate-950/90 border border-amber-400 px-3 py-1.5 rounded text-left shadow-lg transform -rotate-3 animate-pulse">
            <div className="font-arcade text-amber-400 text-base font-extrabold tracking-wider">
              {f1.comboCount} HITS!
            </div>
            <div className="font-pixel text-slate-300 text-xs">
              {f1.comboDamage}% DAMAGE
            </div>
          </div>
        )}

        {f2.comboCount >= 2 && (
          <div className="bg-slate-950/90 border border-cyan-400 px-3 py-1.5 rounded text-right shadow-lg transform rotate-3 animate-pulse">
            <div className="font-arcade text-cyan-400 text-base font-extrabold tracking-wider">
              {f2.comboCount} HITS!
            </div>
            <div className="font-pixel text-slate-300 text-xs">
              {f2.comboDamage}% DAMAGE
            </div>
          </div>
        )}
      </div>

      {/* CENTER STAGE DRAMATIC ANNOUNCEMENTS */}
      {announcement && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-40">
          <div className="text-center transform scale-110 sm:scale-125 animate-pulse">
            <div className="font-arcade text-3xl sm:text-5xl font-black text-amber-300 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] arcade-text-shadow border-y-4 border-amber-400 bg-slate-950/80 px-8 py-3 tracking-widest uppercase">
              {announcement === 'round1' && 'ROUND 1'}
              {announcement === 'round2' && 'ROUND 2'}
              {announcement === 'finalround' && 'FINAL ROUND'}
              {announcement === 'fight' && 'FIGHT !'}
              {announcement === 'ko' && 'K. O. !'}
              {announcement === 'youwin' && 'YOU WIN !'}
            </div>
          </div>
        </div>
      )}

      {/* Bottom spacer for clean layout */}
      <div className="h-2" />
    </div>
  );
};
