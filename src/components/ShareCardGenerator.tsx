'use client';

import React, { useState } from 'react';
import { SelectedCard, GeminiReadingResponse } from '@/types/tarot';
import { Download, Share2, Check, Loader2 } from 'lucide-react';

interface ShareCardGeneratorProps {
  userName?: string;
  question: string;
  cards: SelectedCard[];
  reading: GeminiReadingResponse;
  isOpen: boolean;
  onClose: () => void;
}

// Helper to load an image into an HTMLImageElement
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      // If local crossOrigin fails, try without crossOrigin
      const fallbackImg = new Image();
      fallbackImg.onload = () => resolve(fallbackImg);
      fallbackImg.onerror = reject;
      fallbackImg.src = src;
    };
    img.src = src;
  });
}

// Draw rounded rectangle helper
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

export const ShareCardGenerator: React.FC<ShareCardGeneratorProps> = ({
  userName = 'Pengelana',
  question,
  cards,
  reading,
  isOpen,
  onClose,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isShared, setIsShared] = useState(false);

  if (!isOpen) return null;

  const card1 = cards[0];
  const card2 = cards[1];
  const card3 = cards[2];

  // Pure HTML5 Canvas 1080x1920 Story Generator (Guaranteed No Blank Screen)
  const generateStoryBlob = async (): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D context not available');

    // 1. Background Gradient (Enchanted Twilight)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920);
    bgGrad.addColorStop(0, '#1E1229');
    bgGrad.addColorStop(0.35, '#150F21');
    bgGrad.addColorStop(1, '#0B0813');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1920);

    // 2. Mystical Sacred Circles & Ambient Stars
    ctx.strokeStyle = 'rgba(255, 213, 140, 0.12)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(540, 960, 480, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(115, 59, 115, 0.25)';
    ctx.beginPath();
    ctx.arc(540, 960, 360, 0, Math.PI * 2);
    ctx.stroke();

    // 3. Header: App Branding
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFD58C';
    ctx.font = 'bold 36px serif';
    ctx.fillText('✦ RAMALIN TAROT ✦', 540, 150);

    ctx.fillStyle = '#E8C37C';
    ctx.font = '600 22px sans-serif';
    ctx.fillText(`Pemandu Langkah Batin: ${userName}`, 540, 195);

    // 4. Querent's Question Box
    drawRoundedRect(ctx, 120, 250, 840, 100, 24);
    ctx.fillStyle = 'rgba(34, 22, 43, 0.85)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 213, 140, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#FFD58C';
    ctx.font = 'italic 30px serif';
    const displayQ = question.length > 55 ? question.slice(0, 52) + '...' : question;
    ctx.fillText(`"${displayQ}"`, 540, 312);

    // 5. Preload the 3 card images
    const [img1, img2, img3] = await Promise.all([
      loadImage(card1.image),
      loadImage(card2.image),
      loadImage(card3.image),
    ]);

    // Card drawing helper
    const drawCardItem = (
      img: HTMLImageElement,
      card: SelectedCard,
      x: number,
      y: number,
      w: number,
      h: number,
      positionLabel: string
    ) => {
      ctx.save();

      // Position label above card
      ctx.fillStyle = '#FFD58C';
      ctx.font = 'bold 26px serif';
      ctx.textAlign = 'center';
      ctx.fillText(positionLabel, x + w / 2, y - 20);

      // Card shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 30;
      ctx.shadowOffsetY = 15;

      // Card Border & Clipping
      drawRoundedRect(ctx, x, y, w, h, 20);
      ctx.fillStyle = '#22162B';
      ctx.fill();
      ctx.strokeStyle = '#FFD58C';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.clip(); // Clip image inside rounded rect

      if (card.isReversed) {
        ctx.translate(x + w / 2, y + h / 2);
        ctx.rotate(Math.PI);
        ctx.drawImage(img, -w / 2, -h / 2, w, h);
      } else {
        ctx.drawImage(img, x, y, w, h);
      }

      ctx.restore();

      // Card Name & Orientation below
      ctx.fillStyle = '#F7EEDD';
      ctx.font = 'bold 28px serif';
      ctx.textAlign = 'center';
      ctx.fillText(card.name, x + w / 2, y + h + 42);

      ctx.fillStyle = card.isReversed ? '#F55654' : '#FFD58C';
      ctx.font = '600 22px sans-serif';
      ctx.fillText(card.isReversed ? 'Reversed' : 'Upright', x + w / 2, y + h + 74);
    };

    // Draw Row 1: Past (Left) & Present (Right)
    const cardW = 290;
    const cardH = 508;
    drawCardItem(img1, card1, 180, 400, cardW, cardH, 'PAST (Masa Lalu)');
    drawCardItem(img2, card2, 610, 400, cardW, cardH, 'PRESENT (Masa Kini)');

    // Draw Row 2: Future (Centered Below)
    const futureW = 310;
    const futureH = 542;
    drawCardItem(img3, card3, 385, 1060, futureW, futureH, '✦ FUTURE (Masa Depan) ✦');

    // 6. Footer: Advice & App Brand
    drawRoundedRect(ctx, 100, 1740, 880, 100, 24);
    ctx.fillStyle = 'rgba(34, 22, 43, 0.9)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 213, 140, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#F7EEDD';
    ctx.font = 'italic 24px serif';
    ctx.textAlign = 'center';
    const summary = reading.share_summary.length > 68 ? reading.share_summary.slice(0, 65) + '...' : reading.share_summary;
    ctx.fillText(`"${summary}"`, 540, 1800);

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas toBlob failed'));
      }, 'image/png', 0.95);
    });
  };

  const handleShareOrDownload = async () => {
    if (isGenerating) return;

    try {
      setIsGenerating(true);
      const blob = await generateStoryBlob();

      const file = new File([blob], `ramalin-tarot-${Date.now()}.png`, { type: 'image/png' });

      // Try Native Web Share API if supported
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Ramalin Tarot Reading',
          text: `Hasil bacaan kartu tarotku di Ramalin: "${reading.share_summary}"`,
        });
        setIsShared(true);
      } else {
        // Direct browser file download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ramalin-tarot-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setIsShared(true);
      }
    } catch (err) {
      console.error('Error saat share card:', err);
    } finally {
      setIsGenerating(false);
      setTimeout(() => setIsShared(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-sm bg-tarot-surface border border-tarot-gold/30 rounded-3xl p-5 flex flex-col gap-3 shadow-2xl">
        <div className="flex items-center justify-between pb-2 border-b border-tarot-border/40">
          <span className="font-serif font-bold text-sm text-tarot-gold">
            Pratinjau Story (9:16)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-tarot-muted hover:text-tarot-text font-serif"
          >
            Tutup
          </button>
        </div>

        {/* Visual Mini Preview Container */}
        <div className="w-full h-84 rounded-2xl overflow-hidden border border-tarot-gold/25 bg-tarot-canvas flex flex-col items-center justify-between p-3.5 text-center shadow-inner">
          <div>
            <span className="text-[10px] font-serif tracking-widest text-tarot-gold uppercase block">
              ✦ RAMALIN TAROT ✦
            </span>
            <span className="text-[10px] text-amber-300 font-sans block">
              Pemandu: {userName}
            </span>
            <p className="text-[11px] font-serif italic text-tarot-text mt-0.5 truncate max-w-[240px]">
              "{question}"
            </p>
          </div>

          {/* Mini 3 Cards */}
          <div className="flex flex-col items-center gap-1.5 my-auto">
            <div className="flex gap-2">
              <div className="w-15 h-25 rounded-lg border border-tarot-gold/50 overflow-hidden shadow-md">
                <img
                  src={card1.image}
                  alt={card1.name}
                  className={`w-full h-full object-cover ${card1.isReversed ? 'rotate-180' : ''}`}
                />
              </div>
              <div className="w-15 h-25 rounded-lg border border-tarot-gold/50 overflow-hidden shadow-md">
                <img
                  src={card2.image}
                  alt={card2.name}
                  className={`w-full h-full object-cover ${card2.isReversed ? 'rotate-180' : ''}`}
                />
              </div>
            </div>
            <div className="w-16 h-27 rounded-lg border-2 border-tarot-gold overflow-hidden -mt-1 shadow-lg shadow-tarot-gold/30">
              <img
                src={card3.image}
                alt={card3.name}
                className={`w-full h-full object-cover ${card3.isReversed ? 'rotate-180' : ''}`}
              />
            </div>
          </div>

          <p className="text-[10px] text-tarot-muted italic line-clamp-2 px-2">
            "{reading.share_summary}"
          </p>
        </div>

        {/* Action Button: Canvas Render + Download/Share */}
        <button
          type="button"
          onClick={handleShareOrDownload}
          disabled={isGenerating}
          className="w-full min-h-[50px] bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 hover:from-amber-200 hover:to-amber-400 active:scale-[0.98] text-slate-950 font-serif font-bold text-xs tracking-wider uppercase rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all cursor-pointer"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              <span>Membuat Gambar 1080x1920 HD...</span>
            </>
          ) : isShared ? (
            <>
              <Check className="w-4 h-4 text-emerald-950" />
              <span>Berhasil Disimpan / Dibagikan!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 text-slate-950" />
              <span>Simpan Gambar / Bagikan</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
