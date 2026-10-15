export type PetNeed = 'hunger' | 'hygiene' | 'energy' | 'happiness';

export type RoomType = 'bedroom' | 'kitchen' | 'bathroom' | 'playroom' | 'garden';

export interface PetStats {
  name: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  coins: number;
  hunger: number; // 0 - 100
  hygiene: number; // 0 - 100
  energy: number; // 0 - 100
  happiness: number; // 0 - 100
  health: number; // 0 - 100
  isSleeping: boolean;
  birthDate: string;
  daysAlive: number;
  skinColor: string;
  eyeColor: string;
  equippedHat: string | null;
  equippedGlasses: string | null;
  equippedClothes: string | null;
  equippedWallpaper: string;
  dirtSpots: number; // 0 - 5
}

export interface HabitItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  completedToday: boolean;
  rewardCoins: number;
  rewardXp: number;
  targetCategory: 'salud' | 'estudio' | 'orden' | 'emocion';
}

export interface CustomizationItem {
  id: string;
  name: string;
  category: 'skin' | 'hat' | 'glasses' | 'clothes' | 'wallpaper';
  price: number;
  minLevel: number;
  unlocked: boolean;
  assetKey: string;
  previewColor?: string;
  description: string;
}

export interface FoodItem {
  id: string;
  name: string;
  icon: string;
  price: number;
  hungerRestore: number;
  happinessBonus: number;
  isHealthy: boolean;
  soundType: 'crunch' | 'slurp' | 'sweet';
}

export interface InGameNotification {
  id: string;
  title: string;
  message: string;
  icon: string;
  type: 'habit' | 'hunger' | 'energy' | 'reward' | 'hygiene';
  actionLabel?: string;
  actionRoom?: RoomType;
  timestamp: number;
}
