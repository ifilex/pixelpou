import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { PetStats } from '../types';
import { soundFx } from '../audio/retroAudio';

interface PixelPetRendererProps {
  pet: PetStats;
  isEating?: boolean;
  isSoaping?: boolean;
  isShowering?: boolean;
  onPetPet?: () => void;
  size?: number;
}

export const PixelPetRenderer: React.FC<PixelPetRendererProps> = ({
  pet,
  isEating = false,
  isSoaping = false,
  isShowering = false,
  onPetPet,
  size = 240,
}) => {
  const [isBlinking, setIsBlinking] = useState(false);
  const [isPetting, setIsPetting] = useState(false);
  const [heartPuffs, setHeartPuffs] = useState<{ id: number; x: number; y: number }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Periodic blinking
  useEffect(() => {
    if (pet.isSleeping) return;
    const interval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 200);
    }, 3800);
    return () => clearInterval(interval);
  }, [pet.isSleeping]);

  const handleInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    if (pet.isSleeping) return;

    soundFx.playPetJoy();
    setIsPetting(true);
    setTimeout(() => setIsPetting(false), 350);

    // Spawn floating heart
    const newHeart = {
      id: Date.now() + Math.random(),
      x: (Math.random() - 0.5) * 60,
      y: -20 - Math.random() * 30,
    };
    setHeartPuffs((prev) => [...prev.slice(-4), newHeart]);

    if (onPetPet) {
      onPetPet();
    }
  };

  const isSad = pet.hunger < 25 || pet.hygiene < 25 || pet.energy < 20;

  return (
    <div
      ref={containerRef}
      id="pixel-pet-container"
      onClick={handleInteraction}
      className="relative flex items-center justify-center cursor-pointer select-none"
      style={{ width: size, height: size }}
      title="¡Toca o acaricia a tu mascota!"
    >
      {/* Floating Hearts Animation */}
      {heartPuffs.map((h) => (
        <motion.div
          key={h.id}
          initial={{ opacity: 1, y: 0, scale: 0.6 }}
          animate={{ opacity: 0, y: -60, scale: 1.2 }}
          transition={{ duration: 0.9, ease: 'easeOut' }}
          className="absolute z-40 text-2xl pointer-events-none"
          style={{ transform: `translate(${h.x}px, ${h.y}px)` }}
          onAnimationComplete={() => {
            setHeartPuffs((prev) => prev.filter((item) => item.id !== h.id));
          }}
        >
          💖
        </motion.div>
      ))}

      {/* Sleep Zzz floats */}
      {pet.isSleeping && (
        <div className="absolute -top-6 right-6 flex flex-col items-center pointer-events-none z-30">
          <motion.span
            animate={{ opacity: [0, 1, 0], y: [-5, -35], x: [0, 15], scale: [0.8, 1.3] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
            className="font-pixel text-blue-500 font-bold text-lg"
          >
            Z
          </motion.span>
          <motion.span
            animate={{ opacity: [0, 1, 0], y: [0, -30], x: [-5, 10], scale: [0.7, 1.1] }}
            transition={{ repeat: Infinity, duration: 2.2, delay: 0.7, ease: 'easeInOut' }}
            className="font-pixel text-indigo-400 font-bold text-sm"
          >
            z
          </motion.span>
        </div>
      )}

      {/* Pet SVG Pixel Body */}
      <motion.div
        animate={
          pet.isSleeping
            ? { scaleY: [0.97, 1.02, 0.97], scaleX: [1.02, 0.98, 1.02] }
            : isEating
            ? { scaleY: [1, 1.06, 0.96, 1], scaleX: [1, 0.95, 1.04, 1] }
            : isPetting
            ? { scale: [1, 1.12, 1], rotate: [-4, 4, 0] }
            : { y: [0, -4, 0] }
        }
        transition={
          pet.isSleeping
            ? { repeat: Infinity, duration: 3.5, ease: 'easeInOut' }
            : isEating
            ? { repeat: Infinity, duration: 0.35 }
            : isPetting
            ? { duration: 0.3 }
            : { repeat: Infinity, duration: 2.6, ease: 'easeInOut' }
        }
        className="relative w-full h-full flex items-center justify-center"
      >
        <svg
          viewBox="0 0 120 120"
          className="w-full h-full drop-shadow-xl"
          style={{ imageRendering: 'pixelated' }}
        >
          <defs>
            <filter id="pixel-shadow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="4" stdDeviation="0" floodColor="#000000" floodOpacity="0.25" />
            </filter>
          </defs>

          {/* Body Drop Shadow */}
          <ellipse cx="60" cy="110" rx="38" ry="7" fill="#000000" opacity="0.18" />

          {/* Pou Iconic Shape (Step-pixel outline and main body) */}
          <g filter="url(#pixel-shadow)">
            {/* Outer Pixel Border */}
            <path
              d="
                M 48 20 H 72
                V 24 H 80
                V 28 H 86
                V 34 H 92
                V 42 H 96
                V 52 H 100
                V 72 H 102
                V 92 H 100
                V 100 H 94
                V 104 H 84
                V 108 H 36
                V 104 H 26
                V 100 H 20
                V 92 H 18
                V 72 H 20
                V 52 H 24
                V 42 H 28
                V 34 H 34
                V 28 H 40
                V 24 H 48
                Z
              "
              fill="#221811"
            />

            {/* Inner Body Fill (Uses Custom Skin Color) */}
            <path
              d="
                M 50 24 H 70
                V 28 H 78
                V 32 H 84
                V 38 H 88
                V 46 H 92
                V 56 H 96
                V 72 H 98
                V 90 H 96
                V 96 H 90
                V 100 H 80
                V 104 H 40
                V 100 H 30
                V 96 H 24
                V 90 H 22
                V 72 H 24
                V 56 H 28
                V 46 H 32
                V 38 H 36
                V 32 H 42
                V 28 H 50
                Z
              "
              fill={pet.skinColor}
            />

            {/* Pixel Highlight (Top-left light reflection) */}
            <path
              d="
                M 52 26 H 64 V 30 H 52 Z
                M 42 32 H 48 V 38 H 42 Z
                M 34 40 H 38 V 48 H 34 Z
              "
              fill="#FFFFFF"
              opacity="0.25"
            />

            {/* Bottom Inner Shadow */}
            <path
              d="
                M 36 96 H 84 V 100 H 36 Z
                M 30 92 H 90 V 96 H 30 Z
              "
              fill="#000000"
              opacity="0.15"
            />
          </g>

          {/* Clothes Layer */}
          {pet.equippedClothes === 'striped' && (
            <g id="pet-clothes-striped">
              {/* Blue and white stripes */}
              <path d="M 26 72 H 94 V 78 H 26 Z" fill="#2563EB" />
              <path d="M 24 78 H 96 V 84 H 24 Z" fill="#FFFFFF" />
              <path d="M 24 84 H 96 V 90 H 24 Z" fill="#2563EB" />
              <path d="M 28 90 H 92 V 96 H 28 Z" fill="#FFFFFF" />
              <path d="M 34 96 H 86 V 100 H 34 Z" fill="#2563EB" />
            </g>
          )}

          {pet.equippedClothes === 'tuxedo' && (
            <g id="pet-clothes-tuxedo">
              {/* White shirt triangle */}
              <polygon points="46,68 74,68 60,94" fill="#FFFFFF" />
              {/* Black coat edges */}
              <path d="M 26 72 H 46 V 98 H 28 Z" fill="#1E293B" />
              <path d="M 74 72 H 94 V 98 H 92 Z" fill="#1E293B" />
              {/* Red bow tie */}
              <polygon points="52,70 60,74 52,78" fill="#EF4444" />
              <polygon points="68,70 60,74 68,78" fill="#EF4444" />
              <rect x="58" y="72" width="4" height="4" fill="#991B1B" />
            </g>
          )}

          {pet.equippedClothes === 'hero' && (
            <g id="pet-clothes-hero">
              {/* Red Superhero Cape in front & chest badge */}
              <path d="M 36 68 H 84 V 74 H 36 Z" fill="#DC2626" />
              <polygon points="60,74 70,82 60,92 50,82" fill="#F59E0B" />
              <text x="56" y="86" fontSize="10" fontWeight="bold" fill="#B45309" fontFamily="monospace">
                ★
              </text>
            </g>
          )}

          {/* Cheeks / Blush */}
          <rect x="28" y="66" width="10" height="6" fill="#F43F5E" opacity="0.35" rx="2" />
          <rect x="82" y="66" width="10" height="6" fill="#F43F5E" opacity="0.35" rx="2" />

          {/* EYES LAYER */}
          {pet.isSleeping ? (
            // Sleeping eyes: cute curved slits
            <g id="sleeping-eyes">
              <path d="M 38 56 Q 48 62 58 56" stroke="#221811" strokeWidth="4" strokeLinecap="square" fill="none" />
              <path d="M 62 56 Q 72 62 82 56" stroke="#221811" strokeWidth="4" strokeLinecap="square" fill="none" />
            </g>
          ) : isBlinking ? (
            // Blinking closed eye lines
            <g id="blinking-eyes">
              <rect x="36" y="52" width="20" height="4" fill="#221811" />
              <rect x="64" y="52" width="20" height="4" fill="#221811" />
            </g>
          ) : (
            // Classic Big Pou Eyes
            <g id="open-eyes">
              {/* Left Eye Sclera */}
              <rect x="36" y="40" width="20" height="22" fill="#FFFFFF" stroke="#221811" strokeWidth="3" />
              {/* Left Pupil */}
              <rect x="42" y="45" width="10" height="12" fill={pet.eyeColor} />
              {/* Left Eye Glint (Pixel shine) */}
              <rect x="44" y="46" width="4" height="4" fill="#FFFFFF" />
              <rect x="48" y="52" width="2" height="2" fill="#FFFFFF" />

              {/* Right Eye Sclera */}
              <rect x="64" y="40" width="20" height="22" fill="#FFFFFF" stroke="#221811" strokeWidth="3" />
              {/* Right Pupil */}
              <rect x="68" y="45" width="10" height="12" fill={pet.eyeColor} />
              {/* Right Eye Glint */}
              <rect x="70" y="46" width="4" height="4" fill="#FFFFFF" />
              <rect x="74" y="52" width="2" height="2" fill="#FFFFFF" />
            </g>
          )}

          {/* MOUTH LAYER */}
          {isEating ? (
            // Open eating mouth chomping
            <g id="eating-mouth">
              <rect x="52" y="70" width="16" height="12" fill="#7F1D1D" stroke="#221811" strokeWidth="2" />
              <rect x="54" y="71" width="12" height="3" fill="#FFFFFF" /> {/* Top teeth */}
              <rect x="56" y="77" width="8" height="4" fill="#EF4444" /> {/* Tongue */}
            </g>
          ) : isSad ? (
            // Sad droop mouth
            <path
              d="M 50 75 Q 60 69 70 75"
              stroke="#221811"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
          ) : isPetting ? (
            // Super happy open smile
            <g id="happy-mouth">
              <path
                d="M 48 68 Q 60 84 72 68 Z"
                fill="#DC2626"
                stroke="#221811"
                strokeWidth="3"
              />
              <rect x="54" y="75" width="12" height="4" fill="#F87171" rx="2" />
            </g>
          ) : (
            // Classic gentle smile
            <path
              d="M 50 70 Q 60 77 70 70"
              stroke="#221811"
              strokeWidth="4"
              strokeLinecap="round"
              fill="none"
            />
          )}

          {/* GLASSES ACCESSORY */}
          {pet.equippedGlasses === 'shades' && (
            <g id="acc-glasses-shades">
              <rect x="30" y="44" width="28" height="16" fill="#111827" stroke="#000" strokeWidth="2" />
              <rect x="62" y="44" width="28" height="16" fill="#111827" stroke="#000" strokeWidth="2" />
              <rect x="56" y="48" width="8" height="4" fill="#111827" />
              {/* White glare pixel line */}
              <line x1="34" y1="46" x2="42" y2="46" stroke="#FFF" strokeWidth="2" />
              <line x1="66" y1="46" x2="74" y2="46" stroke="#FFF" strokeWidth="2" />
            </g>
          )}

          {pet.equippedGlasses === 'nerd' && (
            <g id="acc-glasses-nerd">
              <circle cx="46" cy="50" r="13" fill="none" stroke="#78350F" strokeWidth="3" />
              <circle cx="74" cy="50" r="13" fill="none" stroke="#78350F" strokeWidth="3" />
              <line x1="59" y1="50" x2="61" y2="50" stroke="#78350F" strokeWidth="3" />
            </g>
          )}

          {pet.equippedGlasses === 'stars' && (
            <g id="acc-glasses-stars">
              <polygon points="46,38 49,46 58,47 51,52 54,60 46,55 38,60 41,52 34,47 43,46" fill="#FBBF24" stroke="#B45309" strokeWidth="1.5" />
              <polygon points="74,38 77,46 86,47 79,52 82,60 74,55 66,60 69,52 62,47 71,46" fill="#FBBF24" stroke="#B45309" strokeWidth="1.5" />
              <line x1="55" y1="49" x2="65" y2="49" stroke="#B45309" strokeWidth="3" />
            </g>
          )}

          {/* HATS ACCESSORY */}
          {pet.equippedHat === 'cap' && (
            <g id="acc-hat-cap">
              <path d="M 40 22 Q 60 6 80 22 Z" fill="#EF4444" stroke="#221811" strokeWidth="2" />
              <rect x="36" y="20" width="50" height="6" fill="#DC2626" rx="2" />
              <ellipse cx="80" cy="22" rx="14" ry="4" fill="#B91C1C" />
            </g>
          )}

          {pet.equippedHat === 'crown' && (
            <g id="acc-hat-crown">
              <polygon points="42,24 42,10 52,18 60,8 68,18 78,10 78,24" fill="#F59E0B" stroke="#92400E" strokeWidth="2" />
              <circle cx="52" cy="18" r="2" fill="#EF4444" />
              <circle cx="60" cy="14" r="2.5" fill="#3B82F6" />
              <circle cx="68" cy="18" r="2" fill="#10B981" />
            </g>
          )}

          {pet.equippedHat === 'chef' && (
            <g id="acc-hat-chef">
              <ellipse cx="60" cy="12" rx="20" ry="12" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
              <ellipse cx="48" cy="16" rx="12" ry="10" fill="#FFFFFF" />
              <ellipse cx="72" cy="16" rx="12" ry="10" fill="#FFFFFF" />
              <rect x="46" y="20" width="28" height="6" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />
            </g>
          )}

          {pet.equippedHat === 'cat_ears' && (
            <g id="acc-hat-cat-ears">
              <polygon points="38,24 32,8 48,16" fill="#F472B6" stroke="#221811" strokeWidth="2" />
              <polygon points="36,20 34,12 44,16" fill="#FDF2F8" />
              <polygon points="82,24 88,8 72,16" fill="#F472B6" stroke="#221811" strokeWidth="2" />
              <polygon points="84,20 86,12 76,16" fill="#FDF2F8" />
            </g>
          )}

          {pet.equippedHat === 'propeller' && (
            <g id="acc-hat-propeller">
              <ellipse cx="60" cy="22" rx="20" ry="7" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2" />
              <rect x="58" y="14" width="4" height="8" fill="#F59E0B" />
              <ellipse cx="48" cy="14" rx="10" ry="2" fill="#EF4444" />
              <ellipse cx="72" cy="14" rx="10" ry="2" fill="#10B981" />
              <circle cx="60" cy="14" r="2.5" fill="#F59E0B" />
            </g>
          )}

          {/* DIRT SPOTS (If pet needs bath) */}
          {pet.dirtSpots > 0 && (
            <g id="dirt-spots">
              <circle cx="34" cy="46" r="4" fill="#78350F" opacity="0.7" />
              <circle cx="38" cy="49" r="2.5" fill="#78350F" opacity="0.7" />
              {pet.dirtSpots > 1 && (
                <>
                  <circle cx="86" cy="74" r="4.5" fill="#78350F" opacity="0.75" />
                  <circle cx="82" cy="79" r="3" fill="#78350F" opacity="0.7" />
                </>
              )}
              {pet.dirtSpots > 2 && (
                <>
                  <circle cx="60" cy="94" r="5" fill="#78350F" opacity="0.7" />
                  <circle cx="48" cy="88" r="3.5" fill="#78350F" opacity="0.7" />
                </>
              )}
              {pet.dirtSpots > 3 && (
                // Cute little flies buzzing
                <g id="buzzing-fly">
                  <circle cx="20" cy="30" r="2" fill="#000" />
                  <ellipse cx="18" cy="28" rx="2" ry="1" fill="#BAE6FD" opacity="0.8" />
                  <circle cx="98" cy="36" r="2" fill="#000" />
                  <ellipse cx="100" cy="34" rx="2" ry="1" fill="#BAE6FD" opacity="0.8" />
                </g>
              )}
            </g>
          )}

          {/* SOAP BUBBLES OVERLAY (During bath) */}
          {isSoaping && (
            <g id="soap-foam">
              <circle cx="45" cy="35" r="9" fill="#FFFFFF" opacity="0.85" stroke="#93C5FD" strokeWidth="1.5" />
              <circle cx="58" cy="30" r="11" fill="#FFFFFF" opacity="0.9" stroke="#93C5FD" strokeWidth="1.5" />
              <circle cx="74" cy="36" r="9" fill="#FFFFFF" opacity="0.85" stroke="#93C5FD" strokeWidth="1.5" />
              <circle cx="38" cy="75" r="8" fill="#FFFFFF" opacity="0.85" stroke="#93C5FD" strokeWidth="1.5" />
              <circle cx="82" cy="72" r="8" fill="#FFFFFF" opacity="0.85" stroke="#93C5FD" strokeWidth="1.5" />
              <circle cx="60" cy="85" r="10" fill="#FFFFFF" opacity="0.85" stroke="#93C5FD" strokeWidth="1.5" />
            </g>
          )}

          {/* SHOWER WATER DROPS OVERLAY */}
          {isShowering && (
            <g id="shower-water">
              <line x1="45" y1="10" x2="40" y2="40" stroke="#38BDF8" strokeWidth="3" strokeDasharray="4 4" />
              <line x1="60" y1="5" x2="60" y2="50" stroke="#38BDF8" strokeWidth="3" strokeDasharray="4 4" />
              <line x1="75" y1="10" x2="80" y2="40" stroke="#38BDF8" strokeWidth="3" strokeDasharray="4 4" />
            </g>
          )}
        </svg>
      </motion.div>
    </div>
  );
};
