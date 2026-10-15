import React, { useState, useEffect, useCallback } from 'react';
import { CustomizationItem, FoodItem, InGameNotification, PetStats, RoomType } from './types';
import { HeaderStats } from './components/HeaderStats';
import { VitalsMeters } from './components/VitalsMeters';
import { RoomViewport } from './components/RoomViewport';
import { RoomNavigation } from './components/RoomNavigation';
import { HabitsModal } from './components/HabitsModal';
import { MinigamesModal } from './components/MinigamesModal';
import { ClosetStoreModal } from './components/ClosetStoreModal';
import { PhotoShareModal } from './components/PhotoShareModal';
import { DailyRewardsModal } from './components/DailyRewardsModal';
import { NotificationBanner } from './components/NotificationBanner';
import { loadGameData, saveGameData, checkPetNeedsForNotifications, sendBrowserNotification } from './utils/storage';
import { soundFx } from './audio/retroAudio';
import confetti from 'canvas-confetti';

export default function App() {
  const [gameData, setGameData] = useState(() => loadGameData());
  const [pet, setPet] = useState<PetStats>(gameData.pet);
  const [inventory, setInventory] = useState<CustomizationItem[]>(gameData.inventory);
  const [habits, setHabits] = useState(gameData.habits);
  const [streakDays, setStreakDays] = useState(gameData.streakDays);
  const [streakClaimedToday, setStreakClaimedToday] = useState(gameData.streakClaimedToday);

  // Active view room
  const [currentRoom, setCurrentRoom] = useState<RoomType>('kitchen');

  // Modals state
  const [isHabitsOpen, setIsHabitsOpen] = useState(false);
  const [isMinigamesOpen, setIsMinigamesOpen] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const [isPhotoBoothOpen, setIsPhotoBoothOpen] = useState(false);
  const [isStreakOpen, setIsStreakOpen] = useState(false);

  // In-game notification banner
  const [notification, setNotification] = useState<InGameNotification | null>(null);

  // Save game whenever key states change
  useEffect(() => {
    saveGameData(pet, inventory, habits, streakDays, streakClaimedToday);
  }, [pet, inventory, habits, streakDays, streakClaimedToday]);

  // Level Up Helper
  const addXPAndCoins = useCallback((xpGain: number, coinsGain: number = 0) => {
    setPet((prev) => {
      let newXp = prev.xp + xpGain;
      let newLevel = prev.level;
      let newXpTarget = prev.xpToNextLevel;
      let leveledUp = false;

      while (newXp >= newXpTarget) {
        newXp -= newXpTarget;
        newLevel += 1;
        newXpTarget = Math.floor(newXpTarget * 1.35);
        leveledUp = true;
      }

      if (leveledUp) {
        soundFx.playLevelUp();
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.4 },
        });
      }

      return {
        ...prev,
        level: newLevel,
        xp: newXp,
        xpToNextLevel: newXpTarget,
        coins: prev.coins + coinsGain,
      };
    });
  }, []);

  // Periodic game tick (every 20 seconds) for pet vitals decay
  useEffect(() => {
    const interval = setInterval(() => {
      setPet((prev) => {
        if (prev.isSleeping) {
          // Pet is sleeping: energy regenerates, hygiene and hunger stay safe
          const newEnergy = Math.min(100, prev.energy + 5);
          const newHealth = Math.min(100, prev.health + 2);
          return {
            ...prev,
            energy: newEnergy,
            health: newHealth,
            // Strictly preserve isSleeping: true until user turns light back on!
            isSleeping: true,
          };
        } else {
          // Pet is awake: small decay
          const newHunger = Math.max(0, prev.hunger - 1);
          const newHygiene = Math.max(0, prev.hygiene - 1);
          const newEnergy = Math.max(0, prev.energy - 1);
          const newHappiness = Math.max(0, prev.happiness - 1);

          let newDirt = prev.dirtSpots;
          if (newHygiene < 50 && newDirt === 0) newDirt = 1;
          if (newHygiene < 30 && newDirt < 2) newDirt = 2;
          if (newHygiene < 15 && newDirt < 3) newDirt = 3;

          return {
            ...prev,
            hunger: newHunger,
            hygiene: newHygiene,
            energy: newEnergy,
            happiness: newHappiness,
            dirtSpots: newDirt,
          };
        }
      });
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  // Active smooth sleep recharge: recharges energy and health in real time when lamp is off
  useEffect(() => {
    if (!pet.isSleeping) return;

    const sleepTimer = setInterval(() => {
      setPet((prev) => {
        if (!prev.isSleeping) return prev;
        if (prev.energy >= 100 && prev.health >= 100) return prev;

        return {
          ...prev,
          energy: Math.min(100, prev.energy + 2),
          health: Math.min(100, prev.health + 1),
        };
      });
    }, 1200);

    return () => clearInterval(sleepTimer);
  }, [pet.isSleeping]);

  // Check for smart contextual notifications periodically
  useEffect(() => {
    const notifTimer = setTimeout(() => {
      const need = checkPetNeedsForNotifications(pet);
      if (need && !notification) {
        setNotification(need);
        sendBrowserNotification(need.title, need.message);
      }
    }, 8000);

    return () => clearTimeout(notifTimer);
  }, [pet, notification]);

  // Feed action
  const handleFeed = (food: FoodItem) => {
    setPet((prev) => {
      const newHunger = Math.min(100, prev.hunger + food.hungerRestore);
      const newHappiness = Math.min(100, prev.happiness + food.happinessBonus);
      const newHealth = food.isHealthy ? Math.min(100, prev.health + 8) : prev.health;
      const newCoins = Math.max(0, prev.coins - food.price);

      return {
        ...prev,
        hunger: newHunger,
        happiness: newHappiness,
        health: newHealth,
        coins: newCoins,
      };
    });

    addXPAndCoins(food.isHealthy ? 15 : 8, 0);
  };

  // Clean with soap
  const handleCleanSoap = () => {
    setPet((prev) => ({
      ...prev,
      dirtSpots: 0,
      hygiene: Math.min(100, prev.hygiene + 25),
      happiness: Math.min(100, prev.happiness + 5),
    }));
    addXPAndCoins(10, 2);
  };

  // Shower wash
  const handleCleanShower = () => {
    setPet((prev) => ({
      ...prev,
      hygiene: 100,
      happiness: Math.min(100, prev.happiness + 10),
    }));
    addXPAndCoins(12, 3);
  };

  // Brush teeth action
  const handleBrushTeeth = () => {
    setPet((prev) => ({
      ...prev,
      hygiene: Math.min(100, prev.hygiene + 15),
      health: Math.min(100, prev.health + 10),
      happiness: Math.min(100, prev.happiness + 10),
    }));
    // Check off teeth habit automatically if not already completed today!
    setHabits((prev) =>
      prev.map((h) => (h.id === 'h_teeth' ? { ...h, completedToday: true } : h))
    );
    addXPAndCoins(20, 15);
  };

  // Toggle sleep (Turn light off / on)
  const handleToggleSleep = () => {
    setPet((prev) => {
      const willSleep = !prev.isSleeping;
      soundFx.playLampClick(willSleep);
      return {
        ...prev,
        isSleeping: willSleep,
      };
    });
  };

  // Play ball
  const handlePlayBall = () => {
    setPet((prev) => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + 8),
      energy: Math.max(5, prev.energy - 3),
    }));
    addXPAndCoins(6, 1);
  };

  // Pet touch tickle
  const handlePetTouch = () => {
    setPet((prev) => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + 4),
    }));
  };

  // Toggle daily habit
  const handleToggleHabit = (habitId: string) => {
    setHabits((prev) =>
      prev.map((h) => {
        if (h.id === habitId) {
          const nextState = !h.completedToday;
          if (nextState) {
            addXPAndCoins(h.rewardXp, h.rewardCoins);
            // Boost pet stats as a reward for child's healthy habit!
            setPet((p) => ({
              ...p,
              happiness: Math.min(100, p.happiness + 15),
              health: Math.min(100, p.health + 10),
            }));
          }
          return { ...h, completedToday: nextState };
        }
        return h;
      })
    );
  };

  // Minigame reward
  const handleMinigameReward = (coinsEarned: number, xpEarned: number) => {
    addXPAndCoins(xpEarned, coinsEarned);
    setPet((prev) => ({
      ...prev,
      happiness: Math.min(100, prev.happiness + 20),
    }));
  };

  // Equip item
  const handleEquipItem = (item: CustomizationItem) => {
    setPet((prev) => {
      if (item.category === 'skin') return { ...prev, skinColor: item.assetKey };
      if (item.category === 'hat')
        return { ...prev, equippedHat: item.assetKey === 'none' ? null : item.assetKey };
      if (item.category === 'glasses')
        return { ...prev, equippedGlasses: item.assetKey === 'none' ? null : item.assetKey };
      if (item.category === 'clothes')
        return { ...prev, equippedClothes: item.assetKey === 'none' ? null : item.assetKey };
      if (item.category === 'wallpaper') return { ...prev, equippedWallpaper: item.assetKey };
      return prev;
    });
  };

  // Buy item
  const handleBuyItem = (item: CustomizationItem) => {
    setInventory((prev) =>
      prev.map((inv) => (inv.id === item.id ? { ...inv, unlocked: true } : inv))
    );
    setPet((prev) => ({
      ...prev,
      coins: Math.max(0, prev.coins - item.price),
    }));
    handleEquipItem(item);
  };

  // Claim streak reward
  const handleClaimStreak = (coins: number, xp: number) => {
    setStreakClaimedToday(true);
    setStreakDays((prev) => prev + 1);
    addXPAndCoins(xp, coins);
  };

  // Rename pet
  const handleRename = (newName: string) => {
    setPet((prev) => ({ ...prev, name: newName }));
  };

  // Notification action click
  const handleNotificationAction = (targetRoom?: RoomType) => {
    if (targetRoom) {
      setCurrentRoom(targetRoom);
    }
    setNotification(null);
  };

  return (
    <div
      id="game-root-viewport"
      className="h-[100dvh] max-h-[100dvh] w-full bg-slate-950 text-slate-100 flex items-center justify-center overflow-hidden selection:bg-amber-400 selection:text-slate-950 select-none"
    >
      {/* Handheld Game Console / Mobile Shell Container */}
      <div
        id="game-console-chassis"
        className="w-full max-w-md h-full max-h-[100dvh] bg-slate-900 flex flex-col justify-between overflow-hidden relative shadow-2xl sm:border-x-2 sm:border-slate-800"
      >
        {/* Top Header Bar */}
        <HeaderStats
          pet={pet}
          streakDays={streakDays}
          onRename={handleRename}
          onOpenStreakModal={() => setIsStreakOpen(true)}
          onOpenHabitsModal={() => setIsHabitsOpen(true)}
        />

        {/* In-Game Interactive Notification Banner */}
        <NotificationBanner
          notification={notification}
          onDismiss={() => setNotification(null)}
          onAction={handleNotificationAction}
        />

        {/* Vital Need Meters */}
        <VitalsMeters pet={pet} onNavigateRoom={(room) => setCurrentRoom(room)} />

        {/* Main Room Viewport Stage (flex-1 min-h-0 fills exact remaining height without scroll) */}
        <main className="flex-1 min-h-0 w-full p-2 flex flex-col overflow-hidden relative">
          <RoomViewport
            currentRoom={currentRoom}
            pet={pet}
            onFeed={handleFeed}
            onCleanSoap={handleCleanSoap}
            onCleanShower={handleCleanShower}
            onBrushTeeth={handleBrushTeeth}
            onToggleSleep={handleToggleSleep}
            onPlayBall={handlePlayBall}
            onOpenMinigames={() => setIsMinigamesOpen(true)}
            onOpenPhotoBooth={() => setIsPhotoBoothOpen(true)}
            onPetTouch={handlePetTouch}
          />
        </main>

        {/* Bottom Room Navigation Dock */}
        <RoomNavigation
          currentRoom={currentRoom}
          onSelectRoom={(room) => setCurrentRoom(room)}
          onOpenStore={() => setIsStoreOpen(true)}
          onOpenHabits={() => setIsHabitsOpen(true)}
          onOpenPhotoBooth={() => setIsPhotoBoothOpen(true)}
        />
      </div>

      {/* Modals */}
      {isHabitsOpen && (
        <HabitsModal
          habits={habits}
          petName={pet.name}
          onClose={() => setIsHabitsOpen(false)}
          onToggleHabit={handleToggleHabit}
        />
      )}

      {isMinigamesOpen && (
        <MinigamesModal
          onClose={() => setIsMinigamesOpen(false)}
          onRewardEarned={handleMinigameReward}
          currentCoins={pet.coins}
        />
      )}

      {isStoreOpen && (
        <ClosetStoreModal
          pet={pet}
          inventory={inventory}
          onClose={() => setIsStoreOpen(false)}
          onEquipItem={handleEquipItem}
          onBuyItem={handleBuyItem}
        />
      )}

      {isPhotoBoothOpen && (
        <PhotoShareModal
          pet={pet}
          streakDays={streakDays}
          onClose={() => setIsPhotoBoothOpen(false)}
        />
      )}

      {isStreakOpen && (
        <DailyRewardsModal
          streakDays={streakDays}
          streakClaimedToday={streakClaimedToday}
          onClose={() => setIsStreakOpen(false)}
          onClaimStreak={handleClaimStreak}
        />
      )}
    </div>
  );
}
