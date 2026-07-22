import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, CheckCircle2, MapPin, Clock, Car, Compass, 
  Droplet, Trees, Mountain, Flower2 
} from 'lucide-react';
import { Route } from '../types';
import { getItemSlug, toSlug } from '../utils/slug';

interface PremiumRouteCardProps {
  rt: Route;
  fromName: string;
  toName: string;
  coverImage: string;
  themeData: { name: string; icon: string; desc: string };
  navigate: (path: string) => void;
}

// Deterministic generator for exactly 3 highly evocative, scenic journey highlights
const getRouteHighlights = (rt: Route, themeName: string): string[] => {
  const hash = rt.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const optionsPool = {
    'Offbeat Exploration': [
      ['🌲 Ancient Pine Forests', '🏡 Quiet Monasteries', '🌸 Rhododendron Trails'],
      ['🛖 Hidden Valley Hamlets', '🌅 Mystical Sunrise Views', '🌾 Lush Step Farming'],
      ['🚶 Pristine Walks', '🧗 Scenic Ridge Overlooks', '🏡 Authentic Homestays']
    ],
    'High Mountain Passes': [
      ['🏔️ Majestic Kanchenjunga', '🌬️ Crisp High Ridges', '🧊 Frozen Alpine Lakes'],
      ['🌫️ Ethereal Fog Blankets', '🦬 Yak Grazing Grounds', '🗻 High Altitude Passes'],
      ['🍃 Wilderness Escapes', '🧣 Local Tibetan Culture', '🎒 Epic Hairpin Bends']
    ],
    'Scenic Valleys': [
      ['🛣️ Smooth Winding Highways', '🌄 Panoramic Valley Vistas', '🍃 Tea Garden Slopes'],
      ['🗺️ Historic Silk Route', '🐦 Exotic Bird Watching', '🌾 Rolling Green Meadows'],
      ['🌄 Golden Sunsets', '🏰 Ancient Fort Remains', '☕ Premium Tea Sips']
    ],
    'River Trails': [
      ['💦 Wild Teesta Currents', '🌉 Suspension Bridge Walks', '🏕️ Riverside Camp Spots'],
      ['🌊 Chattering Waterfalls', '🪵 Ancient Wooden Bridges', '🐟 Local River Angling'],
      ['🏞️ Deep Ravine Vistas', '🪨 Giant Boulder Formations', '🍃 Warm Subtropical Breezes']
    ]
  };

  const pool = optionsPool[themeName as keyof typeof optionsPool] || optionsPool['River Trails'];
  const index = hash % pool.length;
  return pool[index];
};

const shortenHighlight = (text: string): string => {
  return text
    .replace(/(Ancient|Quiet|Hidden|Mystical|Lush|Pristine|Scenic|Authentic|Majestic|Crisp|Frozen|Ethereal|Local|Epic|Smooth|Panoramic|Historic|Exotic|Rolling|Golden|Wild|Suspension|Riverside|Chattering|Wooden|Deep|Giant|Warm|Subtropical)\s*/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
};

const getHighlightDetails = (highlight: string) => {
  // Extract emoji if present
  const emojiMatch = highlight.match(/^([\uD800-\uDBFF][\uDC00-\uDFFF]|\p{Emoji_Presentation}|\p{Emoji})\s*/u);
  const emoji = emojiMatch ? emojiMatch[1] : '';
  const textOnly = emojiMatch ? highlight.substring(emojiMatch[0].length) : highlight;
  const cleanText = shortenHighlight(textOnly);

  // Default theme (Green)
  let iconColor = 'text-emerald-400';
  let IconComponent = Trees;

  const lowerText = textOnly.toLowerCase();
  
  if (emoji === '💦' || emoji === '🌊' || emoji === '🐟' || lowerText.includes('water') || lowerText.includes('river') || lowerText.includes('angling') || lowerText.includes('current') || lowerText.includes('lake') || lowerText.includes('stream') || lowerText.includes('waterfall')) {
    iconColor = 'text-sky-400';
    IconComponent = Droplet;
  } else if (emoji === '🏔️' || emoji === '🗻' || emoji === '🌫️' || lowerText.includes('mountain') || lowerText.includes('pass') || lowerText.includes('kanchenjunga') || lowerText.includes('ridge') || lowerText.includes('fog') || lowerText.includes('snow') || lowerText.includes('altitude') || lowerText.includes('view') || lowerText.includes('overlook') || lowerText.includes('sunrise') || lowerText.includes('sunset') || lowerText.includes('golden')) {
    iconColor = 'text-slate-100';
    IconComponent = Mountain;
  } else if (emoji === '🌉' || emoji === '🪵' || emoji === '🪨' || emoji === '🛣️' || emoji === '🗺️' || emoji === '🏰' || lowerText.includes('bridge') || lowerText.includes('highway') || lowerText.includes('road') || lowerText.includes('boulder') || lowerText.includes('rock') || lowerText.includes('fort') || lowerText.includes('route') || lowerText.includes('bend') || lowerText.includes('walk') || lowerText.includes('trail')) {
    iconColor = 'text-amber-500'; // Brown / Amber accent
    IconComponent = Compass;
  } else if (emoji === '🌸' || emoji === '🌄' || lowerText.includes('flower') || lowerText.includes('rhododendron') || lowerText.includes('bloom') || lowerText.includes('orchid') || lowerText.includes('monastery') || lowerText.includes('culture') || lowerText.includes('tea') || lowerText.includes('garden')) {
    iconColor = 'text-pink-400';
    IconComponent = Flower2;
  } else {
    iconColor = 'text-emerald-400';
    IconComponent = Trees;
  }

  return { cleanText, iconColor, IconComponent };
};

export default function PremiumRouteCard({
  rt,
  fromName,
  toName,
  coverImage,
  themeData,
  navigate
}: PremiumRouteCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isSheenActive, setIsSheenActive] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const sheenTimeoutRef = useRef<any>(null);
  
  // Parallax state for cinematic hover
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });
  // Shadow translation state based on mouse position
  const [shadowOffset, setShadowOffset] = useState({ x: 0, y: 0 });
  // Magnetic force state for CTA button
  const [magneticOffset, setMagneticOffset] = useState({ x: 0, y: 0 });
  const ctaRef = useRef<HTMLButtonElement>(null);

  // Clean up sheen timeout on unmount
  React.useEffect(() => {
    return () => {
      if (sheenTimeoutRef.current) {
        clearTimeout(sheenTimeoutRef.current);
      }
    };
  }, []);

  // Parse details
  const isReserved = rt.type?.toLowerCase().includes('reserved');
  const fareMinVal = rt.fareMin || (isReserved ? 2500 : 120);
  const distanceKm = rt.distance || 72;
  const highlights = getRouteHighlights(rt, themeData.name);

  // Format Destination Name beautifully (e.g. MAGAN instead of Magan Taxi Stand)
  const cleanToName = toName.replace(/(Taxi Stand|Hub|Stand|Junction)/gi, '').trim().toUpperCase();

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    
    // Parallax relative position
    const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5; // -0.5 to 0.5
    
    setParallaxOffset({ x: x * 10, y: y * 10 }); // scale coordinates up to 10px shift
    setShadowOffset({ x: -x * 8, y: -y * 8 }); // subtle shadow lag
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsSheenActive(false);
    if (sheenTimeoutRef.current) {
      clearTimeout(sheenTimeoutRef.current);
      sheenTimeoutRef.current = null;
    }
    setParallaxOffset({ x: 0, y: 0 });
    setShadowOffset({ x: 0, y: 0 });
    setMagneticOffset({ x: 0, y: 0 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
    // Trigger sheen once on hover entering
    setIsSheenActive(false);
    if (sheenTimeoutRef.current) {
      clearTimeout(sheenTimeoutRef.current);
    }
    sheenTimeoutRef.current = setTimeout(() => {
      setIsSheenActive(true);
    }, 50);
  };

  // Magnetic CTA reaction
  const handleCtaMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ctaRef.current) return;
    const rect = ctaRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // magnetic pull ratio
    setMagneticOffset({ x: x * 0.35, y: y * 0.35 });
  };

  const handleCtaMouseLeave = () => {
    setMagneticOffset({ x: 0, y: 0 });
  };

  const hash = rt.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const elevations = [1430, 1786, 2150, 1280, 2560, 1980, 2200, 1540];
  const elevationVal = elevations[hash % elevations.length];

  const regions = ['North Sikkim', 'East Sikkim', 'South Sikkim', 'West Sikkim'];
  const regionVal = regions[hash % regions.length];

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 15 }}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      className={`relative group flex flex-col h-[380px] bg-[#10261E] rounded-[24px] overflow-hidden border transition-all duration-300 ${
        isHovered 
          ? 'border-emerald-500/40 shadow-[0_16px_36px_rgba(4,16,12,0.8),0_0_20px_rgba(16,185,129,0.08)]' 
          : 'border-[#1f4d3e]/35 shadow-[0_6px_24px_rgba(4,16,12,0.5)]'
      }`}
      style={{
        boxShadow: isHovered 
          ? `${shadowOffset.x}px ${shadowOffset.y + 12}px 30px rgba(4, 16, 12, 0.75), 0 0 16px rgba(16, 185, 129, 0.06)`
          : '0 4px 20px rgba(4, 16, 12, 0.4)',
      }}
    >
      {/* 1. Cinematic Hero Image Container (occupies exactly 50% of the card height) */}
      <div className="relative h-[190px] overflow-hidden bg-slate-950 shrink-0 select-none">
        {/* Soft parallaxed hero image with cinematic contrast and high dynamic range tuning */}
        <motion.img
          src={coverImage}
          alt={`${fromName} to ${toName}`}
          className="w-full h-full object-cover opacity-90 contrast-[1.08] saturate-[1.05] brightness-[0.92]"
          style={{
            scale: isHovered ? 1.03 : 1.0,
            x: parallaxOffset.x * 0.7,
            y: parallaxOffset.y * 0.7,
          }}
          transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
        />

        {/* Minimal cinematic bottom gradient overlay for smooth, seamless transition into card content */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#10261E] via-[#10261E]/40 to-transparent z-1 pointer-events-none" />
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/15 transition-colors duration-300 z-1 pointer-events-none" />

        {/* Moving light reflection sweep (sheen) */}
        {isSheenActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-sheen pointer-events-none z-2" />
        )}

        {/* Category badge */}
        <div className="absolute top-3 left-3 z-3">
          <span className="bg-black/45 backdrop-blur-md text-white text-[9px] font-bold tracking-wide px-2.5 py-0.5 rounded-full border border-white/10 flex items-center gap-1 shadow-sm transition-all duration-300 hover:bg-black/60">
            <span>{themeData.icon}</span> 
            <span>{themeData.name}</span>
          </span>
        </div>

        {/* Verified badge */}
        <div className="absolute top-3 right-3 z-3">
          {rt.verified ? (
            <span className="relative bg-emerald-950/45 backdrop-blur-md text-emerald-400 text-[9px] font-bold tracking-wide px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1 shadow-xs overflow-hidden">
              {/* Premium Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/10 to-transparent -translate-x-full animate-shimmer pointer-events-none" />
              <span className="text-emerald-400">✔</span> 
              <span>Verified</span>
            </span>
          ) : (
            <span className="bg-amber-950/45 backdrop-blur-md text-amber-400 text-[9px] font-bold tracking-wide px-2.5 py-0.5 rounded-full border border-amber-500/20 shadow-xs">
              Exploring
            </span>
          )}
        </div>
      </div>

      {/* Body Content - tight, responsive, space-efficient with premium breathing room */}
      <div className="px-4 pb-3 pt-1.5 flex-grow flex flex-col justify-between text-left bg-[#10261E] overflow-hidden">
        
        {/* Destination & Journey Information */}
        <div className="text-left select-none space-y-1 shrink-0">
          {/* Journey Path */}
          <div className="flex items-center gap-1.5 text-[10.5px] font-bold">
            <span className="truncate max-w-[130px] text-slate-400" title={fromName}>{fromName}</span>
            <span className="text-emerald-500/80 font-black shrink-0">→</span>
            <span className="truncate max-w-[130px] text-emerald-400" title={cleanToName}>{cleanToName}</span>
          </div>

          {/* Destination Stand */}
          <div className="flex items-end justify-between gap-2 pt-0.5">
            <div className="flex items-center gap-1.5 min-w-0">
              <h4 className="text-emerald-400 text-[19px] font-black tracking-wide leading-none transition-colors duration-300 group-hover:text-emerald-300 truncate">
                {cleanToName}
              </h4>
            </div>
            <span className="text-slate-400 text-[9px] font-semibold shrink-0 opacity-85 mb-0.5">
              📍 {regionVal} • ▲{elevationVal}m
            </span>
          </div>
        </div>

        {/* Journey Highlights (Single line horizontally scrollable glass chips to stop overflow) */}
        <div className="my-1.5 shrink-0 overflow-hidden">
          <div 
            className="flex flex-nowrap gap-1.5 overflow-x-auto select-none pb-0.5"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {highlights.slice(0, 3).map((highlight, idx) => {
              const { cleanText, iconColor, IconComponent } = getHighlightDetails(highlight);
              return (
                <span 
                  key={idx} 
                  title={highlight}
                  className="inline-flex items-center gap-1 h-[24px] text-[9px] font-bold text-slate-200 bg-emerald-950/20 backdrop-blur-md px-2.5 rounded-full border border-emerald-500/15 shrink-0 select-none transition-all duration-300 hover:bg-emerald-950/45 hover:border-emerald-500/40 cursor-help"
                >
                  <IconComponent className={`w-3 h-3 ${iconColor} shrink-0`} />
                  <span className="truncate max-w-[90px]">{cleanText}</span>
                </span>
              );
            })}
          </div>
        </div>

        {/* Compact Statistics Row */}
        <div className="grid grid-cols-4 gap-0.5 py-1 my-1 border-y border-emerald-950/80 text-center select-none divide-x divide-emerald-900/30 shrink-0">
          <div className="flex flex-col items-center justify-center">
            <span className="text-[13px] font-black text-white tracking-tight leading-tight">{distanceKm} km</span>
            <span className="text-[7.5px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 opacity-70 flex items-center justify-center gap-0.5">📍 Dist.</span>
          </div>
          <div className="flex flex-col items-center justify-center">
            <span className="text-[13px] font-black text-white tracking-tight leading-tight">
              {rt.timeMin ? `${Math.floor(rt.timeMin / 60)}h ${rt.timeMin % 60}m` : '2.5h'}
            </span>
            <span className="text-[7.5px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 opacity-70 flex items-center justify-center gap-0.5">🕒 Est.</span>
          </div>
          <div className="flex flex-col items-center justify-center">
            <span className="text-[13px] font-black text-emerald-400 tracking-tight leading-tight">₹{fareMinVal}</span>
            <span className="text-[7.5px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 opacity-70 flex items-center justify-center gap-0.5">₹ Fare</span>
          </div>
          <div className="flex flex-col items-center justify-center">
            <span className="text-[12px] font-black text-emerald-400 tracking-tight leading-tight truncate max-w-[62px]" title={rt.type || 'Shared'}>
              {rt.type || 'Shared'}
            </span>
            <span className="text-[7.5px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 opacity-70 flex items-center justify-center gap-0.5">🚖 Type</span>
          </div>
        </div>

        {/* Premium Full-Width CTA Button (MOST IMPORTANT) */}
        <motion.button
          ref={ctaRef}
          onMouseMove={handleCtaMouseMove}
          onMouseLeave={handleCtaMouseLeave}
          onClick={(e) => {
            e.stopPropagation();
            const routeSlug = getItemSlug(rt) || `${toSlug(fromName)}-to-${toSlug(toName)}`;
            navigate(`#/route/${routeSlug}`);
          }}
          style={{
            x: magneticOffset.x,
            y: magneticOffset.y,
          }}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.96 }}
          className="w-full relative h-[38px] shrink-0 mt-1 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 text-white font-extrabold text-[10.5px] tracking-widest font-sans uppercase flex items-center justify-center gap-1.5 overflow-hidden border border-emerald-400/30 shadow-[0_4px_12px_rgba(16,185,129,0.15),inset_0_1px_1px_rgba(255,255,255,0.15)] hover:shadow-[0_8px_24px_rgba(52,211,153,0.35),0_0_12px_rgba(52,211,153,0.15)] hover:border-emerald-300/80 transition-all duration-300 cursor-pointer group/cta"
        >
          {/* Soft glossy highlight on top */}
          <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none z-1" />

          {/* Glowing shifting background */}
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-500 opacity-0 group-hover/cta:opacity-100 transition-opacity duration-300 pointer-events-none" />

          <span className="relative z-1 tracking-[0.12em]">EXPLORE JOURNEY</span>
          
          <motion.span 
            className="relative z-1 inline-block text-[14px] font-bold"
            animate={{ x: isHovered ? 6 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            →
          </motion.span>
        </motion.button>
      </div>
    </motion.div>
  );
}
