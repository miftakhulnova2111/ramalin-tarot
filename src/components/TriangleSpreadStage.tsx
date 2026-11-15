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
  onAllFlipped?: () => void;
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
  onAllFlipped,
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
      <div className="w-full max-w-full px-3 flex items-center justify-center gap-2.5 z-10 select-none">
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
                className={`relative w-full aspect-[2/3] max-w-[84px] rounded-xl overflow-hidden border transition-all ${
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
                className={`text-[10px] font-serif font-bold mt-1 truncate max-w-[80px] text-center ${
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

  const allAreFlipped = nextUnflippedIdx === -1;

  const card1 = cards[0]; // Past
  const card2 = cards[1]; // Present
  const card3 = cards[2]; // Future

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

    const cardWidthClass = isFeatured ? 'w-[108px] xs:w-[124px]' : 'w-[102px] xs:w-[118px]';
    const cardHeightClass = isFeatured ? 'h-[178px] xs:h-[204px]' : 'h-[168px] xs:h-[194px]';

    return (
      <div
        key={card.id || index}
        onClick={() => handleCardTap(index)}
        className={`flex flex-col items-center transition-all duration-300 relative ${
          isClickable ? 'cursor-pointer' : 'cursor-default'
        } ${isActive ? 'scale-105 z-20' : 'z-10'}`}
      >
        {/* Glowing Indicator for the next card to be revealed */}
        {isNextTarget && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-amber-400 text-stone-950 font-serif font-bold text-[10px] px-2 py-0.5 rounded-full shadow-lg animate-bounce z-30">
            Ketuk Di Sini ✦
          </div>
        )}

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
                  ? 'border-amber-300 ring-2 ring-amber-400 shadow-lg shadow-amber-400/30'
                  : 'border-amber-300/30 hover:border-amber-300/60'
              }`}
            >
              <img
                src="/cards/back.webp"
                alt="Punggung Kartu"
                className="w-full h-full object-cover"
              />
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

        {/* Card Title & Position Label */}
        <div className="mt-1.5 text-center max-w-[130px]">
          <span className="text-[10px] font-sans uppercase tracking-widest text-amber-300/70 block">
            {card.positionLabel}
          </span>
          <p
            className={`text-xs font-serif font-bold leading-tight truncate ${
              card.isFlipped ? 'text-amber-200' : 'text-stone-500'
            }`}
          >
            {card.isFlipped ? card.name : '••••••••'}
          </p>
          {card.isFlipped && (
            <span
              className={`text-[10px] font-sans font-semibold block mt-0.5 ${
                card.isReversed ? 'text-rose-400' : 'text-amber-300'
              }`}
            >
              {card.isReversed ? 'Terbalik' : 'Tegak'}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-full px-2 flex flex-col items-center justify-center relative select-none">
      {/* Mystical Sacred Background Ring */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-64 h-64 rounded-full border border-amber-400/10 animate-[spin_60s_linear_infinite]" />
        <div className="absolute w-48 h-48 rounded-full border border-purple-500/10" />
      </div>

      {/* Row 1: Past (Left) & Present (Right) */}
      <div className="flex items-start justify-center gap-4 sm:gap-6 w-full z-10">
        {renderCard(card1, 0)}
        {renderCard(card2, 1)}
      </div>

      {/* Row 2: Future (Centered Below) */}
      <div className="flex items-center justify-center mt-2 z-10">
        {renderCard(card3, 2, true)}
      </div>

      {/* Mind Reading Animation Screen when fetching AI */}
      {isLoadingAI && (
        <div className="mt-4 flex flex-col items-center gap-2 px-4 py-2.5 rounded-2xl bg-stone-900/90 border border-amber-300/30 shadow-xl max-w-xs text-center backdrop-blur-sm z-20 animate-fade-in">
          <div className="flex items-center gap-2 text-amber-300">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
            <span className="text-xs font-serif font-bold tracking-wider uppercase">
              Membaca Pikiran & Aura...
            </span>
          </div>
          <p className="text-xs font-serif italic text-amber-100/90 leading-snug">
            "{MIND_READING_PHRASES[mindPhraseIdx]}"
          </p>
        </div>
      )}

      {/* Tap-to-Reveal Instruction Bar */}
      {canTapToReveal && !isLoadingAI && (
        <div className="mt-3 px-4 py-1.5 rounded-full bg-stone-900/80 border border-amber-300/30 text-center z-20">
          <p className="text-xs font-serif text-amber-200">
            {!allAreFlipped ? (
              <span>
                Ketuk kartu yang berpendar untuk membuka{' '}
                <strong className="text-amber-300 underline font-bold">
                  {cards[nextUnflippedIdx]?.positionLabel === 'Past'
                    ? 'Masa Lalu'
                    : cards[nextUnflippedIdx]?.positionLabel === 'Present'
                    ? 'Masa Kini'
                    : 'Masa Depan'}
                </strong>
              </span>
            ) : (
              <span className="text-amber-300 font-bold">
                ✦ Semua kartu telah terbuka sempurna ✦
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  );
};
