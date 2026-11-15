'use client';

import React from 'react';
import { SavedReadingSession } from '@/types/tarot';
import { X, Trash2, Calendar, ChevronRight } from 'lucide-react';

interface HistoryDrawerProps {
  isOpen: boolean;
  sessions: SavedReadingSession[];
  onClose: () => void;
  onSelectSession: (session: SavedReadingSession) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  sessions,
  onClose,
  onSelectSession,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 z-50">
      <div className="w-full max-w-sm bg-tarot-surface border border-tarot-border rounded-t-3xl sm:rounded-2xl p-4 flex flex-col max-h-[75dvh] shadow-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-tarot-border">
          <span className="font-serif font-bold text-sm text-tarot-gold">
            Riwayat Pembacaan Kartu
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-tarot-muted hover:text-tarot-text hover:bg-tarot-surfaceElevated"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto custom-scrollbar py-3 flex flex-col gap-2.5">
          {sessions.length === 0 ? (
            <p className="text-center text-xs font-mono text-tarot-muted py-8">
              Belum ada riwayat ramalan tersimpan.
            </p>
          ) : (
            sessions.map((s) => {
              const dateStr = new Date(s.timestamp).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={s.id}
                  onClick={() => onSelectSession(s)}
                  className="p-3 rounded-xl border border-tarot-border/60 bg-tarot-surfaceElevated/80 hover:border-tarot-gold cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div className="flex flex-col gap-1 pr-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-tarot-muted">
                      <Calendar className="w-3 h-3" />
                      <span>{s.userName ? `${s.userName} • ${dateStr}` : dateStr}</span>
                    </div>
                    <p className="text-xs font-serif font-bold text-tarot-text truncate max-w-[220px]">
                      "{s.question}"
                    </p>
                    <div className="flex gap-1">
                      {s.cards.map((c, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-tarot-canvas/60 text-tarot-gold border border-tarot-border/40 truncate max-w-[80px]"
                        >
                          {c.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-tarot-muted group-hover:text-tarot-gold transition-colors flex-shrink-0" />
                </div>
              );
            })
          )}
        </div>

        {sessions.length > 0 && (
          <div className="pt-2 border-t border-tarot-border/60">
            <button
              type="button"
              onClick={onClearHistory}
              className="w-full py-2 text-xs font-mono text-tarot-coral hover:bg-tarot-coral/10 rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Semua Riwayat</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
