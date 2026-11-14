'use client';

import { useState, useCallback } from 'react';
import {
  GameStage,
  TarotCardData,
  SelectedCard,
  GeminiReadingResponse,
} from '@/types/tarot';
import rawDeckData from '@/data/tarotDeck.json';
import { audioManager } from '@/utils/audio';

const ALL_CARDS: TarotCardData[] = rawDeckData as TarotCardData[];

const POSITION_LABELS: ('Past' | 'Present' | 'Future')[] = [
  'Past',
  'Present',
  'Future',
];

// Fisher-Yates Shuffle
function shuffleCards<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function useTarotEngine() {
  const [stage, setStage] = useState<GameStage>('INPUT_FORM');
  const [userName, setUserName] = useState<string>('');
  const [question, setQuestion] = useState<string>('');
  const [remainingDeck, setRemainingDeck] = useState<TarotCardData[]>([]);
  const [selectedCards, setSelectedCards] = useState<SelectedCard[]>([]);
  const [activePointer, setActivePointer] = useState<number>(0);
  const [isLocking, setIsLocking] = useState<boolean>(false);
  const [reading, setReading] = useState<GeminiReadingResponse | null>(null);

  // Start reading session with Player's Name & Question
  const startReading = useCallback((name: string, userQuestion: string) => {
    const cleanName = name.trim() || 'Pengelana';
    const cleanQuestion = userQuestion.trim() || 'Petunjuk semesta untuk langkah batin hari ini';

    // Start background music automatically
    audioManager.startBGM();

    setUserName(cleanName);
    setQuestion(cleanQuestion);
    const shuffled = shuffleCards(ALL_CARDS);
    setRemainingDeck(shuffled);
    setSelectedCards([]);
    setActivePointer(0);
    setIsLocking(false);
    setReading(null);
    setStage('SHUFFLING');
  }, []);

  // Lock one card (User tapped a card in the arc carousel or clicked Ambil Kartumu)
  const lockCard = useCallback((cardIndexToPick?: number) => {
    if (isLocking || stage !== 'SHUFFLING' || remainingDeck.length === 0) {
      return;
    }

    setIsLocking(true);
    setStage('CARD_LOCKING');

    // Pick card either by specific index or random pointer
    const pickIndex =
      typeof cardIndexToPick === 'number' && cardIndexToPick >= 0 && cardIndexToPick < remainingDeck.length
        ? cardIndexToPick
        : Math.floor(Math.random() * remainingDeck.length);

    const currentCard = remainingDeck[pickIndex];
    const currentIndex = selectedCards.length as 0 | 1 | 2;

    // 75% Upright, 25% Reversed
    const isReversed = Math.random() < 0.25;

    const newSelected: SelectedCard = {
      ...currentCard,
      positionIndex: currentIndex,
      positionLabel: POSITION_LABELS[currentIndex],
      isReversed,
      isFlipped: false,
    };

    const updatedSelected = [...selectedCards, newSelected];
    setSelectedCards(updatedSelected);

    // Remove chosen card from deck
    const nextDeck = [...remainingDeck];
    nextDeck.splice(pickIndex, 1);
    setRemainingDeck(nextDeck);

    // Play chime when card locks into slot
    audioManager.playCardChime();

    // 250ms docking cooldown
    setTimeout(() => {
      setIsLocking(false);

      if (updatedSelected.length >= 3) {
        // All 3 cards chosen -> proceed to fetching reading
        setStage('FETCHING_READING');
      } else {
        // Continue picking next card
        setStage('SHUFFLING');
      }
    }, 250);
  }, [isLocking, stage, remainingDeck, selectedCards]);

  // Mark a specific card as flipped open
  const flipCard = useCallback((cardIndex: number) => {
    setSelectedCards((prev) =>
      prev.map((card, idx) =>
        idx === cardIndex ? { ...card, isFlipped: true } : card
      )
    );
  }, []);

  // Sequential Reveal: Flips 0 -> 1 -> 2 with robust timeouts and audio chimes
  const revealCardsSequentially = useCallback((onComplete: () => void) => {
    // Flip Card 0 (Past)
    audioManager.playRevealChime(0);
    setSelectedCards((prev) =>
      prev.map((card, idx) => (idx === 0 ? { ...card, isFlipped: true } : card))
    );

    // Flip Card 1 (Present) after 650ms
    setTimeout(() => {
      audioManager.playRevealChime(1);
      setSelectedCards((prev) =>
        prev.map((card, idx) => (idx <= 1 ? { ...card, isFlipped: true } : card))
      );

      // Flip Card 2 (Future) after another 650ms
      setTimeout(() => {
        audioManager.playRevealChime(2);
        setSelectedCards((prev) =>
          prev.map((card) => ({ ...card, isFlipped: true }))
        );

        // Complete after final 600ms
        setTimeout(() => {
          onComplete();
        }, 600);
      }, 650);
    }, 650);
  }, []);

  // Reset entire session
  const resetSession = useCallback(() => {
    setStage('INPUT_FORM');
    setUserName('');
    setQuestion('');
    setRemainingDeck([]);
    setSelectedCards([]);
    setActivePointer(0);
    setIsLocking(false);
    setReading(null);
  }, []);

  return {
    stage,
    setStage,
    userName,
    question,
    selectedCards,
    remainingDeck,
    activePointer,
    isLocking,
    reading,
    setReading,
    startReading,
    lockCard,
    flipCard,
    revealCardsSequentially,
    resetSession,
  };
}
