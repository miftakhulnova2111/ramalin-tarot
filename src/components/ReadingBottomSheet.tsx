'use client';

import React from 'react';
import { SelectedCard, GeminiReadingResponse } from '@/types/tarot';
import { Share2, RotateCcw } from 'lucide-react';

interface ReadingBottomSheetProps {
  cards: SelectedCard[];
  reading: GeminiReadingResponse;
  activeCardIndex?: number;
  onTabChange?: (index: number) => void;
  onShare: () => void;
  onRestart: () => void;
}

export const ReadingBottomSheet: React.FC<ReadingBottomSheetProps> = ({
  cards,
  reading,
  onShare,
  onRestart,
}) => {
  return (
    <div className="w-full max-w-full bg-tarot-surface border-t border-amber-300/25 rounded-t-2xl flex flex-col max-h-[62dvh] z-30 transition-all duration-300">
      {/* Handle Drag Bar */}
      <div className="w-full flex justify-center pt-2.5 pb-1">
        <div className="w-10 h-1 rounded-full bg-amber-300/20" />
      </div>

      {/* Header Title */}
      <div className="px-4 py-2 border-b border-tarot-border/30 flex items-center justify-between">
        <div>
          <h2 className="font-serif font-bold text-sm text-amber-300 tracking-wide">
            Kisah Takdir & Pesan Semesta
          </h2>
          <span className="text-[11px] text-tarot-muted font-sans block">
            Untaian hikmah dari ketiga kartu cermin jiwamu
          </span>
        </div>
      </div>

      {/* Narrative Story Content (Unified Seamless Scroll) */}
      <div className="flex-grow overflow-y-auto custom-scrollbar px-4 py-3.5 flex flex-col gap-4 text-sm leading-relaxed">
        {/* Pembuka / Greeting */}
        {reading.greeting && (
          <div className="bg-tarot-surfaceElevated p-3.5 rounded-xl border border-amber-300/20">
            <span className="text-[10px] uppercase font-serif font-bold tracking-wider text-amber-300 block mb-1">
              Bisikan Awal
            </span>
            <p className="text-sm font-serif italic text-tarot-text leading-relaxed">
              "{reading.greeting}"
            </p>
          </div>
        )}

        {/* Babak 1: Akar Masa Lalu */}
        {cards[0] && reading.readings[0] && (
          <div className="flex flex-col gap-1.5 pb-3 border-b border-tarot-border/20">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-serif font-bold uppercase tracking-wider text-amber-200">
                Akar & Tempaan Awal
              </span>
              <span className="text-[10px] text-tarot-muted font-mono">
                {cards[0].isReversed ? 'Terbalik' : 'Tegak'}
              </span>
            </div>
            <h3 className="font-serif font-bold text-base text-amber-300">
              {cards[0].name}
            </h3>
            <p className="text-sm font-sans text-tarot-text/95 leading-relaxed">
              {reading.readings[0].interpretation}
            </p>
          </div>
        )}

        {/* Babak 2: Ombak Hari Ini */}
        {cards[1] && reading.readings[1] && (
          <div className="flex flex-col gap-1.5 pb-3 border-b border-tarot-border/20">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-serif font-bold uppercase tracking-wider text-amber-200">
                Ombak & Dinamika Hari Ini
              </span>
              <span className="text-[10px] text-tarot-muted font-mono">
                {cards[1].isReversed ? 'Terbalik' : 'Tegak'}
              </span>
            </div>
            <h3 className="font-serif font-bold text-base text-amber-300">
              {cards[1].name}
            </h3>
            <p className="text-sm font-sans text-tarot-text/95 leading-relaxed">
              {reading.readings[1].interpretation}
            </p>
          </div>
        )}

        {/* Babak 3: Fajar Masa Depan */}
        {cards[2] && reading.readings[2] && (
          <div className="flex flex-col gap-1.5 pb-3 border-b border-tarot-border/20">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-serif font-bold uppercase tracking-wider text-amber-200">
                Fajar Potensi Ke Depan
              </span>
              <span className="text-[10px] text-tarot-muted font-mono">
                {cards[2].isReversed ? 'Terbalik' : 'Tegak'}
              </span>
            </div>
            <h3 className="font-serif font-bold text-base text-amber-300">
              {cards[2].name}
            </h3>
            <p className="text-sm font-sans text-tarot-text/95 leading-relaxed">
              {reading.readings[2].interpretation}
            </p>
          </div>
        )}

        {/* Nasihat Penutup */}
        {reading.final_advice && (
          <div className="bg-tarot-surfaceElevated p-4 rounded-xl border border-amber-300/30">
            <span className="text-[10px] uppercase font-serif font-bold tracking-wider text-amber-300 block mb-1.5">
              Pesan Hikmah Semesta
            </span>
            <p className="text-sm font-serif italic text-amber-100/90 leading-relaxed">
              "{reading.final_advice.replace(/^Pesan (Hikmah )?untuk [^:]+:\s*/i, '').trim()}"
            </p>
          </div>
        )}
      </div>

      {/* Bottom Sticky Action Buttons */}
      <div className="flex-shrink-0 px-4 py-3 border-t border-tarot-border/30 bg-tarot-surface flex items-center gap-2">
        <button
          type="button"
          onClick={onShare}
          className="flex-1 min-h-[48px] bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-stone-950 font-serif font-bold text-xs tracking-wide rounded-xl flex items-center justify-center gap-1.5 border border-amber-300/40 cursor-pointer transition-all"
        >
          <Share2 className="w-4 h-4 text-stone-950" />
          <span>Bagikan Kisah Takdir</span>
        </button>

        <button
          type="button"
          onClick={onRestart}
          className="min-h-[48px] px-4 bg-tarot-surfaceElevated hover:bg-tarot-surface active:scale-[0.98] text-tarot-text border border-tarot-border/40 text-xs font-serif font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-amber-300" />
          <span>Sesi Baru</span>
        </button>
      </div>
    </div>
  );
};
