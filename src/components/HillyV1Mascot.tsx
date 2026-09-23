import React from 'react';
import { motion } from 'motion/react';

export interface HillyV1MascotProps {
  pose?: 'waving' | 'pointing' | 'reading_map' | 'drinking_tea' | 'standing' | 'thinking' | 'celebrating' | string;
  view?: 'front' | 'back';
  customImageUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  className?: string;
  showNameTag?: boolean;
  nameTagLabel?: string;
  showSpeechBubble?: boolean;
  speechText?: string;
  isAnimated?: boolean;
  onClick?: () => void;
}

export const HillyV1Mascot: React.FC<HillyV1MascotProps> = ({
  pose = 'waving',
  view = 'front',
  customImageUrl,
  size = 'md',
  className = '',
  showNameTag = false,
  nameTagLabel = 'Hilly • Himalayan Guide',
  showSpeechBubble = false,
  speechText = '',
  isAnimated = true,
  onClick
}) => {
  const [imgError, setImgError] = React.useState(false);

  // Check for uploaded mascot assets in localStorage if available
  const [localMascotAssets, setLocalMascotAssets] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem('hillytrip_mascot_custom_assets');
      if (saved) {
        setLocalMascotAssets(JSON.parse(saved));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Determine key for local assets lookup (e.g., 'back', 'front', 'waving', 'thinking')
  const assetKey = view === 'back' ? 'back' : pose;
  const localSavedUrl = localMascotAssets[assetKey] || localMascotAssets[`hilly-${assetKey}`];

  // Derive asset path prioritizing customImageUrl -> saved local upload -> /mascots/ folder file
  const derivedAssetPath = customImageUrl || localSavedUrl || (
    view === 'back'
      ? '/mascots/hilly-back.png'
      : `/mascots/hilly-${pose}.png`
  );
  // Size mapping
  const sizeClasses = {
    xs: 'w-12 h-14',
    sm: 'w-20 h-24',
    md: 'w-32 h-36 sm:w-40 sm:h-44',
    lg: 'w-48 h-56 sm:w-56 sm:h-64',
    xl: 'w-64 h-72 sm:w-72 sm:h-80',
    '2xl': 'w-80 h-96 sm:w-96 sm:h-[420px]',
    full: 'w-full h-full'
  };

  return (
    <div 
      className={`relative inline-flex flex-col items-center justify-center select-none ${sizeClasses[size] || sizeClasses.md} ${className}`}
      onClick={onClick}
    >
      {/* Speech Bubble Option */}
      {showSpeechBubble && speechText && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 5 }}
          className="absolute -top-12 z-30 bg-slate-900/95 border border-amber-400/50 text-white text-xs font-bold px-3 py-1.5 rounded-2xl shadow-xl backdrop-blur-md whitespace-nowrap flex items-center gap-1.5"
        >
          <span>{speechText}</span>
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 border-r border-b border-amber-400/50 rotate-45" />
        </motion.div>
      )}

      {/* Main Mascot Outer Floating Container */}
      <motion.div
        animate={
          isAnimated
            ? {
                y: [0, -5, 0],
                rotate: [0, 0.8, -0.8, 0]
              }
            : {}
        }
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: 'easeInOut'
        }}
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* Soft Golden Himalayan Ambient Backlight Glow */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-t from-amber-500/20 via-emerald-500/20 to-sky-400/20 blur-xl opacity-80 pointer-events-none" />

        {/* Render Custom Mascot Asset Image if provided or found, else fallback to SVG Vector */}
        {!imgError && derivedAssetPath ? (
          <img
            src={derivedAssetPath}
            alt={`Hilly Mascot ${pose} ${view}`}
            onError={() => setImgError(true)}
            className="w-full h-full object-contain relative z-10 drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]"
            referrerPolicy="no-referrer"
          />
        ) : (
          <svg
            className="w-full h-full relative z-10 drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)]"
            viewBox="0 0 200 220"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
          <defs>
            {/* Liquid River Scarf Water Gradient */}
            <linearGradient id="hillyRiverGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="40%" stopColor="#06B6D4" />
              <stop offset="80%" stopColor="#0284C7" />
              <stop offset="100%" stopColor="#0369A1" />
            </linearGradient>

            {/* Snow Summit Gradient */}
            <linearGradient id="hillySnowPeak" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="70%" stopColor="#F1F5F9" />
              <stop offset="100%" stopColor="#E2E8F0" />
            </linearGradient>

            {/* Weathered Stone Body & Head Base */}
            <linearGradient id="hillyStoneBase" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#64748B" />
              <stop offset="50%" stopColor="#475569" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>

            {/* Dark Stone Layer Shader */}
            <linearGradient id="hillyDarkStone" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>

            {/* Emerald Green Eyes Gradient */}
            <radialGradient id="hillyGreenEye" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#34D399" />
              <stop offset="50%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#047857" />
            </radialGradient>

            {/* Moss Green Gradient */}
            <linearGradient id="hillyMoss" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4ADE80" />
              <stop offset="100%" stopColor="#16A34A" />
            </linearGradient>

            {/* Pine Tree Foliage */}
            <linearGradient id="hillyPine" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#15803D" />
              <stop offset="100%" stopColor="#064E3B" />
            </linearGradient>

            {/* Soft Shadow Filter */}
            <filter id="hillyGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Ground Base / Soft Mist Platform */}
          <ellipse cx="100" cy="205" rx="65" ry="10" fill="#0284C7" opacity="0.15" filter="url(#hillyGlow)" />
          
          {/* Stone Feet */}
          <g>
            {/* Left Foot */}
            <path d="M70 190 C62 190, 56 195, 56 202 C56 206, 62 208, 76 208 C86 208, 88 202, 88 196 C88 192, 80 190, 70 190 Z" fill="url(#hillyDarkStone)" />
            <ellipse cx="64" cy="204" rx="3" ry="2" fill="#64748B" />
            <ellipse cx="72" cy="205" rx="3" ry="2" fill="#64748B" />
            <ellipse cx="80" cy="204" rx="3" ry="2" fill="#64748B" />

            {/* Right Foot */}
            <path d="M130 190 C120 190, 112 192, 112 196 C112 202, 114 208, 124 208 C138 208, 144 206, 144 202 C144 195, 138 190, 130 190 Z" fill="url(#hillyDarkStone)" />
            <ellipse cx="120" cy="204" rx="3" ry="2" fill="#64748B" />
            <ellipse cx="128" cy="205" rx="3" ry="2" fill="#64748B" />
            <ellipse cx="136" cy="204" rx="3" ry="2" fill="#64748B" />
          </g>

          {/* Stone Torso Body (Weathered Rock Strata) */}
          <path
            d="M60 135 C55 150, 50 170, 54 192 C75 198, 125 198, 146 192 C150 170, 145 150, 140 135 Z"
            fill="url(#hillyStoneBase)"
          />

          {/* Natural Rock Layers / Strata Lines on Body */}
          <path d="M62 152 C82 156, 118 156, 138 152" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
          <path d="M58 170 C78 175, 122 175, 142 170" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" opacity="0.7" />

          {/* Moss Patches on Body */}
          <path d="M56 160 C58 155, 66 154, 68 162 C70 168, 62 172, 56 168 Z" fill="url(#hillyMoss)" />
          <path d="M134 175 C136 170, 144 168, 145 176 C146 182, 138 184, 134 180 Z" fill="url(#hillyMoss)" />
          <path d="M92 184 C96 180, 108 180, 112 185 C110 190, 98 191, 92 187 Z" fill="url(#hillyMoss)" opacity="0.8" />

          {/* ---------------------------------------------------------------- */}
          {/* HEAD: ONE ICONIC SNOW-CAPPED HIMALAYAN MOUNTAIN PEAK */}
          {/* ---------------------------------------------------------------- */}
          <g>
            {/* Outer Stone Head Base Silhouette (Single Mountain Peak) */}
            <path
              d="M100 15 L158 100 C165 110, 160 138, 145 142 C120 148, 80 148, 55 142 C40 138, 35 110, 42 100 Z"
              fill="url(#hillyStoneBase)"
            />

            {/* Snow Cap on Top Summit */}
            <path
              d="M100 15 L128 62 C120 58, 112 64, 104 59 C98 56, 92 63, 84 58 C78 62, 72 58, 72 62 Z"
              fill="url(#hillySnowPeak)"
            />
            {/* Crisp Snow Highlight Accent */}
            <path
              d="M100 15 L115 45 C110 42, 105 46, 100 43 C95 41, 90 45, 85 41 Z"
              fill="#FFFFFF"
            />

            {/* Weathered Mountain Ridge Lines */}
            <path d="M100 18 L100 95" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" opacity="0.4" />
            <path d="M100 58 L72 90" stroke="#475569" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
            <path d="M100 58 L128 90" stroke="#475569" strokeWidth="2" strokeLinecap="round" opacity="0.5" />

            {/* Moss & Tiny Dwarf Evergreen Trees on Mountain Head/Shoulders */}
            <path d="M46 95 C50 90, 60 92, 58 102 Z" fill="url(#hillyMoss)" />
            <path d="M142 95 C146 90, 154 92, 152 102 Z" fill="url(#hillyMoss)" />

            {/* Tiny Evergreen Trees on Head Ridge */}
            <polygon points="52,88 47,98 57,98" fill="url(#hillyPine)" />
            <polygon points="148,88 143,98 153,98" fill="url(#hillyPine)" />
            <polygon points="62,75 58,84 66,84" fill="url(#hillyPine)" />
            <polygon points="138,75 134,84 142,84" fill="url(#hillyPine)" />

            {/* -------------------------------------------------------------- */}
            {/* FACE: GREEN EYES, STONE NOSE, STONE EYEBROWS, TRUSTWORTHY SMILE */}
            {/* -------------------------------------------------------------- */}
            
            {/* Stone Ridge Eyebrows */}
            <path d="M68 88 C76 83, 86 85, 92 88" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M108 88 C114 85, 124 83, 132 88" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" />

            {/* Warm Friendly Emerald Green Eyes */}
            <g>
              {/* Left Eye */}
              <ellipse cx="80" cy="102" rx="10" ry="11" fill="#0F172A" />
              <ellipse cx="80" cy="102" rx="8" ry="9" fill="url(#hillyGreenEye)" />
              <circle cx="80" cy="102" r="4.5" fill="#064E3B" />
              {/* Sparkle Reflection Highlights */}
              <circle cx="83" cy="98" r="3" fill="#FFFFFF" />
              <circle cx="77" cy="105" r="1.5" fill="#FFFFFF" />

              {/* Right Eye */}
              <ellipse cx="120" cy="102" rx="10" ry="11" fill="#0F172A" />
              <ellipse cx="120" cy="102" rx="8" ry="9" fill="url(#hillyGreenEye)" />
              <circle cx="120" cy="102" r="4.5" fill="#064E3B" />
              {/* Sparkle Reflection Highlights */}
              <circle cx="123" cy="98" r="3" fill="#FFFFFF" />
              <circle cx="117" cy="105" r="1.5" fill="#FFFFFF" />
            </g>

            {/* Small Rounded Stone Nose */}
            <path d="M96 110 C96 106, 104 106, 104 110 C104 113, 96 113, 96 110 Z" fill="#475569" stroke="#334155" strokeWidth="1" />

            {/* Soft Trustworthy Smile */}
            <path
              d="M86 122 Q100 133 114 122"
              stroke="#1E293B"
              strokeWidth="3.5"
              strokeLinecap="round"
              fill="none"
            />
            {/* Smile Dimple Corners */}
            <path d="M84 120 C84 122, 85 124, 87 123" stroke="#334155" strokeWidth="2" strokeLinecap="round" />
            <path d="M116 123 C115 124, 116 122, 116 120" stroke="#334155" strokeWidth="2" strokeLinecap="round" />

            {/* Rosy Mountain Cheek Glow */}
            <ellipse cx="70" cy="116" rx="6" ry="3" fill="#F43F5E" opacity="0.25" />
            <ellipse cx="130" cy="116" rx="6" ry="3" fill="#F43F5E" opacity="0.25" />
          </g>

          {/* ---------------------------------------------------------------- */}
          {/* SIGNATURE FEATURE: CRYSTAL-CLEAR FLOWING HIMALAYAN RIVER SCARF   */}
          {/* ---------------------------------------------------------------- */}
          <g>
            {/* Main Liquid Water Ribbon Scarf Wrapped Around Neck & Torso */}
            <path
              d="M48 132 C65 126, 135 126, 152 132 C162 136, 158 152, 145 152 C125 152, 75 152, 55 152 C42 152, 38 136, 48 132 Z"
              fill="url(#hillyRiverGradient)"
            />
            {/* Flowing Water Tail cascading down chest */}
            <path
              d="M108 142 C122 148, 128 168, 122 188 C118 196, 108 196, 110 185 C114 170, 108 154, 98 144 Z"
              fill="url(#hillyRiverGradient)"
            />

            {/* Liquid Water Ripples & White Water Foam Highlights */}
            <path d="M54 136 C75 132, 125 132, 146 136" stroke="#E0F2FE" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
            <path d="M60 144 C80 142, 120 142, 140 144" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
            <path d="M114 154 C120 166, 118 180, 115 190" stroke="#E0F2FE" strokeWidth="2" strokeLinecap="round" opacity="0.85" />

            {/* Water Sparkles */}
            <circle cx="68" cy="138" r="1.5" fill="#FFFFFF" />
            <circle cx="132" cy="140" r="1.5" fill="#FFFFFF" />
            <circle cx="118" cy="172" r="1.5" fill="#FFFFFF" />
          </g>

          {/* ---------------------------------------------------------------- */}
          {/* ARMS & HANDS (BASED ON POSE)                                     */}
          {/* ---------------------------------------------------------------- */}
          {pose === 'waving' && (
            <g>
              {/* Left Arm Resting on Hip */}
              <path d="M52 145 C42 152, 42 165, 52 172" stroke="url(#hillyStoneBase)" strokeWidth="12" strokeLinecap="round" />
              
              {/* Right Arm Waving Warmly */}
              <motion.g
                animate={isAnimated ? { rotate: [0, 12, -8, 12, -8, 0] } : {}}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: '148px 145px' }}
              >
                <path d="M148 145 L172 120 C176 116, 182 122, 178 128 L158 155" fill="url(#hillyStoneBase)" stroke="url(#hillyStoneBase)" strokeWidth="10" strokeLinecap="round" />
                {/* Waving Stone Hand */}
                <circle cx="176" cy="118" r="8" fill="url(#hillyStoneBase)" />
                <circle cx="172" cy="112" r="2.5" fill="#64748B" />
                <circle cx="178" cy="110" r="2.5" fill="#64748B" />
                <circle cx="183" cy="114" r="2.5" fill="#64748B" />
              </motion.g>
            </g>
          )}

          {pose === 'pointing' && (
            <g>
              {/* Left Arm Resting */}
              <path d="M52 145 C42 152, 42 165, 52 172" stroke="url(#hillyStoneBase)" strokeWidth="12" strokeLinecap="round" />
              
              {/* Right Arm Pointing Ahead */}
              <path d="M148 145 L182 140" stroke="url(#hillyStoneBase)" strokeWidth="12" strokeLinecap="round" />
              <circle cx="186" cy="140" r="6" fill="url(#hillyStoneBase)" />
              <path d="M186 140 L195 140" stroke="url(#hillyStoneBase)" strokeWidth="4" strokeLinecap="round" />
            </g>
          )}

          {pose === 'reading_map' && (
            <g>
              {/* Both Arms Holding Map */}
              <path d="M52 145 L75 160" stroke="url(#hillyStoneBase)" strokeWidth="10" strokeLinecap="round" />
              <path d="M148 145 L125 160" stroke="url(#hillyStoneBase)" strokeWidth="10" strokeLinecap="round" />
              {/* Map Scroll */}
              <rect x="70" y="152" width="60" height="36" rx="4" fill="#FEF3C7" stroke="#D97706" strokeWidth="2" transform="rotate(-4 100 170)" />
              <path d="M78 160 L118 160 M78 168 L110 168 M78 176 L114 176" stroke="#92400E" strokeWidth="1.5" strokeDasharray="3 2" transform="rotate(-4 100 170)" />
            </g>
          )}

          {pose === 'drinking_tea' && (
            <g>
              {/* Left Arm Resting */}
              <path d="M52 145 C42 152, 42 165, 52 172" stroke="url(#hillyStoneBase)" strokeWidth="12" strokeLinecap="round" />
              {/* Right Arm Holding Himalayan Tea Cup */}
              <path d="M148 145 L130 140" stroke="url(#hillyStoneBase)" strokeWidth="10" strokeLinecap="round" />
              {/* Tea Cup */}
              <rect x="118" y="132" width="16" height="18" rx="3" fill="#DC2626" stroke="#FFFFFF" strokeWidth="1.5" />
              {/* Steam */}
              <path d="M122 128 Q124 122 122 118" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
              <path d="M128 128 Q130 122 128 118" stroke="#FFFFFF" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
            </g>
          )}

          {(pose === 'standing' || pose === 'thinking' || pose === 'celebrating') && (
            <g>
              <path d="M52 145 C40 155, 42 170, 50 180" stroke="url(#hillyStoneBase)" strokeWidth="11" strokeLinecap="round" />
              <path d="M148 145 C160 155, 158 170, 150 180" stroke="url(#hillyStoneBase)" strokeWidth="11" strokeLinecap="round" />
            </g>
          )}
        </svg>
        )}
      </motion.div>

      {/* Name Tag Option */}
      {showNameTag && (
        <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/90 border border-amber-400/30 text-amber-300 text-xs font-black tracking-wide shadow-lg backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>{nameTagLabel}</span>
        </div>
      )}
    </div>
  );
};

export default HillyV1Mascot;
