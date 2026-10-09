export interface ExplorerLevelInfo {
  level: number;
  title: string;
  minScore: number;
  maxScore: number;
  badgeEmoji: string;
  colorClass: string;
}

export const EXPLORER_LEVELS: ExplorerLevelInfo[] = [
  {
    level: 1,
    title: 'Trail Novice',
    minScore: 0,
    maxScore: 499,
    badgeEmoji: '🥾',
    colorClass: 'from-amber-500 to-yellow-400 text-amber-950',
  },
  {
    level: 2,
    title: 'Ridge Rambler',
    minScore: 500,
    maxScore: 1499,
    badgeEmoji: '🏕️',
    colorClass: 'from-teal-500 to-emerald-400 text-teal-950',
  },
  {
    level: 3,
    title: 'Valley Wanderer',
    minScore: 1500,
    maxScore: 2999,
    badgeEmoji: '🛖',
    colorClass: 'from-sky-500 to-blue-400 text-sky-950',
  },
  {
    level: 4,
    title: 'Mountain Explorer',
    minScore: 3000,
    maxScore: 5999,
    badgeEmoji: '🏔️',
    colorClass: 'from-indigo-600 to-purple-500 text-white',
  },
  {
    level: 5,
    title: 'High Pass Pathfinder',
    minScore: 6000,
    maxScore: 9999,
    badgeEmoji: '🦅',
    colorClass: 'from-rose-500 to-orange-400 text-white',
  },
  {
    level: 6,
    title: 'Himalayan Legend',
    minScore: 10000,
    maxScore: Infinity,
    badgeEmoji: '👑',
    colorClass: 'from-amber-400 via-amber-300 to-yellow-500 text-slate-950 font-black',
  },
];

export interface CommunityUserStats {
  photosCount: number;
  reviewsCount: number;
  likesCount: number;
  destinationsVisitedCount: number;
  attractionsVisitedCount: number;
  journeysCompletedCount: number;
  badgesUnlockedCount?: number;
}

export function calculateExplorerScore(stats: CommunityUserStats): number {
  const photosPts = (stats.photosCount || 0) * 50;
  const reviewsPts = (stats.reviewsCount || 0) * 100;
  const likesPts = (stats.likesCount || 0) * 10;
  const destPts = (stats.destinationsVisitedCount || 0) * 200;
  const attrPts = (stats.attractionsVisitedCount || 0) * 150;
  const journeyPts = (stats.journeysCompletedCount || 0) * 300;
  const badgePts = (stats.badgesUnlockedCount || 0) * 500;

  return photosPts + reviewsPts + likesPts + destPts + attrPts + journeyPts + badgePts;
}

export function getExplorerLevel(score: number): {
  currentLevel: ExplorerLevelInfo;
  nextLevel: ExplorerLevelInfo | null;
  progressPercent: number;
} {
  let currentLevel = EXPLORER_LEVELS[0];
  let nextLevel: ExplorerLevelInfo | null = EXPLORER_LEVELS[1];

  for (let i = 0; i < EXPLORER_LEVELS.length; i++) {
    if (score >= EXPLORER_LEVELS[i].minScore) {
      currentLevel = EXPLORER_LEVELS[i];
      nextLevel = EXPLORER_LEVELS[i + 1] || null;
    }
  }

  if (!nextLevel) {
    return { currentLevel, nextLevel: null, progressPercent: 100 };
  }

  const scoreInLevel = score - currentLevel.minScore;
  const levelRange = nextLevel.minScore - currentLevel.minScore;
  const progressPercent = Math.min(100, Math.max(0, Math.round((scoreInLevel / levelRange) * 100)));

  return { currentLevel, nextLevel, progressPercent };
}

export interface RegionStateItem {
  id: string;
  name: string;
  isVisited: boolean;
  verifiedReason?: 'Completed booking' | 'Traveller Moment' | 'Review' | 'Verified check-in' | 'Completed Journey';
  spotsCount?: number;
}

export interface CountryPassportRegion {
  country: string;
  flagEmoji: string;
  isFuture?: boolean;
  states: RegionStateItem[];
}

export const DEFAULT_PASSPORT_REGIONS: CountryPassportRegion[] = [
  {
    country: 'India',
    flagEmoji: '🇮🇳',
    states: [
      { id: 'wb', name: 'West Bengal', isVisited: true, verifiedReason: 'Traveller Moment', spotsCount: 8 },
      { id: 'sk', name: 'Sikkim', isVisited: true, verifiedReason: 'Review', spotsCount: 12 },
      { id: 'ap', name: 'Arunachal Pradesh', isVisited: false, spotsCount: 5 },
      { id: 'ml', name: 'Meghalaya', isVisited: false, spotsCount: 6 },
      { id: 'uk', name: 'Uttarakhand', isVisited: false, spotsCount: 9 },
      { id: 'hp', name: 'Himachal Pradesh', isVisited: true, verifiedReason: 'Completed Journey', spotsCount: 14 },
    ],
  },
  {
    country: 'Future Expeditions',
    flagEmoji: '🌏',
    isFuture: true,
    states: [
      { id: 'np', name: 'Nepal (Annapurna & Everest Circuits)', isVisited: false, spotsCount: 10 },
      { id: 'bt', name: 'Bhutan (Paro Valley & Punakha)', isVisited: false, spotsCount: 7 },
      { id: 'ch', name: 'Switzerland (Alpine Passes)', isVisited: false, spotsCount: 15 },
    ],
  },
];
