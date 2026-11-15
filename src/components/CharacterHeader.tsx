'use client';

import React from 'react';
import { GameStage } from '@/types/tarot';

interface CharacterHeaderProps {
  stage: GameStage;
  userName?: string;
  currentStep?: number; // 1, 2, or 3
}

export const CharacterHeader: React.FC<CharacterHeaderProps> = ({
  stage,
  userName = 'Pengelana',
  currentStep = 1,
}) => {
  const isCompact = stage === 'READING_COMPLETE';

  let animName = 'anim_1_idle';
  let dialogText =
    'Salam kenal, pengelana jiwa. Siapa namamu dan apa yang hendak kau tanyakan pada semesta hari ini?';

  if (stage === 'SHUFFLING') {
    animName = 'anim_2_shuffle';
    if (currentStep === 1) {
      dialogText = `Pusatkan batinmu pada akar masa lalu (Past), ${userName}... sentuh kartu yang memanggilmu!`;
    } else if (currentStep === 2) {
      dialogText = `Sekarang rasakan dinamika hari ini (Present)... pilih kartu keduamu, ${userName}!`;
    } else {
      dialogText = `Dan ke mana takdir akan membawamu (Future)... tarik kartu terakhirmu!`;
    }
  } else if (stage === 'CARD_LOCKING') {
    animName = 'anim_3_pick';
    dialogText = `Hehehe... pilihan yang mengejutkan, ${userName}! Mari kita lihat rahasianya...`;
  } else if (stage === 'FETCHING_READING') {
    animName = 'anim_5_think';
    dialogText = `Dengarkan bisikan semesta, ${userName}... benang takdir sedang menghubungkan auramu.`;
  } else if (stage === 'REVEALING_CARDS') {
    animName = 'anim_4_read';
    dialogText = `Buka matamu, ${userName}... tabir ketiga kartu takdirmu kini terungkap!`;
  } else if (stage === 'CARDS_REVEALED_HOLD') {
    animName = 'anim_4_read';
    dialogText = `Tiga kartu takdirmu telah terbuka sempurna, ${userName}. Siapkan batinmu untuk menyimak pesan semesta.`;
  } else if (stage === 'READING_COMPLETE') {
    animName = 'anim_4_read';
    dialogText = `Inilah pesan semesta yang menuntun langkah batinmu, ${userName}.`;
  }

  const webpSrc = `/animations/${animName}.webp`;
  const gifSrc = `/animations/${animName}.gif`;

  // Compact Header for Results view
  if (isCompact) {
    return (
      <header className="flex-shrink-0 w-full px-4 py-2.5 flex items-center justify-between border-b border-tarot-gold/20 bg-tarot-surface z-20">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 flex-shrink-0">
            <picture className="w-full h-full flex items-center justify-center">
              <source srcSet={webpSrc} type="image/webp" />
              <img
                src={gifSrc}
                alt="Peramal Ramalin"
                className="w-full h-full object-contain"
              />
            </picture>
          </div>
          <div className="flex flex-col">
            <span className="font-serif font-bold text-xs text-amber-300 tracking-wide">
              Ramalin Tarot
            </span>
            <span className="text-[11px] text-amber-100/80 font-sans">
              Pemandu Takdir untuk <span className="font-semibold text-amber-300">{userName}</span>
            </span>
          </div>
        </div>
      </header>
    );
  }

  // 1. Stage: INPUT_FORM (Hero Character Presence)
  if (stage === 'INPUT_FORM') {
    return (
      <div className="flex-shrink-0 w-full flex flex-col items-center justify-center pt-1 px-4 z-10 select-none">
        {/* Big Prominent Transparent Witch Animation */}
        <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center my-0.5">
          <picture className="w-full h-full flex items-center justify-center">
            <source srcSet={webpSrc} type="image/webp" />
            <img
              src={gifSrc}
              alt="Peramal Ramalin"
              className="w-full h-full object-contain select-none pointer-events-none"
            />
          </picture>
        </div>

        {/* Wide Speech Bubble right under character */}
        <div className="relative w-full max-w-sm mx-auto bg-tarot-surfaceElevated border border-amber-300/30 rounded-2xl px-4 py-2.5 text-center">
          <span className="text-[10px] uppercase font-serif font-bold tracking-wider text-amber-300 block mb-0.5">
            Ramalin
          </span>
          <p className="text-xs sm:text-sm font-serif italic text-tarot-text leading-snug">
            "{dialogText}"
          </p>
        </div>
      </div>
    );
  }

  // 2. Stage: REVEALING_CARDS & CARDS_REVEALED_HOLD (Compact horizontal banner to ensure cards and CTA button fit comfortably)
  if (stage === 'REVEALING_CARDS' || stage === 'CARDS_REVEALED_HOLD') {
    return (
      <div className="flex-shrink-0 w-full px-4 pt-1.5 pb-1 z-10 select-none">
        <div className="w-full max-w-sm mx-auto flex items-center gap-2.5 bg-stone-900/80 border border-amber-300/25 rounded-2xl p-2 shadow-md">
          <div className="relative w-11 h-11 flex-shrink-0 rounded-full overflow-hidden border border-amber-300/40 bg-stone-950">
            <picture className="w-full h-full flex items-center justify-center">
              <source srcSet={webpSrc} type="image/webp" />
              <img
                src={gifSrc}
                alt="Peramal Ramalin"
                className="w-full h-full object-cover select-none pointer-events-none"
              />
            </picture>
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-serif italic text-amber-100/90 leading-tight">
              "{dialogText}"
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 3. Stage: FETCHING_READING (Centric Thinking Presence)
  if (stage === 'FETCHING_READING') {
    return (
      <div className="flex-shrink-0 w-full flex flex-col items-center justify-center pt-2 px-3 z-10 select-none">
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
          <picture className="w-full h-full flex items-center justify-center">
            <source srcSet={webpSrc} type="image/webp" />
            <img
              src={gifSrc}
              alt="Peramal Ramalin"
              className="w-full h-full object-contain select-none pointer-events-none"
            />
          </picture>
        </div>
        <div className="mt-1 bg-tarot-surfaceElevated border border-amber-300/30 rounded-xl px-4 py-1.5 text-center max-w-sm">
          <p className="text-xs font-serif italic text-amber-200">
            "{dialogText}"
          </p>
        </div>
      </div>
    );
  }

  // 3. Stage: SHUFFLING & CARD_LOCKING (Active Ritual Character + Bubble)
  return (
    <div className="flex-shrink-0 w-full flex flex-col items-center justify-center pt-2 px-3 z-10 select-none">
      <div className="flex items-center justify-center gap-3 w-full max-w-full">
        {/* Prominent Transparent Witch Animation */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center flex-shrink-0">
          <picture className="w-full h-full flex items-center justify-center">
            <source srcSet={webpSrc} type="image/webp" />
            <img
              src={gifSrc}
              alt="Peramal Ramalin"
              className="w-full h-full object-contain select-none pointer-events-none"
            />
          </picture>
        </div>

        {/* Speech Bubble */}
        <div className="relative flex-1 bg-tarot-surfaceElevated border border-amber-300/30 rounded-2xl p-3">
          <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-t-6 border-t-transparent border-r-8 border-r-tarot-surfaceElevated border-b-6 border-b-transparent" />
          
          <span className="text-[10px] uppercase font-serif font-bold tracking-wider text-amber-300 block mb-0.5">
            Ramalin
          </span>
          <p className="text-xs font-serif italic text-tarot-text leading-snug">
            "{dialogText}"
          </p>
        </div>
      </div>
    </div>
  );
};
