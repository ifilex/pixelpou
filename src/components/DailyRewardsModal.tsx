import React from 'react';
import { DAILY_STREAK_REWARDS } from '../utils/gameData';
import { soundFx } from '../audio/retroAudio';
import confetti from 'canvas-confetti';
import { X, Flame, Gift, Check, Sparkles } from 'lucide-react';

interface DailyRewardsModalProps {
  streakDays: number;
  streakClaimedToday: boolean;
  onClose: () => void;
  onClaimStreak: (coins: number, xp: number) => void;
}

export const DailyRewardsModal: React.FC<DailyRewardsModalProps> = ({
  streakDays,
  streakClaimedToday,
  onClose,
  onClaimStreak,
}) => {
  const currentDayIndex = ((streakDays - 1) % 7); // 0 to 6
  const todayReward = DAILY_STREAK_REWARDS[currentDayIndex];

  const handleClaim = () => {
    if (streakClaimedToday) return;
    soundFx.playLevelUp();
    confetti({
      particleCount: 60,
      spread: 80,
      origin: { y: 0.5 },
    });
    onClaimStreak(todayReward.coins, todayReward.xp);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md select-none animate-in fade-in">
      <div
        id="daily-rewards-card"
        className="w-full max-w-md bg-slate-900 border-4 border-slate-950 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-amber-600 p-4 text-white flex items-center justify-between border-b-4 border-slate-950">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-orange-800 rounded-xl border border-orange-400">
              <Flame className="w-5 h-5 text-yellow-300 fill-yellow-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide">
                Racha Diaria de Cuidado
              </h2>
              <p className="text-xs text-orange-200">
                ¡Vuelve todos los días para recompensas legendarias!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-orange-700 hover:bg-orange-800 text-white transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 7-Day Grid */}
        <div className="p-4 space-y-3 overflow-y-auto">
          <div className="grid grid-cols-4 gap-2">
            {DAILY_STREAK_REWARDS.map((rew, idx) => {
              const isPast = idx < currentDayIndex || (idx === currentDayIndex && streakClaimedToday);
              const isToday = idx === currentDayIndex && !streakClaimedToday;
              const isDay7 = idx === 6;

              return (
                <div
                  key={rew.day}
                  className={`flex flex-col items-center justify-between p-2 rounded-2xl border-2 text-center transition ${
                    isDay7 ? 'col-span-2 bg-gradient-to-r from-amber-500/30 to-yellow-500/30 border-yellow-400' : ''
                  } ${
                    isToday
                      ? 'bg-amber-950/60 border-amber-400 ring-2 ring-amber-400/40 shadow-lg scale-105'
                      : isPast
                      ? 'bg-slate-800 border-slate-700 opacity-60'
                      : 'bg-slate-850 border-slate-800'
                  }`}
                >
                  <span className="text-[10px] font-bold text-slate-400">Día {rew.day}</span>
                  <div className="text-2xl my-1">
                    {isPast ? '✅' : isDay7 ? '👑' : '🎁'}
                  </div>
                  <span className="text-[11px] font-black text-amber-300">+{rew.coins}🪙</span>
                </div>
              );
            })}
          </div>

          {/* Reward claim action box */}
          <div className="p-4 rounded-2xl bg-slate-800 border-2 border-slate-700 text-center space-y-2 mt-2">
            <h3 className="font-bold text-sm text-white flex items-center justify-center gap-1.5">
              <Gift className="w-4 h-4 text-amber-400" />
              Recompensa de Hoy: {todayReward.rewardTitle}
            </h3>
            <p className="text-xs text-slate-300">
              Ganas <strong className="text-amber-400">+{todayReward.coins} Monedas</strong> y{' '}
              <strong className="text-cyan-400">+{todayReward.xp} XP</strong> para tu mascota.
            </p>

            {streakClaimedToday ? (
              <div className="py-2.5 px-4 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5">
                <Check className="w-4 h-4" />
                ¡Reclamado hoy! Vuelve mañana para el Día {currentDayIndex + 2 > 7 ? 1 : currentDayIndex + 2}
              </div>
            ) : (
              <button
                onClick={handleClaim}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black text-sm shadow-xl transition active:scale-95 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>¡Reclamar Regalo Diario!</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
