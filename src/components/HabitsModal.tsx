import React, { useState } from 'react';
import { HabitItem } from '../types';
import { soundFx } from '../audio/retroAudio';
import { requestNotificationPermission } from '../utils/storage';
import confetti from 'canvas-confetti';
import { X, CheckCircle2, Circle, Bell, Award, Sparkles, Heart } from 'lucide-react';

interface HabitsModalProps {
  habits: HabitItem[];
  petName: string;
  onClose: () => void;
  onToggleHabit: (habitId: string) => void;
}

export const HabitsModal: React.FC<HabitsModalProps> = ({
  habits,
  petName,
  onClose,
  onToggleHabit,
}) => {
  const [notifGranted, setNotifGranted] = useState(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );

  const completedCount = habits.filter((h) => h.completedToday).length;
  const progressPercent = Math.round((completedCount / habits.length) * 100);

  const handleHabitCheck = (habit: HabitItem) => {
    if (!habit.completedToday) {
      soundFx.playLevelUp();
      confetti({
        particleCount: 35,
        spread: 60,
        origin: { y: 0.5 },
      });
    } else {
      soundFx.playBoop(350, 'sine');
    }
    onToggleHabit(habit.id);
  };

  const handleEnableReminders = async () => {
    soundFx.playCoin();
    const granted = await requestNotificationPermission();
    setNotifGranted(granted);
    if (granted) {
      confetti({ particleCount: 30 });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        id="habits-modal-card"
        className="w-full max-w-lg bg-slate-900 border-4 border-slate-950 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white flex items-center justify-between border-b-4 border-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-800 rounded-xl border border-emerald-400">
              <Award className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide flex items-center gap-1.5">
                Hábitos de Cuidado Diario
              </h2>
              <p className="text-xs text-emerald-100">
                ¡Cuídate a ti mismo para que {petName} crezca fuerte!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-emerald-100 transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* Daily Goal Banner */}
          <div className="bg-slate-800/90 rounded-2xl p-3 border-2 border-slate-700">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200 mb-1.5">
              <span className="flex items-center gap-1 text-emerald-400">
                <Sparkles className="w-4 h-4" /> Progreso de hoy
              </span>
              <span>
                {completedCount} de {habits.length} completados ({progressPercent}%)
              </span>
            </div>
            <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-700">
              <div
                className="bg-gradient-to-r from-emerald-400 to-teal-400 h-full transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            {completedCount === habits.length && (
              <p className="text-xs font-bold text-amber-300 mt-2 text-center animate-bounce">
                🎉 ¡Felicidades! ¡Completaste todos tus hábitos hoy! Eres un súper campeón.
              </p>
            )}
          </div>

          {/* Habits Checklist */}
          <div className="space-y-2">
            {habits.map((habit) => (
              <div
                key={habit.id}
                onClick={() => handleHabitCheck(habit)}
                className={`flex items-center justify-between p-3 rounded-2xl border-2 cursor-pointer transition active:scale-[0.98] ${
                  habit.completedToday
                    ? 'bg-emerald-950/40 border-emerald-500/80 text-white'
                    : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{habit.icon}</div>
                  <div>
                    <h3
                      className={`text-sm font-bold ${
                        habit.completedToday ? 'line-through text-emerald-300' : 'text-slate-100'
                      }`}
                    >
                      {habit.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-snug">{habit.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right text-[11px] font-bold text-amber-400 hidden sm:block">
                    +{habit.rewardCoins}🪙
                  </div>
                  {habit.completedToday ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 fill-emerald-400/20" />
                  ) : (
                    <Circle className="w-6 h-6 text-slate-500" />
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Notifications Permission Request Box */}
          <div className="bg-indigo-950/50 border-2 border-indigo-700/60 rounded-2xl p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Bell className="w-5 h-5 text-indigo-400 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-indigo-200">
                  Notificaciones Interactivas
                </h4>
                <p className="text-[11px] text-indigo-300">
                  Recibe amables recordatorios para beber agua y cepillarte a tiempo.
                </p>
              </div>
            </div>
            {notifGranted ? (
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-600 shrink-0">
                Activadas ✓
              </span>
            ) : (
              <button
                onClick={handleEnableReminders}
                className="text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-xl border border-indigo-400 shadow-md transition active:scale-95 shrink-0"
              >
                Activar
              </button>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 p-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800">
          <span className="flex items-center gap-1 text-slate-300">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> Hábitos saludables = Mascota feliz
          </span>
          <button
            onClick={onClose}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-1.5 rounded-xl border border-emerald-500 transition active:scale-95"
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};
