import React, { useState } from 'react';
import { X, Gamepad2, Keyboard, Zap, Shield, ArrowRight } from 'lucide-react';
import { CHARACTERS } from '../data/characters';
import { CharacterId } from '../types/game';

interface MoveListModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCharId?: CharacterId;
}

export const MoveListModal: React.FC<MoveListModalProps> = ({
  isOpen,
  onClose,
  selectedCharId = 'kasumi',
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<CharacterId | 'controls'>(selectedCharId);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl max-h-[90vh] bg-slate-900 border-4 border-slate-700 rounded-lg shadow-2xl flex flex-col overflow-hidden arcade-border">
        {/* Header */}
        <div className="bg-slate-950 px-4 py-3 border-b-2 border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            <h2 className="font-arcade text-base sm:text-lg text-amber-300 tracking-wider">
              KOMUTLAR & ÖZEL HAREKETLER
            </h2>
          </div>
          <button
            id="btn-close-movelist"
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1 p-2 bg-slate-950/60 border-b border-slate-800">
          <button
            id="tab-controls"
            onClick={() => setActiveTab('controls')}
            className={`px-3 py-1.5 rounded font-pixel text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'controls'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            KONTROL ŞEMASI
          </button>

          {Object.values(CHARACTERS).map((char) => (
            <button
              key={char.id}
              id={`tab-char-${char.id}`}
              onClick={() => setActiveTab(char.id)}
              className={`px-3 py-1.5 rounded font-pixel text-xs transition-colors cursor-pointer ${
                activeTab === char.id
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {char.name}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 font-pixel text-slate-200">
          {activeTab === 'controls' ? (
            <div className="space-y-4">
              {/* Keyboard Mapping */}
              <div className="bg-slate-950 p-3.5 rounded border border-slate-800">
                <div className="flex items-center gap-2 text-amber-400 font-arcade text-xs mb-2.5">
                  <Keyboard className="w-4 h-4" />
                  <span>KLAVYE KONTROLLERİ (1P & 2P)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-900/90 p-2.5 rounded border border-slate-800">
                    <span className="text-amber-300 font-bold block mb-1.5">OYUNCU 1 (1P):</span>
                    <ul className="space-y-1 text-slate-300">
                      <li>• <strong className="text-white">Hareket:</strong> W, A, S, D (veya Yön Tuşları)</li>
                      <li>• <strong className="text-yellow-400">LP (Zayıf Yumruk):</strong> U veya J Tuşu</li>
                      <li>• <strong className="text-red-400">HP (Güçlü Yumruk):</strong> I veya K Tuşu</li>
                      <li>• <strong className="text-emerald-400">LK (Zayıf Tekme):</strong> H veya M Tuşu</li>
                      <li>• <strong className="text-blue-400">HK (Güçlü Tekme):</strong> O veya L Tuşu</li>
                      <li>• <strong className="text-cyan-300">Savunma / Blok:</strong> Rakip saldırırken Geriye (A) basılı tutun</li>
                    </ul>
                  </div>

                  <div className="bg-slate-900/90 p-2.5 rounded border border-slate-800">
                    <span className="text-cyan-300 font-bold block mb-1.5">OYUNCU 2 (Yerel 2P):</span>
                    <ul className="space-y-1 text-slate-300">
                      <li>• <strong className="text-white">Hareket:</strong> Yön Tuşları (Oklar)</li>
                      <li>• <strong className="text-yellow-400">LP:</strong> Numpad 7 veya [ Tuşu</li>
                      <li>• <strong className="text-red-400">HP:</strong> Numpad 9 veya ] Tuşu</li>
                      <li>• <strong className="text-emerald-400">LK:</strong> Numpad 1 veya ; Tuşu</li>
                      <li>• <strong className="text-blue-400">HK:</strong> Numpad 3 veya ' Tuşu</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Gamepad Mapping */}
              <div className="bg-slate-950 p-3.5 rounded border border-slate-800">
                <div className="flex items-center gap-2 text-emerald-400 font-arcade text-xs mb-2.5">
                  <Gamepad2 className="w-4 h-4" />
                  <span>GAMEPAD & OYUN KOLU DESTEĞİ</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-900/90 p-2.5 rounded border border-slate-800 space-y-1">
                    <p>• <strong className="text-white">D-Pad / Sol Analog:</strong> Hareket / Zıplama / Eğilme</p>
                    <p>• <strong className="text-yellow-400">X / Kare:</strong> Light Punch (LP)</p>
                    <p>• <strong className="text-red-400">Y / Üçgen:</strong> Heavy Punch (HP)</p>
                    <p>• <strong className="text-emerald-400">A / Çarpı:</strong> Light Kick (LK)</p>
                    <p>• <strong className="text-blue-400">B / Daire:</strong> Heavy Kick (HK)</p>
                  </div>
                  <div className="bg-slate-900/90 p-2.5 rounded border border-slate-800 flex flex-col justify-center text-slate-300">
                    <p className="text-[11px]">
                      ★ Standart Xbox, PlayStation ve arcade fightstick modelleri tarayıcı tarafından otomatik algılanır.
                    </p>
                    <p className="text-[11px] text-amber-300 mt-1">
                      ★ Titreşim (Dual-rumble) ağır darbelerde aktifleşir!
                    </p>
                  </div>
                </div>
              </div>

              {/* Touch Controls Guide */}
              <div className="bg-slate-950 p-3.5 rounded border border-slate-800">
                <span className="text-cyan-400 font-arcade text-xs block mb-1">
                  AKILLI TELEFON DOKUNMATİK EKRAN:
                </span>
                <p className="text-xs text-slate-300">
                  Sol tarafta 8 yönlü sanal arcade D-Pad ve sağ tarafta renkli 4 arcade vuruş butonu yer alır. Kolay özel hareket butonları ile mobil cihazda da akıcı dövüş keyfi!
                </p>
              </div>
            </div>
          ) : (
            // Character Move Details
            (() => {
              const char = CHARACTERS[activeTab as CharacterId];
              if (!char) return null;
              return (
                <div className="space-y-4">
                  {/* Character Bio Header */}
                  <div className="bg-slate-950 p-3.5 rounded border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-arcade text-base text-amber-300">{char.name}</h3>
                      <span className="text-xs text-slate-400">{char.title}</span>
                      <p className="text-xs text-slate-300 mt-1">{char.description}</p>
                    </div>
                    {!char.specialKicks && (
                      <div className="bg-rose-950/80 border border-rose-600 text-rose-300 text-xs px-2.5 py-1 rounded">
                        ⚠️ BOKSÖR: Tekme atmaz, tekme tuşları kısa zayıf yumruklar atar!
                      </div>
                    )}
                  </div>

                  {/* Moves List */}
                  <div className="space-y-3">
                    <h4 className="font-arcade text-xs text-slate-400 uppercase tracking-wider">
                      ÖZEL HAREKETLER (SPECIAL MOVES):
                    </h4>

                    {char.moves.map((move, idx) => (
                      <div
                        key={idx}
                        className="bg-slate-950/90 p-3 rounded border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-arcade text-sm text-white font-bold">
                              {move.name}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-pixel bg-amber-500/20 text-amber-400 border border-amber-500/40">
                              {move.command}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">{move.description}</p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <div className="bg-red-950/80 border border-red-500 px-2.5 py-1 rounded text-center">
                            <span className="block font-arcade text-xs text-red-400 font-black">
                              %{move.damagePercent} DMG
                            </span>
                            {move.airBonusDamagePercent && (
                              <span className="block font-pixel text-[9px] text-amber-300">
                                (Havada %{move.airBonusDamagePercent})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-4 py-2.5 border-t border-slate-800 flex justify-end">
          <button
            id="btn-close-footer"
            onClick={onClose}
            className="px-4 py-1.5 rounded font-arcade text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition-colors cursor-pointer"
          >
            KAPAT
          </button>
        </div>
      </div>
    </div>
  );
};
