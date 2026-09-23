import React from 'react';
import { Tag, Sparkles, Gift, Percent, Clock, Star, Flame } from 'lucide-react';
import { OfferBadgeType } from '../../types/offer';

interface OfferBadgeProps {
  badge: OfferBadgeType | string;
  badgeColor?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const OfferBadge: React.FC<OfferBadgeProps> = ({
  badge,
  badgeColor = 'emerald',
  className = '',
  size = 'md'
}) => {
  const getBadgeStyle = () => {
    const textLower = badge.toLowerCase();
    
    if (textLower.includes('% off') || textLower.includes('discount')) {
      return 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-emerald-950/40 border-emerald-400/40';
    }
    if (textLower.includes('flat') || textLower.includes('₹')) {
      return 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-blue-950/40 border-sky-400/40';
    }
    if (textLower.includes('free breakfast') || textLower.includes('breakfast')) {
      return 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black shadow-amber-950/40 border-amber-300/40';
    }
    if (textLower.includes('kids') || textLower.includes('family')) {
      return 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-950/40 border-purple-400/40';
    }
    if (textLower.includes('early bird')) {
      return 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-indigo-950/40 border-indigo-400/40';
    }
    if (textLower.includes('weekend') || textLower.includes('limited')) {
      return 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-rose-950/40 border-rose-400/40';
    }

    switch (badgeColor) {
      case 'amber':
        return 'bg-amber-500 text-slate-950 font-black border-amber-300/40';
      case 'rose':
        return 'bg-rose-600 text-white border-rose-400/40';
      case 'sky':
        return 'bg-sky-600 text-white border-sky-400/40';
      case 'purple':
        return 'bg-purple-600 text-white border-purple-400/40';
      case 'orange':
        return 'bg-orange-500 text-slate-950 font-black border-orange-300/40';
      default:
        return 'bg-emerald-600 text-white border-emerald-400/40';
    }
  };

  const getIcon = () => {
    const textLower = badge.toLowerCase();
    if (textLower.includes('%')) return <Percent className="w-3.5 h-3.5" />;
    if (textLower.includes('free')) return <Gift className="w-3.5 h-3.5" />;
    if (textLower.includes('limited') || textLower.includes('early')) return <Clock className="w-3.5 h-3.5" />;
    if (textLower.includes('special') || textLower.includes('weekend')) return <Flame className="w-3.5 h-3.5" />;
    return <Tag className="w-3.5 h-3.5" />;
  };

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-[10px] gap-1',
    md: 'px-3 py-1 text-xs gap-1.5',
    lg: 'px-3.5 py-1.5 text-sm gap-2 font-black'
  };

  return (
    <span
      className={`inline-flex items-center font-extrabold tracking-wide uppercase rounded-full shadow-md border backdrop-blur-md transition-all ${getBadgeStyle()} ${sizeClasses[size]} ${className}`}
    >
      {getIcon()}
      <span>{badge}</span>
    </span>
  );
};
