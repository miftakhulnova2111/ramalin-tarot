'use client';

import React, { useState, useEffect, useRef } from 'react';
import { History as HistoryIcon, Volume2, VolumeX } from 'lucide-react';
import { audioManager } from '@/utils/audio';
import { useTarotEngine } from '@/hooks/useTarotEngine';
import { useAssetPreloader } from '@/hooks/useAssetPreloader';
import { CharacterHeader } from '@/components/CharacterHeader';
import { PrologueStage } from '@/components/PrologueStage';
import { InputFormStage } from '@/components/InputFormStage';
import { ShuffleStage } from '@/components/ShuffleStage';
import { TriangleSpreadStage } from '@/components/TriangleSpreadStage';
import { ReadingBottomSheet } from '@/components/ReadingBottomSheet';
import { ShareCardGenerator } from '@/components/ShareCardGenerator';
import { HistoryDrawer } from '@/components/HistoryDrawer';
import { SavedReadingSession, GeminiReadingResponse } from '@/types/tarot';

const STORAGE_KEY = 'ramalin_tarot_history';

export default function TarotPage() {
  const { isLoaded } = useAssetPreloader();
  const {
    stage,
    setStage,
    userName,
    question,
    selectedCards,
    remainingDeck,
    isLocking,
    reading,
    setReading,
    startReading,
    lockCard,
    flipCard,
    resetSession,
  } = useTarotEngine();

  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [isShareOpen, setIsShareOpen] = useState<boolean>(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [savedHistory, setSavedHistory] = useState<SavedReadingSession[]>([]);

  // Autoplay BGM automatically on first user touch/pointer interaction anywhere
  useEffect(() => {
    const startAudioOnFirstTouch = () => {
      audioManager.startBGM();
      setIsMuted(audioManager.isMuted());
      window.removeEventListener('pointerdown', startAudioOnFirstTouch);
      window.removeEventListener('keydown', startAudioOnFirstTouch);
    };
    window.addEventListener('pointerdown', startAudioOnFirstTouch, { once: true });
    window.addEventListener('keydown', startAudioOnFirstTouch, { once: true });
    return () => {
      window.removeEventListener('pointerdown', startAudioOnFirstTouch);
      window.removeEventListener('keydown', startAudioOnFirstTouch);
    };
  }, []);

  // Load history from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setSavedHistory(JSON.parse(raw));
      }
    } catch (e) {
      console.warn('Gagal membaca localStorage:', e);
    }
  }, []);

  // Save session helper (FIFO max 5)
  const saveSessionToHistory = (
    name: string,
    q: string,
    cards: typeof selectedCards,
    read: GeminiReadingResponse
  ) => {
    try {
      const newSession: SavedReadingSession = {
        id: `session_${Date.now()}`,
        timestamp: Date.now(),
        userName: name,
        question: q,
        cards,
        reading: read,
      };

      const updated = [newSession, ...savedHistory.filter((s) => s.id !== newSession.id)].slice(
        0,
        5
      );
      setSavedHistory(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Gagal menyimpan ke localStorage:', e);
    }
  };

  const handleClearHistory = () => {
    setSavedHistory([]);
    localStorage.removeItem(STORAGE_KEY);
    setIsHistoryOpen(false);
  };

  const handleSelectHistorySession = (session: SavedReadingSession) => {
    setIsHistoryOpen(false);
    resetSession();
    session.cards.forEach((_, idx) => flipCard(idx));
    setReading(session.reading);
    setStage('READING_COMPLETE');
  };

  // Trigger Gemini API and Transition to Manual Reveal
  const fetchingRef = useRef(false);

  useEffect(() => {
    if (stage === 'FETCHING_READING' && selectedCards.length === 3 && !fetchingRef.current) {
      fetchingRef.current = true;

      const runReadingFlow = async () => {
        try {
          const res = await fetch('/api/tarot', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: userName,
              question,
              cards: selectedCards,
            }),
          });

          const data: GeminiReadingResponse = await res.json();
          setReading(data);
          saveSessionToHistory(userName, question, selectedCards, data);

          // Transition directly to manual tap-to-reveal phase!
          setStage('REVEALING_CARDS');
          fetchingRef.current = false;
        } catch (err) {
          console.error('Fetch error:', err);
          setStage('REVEALING_CARDS');
          fetchingRef.current = false;
        }
      };

      runReadingFlow();
    }
  }, [stage, selectedCards.length, userName, question]);

  const currentStep = Math.min(selectedCards.length + 1, 3);
  const allCardsFlipped = selectedCards.length === 3 && selectedCards.every((c) => c.isFlipped);

  const handleToggleBgm = () => {
    const isPlaying = audioManager.toggleBGM();
    setIsMuted(!isPlaying);
  };

  return (
    <main className="h-[100dvh] max-h-[100dvh] w-full max-w-md mx-auto flex flex-col overflow-hidden relative bg-[#0C0614] text-tarot-text select-none">
      {/* Background Altar Glow & Celestial Ambience */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0F0819] via-[#1B0F2E] to-[#08030E] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_20%,rgba(140,60,160,0.22),transparent_75%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_65%,rgba(255,213,140,0.08),transparent_65%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(4,2,7,0.85)_100%)] pointer-events-none" />

      {/* Semantic Mystical Header with Quick BGM & History Controls */}
      <header className="flex-shrink-0 w-full h-11 px-4 flex items-center justify-between border-b border-amber-300/15 bg-stone-900/90 backdrop-blur-md z-30 select-none">
        <div className="flex items-center gap-2">
          <h1 className="font-serif font-bold text-xs text-amber-300 tracking-widest uppercase">
            Ramalin Tarot
          </h1>
          <span className="text-[10px] text-amber-200/50 font-sans hidden xs:inline">
            ✦ Tebaran 3 Kartu
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Quick Audio Mute / Unmute Toggle */}
          <button
            type="button"
            onClick={handleToggleBgm}
            className="p-1.5 rounded-lg text-amber-200/70 hover:text-amber-200 hover:bg-stone-800 transition-colors cursor-pointer"
            title={isMuted ? 'Nyalakan Musik' : 'Matikan Musik'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-stone-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-amber-300" />
            )}
          </button>

          {/* History Button */}
          {savedHistory.length > 0 && (
            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              className="p-1.5 rounded-lg text-amber-200/70 hover:text-amber-200 hover:bg-stone-800 transition-colors cursor-pointer"
              title="Riwayat Sesi"
            >
              <HistoryIcon className="w-4 h-4 text-amber-300" />
            </button>
          )}
        </div>
      </header>

      {/* Main Viewport Content Area */}
      <div className="flex-1 w-full flex flex-col justify-start overflow-hidden relative z-10">
        {/* Character Animation & Dialog (Visible in all stages except Prologue) */}
        {stage !== 'PROLOGUE' && (
          <CharacterHeader stage={stage} userName={userName} currentStep={currentStep} />
        )}

        {/* Stage 0: PROLOGUE (Interactive Story Dialogue with Fortune Teller) */}
        {stage === 'PROLOGUE' && (
          <PrologueStage onComplete={() => setStage('INPUT_FORM')} />
        )}

        {/* Stage 1: INPUT_FORM (Meja Altar Quick Focus Chips) */}
        {stage === 'INPUT_FORM' && (
          <InputFormStage
            onStart={startReading}
            onOpenHistory={() => setIsHistoryOpen(true)}
            hasHistory={savedHistory.length > 0}
          />
        )}

        {/* Stage 2: SHUFFLING & CARD_LOCKING */}
        {(stage === 'SHUFFLING' || stage === 'CARD_LOCKING') && (
          <ShuffleStage
            currentStep={currentStep}
            selectedCards={selectedCards}
            isLocking={isLocking}
            totalRemaining={remainingDeck.length}
            onStop={lockCard}
          />
        )}

        {/* Stage 3: FETCHING_READING (Mascot Mind Reading Transition) */}
        {stage === 'FETCHING_READING' && (
          <div className="flex flex-col items-center justify-center my-auto px-4 z-10 flex-1 w-full">
            <TriangleSpreadStage
              cards={selectedCards}
              isLoadingAI={true}
            />
          </div>
        )}

        {/* Stage 4: REVEALING_CARDS & CARDS_REVEALED_HOLD (Manual Tap-to-Reveal) */}
        {(stage === 'REVEALING_CARDS' || stage === 'CARDS_REVEALED_HOLD') && (
          <div className="flex flex-col items-center justify-between px-4 py-2 z-10 flex-1 w-full">
            <div className="my-auto w-full flex flex-col items-center">
              <TriangleSpreadStage
                cards={selectedCards}
                isLoadingAI={false}
                canTapToReveal={true}
                onFlipCard={(idx) => flipCard(idx)}
                onCardClick={(idx) => flipCard(idx)}
              />
            </div>

            {/* Action Zone: Tap instructions OR "Baca Penjelasan Lengkap" when all are flipped */}
            <div className="w-full pb-3 pt-2">
              {allCardsFlipped ? (
                <button
                  type="button"
                  onClick={() => setStage('READING_COMPLETE')}
                  className="w-full min-h-[52px] bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-stone-950 font-serif font-bold text-base tracking-wide rounded-2xl flex items-center justify-center gap-2 border border-amber-300/40 cursor-pointer shadow-lg shadow-amber-950/40 transition-all animate-bounce"
                >
                  <span>✦ Baca Penjelasan Lengkap ✦</span>
                </button>
              ) : (
                <div className="w-full py-2.5 text-center text-xs font-serif text-amber-200/70">
                  Sentuh kartu yang berpendar untuk membuka tabir takdir
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stage 5: READING_COMPLETE */}
        {stage === 'READING_COMPLETE' && reading && (
          <div className="flex flex-col justify-between w-full max-w-full flex-grow overflow-hidden z-10">
            {/* Spread is visible in upper portion */}
            <div className="flex-shrink-0 pt-2 pb-1">
              <TriangleSpreadStage
                compactRow={true}
                cards={selectedCards}
                isLoadingAI={false}
                activeCardIndex={activeCardIndex}
                onCardClick={(idx) => setActiveCardIndex(idx)}
              />
            </div>

            {/* Continuous Narrative Reading Sheet */}
            <ReadingBottomSheet
              cards={selectedCards}
              reading={reading}
              activeCardIndex={activeCardIndex}
              onTabChange={(idx) => setActiveCardIndex(idx)}
              onShare={() => setIsShareOpen(true)}
              onRestart={resetSession}
            />
          </div>
        )}
      </div>

      {/* Social Share Card Modal (9:16) */}
      {reading && selectedCards.length === 3 && (
        <ShareCardGenerator
          userName={userName}
          question={question}
          cards={selectedCards}
          reading={reading}
          isOpen={isShareOpen}
          onClose={() => setIsShareOpen(false)}
        />
      )}

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        sessions={savedHistory}
        onClose={() => setIsHistoryOpen(false)}
        onSelectSession={handleSelectHistorySession}
        onClearHistory={handleClearHistory}
      />
    </main>
  );
}
