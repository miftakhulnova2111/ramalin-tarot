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

// Multi-line canvas text wrapping helper for complete advice
function wrapTextLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number = 3
): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = words[0] || '';

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    const testLine = currentLine + ' ' + word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width < maxWidth) {
      currentLine = testLine;
    } else {
      lines.push(currentLine);
      currentLine = word;
      if (lines.length >= maxLines - 1) {
        // Last line, take remainder
        const rest = words.slice(i).join(' ');
        let lastLine = currentLine + (rest.length > currentLine.length ? ' ' + rest : '');
        while (ctx.measureText(lastLine + '...').width > maxWidth && lastLine.length > 10) {
          lastLine = lastLine.slice(0, -1);
        }
        lines.push(lastLine.trim());
        return lines;
      }
    }
  }
  if (currentLine && lines.length < maxLines) {
    lines.push(currentLine);
  }
  return lines;
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

    // 1. Background Gradient (Deep Cosmic Twilight)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, 1920);
    bgGrad.addColorStop(0, '#0D0717');
    bgGrad.addColorStop(0.35, '#1B0F2E');
    bgGrad.addColorStop(0.7, '#140A22');
    bgGrad.addColorStop(1, '#08030D');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1080, 1920);

    // 2. Ornate Celestial Double Gold Border & Corner Accents
    ctx.strokeStyle = 'rgba(255, 213, 140, 0.45)';
    ctx.lineWidth = 3;
    drawRoundedRect(ctx, 36, 36, 1008, 1848, 28);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 213, 140, 0.2)';
    ctx.lineWidth = 1.5;
    drawRoundedRect(ctx, 48, 48, 984, 1824, 20);
    ctx.stroke();

    // Corner Star Accents
    ctx.fillStyle = '#FFD58C';
    ctx.font = '22px serif';
    ctx.textAlign = 'center';
    ctx.fillText('✦', 64, 76);
    ctx.fillText('✦', 1016, 76);
    ctx.fillText('✦', 64, 1858);
    ctx.fillText('✦', 1016, 1858);

    // Sacred Altar Glow (Radial Ambient in Center)
    const radialGlow = ctx.createRadialGradient(540, 960, 80, 540, 960, 580);
    radialGlow.addColorStop(0, 'rgba(115, 59, 115, 0.35)');
    radialGlow.addColorStop(0.5, 'rgba(255, 213, 140, 0.08)');
    radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = radialGlow;
    ctx.beginPath();
    ctx.arc(540, 960, 580, 0, Math.PI * 2);
    ctx.fill();

    // Sacred Circles
    ctx.strokeStyle = 'rgba(255, 213, 140, 0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(540, 960, 470, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(255, 213, 140, 0.08)';
    ctx.beginPath();
    ctx.arc(540, 960, 350, 0, Math.PI * 2);
    ctx.stroke();

    // 3. Header: App Branding & Querent Info
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFD58C';
    ctx.font = 'bold 38px serif';
    ctx.fillText('✦ RAMALIN TAROT ✦', 540, 135);

    ctx.fillStyle = '#E8C37C';
    ctx.font = '600 23px sans-serif';
    ctx.fillText(`Pembacaan Takdir: ${userName}`, 540, 180);

    // 4. Querent's Question Box
    drawRoundedRect(ctx, 100, 225, 880, 92, 22);
    ctx.fillStyle = 'rgba(28, 16, 38, 0.9)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 213, 140, 0.4)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#FFD58C';
    ctx.font = 'italic 27px serif';
    const displayQ = question.length > 55 ? question.slice(0, 52) + '...' : question;
    ctx.fillText(`"${displayQ}"`, 540, 282);

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
      ctx.font = 'bold 24px serif';
      ctx.textAlign = 'center';
      ctx.fillText(positionLabel, x + w / 2, y - 18);

      // Card shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = 32;
      ctx.shadowOffsetY = 16;

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
      ctx.font = 'bold 27px serif';
      ctx.textAlign = 'center';
      ctx.fillText(card.name, x + w / 2, y + h + 38);

      ctx.fillStyle = card.isReversed ? '#F55654' : '#FFD58C';
      ctx.font = '600 21px sans-serif';
      ctx.fillText(card.isReversed ? 'Terbalik' : 'Tegak', x + w / 2, y + h + 68);
    };

    // Draw Row 1: Masa Lalu (Left) & Masa Kini (Right)
    const cardW = 285;
    const cardH = 500;
    drawCardItem(img1, card1, 185, 365, cardW, cardH, '✦ Masa Lalu ✦');
    drawCardItem(img2, card2, 610, 365, cardW, cardH, '✦ Masa Kini ✦');

    // Draw Row 2: Masa Depan (Centered Below)
    const futureW = 300;
    const futureH = 525;
    drawCardItem(img3, card3, 390, 985, futureW, futureH, '✦ Masa Depan ✦');

    // 6. Footer: Complete Wisdom Advice Box (Multi-Line Word Wrap)
    const adviceBoxY = 1625;
    const adviceBoxH = 205;
    drawRoundedRect(ctx, 90, adviceBoxY, 900, adviceBoxH, 24);
    ctx.fillStyle = 'rgba(28, 16, 38, 0.95)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 213, 140, 0.55)';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Box Header Label
    ctx.fillStyle = '#FFD58C';
    ctx.font = 'bold 20px serif';
    ctx.textAlign = 'center';
    ctx.fillText('✦ RANGKUMAN HIKMAH & PETUAH ✦', 540, adviceBoxY + 42);

    // Advice Narrative (Wrapped cleanly across 2-3 lines without truncation)
    const fullAdviceText = (reading.share_summary || reading.final_advice || '')
      .replace(/^Pesan (Hikmah )?untuk [^:]+:\s*/i, '')
      .trim();

    ctx.fillStyle = '#F7EEDD';
    ctx.font = 'italic 23px serif';
    const lines = wrapTextLines(ctx, `"${fullAdviceText}"`, 820, 3);
    const lineSpacing = 34;
    const startY = adviceBoxY + 95;
    lines.forEach((line, idx) => {
      ctx.fillText(line, 540, startY + idx * lineSpacing);
    });

    // 7. Subtle Attribution Signature
    ctx.fillStyle = 'rgba(255, 213, 140, 0.7)';
    ctx.font = '500 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✦ Crafted with magic by mifthspace ✦', 540, 1868);

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
              Pembacaan Takdir: {userName}
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

          <div className="w-full flex flex-col items-center gap-1">
            <p className="text-[10px] text-tarot-muted italic line-clamp-2 px-2">
              "{reading.share_summary}"
            </p>
            <span className="text-[8px] text-amber-200/50 font-sans">
              ✦ Crafted with magic by mifthspace ✦
            </span>
          </div>
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
