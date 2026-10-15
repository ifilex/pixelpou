import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, Flame, Edit2, Check, Bell } from 'lucide-react';
import { PetStats } from '../types';
import { soundFx } from '../audio/retroAudio';

interface HeaderStatsProps {
  pet: PetStats;
  streakDays: number;
  onRename: (newName: string) => void;
  onOpenStreakModal: () => void;
  onOpenHabitsModal: () => void;
}

export const HeaderStats: React.FC<HeaderStatsProps> = ({
  pet,
  streakDays,
  onRename,
  onOpenStreakModal,
  onOpenHabitsModal,
}) => {
  const [soundOn, setSoundOn] = useState(soundFx.isEnabled());
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(pet.name);

  const toggleSound = () => {
    const next = soundFx.toggleSound();
    setSoundOn(next);
  };

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      onRename(tempName.trim().slice(0, 14));
      soundFx.playCoin();
    }
    setIsEditingName(false);
  };

  const xpPercent = Math.min(100, Math.round((pet.xp / pet.xpToNextLevel) * 100));

  return (
    <header
      id="game-header-bar"
      className="w-full shrink-0 bg-slate-900 text-white border-b-2 border-slate-950 px-2.5 py-1.5 shadow-md select-none z-30"
    >
      <div className="w-full flex items-center justify-between gap-1.5">
        {/* Pet Name & Level */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="bg-amber-400 text-amber-950 font-black text-xs px-2 py-1 rounded-md border-2 border-amber-600 shadow-sm flex items-center gap-1 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-amber-900" />
            <span>Nv.{pet.level}</span>
          </div>

          {isEditingName ? (
            <form onSubmit={handleSaveName} className="flex items-center gap-1">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                maxLength={14}
                autoFocus
                className="bg-slate-800 text-white text-sm font-bold px-2 py-0.5 rounded border border-amber-400 focus:outline-none w-28"
              />
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-500 p-1 rounded text-white"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <div
              onClick={() => setIsEditingName(true)}
              className="flex items-center gap-1 cursor-pointer group hover:opacity-90 min-w-0"
              title="Click para cambiar nombre"
            >
              <h1 className="font-extrabold text-sm sm:text-base text-amber-200 truncate tracking-wide">
                {pet.name}
              </h1>
              <Edit2 className="w-3 h-3 text-slate-400 group-hover:text-amber-300 shrink-0" />
            </div>
          )}
        </div>

        {/* XP Bar (Hidden on ultra-narrow, visible on mobile/desktop) */}
        <div className="hidden xs:flex flex-col w-24 sm:w-32 shrink-0">
          <div className="flex justify-between text-[10px] text-slate-300 font-semibold mb-0.5">
            <span>XP</span>
            <span>{pet.xp}/{pet.xpToNextLevel}</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
            <div
              className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full transition-all duration-300"
              style={{ width: `${xpPercent}%` }}
            />
          </div>
        </div>

        {/* Right side: Coins, Streak & Sound */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Daily Streak Flame */}
          <button
            id="streak-rewards-button"
            onClick={onOpenStreakModal}
            className="flex items-center gap-1 bg-orange-600 hover:bg-orange-500 text-orange-50 px-2 py-1 rounded-md text-xs font-bold border-2 border-orange-700 shadow-sm transition active:scale-95"
            title="Racha de días de cuidado"
          >
            <Flame className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
            <span>{streakDays}d</span>
          </button>

          {/* Coins Badge */}
          <div
            id="coins-badge"
            className="flex items-center gap-1 bg-amber-500 text-amber-950 font-black text-xs px-2 py-1 rounded-md border-2 border-amber-600 shadow-sm"
          >
            <span className="text-sm">🪙</span>
            <span>{pet.coins}</span>
          </div>

          {/* Daily Habits Quick Icon */}
          <button
            id="habits-quick-button"
            onClick={onOpenHabitsModal}
            className="bg-emerald-600 hover:bg-emerald-500 text-white p-1.5 rounded-md border-2 border-emerald-700 transition active:scale-95"
            title="Mis Hábitos Diarios"
          >
            <Bell className="w-4 h-4" />
          </button>

          {/* Sound Mute Toggle */}
          <button
            id="sound-toggle-button"
            onClick={toggleSound}
            className={`p-1.5 rounded-md border-2 transition active:scale-95 ${
              soundOn
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-700'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-400 border-slate-600'
            }`}
            title={soundOn ? 'Sonido Activado' : 'Sonido Desactivado'}
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
