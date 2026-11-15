'use client';

import React, { useState, useEffect } from 'react';
import { SelectedCard } from '@/types/tarot';
import { Sparkles } from 'lucide-react';

interface TriangleSpreadStageProps {
  cards: SelectedCard[];
  isLoadingAI?: boolean;
  canTapToReveal?: boolean;
  activeCardIndex?: number;
  onCardClick?: (index: number) => void;
  onFlipCard?: (index: number) => void;
  compactRow?: boolean;
}

const MIND_READING_PHRASES = [
  'Sedang memusatkan cakra dan membaca getaran auramu...',
  'Menyusun benang takdir masa lalu, masa kini, dan masa depan...',
  'Menerjemahkan bisikan kartu ke dalam petuah batin...',
  'Menguak tabir misteri yang menyelubungi langkahmu...',
];

export const TriangleSpreadStage: React.FC<TriangleSpreadStageProps> = ({
  cards,
  isLoadingAI = false,
  canTapToReveal = false,
  activeCardIndex,
  onCardClick,
  onFlipCard,
  compactRow = false,
}) => {
  const [mindPhraseIdx, setMindPhraseIdx] = useState(0);

  // Rotate mind-reading phrases every 1.5s during AI fetch
  useEffect(() => {
    if (!isLoadingAI) return;
    const interval = setInterval(() => {
      setMindPhraseIdx((prev) => (prev + 1) % MIND_READING_PHRASES.length);
    }, 1500);
    return () => clearInterval(interval);
  }, [isLoadingAI]);

  if (cards.length < 3) return null;

  // Compact Row for Final Results Screen (ReadingBottomSheet)
  if (compactRow) {
    return (
      <div className="w-full max-w-full px-3 flex items-center justify-center gap-2 z-10 select-none">
        {cards.map((c, i) => {
          const isActive = activeCardIndex === i;
          return (
            <div
              key={c.id || i}
              onClick={() => onCardClick?.(i)}
              className={`flex-1 flex flex-col items-center cursor-pointer transition-all duration-300 ${
                isActive ? 'scale-105 z-20' : 'opacity-85 hover:opacity-100 z-10'
              }`}
            >
              <div
                className={`relative w-full aspect-[2/3] max-w-[78px] rounded-xl overflow-hidden border transition-all ${
                  isActive
                    ? 'border-amber-400 ring-2 ring-amber-400/40'
                    : 'border-amber-300/30'
                }`}
              >
                <img
                  src={c.image}
                  alt={c.name}
                  className={`w-full h-full object-cover ${c.isReversed ? 'rotate-180' : ''}`}
                />
              </div>
              <span
                className={`text-[10px] font-serif font-bold mt-1 truncate max-w-[75px] text-center ${
                  isActive ? 'text-amber-300' : 'text-stone-300'
                }`}
              >
                {c.name}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  // Determine which card is next in sequence to be flipped
  let nextUnflippedIdx = -1;
  for (let i = 0; i < cards.length; i++) {
    if (!cards[i].isFlipped) {
      nextUnflippedIdx = i;
      break;
    }
  }

  const card1 = cards[0];
  const card2 = cards[1];
  const card3 = cards[2];

  const handleCardTap = (idx: number) => {
    if (canTapToReveal) {
      if (!cards[idx].isFlipped) {
        onFlipCard?.(idx);
      }
    } else {
      onCardClick?.(idx);
    }
  };

  const renderCard = (card: SelectedCard, index: number, isFeatured = false) => {
    const isActive = activeCardIndex === index;
    const isNextTarget = canTapToReveal && index === nextUnflippedIdx;
    const isClickable = canTapToReveal ? !card.isFlipped : true;

    // Compact, balanced dimensions ensuring total vertical fit on mobile screens
    const cardWidthClass = isFeatured ? 'w-[88px] xs:w-[100px]' : 'w-[84px] xs:w-[94px]';
    const cardHeightClass = isFeatured ? 'h-[138px] xs:h-[156px]' : 'h-[132px] xs:h-[148px]';

    return (
      <div
        key={card.id || index}
        onClick={() => handleCardTap(index)}
        className={`flex flex-col items-center transition-all duration-300 relative ${
          isClickable ? 'cursor-pointer' : 'cursor-default'
        } ${isActive ? 'scale-105 z-20' : 'z-10'}`}
      >
        {/* 3D Flip Card Container */}
        <div className={`relative ${cardWidthClass} ${cardHeightClass} perspective-1000`}>
          <div
            className={`w-full h-full relative transform-style-3d transition-transform duration-600 ease-out ${
              card.isFlipped ? 'rotate-y-180' : ''
            }`}
          >
            {/* Card Back Face (Face Down) */}
            <div
              className={`absolute inset-0 backface-hidden rounded-xl overflow-hidden border ${
                isNextTarget
                  ? 'border-amber-400 ring-2 ring-amber-400/80 shadow-lg shadow-amber-400/30'
                  : 'border-amber-300/30'
              }`}
            >
              <img
                src="/cards/back.webp"
                alt="Punggung Kartu"
                className="w-full h-full object-cover"
              />

              {/* Instruction label placed INSIDE the card back */}
              {isNextTarget && (
                <div className="absolute inset-0 bg-stone-950/40 backdrop-blur-[1px] flex flex-col items-center justify-center p-1.5 select-none">
                  <span className="px-2 py-1 rounded-md bg-amber-400 text-stone-950 font-serif font-bold text-[9px] xs:text-[10px] text-center shadow-lg leading-tight animate-pulse border border-amber-200">
                    Buka Kartu ✦
                  </span>
                </div>
              )}
            </div>

            {/* Card Front Face (Face Up) */}
            <div
              className={`absolute inset-0 backface-hidden rotate-y-180 rounded-xl overflow-hidden border bg-stone-900 ${
                isActive
                  ? 'border-amber-400 ring-2 ring-amber-400/40 shadow-xl'
                  : 'border-amber-300/40'
              }`}
            >
              <img
                src={card.image}
                alt={card.name}
                className={`w-full h-full object-cover ${
                  card.isReversed ? 'rotate-180' : ''
                }`}
              />
            </div>
          </div>
        </div>

        {/* Card Title & Orientation (NO "PAST", "PRESENT", "FUTURE" text) */}
        {card.isFlipped && (
          <div className="mt-1 text-center max-w-[105px] leading-tight">
            <p className="text-[10px] xs:text-[11px] font-serif font-bold text-amber-200 truncate">
              {card.name}
            </p>
            <span
              className={`text-[9px] font-sans font-medium block ${
                card.isReversed ? 'text-rose-400' : 'text-amber-300/80'
              }`}
            >
              {card.isReversed ? 'Terbalik' : 'Tegak'}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-full px-2 flex flex-col items-center justify-center relative select-none">
      {/* Mystical Sacred Background Ring */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-56 h-56 rounded-full border border-amber-400/10 animate-[spin_60s_linear_infinite]" />
        <div className="absolute w-40 h-40 rounded-full border border-purple-500/10" />
      </div>

      {/* Row 1: Left & Right Cards */}
      <div className="flex items-start justify-center gap-3 xs:gap-5 w-full z-10">
        {renderCard(card1, 0)}
        {renderCard(card2, 1)}
      </div>

      {/* Row 2: Centered Below */}
      <div className="flex items-center justify-center mt-1.5 z-10">
        {renderCard(card3, 2, true)}
      </div>

      {/* Mind Reading Animation Screen when fetching AI */}
      {isLoadingAI && (
        <div className="mt-3 flex flex-col items-center gap-1.5 px-3 py-2 rounded-2xl bg-stone-900/90 border border-amber-300/30 shadow-xl max-w-xs text-center backdrop-blur-sm z-20 animate-fade-in">
          <div className="flex items-center gap-1.5 text-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span className="text-[11px] font-serif font-bold tracking-wider uppercase">
              Membaca Pikiran & Aura...
            </span>
          </div>
          <p className="text-[11px] font-serif italic text-amber-100/90 leading-tight">
            "{MIND_READING_PHRASES[mindPhraseIdx]}"
          </p>
        </div>
      )}
    </div>
  );
};
