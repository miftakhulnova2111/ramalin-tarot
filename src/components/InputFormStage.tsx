'use client';

import React, { useState } from 'react';
import { History, Sparkles, PenLine, Heart, Briefcase, Moon, Compass } from 'lucide-react';
import { audioManager } from '@/utils/audio';

interface InputFormStageProps {
  onStart: (name: string, question: string) => void;
  onOpenHistory: () => void;
  hasHistory: boolean;
}

const QUICK_TOPICS = [
  {
    id: 'asmara',
    icon: Heart,
    label: 'Asmara & Hubungan',
    query: 'Bagaimana kejelasan dan arah perjalanan asmara serta ikatan hatiku saat ini?',
  },
  {
    id: 'karier',
    icon: Briefcase,
    label: 'Arah Karier & Rezeki',
    query: 'Bagaimana peluang kelancaran rezeki dan arah perkembangan karierku ke depan?',
  },
  {
    id: 'galau',
    icon: Moon,
    label: 'Mengurai Kegalauan Batin',
    query: 'Apa petunjuk semesta untuk mengatasi kegelisahan batin yang sedang kuhadapi?',
  },
  {
    id: 'semesta',
    icon: Compass,
    label: 'Pesan Semesta Hari Ini',
    query: 'Pesan hikmah dan panduan apa yang paling penting untuk kudengar hari ini?',
  },
];

export const InputFormStage: React.FC<InputFormStageProps> = ({
  onStart,
  onOpenHistory,
  hasHistory,
}) => {
  const [name, setName] = useState('');
  const [question, setQuestion] = useState(QUICK_TOPICS[0].query);
  const [selectedTopicId, setSelectedTopicId] = useState<string>(QUICK_TOPICS[0].id);
  const [isCustomMode, setIsCustomMode] = useState(false);

  const handleSelectTopic = (topic: typeof QUICK_TOPICS[0]) => {
    audioManager.startBGM();
    audioManager.playCardSlide();
    setSelectedTopicId(topic.id);
    setQuestion(topic.query);
    setIsCustomMode(false);
  };

  const handleEnableCustom = () => {
    audioManager.startBGM();
    audioManager.playCardSlide();
    setSelectedTopicId('custom');
    if (!isCustomMode) {
      setQuestion('');
    }
    setIsCustomMode(true);
  };

  const isValid = question.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;

    audioManager.playCardShuffle();
    const finalName = name.trim() || 'Pengelana Jiwa';
    onStart(finalName, question);
  };

  return (
    <div className="w-full max-w-full px-4 pt-1 pb-3 flex flex-col items-center justify-start flex-grow z-10 select-none">
      <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto flex flex-col gap-2.5">
        {/* Section 1: Quick Focus Chips (1-Click Selection) */}
        <div className="bg-stone-900/90 border border-amber-300/25 rounded-2xl p-3 flex flex-col gap-2 shadow-xl backdrop-blur-sm">
          <div className="flex items-center justify-between pb-1 border-b border-stone-800">
            <span className="text-[11px] font-serif font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Pilih Fokus Niatmu</span>
            </span>
            <span className="text-[10px] text-amber-200/60 font-sans">1 Sentuhan</span>
          </div>

          {/* 4 Topic Chips Grid */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {QUICK_TOPICS.map((topic) => {
              const isSelected = selectedTopicId === topic.id;
              const Icon = topic.icon;
              return (
                <button
                  key={topic.id}
                  type="button"
                  onClick={() => handleSelectTopic(topic)}
                  className={`min-h-[46px] p-2 rounded-xl text-left border flex items-center gap-2 transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-amber-400/20 border-amber-400 text-amber-200 shadow-md ring-1 ring-amber-400/40'
                      : 'bg-stone-950/60 border-stone-800 text-stone-300 hover:border-amber-300/40 hover:text-amber-200'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 transition-colors ${
                      isSelected ? 'text-amber-300' : 'text-amber-400/70'
                    }`}
                  />
                  <span className="text-xs font-serif font-medium leading-tight">
                    {topic.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Custom Question Toggle */}
          <div className="pt-1 border-t border-stone-800/80">
            {!isCustomMode ? (
              <button
                type="button"
                onClick={handleEnableCustom}
                className="w-full py-1.5 text-center text-xs text-amber-300/70 hover:text-amber-300 font-sans flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <PenLine className="w-3 h-3 text-amber-400/80" />
                <span>Punya pertanyaan khusus? Ketik di sini</span>
              </button>
            ) : (
              <div className="flex flex-col gap-1 pt-1">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value.slice(0, 140))}
                  placeholder="Tuliskan kegelisahan atau pertanyaan spesifikmu..."
                  rows={2}
                  className="w-full bg-stone-950 border border-amber-300/40 focus:border-amber-400 rounded-xl p-2.5 text-xs text-stone-100 placeholder:text-stone-500 focus:outline-none transition-all resize-none shadow-inner"
                />
                <div className="flex justify-between text-[10px] text-stone-400">
                  <button
                    type="button"
                    onClick={() => handleSelectTopic(QUICK_TOPICS[0])}
                    className="text-amber-400/80 hover:underline"
                  >
                    Kembali ke topik cepat
                  </button>
                  <span>{question.length}/140</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Section 2: Optional Player Name */}
        <div className="bg-stone-900/60 border border-stone-800 rounded-xl px-3 py-2 flex items-center justify-between gap-2">
          <label htmlFor="tarot-name-input" className="text-xs text-amber-200/70 font-sans whitespace-nowrap">
            Nama (Opsional):
          </label>
          <input
            id="tarot-name-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 30))}
            placeholder="Pengelana Jiwa"
            className="flex-1 bg-stone-950/80 border border-stone-800 focus:border-amber-400/60 rounded-lg px-2.5 py-1 text-xs text-stone-200 placeholder:text-stone-600 focus:outline-none text-right"
          />
        </div>

        {/* Section 3: Action Start Button */}
        <div className="flex flex-col gap-2 pt-0.5">
          <button
            type="submit"
            disabled={!isValid}
            className={`w-full min-h-[52px] font-serif font-bold text-base tracking-wide rounded-2xl flex items-center justify-center gap-2 transition-all duration-150 ${
              isValid
                ? 'bg-amber-500 hover:bg-amber-400 active:scale-[0.98] text-stone-950 border border-amber-300/40 shadow-lg shadow-amber-950/40 cursor-pointer'
                : 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed opacity-50'
            }`}
          >
            <span>{isValid ? 'Mulai Ramalan Kartu' : 'Pilih Topik Di Atas'}</span>
          </button>

          {hasHistory && (
            <button
              type="button"
              onClick={onOpenHistory}
              className="w-full py-1 flex items-center justify-center gap-1.5 text-xs text-stone-400 hover:text-amber-200 transition-colors"
            >
              <History className="w-3.5 h-3.5 text-amber-300" />
              <span>Lihat Riwayat Sesi Terakhir</span>
            </button>
          )}

          {/* Attribution signature */}
          <p className="text-center text-[10px] font-sans text-amber-200/40 tracking-wider pt-1 select-none">
            ✦ Crafted with magic by <span className="text-amber-300/70 font-medium">Nova Miftakhul Huda</span> ✦
          </p>
        </div>
      </form>
    </div>
  );
};
