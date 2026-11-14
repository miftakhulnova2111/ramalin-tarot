'use client';

import React, { useState } from 'react';
import { Sparkles, History, User, HelpCircle } from 'lucide-react';
import { audioManager } from '@/utils/audio';

interface InputFormStageProps {
  onStart: (name: string, question: string) => void;
  onOpenHistory: () => void;
  hasHistory: boolean;
}

export const InputFormStage: React.FC<InputFormStageProps> = ({
  onStart,
  onOpenHistory,
  hasHistory,
}) => {
  const [name, setName] = useState('');
  const [question, setQuestion] = useState('');

  const isValid = name.trim().length > 0 && question.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onStart(name, question);
  };

  // Trigger audio context wake-up on first user interaction
  const handleInteraction = () => {
    audioManager.startBGM();
  };

  return (
    <div
      onClick={handleInteraction}
      className="w-full max-w-full px-4 pt-1 pb-4 flex flex-col items-center justify-start flex-grow z-10 select-none"
    >
      <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto flex flex-col gap-3 mt-1.5">
        {/* Form Fields Card */}
        <div className="bg-tarot-surface border border-amber-300/25 rounded-2xl p-4 flex flex-col gap-3">
          {/* Input 1: Player Name */}
          <div>
            <label
              htmlFor="tarot-name"
              className="flex items-center gap-1.5 text-xs font-serif font-bold text-amber-300 mb-1.5 tracking-wider uppercase"
            >
              <User className="w-3.5 h-3.5 text-amber-300" />
              <span>Nama Lengkap / Panggilan</span>
            </label>
            <input
              id="tarot-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 40))}
              placeholder="Ketik namamu di sini..."
              className="w-full bg-tarot-surfaceElevated border border-tarot-plum/50 focus:border-amber-400 rounded-xl px-4 py-3 text-base text-tarot-text placeholder:text-tarot-muted/50 focus:outline-none transition-all shadow-inner"
            />
          </div>

          {/* Input 2: Player Question */}
          <div>
            <label
              htmlFor="tarot-question"
              className="flex items-center gap-1.5 text-xs font-serif font-bold text-amber-300 mb-1.5 tracking-wider uppercase"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-300" />
              <span>Hal yang Ingin Dikonsultasikan / Diresapi</span>
            </label>
            <textarea
              id="tarot-question"
              value={question}
              onChange={(e) => setQuestion(e.target.value.slice(0, 140))}
              placeholder="Tuliskan kegelisahan atau hal yang ingin kamu telusuri..."
              rows={2}
              className="w-full bg-tarot-surfaceElevated border border-tarot-plum/50 focus:border-amber-400 rounded-xl p-3.5 text-base text-tarot-text placeholder:text-tarot-muted/50 focus:outline-none transition-all resize-none shadow-inner leading-relaxed"
            />
            <div className="flex items-center justify-between mt-1 text-[11px] text-tarot-muted">
              <span>Maksimal 140 karakter</span>
              <span className={question.length >= 130 ? 'text-tarot-coral font-bold' : 'text-amber-200/70'}>
                {question.length}/140
              </span>
            </div>
          </div>
        </div>

        {/* Action Button: Directly connected below form card */}
        <div className="flex flex-col gap-2 pt-0.5">
          <button
            type="submit"
            disabled={!isValid}
            className={`w-full min-h-[52px] font-serif font-bold text-base tracking-wide rounded-2xl flex items-center justify-center gap-2 transition-all duration-150 ${
              isValid
                ? 'bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-stone-950 border border-amber-300/40 cursor-pointer'
                : 'bg-tarot-surfaceElevated text-tarot-muted/50 border border-tarot-border/20 cursor-not-allowed opacity-50'
            }`}
          >
            <span>{isValid ? 'Mulai Ramalan Kartu' : 'Isi Nama & Topik'}</span>
          </button>

          {hasHistory && (
            <button
              type="button"
              onClick={onOpenHistory}
              className="w-full py-1.5 flex items-center justify-center gap-1.5 text-xs text-tarot-muted hover:text-amber-200 transition-colors"
            >
              <History className="w-3.5 h-3.5 text-amber-300" />
              <span>Lihat Riwayat Sesi Terakhir</span>
            </button>
          )}

          {/* Subtle signature */}
          <p className="text-center text-[10px] font-sans text-amber-200/40 tracking-wider pt-2 select-none">
            ✦ Crafted with magic by <span className="text-amber-300/70 font-medium">Nova Miftakhul Huda</span> ✦
          </p>
        </div>
      </form>
    </div>
  );
};
