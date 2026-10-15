import React, { useState } from 'react';
import { motion } from 'motion/react';
import { FoodItem, PetStats, RoomType } from '../types';
import { PixelPetRenderer } from './PixelPetRenderer';
import { FOOD_CATALOG } from '../utils/gameData';
import { soundFx } from '../audio/retroAudio';
import { Moon, Sun, Sparkles, Gamepad2, Camera } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RoomViewportProps {
  currentRoom: RoomType;
  pet: PetStats;
  onFeed: (food: FoodItem) => void;
  onCleanSoap: () => void;
  onCleanShower: () => void;
  onBrushTeeth: () => void;
  onToggleSleep: () => void;
  onPlayBall: () => void;
  onOpenMinigames: () => void;
  onOpenPhotoBooth: () => void;
  onPetTouch: () => void;
}

export const RoomViewport: React.FC<RoomViewportProps> = ({
  currentRoom,
  pet,
  onFeed,
  onCleanSoap,
  onCleanShower,
  onBrushTeeth,
  onToggleSleep,
  onPlayBall,
  onOpenMinigames,
  onOpenPhotoBooth,
  onPetTouch,
}) => {
  const [isEating, setIsEating] = useState(false);
  const [isSoaping, setIsSoaping] = useState(false);
  const [isShowering, setIsShowering] = useState(false);
  const [activeFoodAnim, setActiveFoodAnim] = useState<string | null>(null);
  const [ballPosition, setBallPosition] = useState({ x: 40, y: 0 });

  // Handle feeding interaction
  const handleFoodSelect = (food: FoodItem) => {
    if (pet.isSleeping) {
      soundFx.playBoop(300, 'sawtooth');
      return;
    }
    if (pet.hunger >= 100) {
      soundFx.playBoop(350, 'sawtooth');
      return;
    }

    soundFx.playEat();
    setActiveFoodAnim(food.icon);
    setIsEating(true);

    setTimeout(() => {
      onFeed(food);
      setIsEating(false);
      setActiveFoodAnim(null);
    }, 600);
  };

  // Handle soaping
  const handleSoapClick = () => {
    soundFx.playClean();
    setIsSoaping(true);
    setTimeout(() => {
      setIsSoaping(false);
      onCleanSoap();
    }, 900);
  };

  // Handle shower rinse
  const handleShowerClick = () => {
    soundFx.playClean();
    setIsShowering(true);
    setTimeout(() => {
      setIsShowering(false);
      onCleanShower();
    }, 1100);
  };

  // Handle tooth brush
  const handleToothbrushClick = () => {
    soundFx.playClean();
    onBrushTeeth();
    confetti({
      particleCount: 20,
      spread: 40,
      origin: { y: 0.6 },
    });
  };

  // Handle ball bounce in playroom
  const handleKickBall = () => {
    soundFx.playBoop(580, 'sine', 0.12);
    setBallPosition({
      x: (Math.random() - 0.5) * 140,
      y: -60 - Math.random() * 50,
    });
    setTimeout(() => {
      setBallPosition({
        x: (Math.random() - 0.5) * 80,
        y: 0,
      });
    }, 450);
    onPlayBall();
  };

  // Background style based on room
  const getRoomBackground = () => {
    if (currentRoom === 'bedroom') {
      if (pet.isSleeping) {
        return 'bg-gradient-to-b from-indigo-950 via-slate-900 to-indigo-950';
      }
      return 'bg-gradient-to-b from-amber-100 via-orange-50 to-amber-200';
    }
    if (currentRoom === 'kitchen') {
      return 'bg-gradient-to-b from-emerald-100 via-teal-50 to-emerald-200';
    }
    if (currentRoom === 'bathroom') {
      return 'bg-gradient-to-b from-sky-100 via-cyan-50 to-blue-200';
    }
    if (currentRoom === 'playroom') {
      return 'bg-gradient-to-b from-purple-100 via-pink-50 to-purple-200';
    }
    if (currentRoom === 'garden') {
      return 'bg-gradient-to-b from-sky-300 via-emerald-100 to-emerald-400';
    }
    return 'bg-amber-100';
  };

  return (
    <div
      id="room-viewport-main"
      className={`relative w-full flex-1 min-h-0 rounded-2xl overflow-hidden shadow-xl border-2 border-slate-950 transition-colors duration-500 flex flex-col justify-between items-center p-2.5 ${getRoomBackground()}`}
      style={{
        backgroundImage:
          pet.equippedWallpaper === 'galaxy'
            ? 'radial-gradient(#a855f7 1px, transparent 1px), radial-gradient(#6366f1 1px, #0f172a 1px)'
            : pet.equippedWallpaper === 'arcade'
            ? 'linear-gradient(rgba(147, 51, 234, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(147, 51, 234, 0.1) 1px, transparent 1px)'
            : undefined,
        backgroundSize:
          pet.equippedWallpaper === 'galaxy'
            ? '24px 24px, 12px 12px'
            : pet.equippedWallpaper === 'arcade'
            ? '20px 20px'
            : undefined,
      }}
    >
      {/* BEDROOM: Interactive Bedside Lamp & Switch */}
      {currentRoom === 'bedroom' && (
        <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
          {/* Visual Clickable Bedside Lamp */}
          <button
            id="visual-lamp-fixture"
            onClick={onToggleSleep}
            className="group flex flex-col items-center cursor-pointer transition active:scale-95"
            title={pet.isSleeping ? 'Click en la lámpara para encender la luz' : 'Click en la lámpara para apagar la luz'}
          >
            {/* Lamp Shade */}
            <div
              className={`w-10 h-7 rounded-t-xl border-2 border-slate-950 transition-all duration-300 flex items-center justify-center ${
                pet.isSleeping
                  ? 'bg-slate-800 shadow-inner'
                  : 'bg-gradient-to-b from-amber-300 to-yellow-400 shadow-[0_0_18px_rgba(251,191,36,0.9)] animate-pulse'
              }`}
            >
              <span className="text-xs">{pet.isSleeping ? '💤' : '✨'}</span>
            </div>
            {/* Lamp Stand & Pull Cord */}
            <div className="relative w-1.5 h-4 bg-slate-700">
              {/* Little pull cord on the side */}
              <div className="absolute top-0 right-[-6px] w-0.5 h-5 bg-amber-200/80 flex flex-col justify-end items-center">
                <div className={`w-1.5 h-1.5 rounded-full ${pet.isSleeping ? 'bg-amber-400 animate-ping' : 'bg-amber-300'}`} />
              </div>
            </div>
            {/* Lamp Base */}
            <div className="w-8 h-1.5 rounded-full bg-slate-800 border border-slate-950 shadow-sm" />
          </button>

          {/* Quick Pill Switch */}
          <button
            id="lamp-toggle-button"
            onClick={onToggleSleep}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-black text-xs border-2 shadow-lg transition active:scale-95 ${
              pet.isSleeping
                ? 'bg-amber-400 hover:bg-amber-300 text-slate-950 border-amber-600 animate-bounce'
                : 'bg-slate-900/90 hover:bg-slate-800 text-amber-300 border-slate-800'
            }`}
          >
            {pet.isSleeping ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-950 fill-amber-950" />
                <span>Encender Luz</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>Apagar Luz</span>
              </>
            )}
          </button>
        </div>
      )}

      {currentRoom === 'garden' && (
        <div className="absolute top-3 right-3 z-10">
          <button
            onClick={onOpenPhotoBooth}
            className="flex items-center gap-1 bg-rose-500 hover:bg-rose-400 text-white font-black text-xs px-2.5 py-1 rounded-full border border-rose-700 shadow-md transition active:scale-95"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Foto Postal</span>
          </button>
        </div>
      )}

      {/* Full Night Atmosphere Overlay when light is OFF */}
      {pet.isSleeping && (
        <div
          onClick={onToggleSleep}
          className="absolute inset-0 bg-slate-950/85 backdrop-blur-[2px] transition-opacity duration-500 z-0 cursor-pointer"
          title="Click para encender la luz y despertar a tu mascota"
        >
          {/* Twinkling pixel stars */}
          <div className="absolute top-4 left-24 text-yellow-200 text-sm animate-pulse">✨</div>
          <div className="absolute top-10 right-10 text-yellow-200 text-lg animate-pulse delay-300">⭐</div>
          <div className="absolute top-20 left-10 text-yellow-300 text-xs animate-pulse delay-700">✨</div>
          <div className="absolute top-6 right-24 text-amber-100 text-2xl animate-pulse">🌙</div>
          <div className="absolute bottom-28 left-8 text-yellow-300 text-sm animate-pulse delay-500">✨</div>
          <div className="absolute bottom-24 right-12 text-yellow-200 text-base animate-pulse delay-200">⭐</div>
        </div>
      )}

      {/* Center Pixel Pet */}
      <div className="relative flex-1 min-h-0 flex items-center justify-center w-full my-auto z-10">
        {/* Flying food animation */}
        {activeFoodAnim && (
          <motion.div
            initial={{ scale: 0.5, y: 80, opacity: 0.8 }}
            animate={{ scale: [1, 1.3, 0.4], y: [80, -20, 10], opacity: [1, 1, 0] }}
            transition={{ duration: 0.6 }}
            className="absolute text-5xl z-30 pointer-events-none"
          >
            {activeFoodAnim}
          </motion.div>
        )}

        {/* Playroom Ball */}
        {currentRoom === 'playroom' && (
          <motion.div
            id="playroom-beach-ball"
            onClick={handleKickBall}
            animate={{ x: ballPosition.x, y: ballPosition.y }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="absolute -bottom-1 right-4 w-12 h-12 rounded-full bg-gradient-to-tr from-rose-500 via-amber-400 to-sky-400 border-2 border-slate-900 shadow-lg cursor-pointer z-20 flex items-center justify-center text-base active:scale-90"
            title="¡Toca para patear la pelota y divertir a Pou!"
          >
            ⚽
          </motion.div>
        )}

        <PixelPetRenderer
          pet={pet}
          isEating={isEating}
          isSoaping={isSoaping}
          isShowering={isShowering}
          onPetPet={onPetTouch}
          size={185}
        />
      </div>

      {/* ROOM-SPECIFIC INTERACTIVE CONTROLS BOTTOM BAR */}
      <div className="w-full z-20 pb-0.5">
        {/* KITCHEN: Food Tray */}
        {currentRoom === 'kitchen' && (
          <div className="bg-slate-900/90 backdrop-blur-sm p-1.5 rounded-xl border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between text-[11px] text-amber-200 font-bold px-1 mb-1">
              <span>Bocadillos & Hábitos Saludables</span>
              <span className="text-[9px] text-slate-400">Toca para alimentar</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-thin">
              {FOOD_CATALOG.map((food) => {
                const canAfford = pet.coins >= food.price;
                return (
                  <button
                    key={food.id}
                    onClick={() => handleFoodSelect(food)}
                    disabled={!canAfford}
                    className={`flex flex-col items-center justify-center min-w-[54px] py-1 px-1 rounded-lg border transition active:scale-90 shrink-0 ${
                      canAfford
                        ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700'
                        : 'bg-slate-900 text-slate-500 border-slate-800 opacity-60'
                    }`}
                    title={`${food.name} (+${food.hungerRestore}% Hambre)`}
                  >
                    <span className="text-xl">{food.icon}</span>
                    <span className="text-[9px] font-bold mt-0.5 truncate max-w-[50px]">
                      {food.name.split(' ')[0]}
                    </span>
                    <span className="text-[8px] font-extrabold text-amber-400 flex items-center gap-0.5">
                      🪙{food.price}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* BATHROOM: Soap, Shower & Toothbrush */}
        {currentRoom === 'bathroom' && (
          <div className="bg-slate-900/90 backdrop-blur-sm p-1.5 rounded-xl border border-slate-800 shadow-xl flex items-center justify-around gap-1.5">
            <button
              id="bath-soap-button"
              onClick={handleSoapClick}
              className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-lg bg-pink-600 hover:bg-pink-500 text-white border border-pink-700 transition active:scale-95 shadow"
            >
              <span className="text-2xl">🧼</span>
              <span className="text-[11px] font-bold mt-0.5 leading-none">Enjabonar</span>
              <span className="text-[8px] text-pink-200 mt-0.5">+25 Higiene</span>
            </button>

            <button
              id="bath-shower-button"
              onClick={handleShowerClick}
              className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white border border-sky-700 transition active:scale-95 shadow"
            >
              <span className="text-2xl">🚿</span>
              <span className="text-[11px] font-bold mt-0.5 leading-none">Enjuagar</span>
              <span className="text-[8px] text-sky-200 mt-0.5">Limpia espuma</span>
            </button>

            <button
              id="bath-toothbrush-button"
              onClick={handleToothbrushClick}
              className="flex-1 flex flex-col items-center justify-center py-1.5 px-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-700 transition active:scale-95 shadow"
            >
              <span className="text-2xl">🪥</span>
              <span className="text-[11px] font-bold mt-0.5 leading-none">Cepillar</span>
              <span className="text-[8px] text-emerald-200 mt-0.5">Hábito dental +XP</span>
            </button>
          </div>
        )}

        {/* BEDROOM: Sleep Status & Live Energy Charger */}
        {currentRoom === 'bedroom' && (
          <div className="bg-slate-900/95 backdrop-blur-sm p-2.5 rounded-xl border border-slate-800 shadow-2xl text-center">
            {pet.isSleeping ? (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                  <span className="flex items-center gap-1 text-amber-300">
                    <span>💤 Durmiendo</span>
                    <span className="text-[10px] text-amber-400 animate-pulse">(Recargando)</span>
                  </span>
                  <span className="text-emerald-400 font-extrabold flex items-center gap-0.5">
                    ⚡ {pet.energy}%
                  </span>
                </div>

                {/* Live recharge progress bar */}
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
                    style={{ width: `${Math.max(5, pet.energy)}%` }}
                  />
                </div>

                {pet.energy >= 100 ? (
                  <p className="text-[11px] font-black text-amber-300 animate-bounce">
                    ✨ ¡Energía al 100%! {pet.name} descansó al máximo.
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-400 font-semibold">
                    La energía y salud se recargan mientras la luz esté apagada.
                  </p>
                )}

                {/* Big Button to Turn Light ON */}
                <button
                  id="bedroom-wake-light-btn"
                  onClick={onToggleSleep}
                  className="w-full py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-95 border-2 border-amber-600"
                >
                  <Sun className="w-4 h-4 text-amber-950 fill-amber-950" />
                  <span>Encender Luz para Despertar</span>
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                  <span className="text-slate-300">💡 Habitación de Descanso</span>
                  <span className="text-amber-400 font-extrabold">⚡ {pet.energy}%</span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  {pet.energy < 40
                    ? `⚠️ ${pet.name} tiene sueño. Apaga la luz para que recupere energías.`
                    : 'Apaga la luz de la lámpara cuando quieras que duerma.'}
                </p>
                {/* Big Button to Turn Light OFF */}
                <button
                  id="bedroom-sleep-light-btn"
                  onClick={onToggleSleep}
                  className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 font-black text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-95"
                >
                  <Moon className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>Apagar Luz para Dormir</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* PLAYROOM: Launch Educational Minigames */}
        {currentRoom === 'playroom' && (
          <div className="bg-slate-900/90 backdrop-blur-sm p-2 rounded-xl border border-slate-800 shadow-xl flex items-center justify-between gap-2">
            <div className="text-left min-w-0">
              <h3 className="text-xs font-black text-amber-300 flex items-center gap-1 truncate">
                <Gamepad2 className="w-3.5 h-3.5 shrink-0" />
                <span>Minijuegos Educativos</span>
              </h3>
              <p className="text-[10px] text-slate-300 truncate">
                Matemáticas, memoria y hábitos (+monedas)
              </p>
            </div>
            <button
              id="play-minigames-cta"
              onClick={onOpenMinigames}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs px-3 py-2 rounded-lg border border-amber-700 shadow transition active:scale-95 shrink-0 flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>¡Jugar!</span>
            </button>
          </div>
        )}

        {/* GARDEN: Relax & Photo */}
        {currentRoom === 'garden' && (
          <div className="bg-slate-900/90 backdrop-blur-sm p-2 rounded-xl border border-slate-800 shadow-xl flex items-center justify-between gap-2">
            <div className="text-left min-w-0">
              <h3 className="text-xs font-black text-emerald-300 truncate">Paseo al Aire Libre 🌻</h3>
              <p className="text-[10px] text-slate-300 truncate">
                Pasear al sol mejora la salud y felicidad
              </p>
            </div>
            <button
              onClick={onOpenPhotoBooth}
              className="bg-pink-500 hover:bg-pink-400 text-white font-black text-xs px-3 py-2 rounded-lg border border-pink-700 shadow transition active:scale-95 shrink-0 flex items-center gap-1"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Foto Postal</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
