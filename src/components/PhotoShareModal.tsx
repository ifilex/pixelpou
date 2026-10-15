import React, { useRef, useState, useEffect } from 'react';
import { PetStats } from '../types';
import { soundFx } from '../audio/retroAudio';
import confetti from 'canvas-confetti';
import { X, Download, Share2, Copy, Check, Sparkles, Heart } from 'lucide-react';

interface PhotoShareModalProps {
  pet: PetStats;
  streakDays: number;
  onClose: () => void;
}

type FrameStyle = 'polaroid' | 'arcade' | 'hearts' | 'neon';

export const PhotoShareModal: React.FC<PhotoShareModalProps> = ({
  pet,
  streakDays,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [frame, setFrame] = useState<FrameStyle>('polaroid');
  const [customMsg, setCustomMsg] = useState('¡Cuidando a mi mejor amigo virtual con hábitos saludables! 💖');
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      setCanNativeShare(true);
    }
  }, []);

  // Draw the high quality share card on canvas
  const drawCard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 600;
    const height = 740;
    canvas.width = width;
    canvas.height = height;

    // Background based on frame style
    if (frame === 'polaroid') {
      ctx.fillStyle = '#F8FAFC'; // Clean white polaroid
      ctx.fillRect(0, 0, width, height);

      // Inner photo container
      ctx.fillStyle = '#FEF3C7'; // Warm amber scene
      ctx.fillRect(36, 36, width - 72, 480);
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 4;
      ctx.strokeRect(36, 36, width - 72, 480);
    } else if (frame === 'arcade') {
      ctx.fillStyle = '#0F172A'; // Arcade dark
      ctx.fillRect(0, 0, width, height);

      // Neon grid
      ctx.strokeStyle = '#9333EA';
      ctx.lineWidth = 2;
      for (let i = 0; i < width; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      // Inner photo container
      ctx.fillStyle = '#1E1B4B';
      ctx.fillRect(36, 36, width - 72, 480);
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 6;
      ctx.strokeRect(36, 36, width - 72, 480);
    } else if (frame === 'hearts') {
      ctx.fillStyle = '#FFF1F2';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#FCE7F3';
      ctx.fillRect(36, 36, width - 72, 480);
      ctx.strokeStyle = '#FB7185';
      ctx.lineWidth = 5;
      ctx.strokeRect(36, 36, width - 72, 480);
    } else {
      // Neon
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = '#090D16';
      ctx.fillRect(36, 36, width - 72, 480);
      ctx.strokeStyle = '#22C55E';
      ctx.lineWidth = 5;
      ctx.strokeRect(36, 36, width - 72, 480);
    }

    // DRAW PET IN CENTER OF PHOTO CONTAINER
    const centerX = width / 2;
    const centerY = 270;

    // Pet drop shadow
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + 105, 95, 20, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fill();

    // Draw Pet Body (Pixel Pou drop shape)
    ctx.fillStyle = pet.skinColor || '#D4A373';
    ctx.strokeStyle = '#221811';
    ctx.lineWidth = 8;

    ctx.beginPath();
    // Stepped pixel curve or rounded triangle
    ctx.moveTo(centerX, centerY - 100);
    ctx.bezierCurveTo(centerX + 120, centerY - 80, centerX + 130, centerY + 100, centerX, centerY + 100);
    ctx.bezierCurveTo(centerX - 130, centerY + 100, centerX - 120, centerY - 80, centerX, centerY - 100);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Pet Highlights
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.ellipse(centerX - 40, centerY - 40, 20, 30, Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();

    // Cheeks
    ctx.fillStyle = 'rgba(244, 63, 94, 0.4)';
    ctx.beginPath();
    ctx.ellipse(centerX - 60, centerY + 25, 18, 12, 0, 0, Math.PI * 2);
    ctx.ellipse(centerX + 60, centerY + 25, 18, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Clothes on canvas
    if (pet.equippedClothes === 'striped') {
      ctx.fillStyle = '#2563EB';
      ctx.fillRect(centerX - 90, centerY + 45, 180, 16);
      ctx.fillRect(centerX - 80, centerY + 75, 160, 16);
    } else if (pet.equippedClothes === 'tuxedo') {
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.moveTo(centerX - 18, centerY + 30);
      ctx.lineTo(centerX, centerY + 42);
      ctx.lineTo(centerX - 18, centerY + 54);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(centerX + 18, centerY + 30);
      ctx.lineTo(centerX, centerY + 42);
      ctx.lineTo(centerX + 18, centerY + 54);
      ctx.fill();
    }

    // Eyes
    // Sclera
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#221811';
    ctx.lineWidth = 5;

    ctx.fillRect(centerX - 56, centerY - 32, 42, 48);
    ctx.strokeRect(centerX - 56, centerY - 32, 42, 48);

    ctx.fillRect(centerX + 14, centerY - 32, 42, 48);
    ctx.strokeRect(centerX + 14, centerY - 32, 42, 48);

    // Pupils
    ctx.fillStyle = pet.eyeColor || '#1E293B';
    ctx.fillRect(centerX - 42, centerY - 20, 22, 26);
    ctx.fillRect(centerX + 24, centerY - 20, 22, 26);

    // Eye Glints
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(centerX - 38, centerY - 18, 8, 8);
    ctx.fillRect(centerX + 28, centerY - 18, 8, 8);

    // Mouth
    ctx.strokeStyle = '#221811';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(centerX, centerY + 35, 18, 0.15, Math.PI - 0.15, false);
    ctx.stroke();

    // Glasses
    if (pet.equippedGlasses === 'shades') {
      ctx.fillStyle = '#111827';
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.fillRect(centerX - 68, centerY - 24, 62, 34);
      ctx.fillRect(centerX + 6, centerY - 24, 62, 34);
      ctx.fillRect(centerX - 8, centerY - 14, 18, 8);
      // Glare line
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(centerX - 58, centerY - 20, 20, 4);
      ctx.fillRect(centerX + 16, centerY - 20, 20, 4);
    }

    // Hats
    if (pet.equippedHat === 'crown') {
      ctx.fillStyle = '#F59E0B';
      ctx.strokeStyle = '#92400E';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(centerX - 55, centerY - 75);
      ctx.lineTo(centerX - 55, centerY - 120);
      ctx.lineTo(centerX - 25, centerY - 95);
      ctx.lineTo(centerX, centerY - 130);
      ctx.lineTo(centerX + 25, centerY - 95);
      ctx.lineTo(centerX + 55, centerY - 120);
      ctx.lineTo(centerX + 55, centerY - 75);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (pet.equippedHat === 'cap') {
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(centerX, centerY - 85, 45, Math.PI, 0);
      ctx.fill();
      ctx.fillRect(centerX - 48, centerY - 88, 120, 14);
    }

    // Photo Card Text Details
    ctx.textAlign = 'center';

    // Pet Title & Level
    if (frame === 'polaroid') {
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText(`✨ ${pet.name} ✨`, centerX, 560);

      ctx.font = 'bold 18px sans-serif';
      ctx.fillStyle = '#475569';
      ctx.fillText(`Nivel ${pet.level} • Racha de cuidado: ${streakDays} días 🔥`, centerX, 595);

      ctx.font = 'italic 16px sans-serif';
      ctx.fillStyle = '#64748B';
      ctx.fillText(`"${customMsg}"`, centerX, 640);

      // Watermark
      ctx.font = 'bold 14px monospace';
      ctx.fillStyle = '#94A3B8';
      ctx.fillText('🎮 PixelPou • Cuidados Diarios para Niños', centerX, 695);
    } else {
      ctx.fillStyle = '#F8FAFC';
      ctx.font = 'bold 30px sans-serif';
      ctx.fillText(`✨ ${pet.name} ✨`, centerX, 560);

      ctx.font = 'bold 18px sans-serif';
      ctx.fillStyle = '#CBD5E1';
      ctx.fillText(`Nivel ${pet.level} • Racha de cuidado: ${streakDays} días 🔥`, centerX, 595);

      ctx.font = 'italic 16px sans-serif';
      ctx.fillStyle = '#E2E8F0';
      ctx.fillText(`"${customMsg}"`, centerX, 640);

      // Watermark
      ctx.font = 'bold 14px monospace';
      ctx.fillStyle = '#64748B';
      ctx.fillText('🎮 PixelPou • Cuidados Diarios para Niños', centerX, 695);
    }
  };

  useEffect(() => {
    drawCard();
  }, [frame, customMsg, pet, streakDays]);

  // Download image
  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    soundFx.playLevelUp();
    confetti({ particleCount: 35 });

    const link = document.createElement('a');
    link.download = `PixelPou-${pet.name}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Native Web Share API
  const handleShare = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    soundFx.playCoin();
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], `PixelPou-${pet.name}.png`, { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `Mi Mascota Virtual: ${pet.name}`,
            text: `¡Mira a mi mascota virtual ${pet.name}! Nivel ${pet.level} con ${streakDays} días de cuidados saludables.`,
            files: [file],
          });
        } else if (navigator.share) {
          await navigator.share({
            title: `Mi Mascota Virtual: ${pet.name}`,
            text: `¡Mira a mi mascota virtual ${pet.name}! Nivel ${pet.level} con ${streakDays} días de cuidados saludables.`,
            url: window.location.href,
          });
        }
      });
    } catch {
      // User cancelled share
    }
  };

  // Copy to clipboard
  const handleCopyLink = () => {
    soundFx.playCoin();
    navigator.clipboard.writeText(
      `¡Mira mi mascota PixelPou llamada ${pet.name}! Nivel ${pet.level}, Racha: ${streakDays} días.`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md select-none animate-in fade-in">
      <div
        id="photo-share-modal-card"
        className="w-full max-w-lg bg-slate-900 border-4 border-slate-950 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-600 to-rose-600 p-4 text-white flex items-center justify-between border-b-4 border-slate-950">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-pink-800 rounded-xl border border-pink-400">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide">
                Foto Postal de {pet.name}
              </h2>
              <p className="text-xs text-pink-200">
                Comparte tu mascota con tus amigos y familia
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-pink-700 hover:bg-pink-800 text-pink-100 transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 flex flex-col items-center">
          {/* Frame Style Selectors */}
          <div className="flex items-center gap-2 w-full justify-center">
            {(
              [
                { id: 'polaroid', label: 'Polaroid Clásica' },
                { id: 'arcade', label: 'Arcade Neón' },
                { id: 'hearts', label: 'Corazones' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                onClick={() => {
                  soundFx.playBoop(450, 'triangle');
                  setFrame(f.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition active:scale-95 ${
                  frame === f.id
                    ? 'bg-pink-500 text-white border-pink-300 shadow-md'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Canvas Preview Container */}
          <div className="w-full max-w-[280px] sm:max-w-[320px] rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-950 bg-slate-950">
            <canvas ref={canvasRef} className="w-full h-auto block" />
          </div>

          {/* Custom Message Input */}
          <div className="w-full max-w-sm">
            <label className="text-[11px] font-bold text-slate-400 block mb-1">
              Mensaje en la foto:
            </label>
            <input
              type="text"
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value.slice(0, 60))}
              maxLength={60}
              className="w-full bg-slate-800 text-white text-xs font-medium px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-pink-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full max-w-sm">
            {/* Download PNG */}
            <button
              onClick={handleDownload}
              className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition active:scale-95 border-2 border-emerald-700"
            >
              <Download className="w-4 h-4" />
              <span>Guardar PNG</span>
            </button>

            {/* Native Share */}
            {canNativeShare && (
              <button
                onClick={handleShare}
                className="py-2.5 px-3 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition active:scale-95 border-2 border-pink-700"
              >
                <Share2 className="w-4 h-4" />
                <span>Compartir</span>
              </button>
            )}

            {/* Copy Info */}
            <button
              onClick={handleCopyLink}
              className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition active:scale-95 border-2 ${
                copied
                  ? 'bg-amber-500 text-slate-950 border-amber-600'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
