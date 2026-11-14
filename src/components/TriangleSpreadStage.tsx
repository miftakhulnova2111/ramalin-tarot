'use client';

import React from 'react';
import { SelectedCard } from '@/types/tarot';

interface TriangleSpreadStageProps {
  cards: SelectedCard[];
  isLoadingAI: boolean;
  activeCardIndex?: number;
  onCardClick?: (index: number) => void;
  compactRow?: boolean;
}

export const TriangleSpreadStage: React.FC<TriangleSpreadStageProps> = ({
  cards,
  isLoadingAI,
  activeCardIndex,
  onCardClick,
  compactRow = false,
}) => {
  if (cards.length < 3) return null;

  // Compact Row for Final Results Screen
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
                    : 'border-tarot-gold/30'
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
                  isActive ? 'text-amber-300' : 'text-tarot-text'
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

  const card1 = cards[0]; // Past
  const card2 = cards[1]; // Present
  const card3 = cards[2]; // Future

  const renderCard = (card: SelectedCard, index: number, isFeatured = false) => {
    const isActive = activeCardIndex === index;
    const cardWidthClass = isFeatured ? 'w-[105px] xs:w-[120px]' : 'w-[100px] xs:w-[115px]';
    const cardHeightClass = isFeatured ? 'h-[175px] xs:h-[200px]' : 'h-[165px] xs:h-[190px]';

    return (
      <div
        key={card.id || index}
        onClick={() => onCardClick?.(index)}
        className={`flex flex-col items-center cursor-pointer transition-all duration-300 ${
          isActive ? 'scale-105 z-20' : 'hover:scale-102 z-10'
        }`}
      >
        {/* 3D Flip Card Container */}
        <div className={`relative ${cardWidthClass} ${cardHeightClass} perspective-1000`}>
          <div
            className={`w-full h-full relative transform-style-3d transition-transform duration-700 ease-out ${
              card.isFlipped ? 'rotate-y-180' : ''
            }`}
          >
            {/* Card Back Face (Face Down) */}
            <div
              className={`absolute inset-0 backface-hidden rounded-xl overflow-hidden border ${
                isLoadingAI
                  ? 'border-tarot-gold ring-1 ring-tarot-gold/30 animate-pulse'
                  : 'border-tarot-border/50'
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
              className={`absolute inset-0 backface-hidden rotate-y-180 rounded-xl overflow-hidden border bg-tarot-surfaceElevated ${
                isActive
                  ? 'border-tarot-gold ring-2 ring-tarot-gold/40'
                  : 'border-tarot-gold/30'
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

        {/* English Card Title & Orientation */}
        <div className="mt-1.5 text-center max-w-[130px]">
          <p
            className={`text-xs font-serif font-bold leading-tight truncate ${
              isActive ? 'text-tarot-gold' : 'text-tarot-text'
            }`}
          >
            {card.isFlipped ? card.name : '••••••••'}
          </p>
          {card.isFlipped && (
            <span
              className={`text-[10px] font-sans font-semibold block mt-0.5 ${
                card.isReversed ? 'text-tarot-coral' : 'text-tarot-gold'
              }`}
            >
              {card.isReversed ? 'Reversed' : 'Upright'}
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
        <div className="w-64 h-64 rounded-full border border-tarot-gold/15 animate-[spin_60s_linear_infinite]" />
        <div className="absolute w-48 h-48 rounded-full border border-tarot-plum/30" />
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

      {/* Loading Status Glow if fetching AI */}
      {isLoadingAI && (
        <div className="mt-3 flex items-center gap-2 px-3 py-1 rounded-full bg-tarot-surfaceElevated border border-tarot-gold/40 shadow-md">
          <div className="w-2 h-2 rounded-full bg-tarot-gold animate-ping" />
          <span className="text-xs font-serif text-tarot-gold tracking-wide">
            Membuka tabir kartu...
          </span>
        </div>
      )}
    </div>
  );
};
