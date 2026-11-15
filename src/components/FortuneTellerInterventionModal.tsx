'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { audioManager } from '@/utils/audio';

interface FortuneTellerInterventionModalProps {
  isOpen: boolean;
  userName?: string;
  onContinue: () => void;
}

const INTERVENTION_DIALOGUES = [
  (name: string) =>
    `Hehehe... Tiga kali kau bolak-balik bertanya pada semesta hari ini${name ? `, ${name}` : ''}! Sedang meragukan takdirmu, atau batinmu belum siap menerima jawaban yang tadi? Tenang... semesta tidak akan lari ke mana-mana.`,
  (name: string) =>
    `Hihihi... Tiga kali membentangkan kartu berturut-turut? Aku bisa mencium aroma overthinking dan keraguan dari auramu${name ? `, ${name}` : ''}. Baiklah, tarik napasmu dulu... mari kita lihat apa lagi yang membuat pikiranmu gundah!`,
  (name: string) =>
    `Hehehe... Masih belum puas juga ya${name ? `, ${name}` : ''}? Tiga kali kartu dibentangkan, batinmu sepertinya masih mencari jawaban yang ingin kau dengar, bukan yang semesta bisikkan. Ayo, sini kubantu luruskan benang takdirmu sekali lagi!`,
  (name: string) =>
    `Hihihi... Jangan kira aku tidak memperhatikanmu${name ? `, ${name}` : ''}! Mengulang sampai tiga kali begini... apakah jalan hidupmu yang rumit, atau kau yang terlalu takut melangkah? Ayo buka tabir baru lagi!`,
];

export const FortuneTellerInterventionModal: React.FC<FortuneTellerInterventionModalProps> = ({
  isOpen,
  userName = '',
  onContinue,
}) => {
  const [dialogueText, setDialogueText] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Pick random hybrid dialogue on each appearance
      const randomIdx = Math.floor(Math.random() * INTERVENTION_DIALOGUES.length);
      const cleanName = userName && userName !== 'Pengelana Jiwa' ? userName : '';
      setDialogueText(INTERVENTION_DIALOGUES[randomIdx](cleanName));
      audioManager.play('snap');
    }
  }, [isOpen, userName]);

  if (!isOpen) return null;

  const handleContinueClick = () => {
    audioManager.play('flip');
    onContinue();
  };

  return (
    <div className="fixed inset-0 bg-stone-950/85 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in select-none">
      <div className="w-full max-w-sm bg-gradient-to-b from-[#1C102A] via-[#150A21] to-[#0D0517] border border-amber-400/40 rounded-3xl p-5 flex flex-col items-center gap-4 shadow-2xl relative overflow-hidden">
        {/* Mystical Background Glow */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-36 h-36 bg-purple-600/15 rounded-full blur-2xl pointer-events-none" />

        {/* Header Tag */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-300/30">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
          <span className="text-[10px] font-serif font-bold tracking-widest text-amber-300 uppercase">
            Bisikan Sang Peramal
          </span>
        </div>

        {/* Character Visual (Mascot Smirking / Laughing WebP) */}
        <div className="relative flex flex-col items-center">
          <div className="w-24 h-24 rounded-full p-1 border-2 border-amber-400/80 shadow-lg shadow-amber-500/25 bg-stone-900/90 flex items-center justify-center overflow-hidden">
            <picture className="w-full h-full">
              <source srcSet="/animations/anim_3_pick.webp" type="image/webp" />
              <img
                src="/animations/anim_3_pick.gif"
                alt="Peramal Tarot"
                className="w-full h-full object-cover scale-110"
              />
            </picture>
          </div>
          <span className="mt-1 text-[11px] font-serif text-amber-200/70 italic">
            Sang Peramal tersenyum penuh arti...
          </span>
        </div>

        {/* Dialogue Bubble with Top Pointer */}
        <div className="relative w-full bg-stone-900/95 border border-amber-300/35 rounded-2xl p-4 text-center shadow-inner">
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-stone-900 border-t border-l border-amber-300/35 rotate-45" />
          <p className="text-xs xs:text-sm font-serif italic text-amber-100 leading-relaxed relative z-10">
            "{dialogueText}"
          </p>
        </div>

        {/* Single Action Button: Lanjut Ramal Lagi */}
        <button
          type="button"
          onClick={handleContinueClick}
          className="w-full min-h-[50px] bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-[0.98] text-stone-950 font-serif font-bold text-xs tracking-wider uppercase rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 border border-amber-200/50 transition-all cursor-pointer"
        >
          <span>✦ Lanjut Ramal Lagi ✦</span>
        </button>
      </div>
    </div>
  );
};
