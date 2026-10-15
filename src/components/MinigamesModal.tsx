import React, { useState, useEffect, useRef } from 'react';
import { soundFx } from '../audio/retroAudio';
import confetti from 'canvas-confetti';
import { X, ArrowLeft, Trophy, Sparkles, Brain, Layers, Rocket } from 'lucide-react';

interface MinigamesModalProps {
  onClose: () => void;
  onRewardEarned: (coins: number, xp: number) => void;
  currentCoins: number;
}

type ActiveGame = 'menu' | 'math' | 'memory' | 'jumper';

export const MinigamesModal: React.FC<MinigamesModalProps> = ({
  onClose,
  onRewardEarned,
  currentCoins,
}) => {
  const [activeGame, setActiveGame] = useState<ActiveGame>('menu');

  // Math Game State
  const [mathNum1, setMathNum1] = useState(2);
  const [mathNum2, setMathNum2] = useState(3);
  const [mathOp, setMathOp] = useState<'+' | '-' | '×'>('+');
  const [mathOptions, setMathOptions] = useState<number[]>([]);
  const [mathScore, setMathScore] = useState(0);
  const [mathTimeLeft, setMathTimeLeft] = useState(25);
  const [mathGameOver, setMathGameOver] = useState(false);
  const [mathFeedback, setMathFeedback] = useState<string | null>(null);

  // Memory Game State
  const HABIT_CARDS = ['🪥', '💧', '🍎', '📖', '😴', '🏃'];
  interface MemoryCard {
    id: number;
    symbol: string;
    isFlipped: boolean;
    isMatched: boolean;
  }
  const [memoryCards, setMemoryCards] = useState<MemoryCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<number[]>([]);
  const [memoryMoves, setMemoryMoves] = useState(0);
  const [memoryWon, setMemoryWon] = useState(false);

  // Jumper Game State
  const [jumperScore, setJumperScore] = useState(0);
  const [jumperGameOver, setJumperGameOver] = useState(false);
  const [playerX, setPlayerX] = useState(50); // percentage 0-100
  const [playerY, setPlayerY] = useState(80); // percentage
  const [jumperCoinsCollected, setJumperCoinsCollected] = useState(0);
  const jumperCanvasRef = useRef<HTMLDivElement>(null);

  // ===================== MATH GAME LOGIC =====================
  const generateMathQuestion = () => {
    const ops: ('+' | '-' | '×')[] = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let n1 = Math.floor(Math.random() * 9) + 1;
    let n2 = Math.floor(Math.random() * 9) + 1;

    let ans = n1 + n2;
    if (op === '-') {
      if (n1 < n2) {
        const temp = n1;
        n1 = n2;
        n2 = temp;
      }
      ans = n1 - n2;
    } else if (op === '×') {
      n1 = Math.floor(Math.random() * 6) + 1;
      n2 = Math.floor(Math.random() * 5) + 1;
      ans = n1 * n2;
    }

    setMathNum1(n1);
    setMathNum2(n2);
    setMathOp(op);

    // Generate 3 wrong options
    const opts = new Set<number>([ans]);
    while (opts.size < 4) {
      const delta = (Math.random() > 0.5 ? 1 : -1) * (Math.floor(Math.random() * 4) + 1);
      const fake = Math.max(0, ans + delta);
      opts.add(fake);
    }
    const shuffled = Array.from(opts).sort(() => Math.random() - 0.5);
    setMathOptions(shuffled);
  };

  const startMathGame = () => {
    setActiveGame('math');
    setMathScore(0);
    setMathTimeLeft(25);
    setMathGameOver(false);
    setMathFeedback(null);
    generateMathQuestion();
  };

  // Math timer tick
  useEffect(() => {
    if (activeGame !== 'math' || mathGameOver) return;
    const timer = setInterval(() => {
      setMathTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          setMathGameOver(true);
          soundFx.playBoop(200, 'sawtooth');
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeGame, mathGameOver]);

  const handleMathAnswer = (val: number) => {
    if (mathGameOver) return;
    let expected = mathNum1 + mathNum2;
    if (mathOp === '-') expected = mathNum1 - mathNum2;
    if (mathOp === '×') expected = mathNum1 * mathNum2;

    if (val === expected) {
      soundFx.playCoin();
      const newScore = mathScore + 1;
      setMathScore(newScore);
      setMathFeedback('¡Correcto! +10 Monedas 🎉');
      setMathTimeLeft((prev) => Math.min(30, prev + 2)); // bonus time
      generateMathQuestion();
    } else {
      soundFx.playBoop(220, 'sawtooth');
      setMathFeedback(`¡Casi! Era ${expected} 💡`);
      generateMathQuestion();
    }
  };

  const finishMathGame = () => {
    const earnedCoins = mathScore * 10 + 15;
    const earnedXp = mathScore * 12 + 20;
    onRewardEarned(earnedCoins, earnedXp);
    confetti({ particleCount: 40 });
    setActiveGame('menu');
  };

  // ===================== MEMORY GAME LOGIC =====================
  const startMemoryGame = () => {
    setActiveGame('memory');
    setMemoryMoves(0);
    setMemoryWon(false);
    setSelectedCards([]);

    // Double the symbols and shuffle
    const deck: MemoryCard[] = [...HABIT_CARDS, ...HABIT_CARDS]
      .sort(() => Math.random() - 0.5)
      .map((sym, index) => ({
        id: index,
        symbol: sym,
        isFlipped: false,
        isMatched: false,
      }));
    setMemoryCards(deck);
  };

  const handleFlipMemoryCard = (index: number) => {
    if (selectedCards.length >= 2 || memoryCards[index].isFlipped || memoryCards[index].isMatched) {
      return;
    }

    soundFx.playBoop(480, 'sine', 0.05);
    const newCards = [...memoryCards];
    newCards[index].isFlipped = true;
    setMemoryCards(newCards);

    const nextSelected = [...selectedCards, index];
    setSelectedCards(nextSelected);

    if (nextSelected.length === 2) {
      setMemoryMoves((m) => m + 1);
      const [firstIdx, secondIdx] = nextSelected;
      if (newCards[firstIdx].symbol === newCards[secondIdx].symbol) {
        // MATCH!
        soundFx.playLevelUp();
        setTimeout(() => {
          newCards[firstIdx].isMatched = true;
          newCards[secondIdx].isMatched = true;
          setMemoryCards([...newCards]);
          setSelectedCards([]);

          // Check if won
          if (newCards.every((c) => c.isMatched)) {
            setMemoryWon(true);
            soundFx.playCoin();
            confetti({ particleCount: 50, spread: 70 });
          }
        }, 400);
      } else {
        // MISMATCH
        setTimeout(() => {
          newCards[firstIdx].isFlipped = false;
          newCards[secondIdx].isFlipped = false;
          setMemoryCards([...newCards]);
          setSelectedCards([]);
        }, 900);
      }
    }
  };

  const finishMemoryGame = () => {
    const earnedCoins = 45;
    const earnedXp = 50;
    onRewardEarned(earnedCoins, earnedXp);
    setActiveGame('menu');
  };

  // ===================== SPACE JUMPER GAME LOGIC =====================
  interface JumperPlatform {
    id: number;
    x: number;
    y: number;
    hasCoin: boolean;
  }
  const [platforms, setPlatforms] = useState<JumperPlatform[]>([]);

  const startJumperGame = () => {
    setActiveGame('jumper');
    setJumperScore(0);
    setJumperCoinsCollected(0);
    setJumperGameOver(false);
    setPlayerX(50);
    setPlayerY(75);

    const initialPlats: JumperPlatform[] = [
      { id: 1, x: 45, y: 85, hasCoin: false },
      { id: 2, x: 20, y: 65, hasCoin: true },
      { id: 3, x: 70, y: 45, hasCoin: true },
      { id: 4, x: 35, y: 25, hasCoin: true },
      { id: 5, x: 60, y: 5, hasCoin: true },
    ];
    setPlatforms(initialPlats);
  };

  // Simple step jump action
  const jumpStep = (direction: 'left' | 'right') => {
    if (jumperGameOver) return;
    soundFx.playBoop(540, 'triangle', 0.08);

    setPlayerX((prev) => {
      const next = direction === 'left' ? Math.max(10, prev - 25) : Math.min(90, prev + 25);
      return next;
    });

    setJumperScore((s) => s + 10);

    // Shift platforms down
    setPlatforms((prev) => {
      const shifted = prev.map((p) => ({ ...p, y: p.y + 15 }));
      // Filter out low ones and add top
      const filtered = shifted.filter((p) => p.y < 95);
      if (filtered.length < 5) {
        filtered.push({
          id: Date.now() + Math.random(),
          x: Math.floor(Math.random() * 70) + 15,
          y: 0,
          hasCoin: Math.random() > 0.3,
        });
      }
      return filtered;
    });

    // Check coin collection
    if (Math.random() > 0.4) {
      soundFx.playCoin();
      setJumperCoinsCollected((c) => c + 1);
    }
  };

  const finishJumperGame = () => {
    const earnedCoins = jumperCoinsCollected * 5 + Math.floor(jumperScore / 5);
    const earnedXp = 35 + Math.floor(jumperScore / 4);
    onRewardEarned(earnedCoins, earnedXp);
    confetti({ particleCount: 35 });
    setActiveGame('menu');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/85 backdrop-blur-md select-none animate-in fade-in">
      <div
        id="minigames-modal-card"
        className="w-full max-w-lg bg-slate-900 border-4 border-slate-950 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-4 text-slate-950 flex items-center justify-between border-b-4 border-slate-950">
          <div className="flex items-center gap-2">
            {activeGame !== 'menu' && (
              <button
                onClick={() => setActiveGame('menu')}
                className="p-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 border border-amber-600 mr-1"
                title="Volver al menú de juegos"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="font-black text-lg sm:text-xl flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-950" />
              <span>
                {activeGame === 'menu' && 'Arcade de Minijuegos'}
                {activeGame === 'math' && 'Desafío Matemático'}
                {activeGame === 'memory' && 'Memoria Saludable'}
                {activeGame === 'jumper' && 'Salto Espacial Retro'}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content View */}
        <div className="p-4 overflow-y-auto flex-1 flex flex-col justify-center">
          {/* ===================== ARCADE MENU ===================== */}
          {activeGame === 'menu' && (
            <div className="space-y-3">
              <p className="text-xs sm:text-sm text-slate-300 text-center mb-2">
                ¡Juega minijuegos educativos para aprender, divertirte y ganar monedas para vestir a tu mascota!
              </p>

              {/* Game 1: Math Sprint */}
              <div
                onClick={startMathGame}
                className="group flex items-center justify-between p-3.5 bg-gradient-to-r from-blue-950/60 to-indigo-900/60 hover:from-blue-900/80 hover:to-indigo-800/80 rounded-2xl border-2 border-indigo-500/60 cursor-pointer transition active:scale-[0.98] shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-2xl border border-indigo-400">
                    <Brain className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-base group-hover:text-indigo-300 transition">
                      Desafío Matemático Ninja
                    </h3>
                    <p className="text-xs text-slate-300">
                      Sumas, restas y multiplicaciones rápidas para niños.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700 shrink-0">
                  +Monedas 🪙
                </span>
              </div>

              {/* Game 2: Habits Memory */}
              <div
                onClick={startMemoryGame}
                className="group flex items-center justify-between p-3.5 bg-gradient-to-r from-emerald-950/60 to-teal-900/60 hover:from-emerald-900/80 hover:to-teal-800/80 rounded-2xl border-2 border-emerald-500/60 cursor-pointer transition active:scale-[0.98] shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-2xl border border-emerald-400">
                    <Layers className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-base group-hover:text-emerald-300 transition">
                      Memoria de Hábitos
                    </h3>
                    <p className="text-xs text-slate-300">
                      Encuentra las parejas de rutinas saludables.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700 shrink-0">
                  +45🪙 +XP
                </span>
              </div>

              {/* Game 3: Sky Jumper */}
              <div
                onClick={startJumperGame}
                className="group flex items-center justify-between p-3.5 bg-gradient-to-r from-purple-950/60 to-pink-900/60 hover:from-purple-900/80 hover:to-pink-800/80 rounded-2xl border-2 border-pink-500/60 cursor-pointer transition active:scale-[0.98] shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-pink-600 flex items-center justify-center text-2xl border border-pink-400">
                    <Rocket className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-base group-hover:text-pink-300 transition">
                      Salto Espacial Retro
                    </h3>
                    <p className="text-xs text-slate-300">
                      Rebota sobre plataformas y recolecta monedas estelares.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-amber-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700 shrink-0">
                  Infinito 🚀
                </span>
              </div>
            </div>
          )}

          {/* ===================== GAME 1: MATH CHALLENGE ===================== */}
          {activeGame === 'math' && (
            <div className="flex flex-col items-center justify-center py-2 space-y-4">
              {/* Score & Timer */}
              <div className="flex items-center justify-between w-full max-w-sm text-sm font-bold text-slate-300 px-2">
                <span>Puntos: <strong className="text-amber-400 text-lg">{mathScore}</strong></span>
                <span className="text-cyan-400 font-mono text-base">⏱️ {mathTimeLeft}s</span>
              </div>

              {!mathGameOver ? (
                <>
                  {/* Math Problem Card */}
                  <div className="bg-slate-800 border-4 border-indigo-500 rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl">
                    <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-wider">
                      {mathNum1} {mathOp} {mathNum2} = ?
                    </span>
                    {mathFeedback && (
                      <p className="text-xs font-bold text-emerald-400 mt-2 animate-bounce">
                        {mathFeedback}
                      </p>
                    )}
                  </div>

                  {/* 4 Answer Options */}
                  <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                    {mathOptions.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleMathAnswer(opt)}
                        className="py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-black text-2xl border-3 border-indigo-700 shadow-md transition"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                /* Game Over Card */
                <div className="bg-slate-800 border-4 border-amber-500 rounded-3xl p-6 text-center w-full max-w-sm space-y-3">
                  <span className="text-5xl">🏆</span>
                  <h3 className="text-xl font-black text-white">¡Tiempo Cumplido!</h3>
                  <p className="text-sm text-slate-300">
                    Resolviste <strong className="text-amber-400">{mathScore}</strong> operaciones correctamente.
                  </p>
                  <p className="text-sm font-bold text-emerald-400">
                    Recompensa: +{mathScore * 10 + 15} Monedas 🪙
                  </p>
                  <button
                    onClick={finishMathGame}
                    className="w-full py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 font-black text-slate-950 text-base shadow-lg transition active:scale-95"
                  >
                    Reclamar Premio
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ===================== GAME 2: HABITS MEMORY ===================== */}
          {activeGame === 'memory' && (
            <div className="flex flex-col items-center justify-center py-2 space-y-3">
              <div className="flex items-center justify-between w-full max-w-sm text-xs font-bold text-slate-300">
                <span>Movimientos: {memoryMoves}</span>
                <span>¡Empareja los hábitos saludables!</span>
              </div>

              {/* Card Grid 4x3 */}
              <div className="grid grid-cols-4 gap-2.5 w-full max-w-sm">
                {memoryCards.map((card, idx) => (
                  <button
                    key={card.id}
                    onClick={() => handleFlipMemoryCard(idx)}
                    disabled={card.isFlipped || card.isMatched}
                    className={`h-16 rounded-xl border-3 font-bold text-2xl flex items-center justify-center transition-all duration-300 active:scale-95 ${
                      card.isFlipped || card.isMatched
                        ? 'bg-emerald-600 border-emerald-400 text-white shadow-md rotate-0'
                        : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-500'
                    }`}
                  >
                    {card.isFlipped || card.isMatched ? card.symbol : '❓'}
                  </button>
                ))}
              </div>

              {memoryWon && (
                <div className="bg-emerald-950/80 border-2 border-emerald-500 rounded-2xl p-4 text-center w-full max-w-sm space-y-2 animate-in zoom-in-95">
                  <h3 className="text-lg font-black text-amber-300">¡Memoria Perfecta! 🎉</h3>
                  <p className="text-xs text-slate-200">
                    ¡Completaste el juego en solo {memoryMoves} turnos!
                  </p>
                  <button
                    onClick={finishMemoryGame}
                    className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 font-bold text-slate-950 text-sm shadow-md"
                  >
                    Reclamar +45 Monedas 🪙
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ===================== GAME 3: SKY JUMPER ===================== */}
          {activeGame === 'jumper' && (
            <div className="flex flex-col items-center justify-center py-2 space-y-3">
              <div className="flex items-center justify-between w-full max-w-sm text-xs font-bold text-slate-300">
                <span>Altura: {jumperScore}m</span>
                <span className="text-amber-400">Monedas: {jumperCoinsCollected} 🪙</span>
              </div>

              {/* Jumper Stage Canvas */}
              <div
                ref={jumperCanvasRef}
                className="relative w-full max-w-sm h-64 bg-gradient-to-b from-indigo-950 via-slate-900 to-indigo-900 rounded-2xl border-4 border-slate-950 overflow-hidden shadow-inner"
              >
                {/* Background stars */}
                <div className="absolute top-4 left-10 text-yellow-300 text-xs">★</div>
                <div className="absolute top-16 right-12 text-yellow-200 text-xs">✦</div>
                <div className="absolute top-28 left-20 text-yellow-400 text-xs">★</div>

                {/* Platforms */}
                {platforms.map((p) => (
                  <div
                    key={p.id}
                    className="absolute h-3.5 bg-emerald-500 border-2 border-emerald-300 rounded-full shadow-md flex items-center justify-center"
                    style={{ left: `${p.x}%`, top: `${p.y}%`, width: '28%' }}
                  >
                    {p.hasCoin && (
                      <span className="absolute -top-4 text-xs animate-bounce">🪙</span>
                    )}
                  </div>
                ))}

                {/* Pet Jumper Avatar */}
                <div
                  className="absolute w-8 h-8 rounded-full bg-amber-400 border-2 border-slate-950 shadow-md flex items-center justify-center text-xs font-bold transition-all duration-150"
                  style={{ left: `${playerX}%`, top: `${playerY}%`, transform: 'translate(-50%, -50%)' }}
                >
                  🥔
                </div>
              </div>

              {/* Mobile Left / Right Jump Controls */}
              <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                <button
                  onClick={() => jumpStep('left')}
                  className="py-3 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-black text-sm border-2 border-purple-800 shadow-md"
                >
                  ⬅️ Saltar Izquierda
                </button>
                <button
                  onClick={() => jumpStep('right')}
                  className="py-3 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-black text-sm border-2 border-purple-800 shadow-md"
                >
                  Saltar Derecha ➡️
                </button>
              </div>

              <button
                onClick={finishJumperGame}
                className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold border border-slate-700"
              >
                Terminar y cobrar monedas ({jumperCoinsCollected * 5 + Math.floor(jumperScore / 5)} 🪙)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
