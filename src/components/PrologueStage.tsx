'use client';

import React, { useState } from 'react';
import { audioManager } from '@/utils/audio';

interface PrologueStageProps {
  onComplete: () => void;
}

const PROLOGUE_STEPS = [
  {
    step: 1,
    title: 'Panggilan Semesta',
    mascotAnimation: '/animations/anim_1_idle.webp',
    mascotFallback: '/animations/anim_1_idle.gif',
    dialogue:
      'Kurasakan getaran jiwamu mendekat ke altar ini... Sudah lama semesta menunggumu, wahai pengelana.',
    buttonText: 'Lanjut ✦',
  },
  {
    step: 2,
    title: 'Penyelarasan Energi',
    mascotAnimation: '/animations/anim_5_think.webp',
    mascotFallback: '/animations/anim_5_think.gif',
    dialogue:
      'Heningkan sejenak riuhnya dunia di luar sana. Tarik napas perlahan... Biarkan frekuensimu menyatu dengan kartu-kartu di hadapanku.',
    buttonText: 'Lanjut ✦',
  },
  {
    step: 3,
    title: 'Gerbang Takdir',
    mascotAnimation: '/animations/anim_2_shuffle.webp',
    mascotFallback: '/animations/anim_2_shuffle.gif',
    dialogue:
      'Kartu-kartu ini tidak berbohong. Mereka hanya mencerminkan apa yang sesungguhnya telah diketahui oleh hatimu yang terdalam. Apakah jiwamu siap?',
    buttonText: 'Buka Altar Tarot ✦',
  },
];

export const PrologueStage: React.FC<PrologueStageProps> = ({ onComplete }) => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);

  const handleNext = () => {
    audioManager.startBGM();
    audioManager.playCardSlide();

    if (currentStepIdx < PROLOGUE_STEPS.length - 1) {
      setCurrentStepIdx((prev) => prev + 1);
    } else {
      audioManager.playCardShuffle();
      onComplete();
    }
  };

  const handleSkip = () => {
    audioManager.startBGM();
    audioManager.playCardShuffle();
    onComplete();
  };

  const currentStep = PROLOGUE_STEPS[currentStepIdx];

  return (
    <div className="w-full flex-grow flex flex-col justify-between items-center px-4 py-2 select-none relative z-10 overflow-hidden">
      {/* Top Header: Step Indicator & Skip Button */}
      <div className="w-full flex items-center justify-between pt-1 pb-1 flex-shrink-0 max-w-sm">
        <div className="flex items-center gap-1.5">
          {PROLOGUE_STEPS.map((_, idx) => (
            <div
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentStepIdx
                  ? 'w-6 bg-amber-400'
                  : idx < currentStepIdx
                  ? 'w-2 bg-amber-400/60'
                  : 'w-2 bg-stone-700'
              }`}
            />
          ))}
          <span className="text-[11px] font-sans text-amber-200/70 ml-1.5">
            {currentStepIdx + 1} dari 3
          </span>
        </div>

        <button
          type="button"
          onClick={handleSkip}
          className="text-xs font-sans text-amber-200/60 hover:text-amber-200 px-2 py-1 rounded-lg border border-transparent hover:border-amber-300/30 transition-all cursor-pointer"
        >
          Lewati ↗
        </button>
      </div>

      {/* Center Conversational Zone: Mascot + Badge + Speech Bubble (Unified & Shifted Up) */}
      <div className="w-full flex-1 flex flex-col items-center justify-center my-auto max-w-sm">
        {/* Sacred Altar Rings and Mascot Avatar */}
        <div className="relative flex flex-col items-center justify-center">
          {/* Sacred Altar Aura Rings */}
          <div className="absolute w-52 h-52 sm:w-60 sm:h-60 rounded-full border border-amber-400/15 bg-radial from-amber-400/10 via-purple-950/20 to-transparent pointer-events-none" />
          <div className="absolute w-40 h-40 sm:w-44 sm:h-44 rounded-full border border-dashed border-amber-300/20 animate-[spin_50s_linear_infinite] pointer-events-none" />

          {/* Mascot Avatar with Subtle Glow */}
          <div className="relative z-10 w-32 h-32 sm:w-36 sm:h-36 rounded-full overflow-hidden border-2 border-amber-300/50 shadow-xl shadow-amber-950/50 bg-stone-950 flex items-center justify-center transition-all duration-300">
            <picture>
              <source srcSet={currentStep.mascotAnimation} type="image/webp" />
              <img
                src={currentStep.mascotFallback}
                alt="Sang Peramal Ramalin"
                className="w-full h-full object-cover"
              />
            </picture>
          </div>

          {/* Step Badge */}
          <span className="mt-2.5 text-[11px] font-serif tracking-widest text-amber-300/80 uppercase">
            ✦ {currentStep.title} ✦
          </span>
        </div>

        {/* Speech Bubble right under character badge (shifted up) */}
        <div className="w-full bg-stone-900/90 border border-amber-300/25 rounded-2xl p-4 shadow-xl backdrop-blur-sm relative mt-4">
          {/* Subtle speech tail pointing directly up to mascot */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-stone-900 border-t border-l border-amber-300/25 rotate-45" />

          <p className="text-center font-serif text-amber-100/95 text-xs sm:text-sm leading-relaxed italic">
            "{currentStep.dialogue}"
          </p>
        </div>
      </div>

      {/* Bottom Zone: Action CTA Button */}
      <div className="w-full max-w-sm pb-3 pt-1 flex-shrink-0">
        <button
          type="button"
          onClick={handleNext}
          className="w-full min-h-[50px] bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-stone-950 font-serif font-bold text-sm sm:text-base tracking-wide rounded-2xl flex items-center justify-center gap-2 border border-amber-300/40 shadow-lg shadow-amber-950/40 cursor-pointer transition-all duration-150"
        >
          <span>{currentStep.buttonText}</span>
        </button>
      </div>
    </div>
  );
};
