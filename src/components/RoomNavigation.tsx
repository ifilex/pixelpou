import React from 'react';
import { RoomType } from '../types';
import { soundFx } from '../audio/retroAudio';

interface RoomNavigationProps {
  currentRoom: RoomType;
  onSelectRoom: (room: RoomType) => void;
  onOpenStore: () => void;
  onOpenHabits: () => void;
  onOpenPhotoBooth: () => void;
}

export const RoomNavigation: React.FC<RoomNavigationProps> = ({
  currentRoom,
  onSelectRoom,
  onOpenStore,
  onOpenHabits,
  onOpenPhotoBooth,
}) => {
  const rooms: { id: RoomType; label: string; icon: string }[] = [
    { id: 'bedroom', label: 'Cuarto', icon: '🛏️' },
    { id: 'kitchen', label: 'Cocina', icon: '🍎' },
    { id: 'bathroom', label: 'Baño', icon: '🧼' },
    { id: 'playroom', label: 'Juegos', icon: '🎮' },
    { id: 'garden', label: 'Jardín', icon: '🌳' },
  ];

  const handleRoomClick = (room: RoomType) => {
    soundFx.playBoop(520, 'triangle', 0.05);
    onSelectRoom(room);
  };

  return (
    <nav
      id="room-navigation-dock"
      className="w-full shrink-0 z-30 bg-slate-900/95 border-t-2 border-slate-950 px-2 py-1.5 shadow-2xl backdrop-blur-md"
      style={{ paddingBottom: 'max(6px, env(safe-area-inset-bottom))' }}
    >
      <div className="w-full flex items-center justify-between gap-1">
        {/* Five core rooms */}
        {rooms.map((r) => {
          const isActive = currentRoom === r.id;
          return (
            <button
              key={r.id}
              onClick={() => handleRoomClick(r.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all active:scale-95 ${
                isActive
                  ? 'bg-amber-400 text-slate-950 font-extrabold shadow-md scale-105 border-2 border-amber-600'
                  : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700'
              }`}
            >
              <span className="text-xl leading-none">{r.icon}</span>
              <span className="text-[10px] font-bold mt-0.5 truncate">{r.label}</span>
            </button>
          );
        })}

        {/* Separator */}
        <div className="h-7 w-0.5 bg-slate-700 mx-0.5 shrink-0" />

        {/* Wardrobe Store button */}
        <button
          id="open-wardrobe-btn"
          onClick={() => {
            soundFx.playBoop(600, 'square');
            onOpenStore();
          }}
          className="flex flex-col items-center justify-center py-1 px-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-purple-100 border-2 border-purple-800 transition active:scale-95 shadow-md shrink-0"
          title="Tienda de accesorios y disfraces"
        >
          <span className="text-xl leading-none">👗</span>
          <span className="text-[10px] font-bold mt-0.5">Tienda</span>
        </button>

        {/* Photo Share Button */}
        <button
          id="open-photobooth-btn"
          onClick={() => {
            soundFx.playBoop(700, 'triangle');
            onOpenPhotoBooth();
          }}
          className="flex flex-col items-center justify-center py-1 px-1.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-pink-100 border-2 border-pink-800 transition active:scale-95 shadow-md shrink-0"
          title="Tomar y compartir foto de tu mascota"
        >
          <span className="text-xl leading-none">📸</span>
          <span className="text-[10px] font-bold mt-0.5">Foto</span>
        </button>
      </div>
    </nav>
  );
};
