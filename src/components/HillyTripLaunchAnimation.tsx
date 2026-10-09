import React, { useEffect, useState, useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';

export interface HillyTripLaunchAnimationProps {
  /**
   * Callback fired when the 3.0 second animation completes.
   */
  onComplete?: () => void;
  /**
   * Optional custom className for the root container.
   */
  className?: string;
}

export const HillyTripLaunchAnimation: React.FC<HillyTripLaunchAnimationProps> = ({
  onComplete,
  className = '',
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [animationFinished, setAnimationFinished] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    // Exact total timeline duration: 3.0 seconds
    const timer = setTimeout(() => {
      setAnimationFinished(true);
      if (onCompleteRef.current) {
        onCompleteRef.current();
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Reduced motion support: instant layout render without timing delays
  if (shouldReduceMotion) {
    return (
      <div className={`fixed inset-0 z-[10000] flex items-center justify-center bg-black text-white ${className}`}>
        <div className="w-full max-w-4xl px-6 flex flex-col items-center">
          <svg viewBox="0 0 1000 420" className="w-full h-auto max-h-[75vh]" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="static-trip-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="100%" stopColor="#0EA5E9" />
              </linearGradient>
              <linearGradient id="static-sky-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F97316" />
                <stop offset="50%" stopColor="#FB923C" />
                <stop offset="100%" stopColor="#0F172A" />
              </linearGradient>
              <clipPath id="static-pin-clip">
                <path d="M 220 40 C 130 40, 60 110, 60 200 C 60 270, 130 350, 220 420 C 310 350, 380 270, 380 200 C 380 110, 310 40, 220 40 Z" />
              </clipPath>
            </defs>

            {/* Emblem Pin */}
            <g>
              <path d="M 220 40 C 130 40, 60 110, 60 200 C 60 270, 130 350, 220 420 C 310 350, 380 270, 380 200 C 380 110, 310 40, 220 40 Z" stroke="#38BDF8" strokeWidth="6" fill="#0B1329" />
              <g clipPath="url(#static-pin-clip)">
                <rect x="50" y="30" width="340" height="400" fill="url(#static-sky-grad)" />
                <circle cx="280" cy="130" r="22" fill="#F59E0B" opacity="0.9" />
                <polygon points="60,340 160,220 230,290 320,170 380,340" fill="#1E293B" opacity="0.9" />
                <polygon points="60,360 180,250 250,310 380,360" fill="#0F172A" />
                <path d="M 220 410 C 220 370, 190 340, 190 300 C 190 260, 220 240, 220 190" stroke="#FFFFFF" strokeWidth="12" strokeLinecap="round" fill="none" />
                <path d="M 180 280 L 230 280" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" />
              </g>
            </g>

            {/* Wordmark */}
            <text x="420" y="235" fill="#FFFFFF" style={{ fontFamily: '"Lora", "Georgia", serif', fontSize: '140px', fontWeight: 500 }}>Hilly</text>
            <text x="705" y="235" fill="url(#static-trip-grad)" style={{ fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', fontSize: '140px', fontWeight: 800 }}>Trip</text>

            {/* Peaks */}
            <path d="M 680 150 L 730 100 L 755 120 L 820 50 L 880 120 L 905 100 L 940 150" stroke="url(#static-trip-grad)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />

            {/* Tagline & Lines */}
            <line x1="420" y1="295" x2="590" y2="295" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
            <circle cx="610" cy="295" r="5" fill="#F59E0B" />
            <line x1="630" y1="295" x2="940" y2="295" stroke="#10B981" strokeWidth="4" strokeLinecap="round" />
            <text x="680" y="340" fill="#E2E8F0" textAnchor="middle" style={{ fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif', fontSize: '24px', fontWeight: 700, letterSpacing: '0.35em' }}>EXPLORE BEYOND MAPS</text>
          </svg>
        </div>
      </div>
    );
  }

  // Animation timelines (in seconds):
  // Phase 1 (0.00s - 0.40s): Pin stroke draws
  // Phase 2 (0.40s - 0.90s): Sky, mountains, trees fade in inside Pin
  // Phase 3 (0.90s - 1.50s): Hero white H-road draws & soft travelling light moves along path
  // Phase 4 (1.50s - 1.80s): Orange sun fades in & birds fly across left-to-right (once)
  // Phase 5 (1.80s - 2.30s): "Hilly" slides from left, "Trip" slides from right
  // Phase 6 (2.30s - 2.65s): Green lines draw, orange dot pops, tagline fades in
  // Phase 7 (2.65s - 3.00s): Subtle breathing scale (100% -> 103% -> 100%) and fade to home

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: animationFinished ? 0 : 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={`fixed inset-0 z-[10000] flex items-center justify-center bg-black text-white select-none overflow-hidden ${className}`}
    >
      {/* PHASE 7: Entire Logo Wrapper performs one elegant breathing effect at 2.65s - 3.00s */}
      <motion.div
        initial={{ scale: 1 }}
        animate={{
          scale: [1, 1, 1.03, 1],
        }}
        transition={{
          duration: 3.0,
          times: [0, 0.88, 0.95, 1], // 2.65s to 3.0s is ~0.88 to 1.0 fraction
          ease: 'easeOut',
        }}
        className="w-full max-w-5xl px-4 sm:px-8 flex flex-col items-center justify-center"
      >
        <svg
          viewBox="0 0 1020 440"
          className="w-full h-auto max-h-[80vh] drop-shadow-2xl"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="launch-trip-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#0EA5E9" />
            </linearGradient>

            <linearGradient id="launch-sky-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F97316" />
              <stop offset="45%" stopColor="#FB923C" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>

            <linearGradient id="launch-pin-stroke-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="50%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#10B981" />
            </linearGradient>

            {/* Pin Contour Clip Path */}
            <clipPath id="launch-pin-clip">
              <path d="M 220 40 C 130 40, 60 110, 60 200 C 60 270, 130 350, 220 420 C 310 350, 380 270, 380 200 C 380 110, 310 40, 220 40 Z" />
            </clipPath>
          </defs>

          {/* ============================================================ */}
          {/* LOCATION PIN EMBLEM (LEFT) */}
          {/* ============================================================ */}

          {/* PHASE 1 (0.00 - 0.40s): Pin Outer Outline draws via SVG pathLength */}
          <motion.path
            d="M 220 40 C 130 40, 60 110, 60 200 C 60 270, 130 350, 220 420 C 310 350, 380 270, 380 200 C 380 110, 310 40, 220 40 Z"
            stroke="url(#launch-pin-stroke-grad)"
            strokeWidth="7"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0, opacity: 1 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 0.4,
              ease: 'easeOut',
              delay: 0,
            }}
          />

          {/* INNER PIN ARTWORK (Clipped to Pin shape) */}
          <g clipPath="url(#launch-pin-clip)">
            {/* PHASE 2 (0.40 - 0.90s): Orange sky, mountains, pine trees fade in naturally */}
            <motion.g
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.5,
                delay: 0.4,
                ease: 'easeInOut',
              }}
            >
              {/* Sky Background */}
              <rect x="50" y="30" width="340" height="400" fill="url(#launch-sky-grad)" />

              {/* Mountains Back Silhouette */}
              <polygon points="50,350 140,210 220,280 320,160 390,350" fill="#1E293B" opacity="0.9" />

              {/* Mountains Front Silhouette */}
              <polygon points="50,380 170,240 250,310 390,380" fill="#0F172A" />

              {/* Pine Tree Silhouettes */}
              <g fill="#064E3B" opacity="0.85">
                <polygon points="70,360 82,325 94,360" />
                <polygon points="86,365 100,320 114,365" />
                <polygon points="326,365 340,320 354,365" />
                <polygon points="346,360 358,325 370,360" />
              </g>
            </motion.g>

            {/* PHASE 4 (1.50 - 1.80s): Orange Sun Fades In */}
            <motion.circle
              cx="290"
              cy="125"
              r="22"
              fill="#F59E0B"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 0.95, scale: 1 }}
              transition={{
                duration: 0.3,
                delay: 1.5,
                ease: 'easeOut',
              }}
            />

            {/* PHASE 4 (1.50 - 1.80s): Birds fly once from left-to-right across the sky */}
            <motion.g
              initial={{ x: -40, opacity: 0 }}
              animate={{
                x: [ -40, 10, 60 ],
                opacity: [ 0, 1, 0 ],
              }}
              transition={{
                duration: 0.5,
                delay: 1.5,
                ease: 'easeInOut',
              }}
              fill="none"
              stroke="#0F172A"
              strokeWidth="2"
              strokeLinecap="round"
            >
              {/* Bird 1 */}
              <path d="M 200 110 Q 205 105 210 110 Q 215 105 220 110" />
              {/* Bird 2 */}
              <path d="M 218 100 Q 222 96 226 100 Q 230 96 234 100" />
              {/* Bird 3 */}
              <path d="M 190 120 Q 194 116 198 120 Q 202 116 206 120" />
            </motion.g>

            {/* PHASE 3 (0.90 - 1.50s): HERO ANIMATION */}
            {/* The white H-shaped road draws itself from bottom to top */}
            <motion.path
              id="h-road-path"
              d="M 220 410 C 220 370, 190 340, 190 300 C 190 260, 220 240, 220 190"
              stroke="#FFFFFF"
              strokeWidth="11"
              strokeLinecap="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 0.6,
                delay: 0.9,
                ease: 'easeInOut',
              }}
            />

            {/* Horizontal bridge connecting the H-road motif */}
            <motion.path
              d="M 180 280 L 230 280"
              stroke="#FFFFFF"
              strokeWidth="9"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                duration: 0.3,
                delay: 1.15,
                ease: 'easeOut',
              }}
            />

            {/* PHASE 3 (0.90 - 1.50s): Travelling Light following the road journey */}
            {/* Moves from bottom (220, 410) to peak (220, 190) along curve and disappears at mountain */}
            <motion.circle
              r="7"
              fill="#FFFFFF"
              filter="drop-shadow(0 0 6px rgba(255, 255, 255, 0.9))"
              initial={{
                cx: 220,
                cy: 410,
                opacity: 0,
              }}
              animate={{
                cx: [220, 200, 190, 205, 220],
                cy: [410, 360, 300, 240, 190],
                opacity: [0, 1, 1, 0.9, 0],
              }}
              transition={{
                duration: 0.6,
                delay: 0.9,
                ease: 'easeInOut',
              }}
            />
          </g>

          {/* ============================================================ */}
          {/* BRAND NAME & WORDMARK (RIGHT) */}
          {/* ============================================================ */}

          {/* PHASE 5 (1.80 - 2.30s): "Hilly" slides slightly from the LEFT while fading in */}
          <motion.g
            initial={{ x: -25, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{
              duration: 0.5,
              delay: 1.8,
              ease: 'easeOut',
            }}
          >
            <text
              x="420"
              y="235"
              fill="#FFFFFF"
              style={{
                fontFamily: '"Lora", "Georgia", "Merriweather", serif',
                fontSize: '142px',
                fontWeight: 500,
                letterSpacing: '-0.02em',
              }}
            >
              Hilly
            </text>
          </motion.g>

          {/* PHASE 5 (1.80 - 2.30s): "Trip" slides slightly from the RIGHT while fading in */}
          <motion.g
            initial={{ x: 25, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{
              duration: 0.5,
              delay: 1.8,
              ease: 'easeOut',
            }}
          >
            <text
              x="705"
              y="235"
              fill="url(#launch-trip-grad)"
              style={{
                fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
                fontSize: '142px',
                fontWeight: 800,
                letterSpacing: '-0.04em',
              }}
            >
              Trip
            </text>

            {/* Vector Mountain Peaks path above "Trip" */}
            <motion.path
              d="M 680 150 L 730 100 L 755 120 L 820 50 L 880 120 L 905 100 L 940 150"
              stroke="url(#launch-trip-grad)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                duration: 0.45,
                delay: 1.85,
                ease: 'easeOut',
              }}
            />
          </motion.g>

          {/* ============================================================ */}
          {/* PHASE 6 (2.30 - 2.65s): ACCENT LINES, DOT, AND TAGLINE */}
          {/* ============================================================ */}

          {/* Left Green Horizontal Line draws from left */}
          <motion.line
            x1="420"
            y1="295"
            x2="590"
            y2="295"
            stroke="#10B981"
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: 0.18,
              delay: 2.3,
              ease: 'easeOut',
            }}
          />

          {/* Orange Dot pops in gently */}
          <motion.circle
            cx="610"
            cy="295"
            r="5"
            fill="#F59E0B"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              duration: 0.12,
              delay: 2.45,
              ease: 'easeOut',
            }}
          />

          {/* Right Green Horizontal Line draws from left */}
          <motion.line
            x1="630"
            y1="295"
            x2="940"
            y2="295"
            stroke="#10B981"
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{
              duration: 0.18,
              delay: 2.48,
              ease: 'easeOut',
            }}
          />

          {/* Tagline "EXPLORE BEYOND MAPS" fades in */}
          <motion.text
            x="680"
            y="342"
            fill="#E2E8F0"
            textAnchor="middle"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.25,
              delay: 2.4,
              ease: 'easeOut',
            }}
            style={{
              fontFamily: '"Plus Jakarta Sans", "Inter", sans-serif',
              fontSize: '24px',
              fontWeight: 700,
              letterSpacing: '0.35em',
            }}
          >
            EXPLORE BEYOND MAPS
          </motion.text>
        </svg>
      </motion.div>
    </motion.div>
  );
};
