// HillyTrip Badge & Recognition System Data and Helper Utilities

export interface BadgeLevel {
  levelName: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';
  label: string;
  emoji: string;
  colorClass: string; // Tailwind class
  bgClass: string;
  borderClass: string;
  threshold: number;
}

export interface BadgeCategory {
  id: string;
  name: string;
  description: string;
  iconName: string; // Lucide icon name mapping
  defaultEmoji: string;
  metricLabel: string;
  levels: {
    Bronze: BadgeLevel;
    Silver: BadgeLevel;
    Gold: BadgeLevel;
    Platinum: BadgeLevel;
    Diamond: BadgeLevel;
  };
}

export interface SpecialBadge {
  id: string;
  name: string;
  description: string;
  emoji: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
  requirement: string;
}

export interface ContributorLevelDef {
  level: number;
  name: string;
  minPoints: number;
  maxPoints: number;
  description: string;
}

// 1. Contributor levels based on points
export const CONTRIBUTOR_LEVELS: ContributorLevelDef[] = [
  { level: 1, name: 'Explorer', minPoints: 0, maxPoints: 299, description: 'Beginning the ascent into the offbeat trails.' },
  { level: 2, name: 'Trail Seeker', minPoints: 300, maxPoints: 799, description: 'Venturing into the pristine secondary valleys and pathways.' },
  { level: 3, name: 'Mountain Explorer', minPoints: 800, maxPoints: 1499, description: 'Unlocking hidden landmarks across multiple high altitude ridges.' },
  { level: 4, name: 'Hill Contributor', minPoints: 1500, maxPoints: 2499, description: 'Providing consistent guidance for regional road corridors and settlements.' },
  { level: 5, name: 'Local Expert', minPoints: 2500, maxPoints: 3999, description: 'Respected custodian of offbeat secrets with verified credentials.' },
  { level: 6, name: 'Mountain Ambassador', minPoints: 4000, maxPoints: 5999, description: 'Influencing active navigation layers and guiding safety protocols across districts.' },
  { level: 7, name: 'HillyTrip Legend', minPoints: 6000, maxPoints: 100000, description: 'Master of Himalayan topography and community-focused travel preservation.' }
];

// Helper to get level by points
export function getLevelInfo(points: number) {
  const currentLevel = CONTRIBUTOR_LEVELS.find(lvl => points >= lvl.minPoints && points <= lvl.maxPoints) 
    || CONTRIBUTOR_LEVELS[CONTRIBUTOR_LEVELS.length - 1];
  
  const nextLevel = CONTRIBUTOR_LEVELS.find(lvl => lvl.level === currentLevel.level + 1);
  return {
    current: currentLevel,
    next: nextLevel,
    progressPercent: nextLevel 
      ? Math.min(100, Math.max(0, ((points - currentLevel.minPoints) / (nextLevel.minPoints - currentLevel.minPoints)) * 100))
      : 100
  };
}

// 2. Core Badge Categories
export const BADGE_CATEGORIES: BadgeCategory[] = [
  {
    id: 'badge-photographer',
    name: 'Mountain Photographer',
    description: 'Awarded for capturing the raw beauty and hidden vistas of the Himalayas with approved traveler photos.',
    iconName: 'Camera',
    defaultEmoji: '📸',
    metricLabel: 'Approved Photos',
    levels: {
      Bronze: { levelName: 'Bronze', label: '🥉 Bronze Photographer', emoji: '📸', colorClass: 'text-amber-700', bgClass: 'from-amber-100 to-amber-200 dark:from-amber-950/40 dark:to-amber-900/40', borderClass: 'border-amber-500/30', threshold: 1 },
      Silver: { levelName: 'Silver', label: '🥈 Silver Photographer', emoji: '📸', colorClass: 'text-slate-400', bgClass: 'from-slate-100 to-slate-200 dark:from-slate-850 dark:to-slate-750', borderClass: 'border-slate-400/30', threshold: 5 },
      Gold: { levelName: 'Gold', label: '🥇 Gold Photographer', emoji: '📸', colorClass: 'text-yellow-500', bgClass: 'from-yellow-50 to-yellow-150 dark:from-yellow-950/40 dark:to-yellow-900/40', borderClass: 'border-yellow-500/30', threshold: 15 },
      Platinum: { levelName: 'Platinum', label: '💎 Platinum Photographer', emoji: '📸', colorClass: 'text-sky-400', bgClass: 'from-sky-50 to-sky-150 dark:from-sky-950/40 dark:to-sky-900/40', borderClass: 'border-sky-400/30', threshold: 30 },
      Diamond: { levelName: 'Diamond', label: '👑 Diamond Photographer', emoji: '📸', colorClass: 'text-indigo-400', bgClass: 'from-indigo-100 to-indigo-200 dark:from-indigo-950/40 dark:to-indigo-900/40', borderClass: 'border-indigo-500/40', threshold: 50 }
    }
  },
  {
    id: 'badge-reviewer',
    name: 'Trusted Reviewer',
    description: 'Awarded for publishing rich, precise reviews detailing historical context, monk guidelines, and peak trails.',
    iconName: 'Star',
    defaultEmoji: '✍',
    metricLabel: 'Approved Reviews',
    levels: {
      Bronze: { levelName: 'Bronze', label: '🥉 Bronze Reviewer', emoji: '✍', colorClass: 'text-amber-700', bgClass: 'from-amber-100 to-amber-200 dark:from-amber-950/30 dark:to-amber-900/30', borderClass: 'border-amber-500/30', threshold: 1 },
      Silver: { levelName: 'Silver', label: '🥈 Silver Reviewer', emoji: '✍', colorClass: 'text-slate-400', bgClass: 'from-slate-100 to-slate-200 dark:from-slate-850 dark:to-slate-750', borderClass: 'border-slate-400/30', threshold: 5 },
      Gold: { levelName: 'Gold', label: '🥇 Gold Reviewer', emoji: '✍', colorClass: 'text-yellow-500', bgClass: 'from-yellow-50 to-yellow-150 dark:from-yellow-950/40 dark:to-yellow-900/40', borderClass: 'border-yellow-500/30', threshold: 10 },
      Platinum: { levelName: 'Platinum', label: '💎 Platinum Reviewer', emoji: '✍', colorClass: 'text-sky-400', bgClass: 'from-sky-50 to-sky-150 dark:from-sky-950/40 dark:to-sky-900/40', borderClass: 'border-sky-400/30', threshold: 20 },
      Diamond: { levelName: 'Diamond', label: '👑 Diamond Reviewer', emoji: '✍', colorClass: 'text-indigo-400', bgClass: 'from-indigo-100 to-indigo-200 dark:from-indigo-950/40 dark:to-indigo-900/40', borderClass: 'border-indigo-500/40', threshold: 35 }
    }
  },
  {
    id: 'badge-explorer',
    name: 'Destination Explorer',
    description: 'Awarded for mapping entirely new offbeat valleys and fine-tuning coordinates of pristine towns.',
    iconName: 'Compass',
    defaultEmoji: '📍',
    metricLabel: 'Destinations Discovered',
    levels: {
      Bronze: { levelName: 'Bronze', label: '🥉 Bronze Explorer', emoji: '📍', colorClass: 'text-amber-700', bgClass: 'from-amber-100 to-amber-200 dark:from-amber-950/30 dark:to-amber-900/30', borderClass: 'border-amber-500/30', threshold: 1 },
      Silver: { levelName: 'Silver', label: '🥈 Silver Explorer', emoji: '📍', colorClass: 'text-slate-400', bgClass: 'from-slate-100 to-slate-200 dark:from-slate-850 dark:to-slate-750', borderClass: 'border-slate-400/30', threshold: 2 },
      Gold: { levelName: 'Gold', label: '🥇 Gold Explorer', emoji: '📍', colorClass: 'text-yellow-500', bgClass: 'from-yellow-50 to-yellow-150 dark:from-yellow-950/40 dark:to-yellow-900/40', borderClass: 'border-yellow-500/30', threshold: 5 },
      Platinum: { levelName: 'Platinum', label: '💎 Platinum Explorer', emoji: '📍', colorClass: 'text-sky-400', bgClass: 'from-sky-50 to-sky-150 dark:from-sky-950/40 dark:to-sky-900/40', borderClass: 'border-sky-400/30', threshold: 10 },
      Diamond: { levelName: 'Diamond', label: '👑 Diamond Explorer', emoji: '📍', colorClass: 'text-indigo-400', bgClass: 'from-indigo-100 to-indigo-200 dark:from-indigo-950/40 dark:to-indigo-900/40', borderClass: 'border-indigo-500/40', threshold: 20 }
    }
  },
  {
    id: 'badge-attraction',
    name: 'Attraction Hunter',
    description: 'Awarded for documenting waterfalls, pristine view ridges, and ancient sacred monasteries.',
    iconName: 'MapPin',
    defaultEmoji: '🏞',
    metricLabel: 'Attractions Added',
    levels: {
      Bronze: { levelName: 'Bronze', label: '🥉 Bronze Attraction Hunter', emoji: '🏞', colorClass: 'text-amber-700', bgClass: 'from-amber-100 to-amber-200 dark:from-amber-950/30 dark:to-amber-900/30', borderClass: 'border-amber-500/30', threshold: 1 },
      Silver: { levelName: 'Silver', label: '🥈 Silver Attraction Hunter', emoji: '🏞', colorClass: 'text-slate-400', bgClass: 'from-slate-100 to-slate-200 dark:from-slate-850 dark:to-slate-750', borderClass: 'border-slate-400/30', threshold: 3 },
      Gold: { levelName: 'Gold', label: '🥇 Gold Attraction Hunter', emoji: '🏞', colorClass: 'text-yellow-500', bgClass: 'from-yellow-50 to-yellow-150 dark:from-yellow-950/40 dark:to-yellow-900/40', borderClass: 'border-yellow-500/30', threshold: 8 },
      Platinum: { levelName: 'Platinum', label: '💎 Platinum Attraction Hunter', emoji: '🏞', colorClass: 'text-sky-400', bgClass: 'from-sky-50 to-sky-150 dark:from-sky-950/40 dark:to-sky-900/40', borderClass: 'border-sky-400/30', threshold: 15 },
      Diamond: { levelName: 'Diamond', label: '👑 Diamond Attraction Hunter', emoji: '🏞', colorClass: 'text-indigo-400', bgClass: 'from-indigo-100 to-indigo-200 dark:from-indigo-950/40 dark:to-indigo-900/40', borderClass: 'border-indigo-500/40', threshold: 25 }
    }
  },
  {
    id: 'badge-road',
    name: 'Road Reporter',
    description: 'Awarded for providing accurate road condition warnings, landslide blockages, and bypass updates.',
    iconName: 'ShieldAlert',
    defaultEmoji: '🛣️',
    metricLabel: 'Road Advisories Filed',
    levels: {
      Bronze: { levelName: 'Bronze', label: '🥉 Bronze Road Reporter', emoji: '🛣️', colorClass: 'text-amber-700', bgClass: 'from-amber-100 to-amber-200 dark:from-amber-950/30 dark:to-amber-900/30', borderClass: 'border-amber-500/30', threshold: 1 },
      Silver: { levelName: 'Silver', label: '🥈 Silver Road Reporter', emoji: '🛣️', colorClass: 'text-slate-400', bgClass: 'from-slate-100 to-slate-200 dark:from-slate-850 dark:to-slate-750', borderClass: 'border-slate-400/30', threshold: 3 },
      Gold: { levelName: 'Gold', label: '🥇 Gold Road Reporter', emoji: '🛣️', colorClass: 'text-yellow-500', bgClass: 'from-yellow-50 to-yellow-150 dark:from-yellow-950/40 dark:to-yellow-900/40', borderClass: 'border-yellow-500/30', threshold: 7 },
      Platinum: { levelName: 'Platinum', label: '💎 Platinum Road Reporter', emoji: '🛣️', colorClass: 'text-sky-400', bgClass: 'from-sky-50 to-sky-150 dark:from-sky-950/40 dark:to-sky-900/40', borderClass: 'border-sky-400/30', threshold: 15 },
      Diamond: { levelName: 'Diamond', label: '👑 Diamond Road Reporter', emoji: '🛣️', colorClass: 'text-indigo-400', bgClass: 'from-indigo-100 to-indigo-200 dark:from-indigo-950/40 dark:to-indigo-900/40', borderClass: 'border-indigo-500/40', threshold: 25 }
    }
  },
  {
    id: 'badge-stay',
    name: 'Stay Expert',
    description: 'Awarded for identifying and registering offbeat homestays with direct local host coordinates.',
    iconName: 'Home',
    defaultEmoji: '🏡',
    metricLabel: 'Homestays Registered',
    levels: {
      Bronze: { levelName: 'Bronze', label: '🥉 Bronze Stay Expert', emoji: '🏡', colorClass: 'text-amber-700', bgClass: 'from-amber-100 to-amber-200 dark:from-amber-950/30 dark:to-amber-900/30', borderClass: 'border-amber-500/30', threshold: 1 },
      Silver: { levelName: 'Silver', label: '🥈 Silver Stay Expert', emoji: '🏡', colorClass: 'text-slate-400', bgClass: 'from-slate-100 to-slate-200 dark:from-slate-850 dark:to-slate-750', borderClass: 'border-slate-400/30', threshold: 2 },
      Gold: { levelName: 'Gold', label: '🥇 Gold Stay Expert', emoji: '🏡', colorClass: 'text-yellow-500', bgClass: 'from-yellow-50 to-yellow-150 dark:from-yellow-950/40 dark:to-yellow-900/40', borderClass: 'border-yellow-500/30', threshold: 5 },
      Platinum: { levelName: 'Platinum', label: '💎 Platinum Stay Expert', emoji: '🏡', colorClass: 'text-sky-400', bgClass: 'from-sky-50 to-sky-150 dark:from-sky-950/40 dark:to-sky-900/40', borderClass: 'border-sky-400/30', threshold: 10 },
      Diamond: { levelName: 'Diamond', label: '👑 Diamond Stay Expert', emoji: '🏡', colorClass: 'text-indigo-400', bgClass: 'from-indigo-100 to-indigo-200 dark:from-indigo-950/40 dark:to-indigo-900/40', borderClass: 'border-indigo-500/40', threshold: 15 }
    }
  },
  {
    id: 'badge-transport',
    name: 'Transport Guide',
    description: 'Awarded for adding verified local taxi stands and direct local operators to the transit graph.',
    iconName: 'Car',
    defaultEmoji: '🚕',
    metricLabel: 'Transport Updates',
    levels: {
      Bronze: { levelName: 'Bronze', label: '🥉 Bronze Transport Guide', emoji: '🚕', colorClass: 'text-amber-700', bgClass: 'from-amber-100 to-amber-200 dark:from-amber-950/30 dark:to-amber-900/30', borderClass: 'border-amber-500/30', threshold: 1 },
      Silver: { levelName: 'Silver', label: '🥈 Silver Transport Guide', emoji: '🚕', colorClass: 'text-slate-400', bgClass: 'from-slate-100 to-slate-200 dark:from-slate-850 dark:to-slate-750', borderClass: 'border-slate-400/30', threshold: 2 },
      Gold: { levelName: 'Gold', label: '🥇 Gold Transport Guide', emoji: '🚕', colorClass: 'text-yellow-500', bgClass: 'from-yellow-50 to-yellow-150 dark:from-yellow-950/40 dark:to-yellow-900/40', borderClass: 'border-yellow-500/30', threshold: 5 },
      Platinum: { levelName: 'Platinum', label: '💎 Platinum Transport Guide', emoji: '🚕', colorClass: 'text-sky-400', bgClass: 'from-sky-50 to-sky-150 dark:from-sky-950/40 dark:to-sky-900/40', borderClass: 'border-sky-400/30', threshold: 10 },
      Diamond: { levelName: 'Diamond', label: '👑 Diamond Transport Guide', emoji: '🚕', colorClass: 'text-indigo-400', bgClass: 'from-indigo-100 to-indigo-200 dark:from-indigo-950/40 dark:to-indigo-900/40', borderClass: 'border-indigo-500/40', threshold: 15 }
    }
  },
  {
    id: 'badge-local',
    name: 'Local Guide',
    description: 'Awarded for deep-rooted knowledge. Consistently logging top-quality accuracy updates in a single sub-region.',
    iconName: 'Map',
    defaultEmoji: '🗺',
    metricLabel: 'Regional Contributions',
    levels: {
      Bronze: { levelName: 'Bronze', label: '🥉 Bronze Local Guide', emoji: '🗺', colorClass: 'text-amber-700', bgClass: 'from-amber-100 to-amber-200 dark:from-amber-950/30 dark:to-amber-900/30', borderClass: 'border-amber-500/30', threshold: 1 },
      Silver: { levelName: 'Silver', label: '🥈 Silver Local Guide', emoji: '🗺', colorClass: 'text-slate-400', bgClass: 'from-slate-100 to-slate-200 dark:from-slate-850 dark:to-slate-750', borderClass: 'border-slate-400/30', threshold: 3 },
      Gold: { levelName: 'Gold', label: '🥇 Gold Local Guide', emoji: '🗺', colorClass: 'text-yellow-500', bgClass: 'from-yellow-50 to-yellow-150 dark:from-yellow-950/40 dark:to-yellow-900/40', borderClass: 'border-yellow-500/30', threshold: 10 },
      Platinum: { levelName: 'Platinum', label: '💎 Platinum Local Guide', emoji: '🗺', colorClass: 'text-sky-400', bgClass: 'from-sky-50 to-sky-150 dark:from-sky-950/40 dark:to-sky-900/40', borderClass: 'border-sky-400/30', threshold: 20 },
      Diamond: { levelName: 'Diamond', label: '👑 Diamond Local Guide', emoji: '🗺', colorClass: 'text-indigo-400', bgClass: 'from-indigo-100 to-indigo-200 dark:from-indigo-950/40 dark:to-indigo-900/40', borderClass: 'border-indigo-500/40', threshold: 40 }
    }
  },
  {
    id: 'badge-community',
    name: 'Community Helper',
    description: 'Awarded when your guides and advisories receive high appreciation and bookmarks from the traveler community.',
    iconName: 'Heart',
    defaultEmoji: '⭐',
    metricLabel: 'Appreciations Received',
    levels: {
      Bronze: { levelName: 'Bronze', label: '🥉 Bronze Helper', emoji: '⭐', colorClass: 'text-amber-700', bgClass: 'from-amber-100 to-amber-200 dark:from-amber-950/30 dark:to-amber-900/30', borderClass: 'border-amber-500/30', threshold: 10 },
      Silver: { levelName: 'Silver', label: '🥈 Silver Helper', emoji: '⭐', colorClass: 'text-slate-400', bgClass: 'from-slate-100 to-slate-200 dark:from-slate-850 dark:to-slate-750', borderClass: 'border-slate-400/30', threshold: 50 },
      Gold: { levelName: 'Gold', label: '🥇 Gold Helper', emoji: '⭐', colorClass: 'text-yellow-500', bgClass: 'from-yellow-50 to-yellow-150 dark:from-yellow-950/40 dark:to-yellow-900/40', borderClass: 'border-yellow-500/30', threshold: 150 },
      Platinum: { levelName: 'Platinum', label: '💎 Platinum Helper', emoji: '⭐', colorClass: 'text-sky-400', bgClass: 'from-sky-50 to-sky-150 dark:from-sky-950/40 dark:to-sky-900/40', borderClass: 'border-sky-400/30', threshold: 300 },
      Diamond: { levelName: 'Diamond', label: '👑 Diamond Helper', emoji: '⭐', colorClass: 'text-indigo-400', bgClass: 'from-indigo-100 to-indigo-200 dark:from-indigo-950/40 dark:to-indigo-900/40', borderClass: 'border-indigo-500/40', threshold: 500 }
    }
  },
  {
    id: 'badge-hiddengem',
    name: 'Hidden Gem Explorer',
    description: 'Awarded for discovering lesser-known, low-footprint destinations and attractions hidden in the mist.',
    iconName: 'Sparkles',
    defaultEmoji: '🌄',
    metricLabel: 'Gems Logged',
    levels: {
      Bronze: { levelName: 'Bronze', label: '🥉 Bronze Gem Seeker', emoji: '🌄', colorClass: 'text-amber-700', bgClass: 'from-amber-100 to-amber-200 dark:from-amber-950/30 dark:to-amber-900/30', borderClass: 'border-amber-500/30', threshold: 1 },
      Silver: { levelName: 'Silver', label: '🥈 Silver Gem Seeker', emoji: '🌄', colorClass: 'text-slate-400', bgClass: 'from-slate-100 to-slate-200 dark:from-slate-850 dark:to-slate-750', borderClass: 'border-slate-400/30', threshold: 2 },
      Gold: { levelName: 'Gold', label: '🥇 Gold Gem Seeker', emoji: '🌄', colorClass: 'text-yellow-500', bgClass: 'from-yellow-50 to-yellow-150 dark:from-yellow-950/40 dark:to-yellow-900/40', borderClass: 'border-yellow-500/30', threshold: 5 },
      Platinum: { levelName: 'Platinum', label: '💎 Platinum Gem Seeker', emoji: '🌄', colorClass: 'text-sky-400', bgClass: 'from-sky-50 to-sky-150 dark:from-sky-950/40 dark:to-sky-900/40', borderClass: 'border-sky-400/30', threshold: 10 },
      Diamond: { levelName: 'Diamond', label: '👑 Diamond Gem Seeker', emoji: '🌄', colorClass: 'text-indigo-400', bgClass: 'from-indigo-100 to-indigo-200 dark:from-indigo-950/40 dark:to-indigo-900/40', borderClass: 'border-indigo-500/40', threshold: 15 }
    }
  },
  {
    id: 'badge-adventure',
    name: 'Adventure Seeker',
    description: 'Awarded for crossing travel boundaries. Consistently submitting data across multiple different categories.',
    iconName: 'Flame',
    defaultEmoji: '🎒',
    metricLabel: 'Categories Contributed',
    levels: {
      Bronze: { levelName: 'Bronze', label: '🥉 Bronze Adventurer', emoji: '🎒', colorClass: 'text-amber-700', bgClass: 'from-amber-100 to-amber-200 dark:from-amber-950/30 dark:to-amber-900/30', borderClass: 'border-amber-500/30', threshold: 2 },
      Silver: { levelName: 'Silver', label: '🥈 Silver Adventurer', emoji: '🎒', colorClass: 'text-slate-400', bgClass: 'from-slate-100 to-slate-200 dark:from-slate-850 dark:to-slate-750', borderClass: 'border-slate-400/30', threshold: 3 },
      Gold: { levelName: 'Gold', label: '🥇 Gold Adventurer', emoji: '🎒', colorClass: 'text-yellow-500', bgClass: 'from-yellow-50 to-yellow-150 dark:from-yellow-950/40 dark:to-yellow-900/40', borderClass: 'border-yellow-500/30', threshold: 4 },
      Platinum: { levelName: 'Platinum', label: '💎 Platinum Adventurer', emoji: '🎒', colorClass: 'text-sky-400', bgClass: 'from-sky-50 to-sky-150 dark:from-sky-950/40 dark:to-sky-900/40', borderClass: 'border-sky-400/30', threshold: 5 },
      Diamond: { levelName: 'Diamond', label: '👑 Diamond Adventurer', emoji: '🎒', colorClass: 'text-indigo-400', bgClass: 'from-indigo-100 to-indigo-200 dark:from-indigo-950/40 dark:to-indigo-900/40', borderClass: 'border-indigo-500/40', threshold: 6 }
    }
  },
  {
    id: 'badge-legend',
    name: 'HillyTrip Legend',
    description: 'The ultimate badge of top-tier honor. Conquering long-term mountain stewardship that cannot be rushed.',
    iconName: 'Crown',
    defaultEmoji: '👑',
    metricLabel: 'Total Score Threshold',
    levels: {
      Bronze: { levelName: 'Bronze', label: '🥉 Bronze Legend', emoji: '👑', colorClass: 'text-amber-700', bgClass: 'from-amber-100 to-amber-200 dark:from-amber-950/30 dark:to-amber-900/30', borderClass: 'border-amber-500/30', threshold: 500 },
      Silver: { levelName: 'Silver', label: '🥈 Silver Legend', emoji: '👑', colorClass: 'text-slate-400', bgClass: 'from-slate-100 to-slate-200 dark:from-slate-850 dark:to-slate-750', borderClass: 'border-slate-400/30', threshold: 1500 },
      Gold: { levelName: 'Gold', label: '🥇 Gold Legend', emoji: '👑', colorClass: 'text-yellow-500', bgClass: 'from-yellow-50 to-yellow-150 dark:from-yellow-950/40 dark:to-yellow-900/40', borderClass: 'border-yellow-500/30', threshold: 3000 },
      Platinum: { levelName: 'Platinum', label: '💎 Platinum Legend', emoji: '👑', colorClass: 'text-sky-400', bgClass: 'from-sky-50 to-sky-150 dark:from-sky-950/40 dark:to-sky-900/40', borderClass: 'border-sky-400/30', threshold: 5000 },
      Diamond: { levelName: 'Diamond', label: '👑 Diamond Legend', emoji: '👑', colorClass: 'text-indigo-400', bgClass: 'from-indigo-100 to-indigo-200 dark:from-indigo-950/40 dark:to-indigo-900/40', borderClass: 'border-indigo-500/40', threshold: 8000 }
    }
  }
];

// 3. Special Badges List
export const SPECIAL_BADGES: SpecialBadge[] = [
  { id: 'sb-firstphoto', name: 'First Photo', description: 'Celebrates your first approved photograph capturing mountain life.', emoji: '📷', colorClass: 'text-blue-500', bgClass: 'bg-blue-500/10', borderClass: 'border-blue-500/20', requirement: '1 approved photo contribution' },
  { id: 'sb-firstreview', name: 'First Review', description: 'Awarded for your introductory approved trail review or historical detail.', emoji: '⭐', colorClass: 'text-yellow-500', bgClass: 'bg-yellow-500/10', borderClass: 'border-yellow-500/20', requirement: '1 approved review contribution' },
  { id: 'sb-firstattr', name: 'First Attraction', description: 'Awarded for successfully pinpointing and verifying a natural attraction.', emoji: '📍', colorClass: 'text-emerald-500', bgClass: 'bg-emerald-500/10', borderClass: 'border-emerald-500/20', requirement: '1 approved attraction registration' },
  { id: 'sb-firstroad', name: 'First Road Update', description: 'Recognizes your critical first warning for live traffic or landslides.', emoji: '🛣️', colorClass: 'text-red-500', bgClass: 'bg-red-500/10', borderClass: 'border-red-500/20', requirement: '1 verified road status report' },
  { id: 'sb-firststay', name: 'First Homestay', description: 'Awarded for registering your initial vetted local mountain homestay.', emoji: '🏡', colorClass: 'text-indigo-500', bgClass: 'bg-indigo-500/10', borderClass: 'border-indigo-500/20', requirement: '1 approved homestay addition' },
  { id: 'sb-firsttaxi', name: 'First Taxi Contact', description: 'Recognizes connecting mountain transport networks to direct host drivers.', emoji: '🚕', colorClass: 'text-amber-500', bgClass: 'bg-amber-500/10', borderClass: 'border-amber-500/20', requirement: '1 approved taxi operator contact listing' },
  { id: 'sb-early', name: 'Early Contributor', description: 'An honorary title awarded for helping establish HillyTrip since early stages.', emoji: '🎉', colorClass: 'text-purple-500', bgClass: 'bg-purple-500/10', borderClass: 'border-purple-500/20', requirement: 'Joined in early launch stages' },
  { id: 'sb-pioneer', name: 'Pioneer Explorer', description: 'Uncompromising adventure. Awarded for registering 3+ hidden offbeat gems.', emoji: '🏔', colorClass: 'text-teal-500', bgClass: 'bg-teal-500/10', borderClass: 'border-teal-500/20', requirement: 'Submit 3+ hidden gems' },
  { id: 'sb-topmonth', name: 'Top Contributor of the Month', description: 'Active and relentless. Awarded for exceptional contributions this month.', emoji: '🔥', colorClass: 'text-orange-500', bgClass: 'bg-orange-500/10', borderClass: 'border-orange-500/20', requirement: 'Accumulate >100 points in a single month' },
  { id: 'sb-featuredphoto', name: 'Featured Photographer', description: 'Artistic capture. Awarded when one of your photos is featured on the HillyTrip homepage.', emoji: '🏆', colorClass: 'text-amber-500', bgClass: 'bg-amber-500/10', borderClass: 'border-amber-500/20', requirement: 'Get a photograph featured by editors' },
  { id: 'sb-editorschoice', name: 'Editor\'s Choice', description: 'Stellar excellence. Awarded directly by HillyTrip moderators for pristine detail guides.', emoji: '🌟', colorClass: 'text-rose-500', bgClass: 'bg-rose-500/10', borderClass: 'border-rose-500/20', requirement: 'Receive editorial nomination badge' }
];

// Calculate earned level and progress info for a specific category metric
export function calculateCategoryBadgeState(categoryId: string, metricValue: number) {
  const cat = BADGE_CATEGORIES.find(c => c.id === categoryId);
  if (!cat) return null;

  const levelsArray = [cat.levels.Bronze, cat.levels.Silver, cat.levels.Gold, cat.levels.Platinum, cat.levels.Diamond];
  
  // Find highest level unlocked
  let currentLevel: BadgeLevel | null = null;
  let nextLevel: BadgeLevel | null = levelsArray[0];

  for (let i = levelsArray.length - 1; i >= 0; i--) {
    if (metricValue >= levelsArray[i].threshold) {
      currentLevel = levelsArray[i];
      nextLevel = i < levelsArray.length - 1 ? levelsArray[i + 1] : null;
      break;
    }
  }

  const earnedDate = currentLevel ? 'June 18, 2026' : null;

  return {
    category: cat,
    currentLevel,
    nextLevel,
    hasAnyBadge: currentLevel !== null,
    progress: {
      current: metricValue,
      target: nextLevel ? nextLevel.threshold : (currentLevel ? currentLevel.threshold : levelsArray[0].threshold),
      percent: nextLevel 
        ? Math.min(100, (metricValue / nextLevel.threshold) * 100) 
        : 100
    },
    earnedDate
  };
}

// Map user stats object to metrics for badge calculation
export function getUserBadges(stats: {
  photos: number;
  reviews: number;
  attractions: number;
  roads: number;
  homestays: number;
  taxis: number;
  likes: number;
  views: number;
  total: number;
}, points: number) {
  
  // Core Badge States
  const photographer = calculateCategoryBadgeState('badge-photographer', stats.photos)!;
  const reviewer = calculateCategoryBadgeState('badge-reviewer', stats.reviews)!;
  const explorer = calculateCategoryBadgeState('badge-explorer', stats.attractions + stats.homestays > 0 ? Math.floor((stats.attractions + stats.homestays) / 2) + 1 : 0)!;
  const attraction = calculateCategoryBadgeState('badge-attraction', stats.attractions)!;
  const road = calculateCategoryBadgeState('badge-road', stats.roads)!;
  const stay = calculateCategoryBadgeState('badge-stay', stats.homestays)!;
  const transport = calculateCategoryBadgeState('badge-transport', stats.taxis || 0)!;
  const local = calculateCategoryBadgeState('badge-local', Math.max(1, Math.floor(stats.total / 5)))!;
  const community = calculateCategoryBadgeState('badge-community', stats.likes + (stats.views > 0 ? Math.floor(stats.views / 100) : 0))!;
  const hiddengem = calculateCategoryBadgeState('badge-hiddengem', Math.max(0, Math.floor(stats.attractions / 2)))!;
  
  // Count distinct categories contributed to
  let categoriesCount = 0;
  if (stats.photos > 0) categoriesCount++;
  if (stats.reviews > 0) categoriesCount++;
  if (stats.attractions > 0) categoriesCount++;
  if (stats.roads > 0) categoriesCount++;
  if (stats.homestays > 0) categoriesCount++;
  if (stats.taxis > 0) categoriesCount++;

  const adventure = calculateCategoryBadgeState('badge-adventure', categoriesCount)!;
  const legend = calculateCategoryBadgeState('badge-legend', points)!;

  const coreBadges = [
    photographer,
    reviewer,
    explorer,
    attraction,
    road,
    stay,
    transport,
    local,
    community,
    hiddengem,
    adventure,
    legend
  ];

  // Special Badges Evaluation
  const earnedSpecialBadges: SpecialBadge[] = [];
  
  if (stats.photos >= 1) earnedSpecialBadges.push(SPECIAL_BADGES.find(sb => sb.id === 'sb-firstphoto')!);
  if (stats.reviews >= 1) earnedSpecialBadges.push(SPECIAL_BADGES.find(sb => sb.id === 'sb-firstreview')!);
  if (stats.attractions >= 1) earnedSpecialBadges.push(SPECIAL_BADGES.find(sb => sb.id === 'sb-firstattr')!);
  if (stats.roads >= 1) earnedSpecialBadges.push(SPECIAL_BADGES.find(sb => sb.id === 'sb-firstroad')!);
  if (stats.homestays >= 1) earnedSpecialBadges.push(SPECIAL_BADGES.find(sb => sb.id === 'sb-firststay')!);
  if ((stats.taxis || 0) >= 1) earnedSpecialBadges.push(SPECIAL_BADGES.find(sb => sb.id === 'sb-firsttaxi')!);
  
  // Custom based on user mock profiles (like Anjali or Amit)
  if (points > 1000) {
    earnedSpecialBadges.push(SPECIAL_BADGES.find(sb => sb.id === 'sb-early')!);
    earnedSpecialBadges.push(SPECIAL_BADGES.find(sb => sb.id === 'sb-pioneer')!);
  }
  if (points >= 2000) {
    earnedSpecialBadges.push(SPECIAL_BADGES.find(sb => sb.id === 'sb-topmonth')!);
    earnedSpecialBadges.push(SPECIAL_BADGES.find(sb => sb.id === 'sb-featuredphoto')!);
    earnedSpecialBadges.push(SPECIAL_BADGES.find(sb => sb.id === 'sb-editorschoice')!);
  }

  return {
    coreBadges,
    specialBadges: SPECIAL_BADGES.map(sb => ({
      ...sb,
      unlocked: earnedSpecialBadges.some(esb => esb?.id === sb.id)
    }))
  };
}
