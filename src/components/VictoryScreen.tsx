import React from 'react';
import { CharacterId, GameMode, CpuDifficulty } from '../types/game';
import { CHARACTERS } from '../data/characters';
import { Trophy, RotateCcw, ArrowRight, Flame, ShieldAlert, Award } from 'lucide-react';
import { audio } from '../audio/retroAudio';

interface VictoryScreenProps {
  winnerIndex: number;
  p1Char: CharacterId;
  p2Char: CharacterId;
  mode: GameMode;
  difficulty?: CpuDifficulty;
  isArcadeComplete?: boolean;
  arcadeFightIndex?: number;
  totalArcadeFights?: number;
  onRematch: () => void;
  onNextOpponent?: () => void;
  onAcceptChallenge?: (nextDiff: CpuDifficulty) => void;
  onSelectScreen: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  winnerIndex,
  p1Char,
  p2Char,
  mode,
  difficulty = 'normal',
  isArcadeComplete = false,
  arcadeFightIndex = 0,
  totalArcadeFights = 5,
  onRematch,
  onNextOpponent,
  onAcceptChallenge,
  onSelectScreen,
}) => {
  const winnerCharId = winnerIndex === 0 ? p1Char : p2Char;
  const winnerChar = CHARACTERS[winnerCharId] || CHARACTERS['kasumi'];
  const isP1Winner = winnerIndex === 0;

  const victoryQuotes: Record<CharacterId, string> = {
    kasumi: '"Ders zili çaldı! Dövüş sanatları disiplini her zaman kaba kuvvete üstün gelir."',
    roxie: '"Tekmelerimin hızını göremedin bile! Biraz daha esneklik çalışmalısın."',
    kenzo: '"Ejderhanın alevi asla sönmez! Harika bir maçtı, tekrar karşılaşalım."',
    marcus: '"Ringde bana karşı ayakta kalamazsın! Ağır siklet yumruklarım affetmez."',
    raizen: '"Karanlığın kadim kudretini hafife aldınız. Bu taht sadece en güçlü olanındır."',
  };

  const getNextDifficulty = (current: CpuDifficulty = 'normal'): CpuDifficulty => {
    if (current === 'easy') return 'normal';
    if (current === 'normal') return 'hard';
    return 'ultra';
  };

  const currentDiff: CpuDifficulty = (difficulty as CpuDifficulty) || 'normal';
  const nextDiff = getNextDifficulty(currentDiff);

  const diffLabels: Record<CpuDifficulty, { name: string; color: string }> = {
    easy: { name: 'KOLAY (EASY)', color: 'text-emerald-400' },
    normal: { name: 'NORMAL', color: 'text-amber-400' },
    hard: { name: 'ZOR (HARD)', color: 'text-orange-400' },
    ultra: { name: 'KABUS (ULTRA NIGHTMARE)', color: 'text-red-500' },
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4 select-none">
      <div className="w-full max-w-2xl bg-slate-900 border-4 border-amber-500 rounded-xl p-5 sm:p-6 shadow-[0_0_40px_rgba(245,158,11,0.5)] flex flex-col items-center text-center font-pixel text-slate-100 arcade-border-gold max-h-[95vh] overflow-y-auto">
        
        {/* ARCADE LADDER COMPLETE (GRAND CHAMPION) VIEW */}
        {isArcadeComplete && isP1Winner ? (
          <div className="w-full flex flex-col items-center">
            <div className="flex items-center gap-3 text-amber-400 mb-1">
              <Award className="w-9 h-9 sm:w-12 sm:h-12 text-yellow-400 animate-bounce" />
              <h2 className="font-arcade text-2xl sm:text-4xl text-amber-300 tracking-widest arcade-text-shadow">
                TEBRİKLER ŞAMPİYON!
              </h2>
              <Award className="w-9 h-9 sm:w-12 sm:h-12 text-yellow-400 animate-bounce" />
            </div>

            <span className="text-xs sm:text-sm text-yellow-400 font-arcade uppercase tracking-wider mb-3">
              ★ ARCADE LADDER TAMAMLANDI ★
            </span>

            {/* Boss Fallen Card */}
            <div className="my-3 w-full bg-slate-950/90 p-4 rounded-lg border-2 border-purple-600/80 shadow-inner flex flex-col items-center">
              <div className="flex items-center gap-2 text-purple-400 font-arcade text-sm mb-1">
                <Flame className="w-4 h-4 text-purple-400" />
                <span>LORD RAIZEN VE 4 DÖVÜŞÇÜ MAĞLUP EDİLDİ!</span>
                <Flame className="w-4 h-4 text-purple-400" />
              </div>
              <p className="text-xs text-slate-300 max-w-lg mb-2">
                Turnuvanın gizli hükümdarı karanlık tahtından indirildi. Gölgeler dağıldı ve {winnerChar.name} tarihin en büyük sokak efsanelerinden biri olarak taç giydi!
              </p>
              <div className="bg-purple-950/40 border border-purple-800/80 p-2.5 rounded text-xs text-purple-200 italic max-w-md">
                Lord Raizen: &quot;İmkansız... Kadim karanlık ateşi nasıl söndürülebilir? Sen... gerçekten gerçek bir dövüş ustasısın.&quot;
              </div>
            </div>

            {/* HIGH-DIFFICULTY CHALLENGE SECTION */}
            <div className="w-full my-3 p-4 bg-gradient-to-r from-red-950/60 via-slate-950 to-red-950/60 border-2 border-red-500/80 rounded-lg flex flex-col items-center text-center">
              <div className="flex items-center gap-2 text-red-400 font-arcade text-sm sm:text-base font-bold mb-1">
                <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse" />
                <span>MEYDAN OKUMA (CHALLENGE AWAITS)</span>
                <ShieldAlert className="w-5 h-5 text-red-400 animate-pulse" />
              </div>

              <div className="text-xs text-slate-300 max-w-lg mb-3 leading-relaxed">
                {difficulty !== 'ultra' ? (
                  <>
                    Şu anki mod: <span className={`font-bold ${diffLabels[difficulty].color}`}>{diffLabels[difficulty].name}</span>.
                    <br />
                    Gerçek bir arcade ustası asla yerinde saymaz! Seni bir üst seviye olan{' '}
                    <span className={`font-bold uppercase ${diffLabels[nextDiff].color}`}>{diffLabels[nextDiff].name}</span> moduna meydan okumaya davet ediyoruz!
                  </>
                ) : (
                  <>
                    <span className="text-amber-300 font-bold">EFSANE MERTEBESİ!</span> En ölümcül KABUS (ULTRA NIGHTMARE) modunda bile Lord Raizen&apos;i dize getirdin! Gerçek bir dövüş efsanesisin!
                  </>
                )}
              </div>

              {difficulty !== 'ultra' && onAcceptChallenge && (
                <button
                  id="btn-accept-challenge"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    try { audio.playSelectSound(); } catch (_) {}
                    onAcceptChallenge(nextDiff);
                  }}
                  className="px-6 py-2.5 rounded bg-gradient-to-r from-red-600 via-orange-500 to-red-600 hover:from-red-500 hover:to-orange-400 text-white font-arcade text-xs font-bold border-2 border-white shadow-[0_0_15px_rgba(239,68,68,0.7)] flex items-center gap-2 cursor-pointer transition-transform active:scale-95"
                >
                  <Flame className="w-4 h-4 text-yellow-300" />
                  <span>MEYDAN OKUMAYI KABUL ET ({diffLabels[nextDiff].name})</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          /* STANDARD MATCH RESULT VIEW */
          <div className="w-full flex flex-col items-center">
            {/* Banner */}
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <Trophy className="w-8 h-8 text-yellow-400 animate-bounce" />
              <h2 className="font-arcade text-2xl sm:text-4xl text-amber-300 tracking-widest arcade-text-shadow">
                {isP1Winner ? 'VICTORY !' : mode === 'pvp' ? 'PLAYER 2 WINS !' : 'K.O. - DEFEAT'}
              </h2>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 uppercase tracking-widest font-arcade">
              <span>HYPER PIXEL CHAMPION</span>
              {mode === 'arcade' && (
                <span className="text-amber-400 font-bold ml-1">
                  • RAUND {arcadeFightIndex + 1}/{totalArcadeFights}
                  {p2Char === 'raizen' ? ' (FINAL BOSS)' : ''}
                </span>
              )}
            </div>

            {/* Winner Showcase Card */}
            <div className="my-4 w-full bg-slate-950 p-4 rounded-lg border-2 border-slate-700 flex flex-col items-center">
              <h3 className="font-arcade text-lg sm:text-xl text-white mb-1">
                {winnerChar.name}
              </h3>
              <span className="text-xs text-amber-400 font-bold mb-3">
                {winnerChar.title}
              </span>

              {/* Character Victory Quote */}
              <div className="bg-slate-900/90 border border-slate-800 p-3 rounded text-xs sm:text-sm text-amber-200 italic max-w-lg">
                {victoryQuotes[winnerCharId] || victoryQuotes.kasumi}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 w-full mt-2 font-arcade text-xs">
          {mode === 'arcade' && isP1Winner && !isArcadeComplete && onNextOpponent && (
            <button
              id="btn-next-opponent"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                try { audio.playSelectSound(); } catch (_) {}
                onNextOpponent();
              }}
              className="px-6 py-2.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 border border-white shadow-lg cursor-pointer transition-transform active:scale-95"
            >
              <span>{arcadeFightIndex === 3 ? 'FINAL BOSS\'A GEÇ' : 'SONRAKİ RAKİP'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <button
            id="btn-rematch"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              try { audio.playSelectSound(); } catch (_) {}
              onRematch();
            }}
            className="px-6 py-2.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold flex items-center gap-2 border border-white shadow-lg cursor-pointer transition-transform active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RÖVANŞ (REMATCH)</span>
          </button>

          <button
            id="btn-victory-select"
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              try { audio.playCursorSound(); } catch (_) {}
              onSelectScreen();
            }}
            className="px-6 py-2.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-600 cursor-pointer transition-transform active:scale-95"
          >
            <span>KARAKTER SEÇİMİ</span>
          </button>
        </div>
      </div>
    </div>
  );
};
