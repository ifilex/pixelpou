import React, { useState } from 'react';
import { CustomizationItem, PetStats } from '../types';
import { soundFx } from '../audio/retroAudio';
import confetti from 'canvas-confetti';
import { X, Lock, Check, ShoppingBag, Sparkles } from 'lucide-react';

interface ClosetStoreModalProps {
  pet: PetStats;
  inventory: CustomizationItem[];
  onClose: () => void;
  onEquipItem: (item: CustomizationItem) => void;
  onBuyItem: (item: CustomizationItem) => void;
}

type TabType = 'skin' | 'hat' | 'glasses' | 'clothes' | 'wallpaper';

export const ClosetStoreModal: React.FC<ClosetStoreModalProps> = ({
  pet,
  inventory,
  onClose,
  onEquipItem,
  onBuyItem,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('skin');

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'skin', label: 'Piel', icon: '🎨' },
    { id: 'hat', label: 'Gorros', icon: '🧢' },
    { id: 'glasses', label: 'Gafas', icon: '🕶️' },
    { id: 'clothes', label: 'Ropa', icon: '👔' },
    { id: 'wallpaper', label: 'Fondo', icon: '🖼️' },
  ];

  const filteredItems = inventory.filter((item) => item.category === activeTab);

  const isEquipped = (item: CustomizationItem) => {
    if (item.category === 'skin') return pet.skinColor === item.assetKey;
    if (item.category === 'hat') return pet.equippedHat === (item.assetKey === 'none' ? null : item.assetKey);
    if (item.category === 'glasses') return pet.equippedGlasses === (item.assetKey === 'none' ? null : item.assetKey);
    if (item.category === 'clothes') return pet.equippedClothes === (item.assetKey === 'none' ? null : item.assetKey);
    if (item.category === 'wallpaper') return pet.equippedWallpaper === item.assetKey;
    return false;
  };

  const handleAction = (item: CustomizationItem) => {
    if (item.unlocked) {
      soundFx.playBoop(520, 'square');
      onEquipItem(item);
    } else {
      if (pet.level < item.minLevel) {
        soundFx.playBoop(240, 'sawtooth');
        return;
      }
      if (pet.coins < item.price) {
        soundFx.playBoop(240, 'sawtooth');
        return;
      }
      // Buy & equip
      soundFx.playLevelUp();
      confetti({ particleCount: 30 });
      onBuyItem(item);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md select-none animate-in fade-in">
      <div
        id="closet-store-modal-card"
        className="w-full max-w-lg bg-slate-900 border-4 border-slate-950 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 text-white flex items-center justify-between border-b-4 border-slate-950">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-800 rounded-xl border border-purple-400">
              <ShoppingBag className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-wide">
                Tienda & Armario Exclusivo
              </h2>
              <p className="text-xs text-purple-200">
                Personaliza el look de {pet.name} con accesorios únicos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-amber-400 text-amber-950 font-black text-xs px-2.5 py-1 rounded-xl border border-amber-600 shadow-sm flex items-center gap-1">
              <span>🪙</span>
              <span>{pet.coins}</span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-purple-100 transition active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center justify-between gap-1 p-2 bg-slate-950 border-b border-slate-800 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                soundFx.playBoop(400, 'triangle', 0.04);
                setActiveTab(t.id);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs shrink-0 transition active:scale-95 ${
                activeTab === t.id
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="p-4 overflow-y-auto grid grid-cols-2 gap-3 flex-1">
          {filteredItems.map((item) => {
            const equipped = isEquipped(item);
            const levelLocked = pet.level < item.minLevel;
            const canAfford = pet.coins >= item.price;

            return (
              <div
                key={item.id}
                className={`flex flex-col justify-between p-3 rounded-2xl border-2 transition ${
                  equipped
                    ? 'bg-purple-950/50 border-purple-400 shadow-md ring-2 ring-purple-500/30'
                    : item.unlocked
                    ? 'bg-slate-800 border-slate-700'
                    : 'bg-slate-850 border-slate-800 opacity-90'
                }`}
              >
                {/* Item Preview */}
                <div className="flex items-start justify-between mb-1">
                  <div className="flex items-center gap-2">
                    {item.category === 'skin' && (
                      <div
                        className="w-7 h-7 rounded-lg border-2 border-slate-900 shadow-sm"
                        style={{ backgroundColor: item.previewColor }}
                      />
                    )}
                    <div>
                      <h4 className="font-bold text-xs text-white leading-tight">{item.name}</h4>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{item.description}</p>
                    </div>
                  </div>
                  {equipped && (
                    <span className="p-1 rounded-full bg-emerald-500 text-slate-950">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </div>

                {/* Level / Price / Action */}
                <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-between">
                  {item.unlocked ? (
                    <button
                      onClick={() => handleAction(item)}
                      className={`w-full py-1.5 px-2 rounded-xl text-xs font-bold transition active:scale-95 ${
                        equipped
                          ? 'bg-slate-700 hover:bg-slate-600 text-purple-200'
                          : 'bg-purple-600 hover:bg-purple-500 text-white'
                      }`}
                    >
                      {equipped ? 'Puesto ✓' : 'Equipar'}
                    </button>
                  ) : levelLocked ? (
                    <div className="flex items-center gap-1 text-[10px] text-rose-400 font-bold w-full justify-center py-1">
                      <Lock className="w-3 h-3" /> Requiere Nv.{item.minLevel}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAction(item)}
                      disabled={!canAfford}
                      className={`w-full py-1.5 px-2 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition active:scale-95 ${
                        canAfford
                          ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <span>Desbloquear</span>
                      <span className="text-amber-900">🪙{item.price}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1 text-amber-300">
            <Sparkles className="w-3.5 h-3.5" /> ¡Sube de nivel completando hábitos para más ropa!
          </span>
          <button
            onClick={onClose}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-1.5 rounded-xl text-xs transition"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
