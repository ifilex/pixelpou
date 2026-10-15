import React from 'react';
import { PetStats, RoomType } from '../types';

interface VitalsMetersProps {
  pet: PetStats;
  onNavigateRoom: (room: RoomType) => void;
}

export const VitalsMeters: React.FC<VitalsMetersProps> = ({ pet, onNavigateRoom }) => {
  const getStatusColor = (value: number) => {
    if (value < 30) return 'bg-rose-500';
    if (value < 60) return 'bg-amber-400';
    return 'bg-emerald-500';
  };

  const meters: {
    key: string;
    label: string;
    value: number;
    icon: string;
    targetRoom: RoomType;
  }[] = [
    { key: 'hunger', label: 'Hambre', value: pet.hunger, icon: '🍎', targetRoom: 'kitchen' },
    { key: 'hygiene', label: 'Higiene', value: pet.hygiene, icon: '🧼', targetRoom: 'bathroom' },
    { key: 'energy', label: 'Energía', value: pet.energy, icon: '⚡', targetRoom: 'bedroom' },
    { key: 'happiness', label: 'Felicidad', value: pet.happiness, icon: '💖', targetRoom: 'playroom' },
  ];

  return (
    <div
      id="pet-vitals-bar"
      className="grid grid-cols-4 gap-1.5 w-full shrink-0 px-2 py-1 bg-slate-950/80 border-b border-slate-800 shadow-inner"
    >
      {meters.map((m) => (
        <button
          key={m.key}
          onClick={() => onNavigateRoom(m.targetRoom)}
          className="flex flex-col items-center group transition active:scale-95 text-left w-full p-0.5 rounded-lg hover:bg-slate-850"
          title={`Click para ir a ${m.targetRoom} y cuidar ${m.label}`}
        >
          <div className="flex items-center justify-between w-full text-[10px] font-bold text-slate-200 px-0.5 mb-0.5 leading-none">
            <span className="text-xs">{m.icon}</span>
            <span className={m.value < 30 ? 'text-rose-400 font-black animate-pulse' : 'text-slate-300'}>
              {m.value}%
            </span>
          </div>

          <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-700">
            <div
              className={`h-full ${getStatusColor(m.value)} transition-all duration-300 rounded-full`}
              style={{ width: `${Math.max(4, m.value)}%` }}
            />
          </div>
          <span className="text-[8.5px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wider group-hover:text-amber-300 transition leading-none">
            {m.label}
          </span>
        </button>
      ))}
    </div>
  );
};
