'use client';

import React, { useState, useEffect, useRef } from 'react';
import { SelectedCard } from '@/types/tarot';
import { Sparkles } from 'lucide-react';
import { audioManager } from '@/utils/audio';

interface ShuffleStageProps {
  currentStep: number; // 1, 2, or 3
  selectedCards: SelectedCard[];
  isLocking: boolean;
  totalRemaining: number;
  onStop: (pickedCardIndex?: number) => void;
}

const SLOTS = [
  { index: 0, label: 'Kartu I' },
  { index: 1, label: 'Kartu II' },
  { index: 2, label: 'Kartu III' },
];

const TOTAL_CAROUSEL_CARDS = 9;
const RADIUS = 155; // Radius of semi-circle arc in pixels

export const ShuffleStage: React.FC<ShuffleStageProps> = ({
  currentStep,
  selectedCards,
  isLocking,
  onStop,
}) => {
  const [angleOffset, setAngleOffset] = useState<number>(0);
  const [animatingCardId, setAnimatingCardId] = useState<number | null>(null);
  const [animPhase, setAnimPhase] = useState<'idle' | 'zoom' | 'move_to_slot'>('idle');
  const animFrameRef = useRef<number | null>(null);

  // Fast & fluid carousel motion (~75 degrees per second)
  useEffect(() => {
    if (animPhase !== 'idle') return;

    let lastTime = performance.now();
    const updateMotion = (now: number) => {
      const dt = (now - lastTime) / 1000;
      lastTime = now;
      setAngleOffset((prev) => (prev + dt * 75) % 360);
      animFrameRef.current = requestAnimationFrame(updateMotion);
    };

    animFrameRef.current = requestAnimationFrame(updateMotion);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [animPhase]);

  // Play crisp acoustic riffle shuffle on deck round start
  useEffect(() => {
    audioManager.playCardShuffle();
  }, [currentStep]);

  // Card Selection: Zoom in -> Swoop UPWARD into top target slot
  const handleSelectCard = (cardIdx: number) => {
    if (isLocking || animPhase !== 'idle') return;

    // Trigger punchy card draw sound
    audioManager.playCardSlide();

    setAnimatingCardId(cardIdx);
    setAnimPhase('zoom');

    // Phase 1: Zoom in (280ms)
    setTimeout(() => {
      setAnimPhase('move_to_slot');

      // Phase 2: Swoop UPWARD to target slot (420ms)
      setTimeout(() => {
        onStop(cardIdx);
        setTimeout(() => {
          setAnimPhase('idle');
          setAnimatingCardId(null);
        }, 250);
      }, 420);
    }, 280);
  };

  const currentSlot = SLOTS[currentStep - 1] || SLOTS[0];

  return (
    <div className="w-full h-full max-w-full px-4 py-2 flex flex-col justify-between z-10 select-none overflow-hidden">
      {/* 
        ZONE 1 (TOP): 3 Target Card Boxes (Kartu I, II, III)
      */}
      <div className="w-full pt-1 pb-1">
        <div className="grid grid-cols-3 gap-2 bg-tarot-surface p-2.5 rounded-2xl border border-amber-300/25">
          {SLOTS.map((slot) => {
            const card = selectedCards[slot.index];
            const isFilled = !!card;
            const isCurrent = currentStep === slot.index + 1 && !isFilled;

            return (
              <div
                key={slot.index}
                className={`flex flex-col items-center p-2 rounded-xl border text-center transition-all duration-200 ${
                  isFilled
                    ? 'border-tarot-gold bg-tarot-surfaceElevated'
                    : isCurrent
                    ? 'border-amber-400 bg-amber-400/10 ring-1 ring-amber-400/30'
                    : 'border-tarot-border/30 bg-tarot-canvas/40 opacity-40'
                }`}
              >
                <span className="text-[11px] font-serif font-bold text-amber-200 truncate w-full mb-1">
                  {slot.label}
                </span>

                <div className="w-[44px] h-[77px] rounded-md border border-tarot-gold/30 overflow-hidden flex items-center justify-center bg-tarot-canvas">
                  {isFilled ? (
                    <img
                      src="/cards/back.webp"
                      alt={card.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-tarot-gold/30" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 
        ZONE 2 (MIDDLE): Semi-Circle Arc Carousel 
        Cards revolving swiftly around the sacred mandala
      */}
      <div className="relative w-full flex-1 min-h-[240px] flex items-center justify-center my-1">
        {/* Sacred Altar Ring Texture */}
        <div className="absolute w-64 h-64 rounded-full border border-tarot-gold/15 bg-radial from-amber-400/10 via-tarot-plum/10 to-transparent pointer-events-none" />
        <div className="absolute w-44 h-44 rounded-full border border-dashed border-tarot-gold/20 animate-[spin_40s_linear_infinite] pointer-events-none" />

        {/* The Arc Cards */}
        <div className="relative w-full h-full flex items-center justify-center">
          {Array.from({ length: TOTAL_CAROUSEL_CARDS }).map((_, idx) => {
            const baseAngle = (idx * (360 / TOTAL_CAROUSEL_CARDS)) + angleOffset;
            const normalizedAngle = ((baseAngle % 360) + 360) % 360;
            const relativeAngle = normalizedAngle > 180 ? normalizedAngle - 360 : normalizedAngle;

            const isVisible = relativeAngle >= -90 && relativeAngle <= 90;
            if (!isVisible && animatingCardId !== idx) return null;

            const rad = (relativeAngle * Math.PI) / 180;
            const x = RADIUS * Math.sin(rad);
            const y = (1 - Math.cos(rad)) * 75 - 35;
            const cardRot = relativeAngle * 0.7;
            const cardScale = Math.max(0.75, 1.05 - Math.abs(relativeAngle) / 140);
            const zIndex = Math.round(100 - Math.abs(relativeAngle));
            const opacity = Math.max(0.4, 1 - Math.abs(relativeAngle) / 110);

            const isAnimating = animatingCardId === idx;

            let transformStyle = `translate(${x}px, ${y}px) rotate(${cardRot}deg) scale(${cardScale})`;
            let transitionStyle = 'transform 0.05s linear, opacity 0.1s linear';
            let cardZIndex = zIndex;

            if (isAnimating) {
              cardZIndex = 500;
              if (animPhase === 'zoom') {
                // Phase 1: Zoom in and lift
                transformStyle = 'translate(0px, -20px) rotate(0deg) scale(1.35)';
                transitionStyle = 'transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)';
              } else if (animPhase === 'move_to_slot') {
                // Phase 2: Swoop UPWARD into top target slot
                // Slot 0 (Past): x = -105px; Slot 1 (Present): x = 0px; Slot 2 (Future): x = +105px
                const targetSlotX = (currentStep - 2) * 105;
                const targetSlotY = -180; // Upward into top slot box
                transformStyle = `translate(${targetSlotX}px, ${targetSlotY}px) rotate(0deg) scale(0.48)`;
                transitionStyle = 'transform 0.42s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.42s ease-in';
              }
            }

            return (
              <div
                key={idx}
                onClick={() => handleSelectCard(idx)}
                style={{
                  transform: transformStyle,
                  transition: transitionStyle,
                  zIndex: cardZIndex,
                  opacity: isAnimating ? 1 : opacity,
                }}
                className={`absolute w-24 h-42 rounded-lg overflow-hidden cursor-pointer ${
                  isAnimating
                    ? 'ring-2 ring-amber-300 scale-105'
                    : 'border border-amber-300/30 hover:border-amber-300'
                }`}
              >
                <img
                  src="/cards/back.webp"
                  alt="Punggung Kartu"
                  className="w-full h-full object-cover pointer-events-none"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* 
        ZONE 3 (BOTTOM): Action Button "Ambil Kartumu"
      */}
      <div className="w-full pb-2">
        <button
          type="button"
          disabled={isLocking || animPhase !== 'idle'}
          onClick={() => handleSelectCard(Math.floor(Math.random() * TOTAL_CAROUSEL_CARDS))}
          className={`w-full min-h-[52px] font-serif font-bold text-base tracking-wide rounded-2xl flex items-center justify-center gap-2 transition-all ${
            isLocking || animPhase !== 'idle'
              ? 'bg-tarot-surfaceElevated text-tarot-muted border border-tarot-border/20 cursor-not-allowed opacity-60'
              : 'bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-stone-950 border border-amber-300/40 cursor-pointer'
          }`}
        >
          <span>
            {animPhase !== 'idle' || isLocking
              ? `Mengunci Kartu...`
              : `Ambil Kartu ke-${currentStep}`}
          </span>
        </button>
      </div>
    </div>
  );
};
