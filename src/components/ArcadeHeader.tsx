import React from 'react';
import { Volume2, VolumeX, Tv, Gamepad2, BookOpen, RotateCcw, Smartphone, Maximize2, Minimize2 } from 'lucide-react';

interface ArcadeHeaderProps {
  isMuted: boolean;
  onToggleMute: () => void;
  crtEnabled: boolean;
  onToggleCrt: () => void;
  showTouch: boolean;
  onToggleTouch: () => void;
  gamepadCount: number;
  onOpenMoveList: () => void;
  onBackToSelect?: () => void;
  inGame: boolean;
  isLandscape?: boolean;
  isFullscreen?: boolean;
  onToggleLandscape?: () => void;
}

export const ArcadeHeader: React.FC<ArcadeHeaderProps> = ({
  isMuted,
  onToggleMute,
  crtEnabled,
  onToggleCrt,
  showTouch,
  onToggleTouch,
  gamepadCount,
  onOpenMoveList,
  onBackToSelect,
  inGame,
  isLandscape = false,
  isFullscreen = false,
  onToggleLandscape,
}) => {
  return (
    <header
      className={`w-full bg-slate-950/90 border-b-2 border-slate-800 transition-all z-30 ${
        isLandscape
          ? 'px-2 py-1 flex items-center justify-between gap-1 text-[10px]'
          : 'px-4 py-2 flex flex-wrap items-center justify-between gap-2'
      }`}
    >
      {/* Title & Creator Logo */}
      <div className="flex items-center gap-1.5 sm:gap-3">
        <div className="bg-gradient-to-r from-red-600 via-yellow-400 to-cyan-400 text-transparent bg-clip-text font-arcade text-xs sm:text-base lg:text-lg tracking-wider font-extrabold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          HYPER PIXEL STRIKER
        </div>
        <span className="text-[9px] sm:text-xs font-pixel text-slate-400 border-l border-slate-800 pl-1.5 sm:pl-3 hidden xs:inline">
          Created by Haldun Lenger
        </span>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-pixel">
        {/* Landscape / Fullscreen Toggle Button */}
        {onToggleLandscape && (
          <button
            id="btn-toggle-landscape"
            type="button"
            onClick={onToggleLandscape}
            className="flex items-center gap-1 px-2 py-1 rounded border bg-amber-950/70 border-amber-500 text-amber-300 hover:bg-amber-900/80 transition-colors cursor-pointer text-[10px] sm:text-xs"
            title={isFullscreen ? 'Tam Ekrandan Çık' : 'Yatay Mod / Tam Ekran (Mobil İçin En İyi)'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isFullscreen ? 'TAM EKRAN' : 'YATAY MOD'}</span>
          </button>
        )}

        {/* Gamepad status indicator */}
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded border transition-colors ${
            gamepadCount > 0
              ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
              : 'bg-slate-900 border-slate-700 text-slate-400'
          }`}
          title={gamepadCount > 0 ? `${gamepadCount} Gamepad bağlı` : 'Gamepad takıldığında otomatik algılanır'}
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          <span className="hidden md:inline">{gamepadCount > 0 ? `${gamepadCount} PAD` : 'NO PAD'}</span>
        </div>

        {/* Touch Controls Toggle */}
        <button
          id="btn-toggle-touch"
          type="button"
          onClick={onToggleTouch}
          className={`flex items-center gap-1 px-2 py-1 rounded border transition-colors cursor-pointer ${
            showTouch
              ? 'bg-amber-600/30 border-amber-500 text-amber-300'
              : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
          title="Dokunmatik Sanal Kontroller"
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">DOKUNMATİK</span>
        </button>

        {/* CRT Scanline Toggle */}
        <button
          id="btn-toggle-crt"
          type="button"
          onClick={onToggleCrt}
          className={`flex items-center gap-1 px-2 py-1 rounded border transition-colors cursor-pointer ${
            crtEnabled
              ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300'
              : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
          title="CRT Retro Tarama Çizgileri"
        >
          <Tv className="w-3.5 h-3.5" />
          <span className="hidden md:inline">CRT {crtEnabled ? 'ON' : 'OFF'}</span>
        </button>

        {/* Audio Mute Toggle */}
        <button
          id="btn-toggle-mute"
          type="button"
          onClick={onToggleMute}
          className="flex items-center gap-1 px-2 py-1 rounded border bg-slate-900 border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-colors cursor-pointer"
          title={isMuted ? 'Sesi Aç' : 'Sesi Kapat'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          <span className="hidden md:inline">{isMuted ? 'MUTE' : 'SES'}</span>
        </button>

        {/* Move List Modal */}
        <button
          id="btn-open-movelist"
          type="button"
          onClick={onOpenMoveList}
          className="flex items-center gap-1 px-2 py-1 rounded border bg-indigo-950/60 border-indigo-500 text-indigo-200 hover:bg-indigo-900/80 transition-colors cursor-pointer"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">KOMUTLAR</span>
        </button>

        {/* Back to Character Select (if in game) */}
        {inGame && onBackToSelect && (
          <button
            id="btn-back-select"
            type="button"
            onClick={onBackToSelect}
            className="flex items-center gap-1 px-2 py-1 rounded border bg-rose-950/60 border-rose-500 text-rose-300 hover:bg-rose-900/80 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">SEÇİM EKRANI</span>
          </button>
        )}
      </div>
    </header>
  );
};
