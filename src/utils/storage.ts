import { CustomizationItem, HabitItem, InGameNotification, PetStats } from '../types';
import { CUSTOMIZATION_ITEMS, INITIAL_HABITS, INITIAL_PET } from './gameData';

const STORAGE_KEY_PET = 'pixelpou_pet_state_v1';
const STORAGE_KEY_ITEMS = 'pixelpou_items_state_v1';
const STORAGE_KEY_HABITS = 'pixelpou_habits_state_v1';
const STORAGE_KEY_LAST_LOGIN = 'pixelpou_last_login_date';
const STORAGE_KEY_STREAK = 'pixelpou_streak_days';
const STORAGE_KEY_CLAIMED_STREAK_TODAY = 'pixelpou_streak_claimed_today';

export interface GameSaveData {
  pet: PetStats;
  inventory: CustomizationItem[];
  habits: HabitItem[];
  streakDays: number;
  streakClaimedToday: boolean;
}

export function loadGameData(): GameSaveData {
  let pet: PetStats = INITIAL_PET;
  let inventory: CustomizationItem[] = CUSTOMIZATION_ITEMS;
  let habits: HabitItem[] = INITIAL_HABITS;
  let streakDays = 1;
  let streakClaimedToday = false;

  try {
    const rawPet = localStorage.getItem(STORAGE_KEY_PET);
    if (rawPet) {
      const parsed = JSON.parse(rawPet);
      pet = { ...INITIAL_PET, ...parsed };

      // Calculate offline decay based on time elapsed since last saved
      const lastSaveTime = (parsed as { lastSaveTimestamp?: number }).lastSaveTimestamp;
      if (lastSaveTime) {
        const now = Date.now();
        const diffMinutes = Math.min(Math.floor((now - lastSaveTime) / (1000 * 60)), 720); // cap at 12 hours
        if (diffMinutes > 1) {
          // Pet slowly gets hungry, slightly dirtier, loses energy unless sleeping
          const hungerLoss = Math.floor(diffMinutes * 0.08);
          const hygieneLoss = Math.floor(diffMinutes * 0.05);
          pet.hunger = Math.max(10, pet.hunger - hungerLoss);
          pet.hygiene = Math.max(15, pet.hygiene - hygieneLoss);
          if (pet.hygiene < 40) {
            pet.dirtSpots = Math.min(4, Math.floor((100 - pet.hygiene) / 20));
          }
          if (pet.isSleeping) {
            pet.energy = Math.min(100, pet.energy + Math.floor(diffMinutes * 0.2));
          } else {
            pet.energy = Math.max(15, pet.energy - Math.floor(diffMinutes * 0.06));
          }
        }
      }
    }

    const rawItems = localStorage.getItem(STORAGE_KEY_ITEMS);
    if (rawItems) {
      const savedItems: CustomizationItem[] = JSON.parse(rawItems);
      // Merge with default catalog in case new items were added
      inventory = CUSTOMIZATION_ITEMS.map((catalogItem) => {
        const found = savedItems.find((s) => s.id === catalogItem.id);
        return found ? { ...catalogItem, unlocked: found.unlocked } : catalogItem;
      });
    }

    const rawHabits = localStorage.getItem(STORAGE_KEY_HABITS);
    const lastLoginDate = localStorage.getItem(STORAGE_KEY_LAST_LOGIN);
    const todayStr = new Date().toISOString().split('T')[0];

    if (rawHabits) {
      const parsedHabits: HabitItem[] = JSON.parse(rawHabits);
      // If it's a new day, reset habits completion status!
      if (lastLoginDate !== todayStr) {
        habits = parsedHabits.map((h) => ({ ...h, completedToday: false }));
        streakClaimedToday = false;
      } else {
        habits = parsedHabits;
      }
    }

    const rawStreak = localStorage.getItem(STORAGE_KEY_STREAK);
    if (rawStreak) {
      streakDays = parseInt(rawStreak, 10) || 1;
    }

    const rawClaimed = localStorage.getItem(STORAGE_KEY_CLAIMED_STREAK_TODAY);
    if (rawClaimed && lastLoginDate === todayStr) {
      streakClaimedToday = rawClaimed === 'true';
    }

    // Update last login
    localStorage.setItem(STORAGE_KEY_LAST_LOGIN, todayStr);
  } catch (err) {
    console.error('Error loading game data:', err);
  }

  return {
    pet,
    inventory,
    habits,
    streakDays,
    streakClaimedToday,
  };
}

export function saveGameData(
  pet: PetStats,
  inventory: CustomizationItem[],
  habits: HabitItem[],
  streakDays: number,
  streakClaimedToday: boolean
) {
  try {
    const petWithTimestamp = {
      ...pet,
      lastSaveTimestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY_PET, JSON.stringify(petWithTimestamp));
    localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(inventory));
    localStorage.setItem(STORAGE_KEY_HABITS, JSON.stringify(habits));
    localStorage.setItem(STORAGE_KEY_STREAK, String(streakDays));
    localStorage.setItem(STORAGE_KEY_CLAIMED_STREAK_TODAY, String(streakClaimedToday));
  } catch (err) {
    console.error('Error saving game data:', err);
  }
}

// Request Browser Notifications safely for daily reminders
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  if (Notification.permission === 'granted') {
    return true;
  }
  if (Notification.permission !== 'denied') {
    const result = await Notification.requestPermission();
    return result === 'granted';
  }
  return false;
}

export function sendBrowserNotification(title: string, body: string) {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '🍎',
      });
    } catch {
      // Notification failed
    }
  }
}

// Generate smart contextual notification
export function checkPetNeedsForNotifications(pet: PetStats): InGameNotification | null {
  if (pet.hunger < 35) {
    return {
      id: `notif_hunger_${Date.now()}`,
      title: '¡Tengo mucha hambre!',
      message: `${pet.name} tiene la pancita vacía. ¡Vamos a la cocina a comer una manzana!`,
      icon: '🍎',
      type: 'hunger',
      actionLabel: 'Ir a Cocinar',
      actionRoom: 'kitchen',
      timestamp: Date.now(),
    };
  }
  if (pet.hygiene < 35) {
    return {
      id: `notif_hygiene_${Date.now()}`,
      title: '¡Hora de un buen baño!',
      message: `${pet.name} está un poco sucio. ¡Enjabónalo y pásale la esponja burbujeante!`,
      icon: '🧼',
      type: 'hygiene',
      actionLabel: 'Ir al Baño',
      actionRoom: 'bathroom',
      timestamp: Date.now(),
    };
  }
  if (pet.energy < 25 && !pet.isSleeping) {
    return {
      id: `notif_energy_${Date.now()}`,
      title: '¡Estoy cansado... bostezo!',
      message: `${pet.name} tiene los ojitos pesados. ¡Apaga la lámpara para descansar!`,
      icon: '💤',
      type: 'energy',
      actionLabel: 'Ir al Dormitorio',
      actionRoom: 'bedroom',
      timestamp: Date.now(),
    };
  }
  return null;
}
