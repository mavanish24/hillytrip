import React from 'react';
import { MapPin, Mountain, Home, Car, Route, Gift, Sparkles } from 'lucide-react';

export interface NavItemConfig {
  id: string; // 'villages' | 'attractions' | 'stays' | 'taxi' | 'explore' | 'offers' | 'ai-planner'
  tabId: 'village' | 'destination' | 'attraction' | 'homestay' | 'taxi' | 'journeys' | 'explore' | 'offers' | 'ai-planner';
  label: string; // 'Villages' | 'Attractions' | 'Stays' | 'Taxi' | 'Explore' | 'Offers' | 'AI Planner'
  heroTabLabel: string; // 'Village' | 'Attraction' | 'Homestay' | 'Taxi' | 'Explore' | 'Offers'
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  emoji: string; // 🏔, 📍, 🏡, 🚖, 🧭, 🎁, ✨
  iconColor: string;
  isAi?: boolean;
  badge?: string; // 'NEW'
  badgeColor?: 'orange-red' | 'amber' | 'emerald' | 'rose';
  supportsHeroTab: boolean;
}

export const MAIN_NAVIGATION: NavItemConfig[] = [
  {
    id: 'villages',
    tabId: 'village',
    label: 'Villages',
    heroTabLabel: 'Village',
    path: '#/villages',
    icon: Mountain,
    emoji: '🏔',
    iconColor: 'text-amber-400',
    supportsHeroTab: true,
  },
  {
    id: 'attractions',
    tabId: 'attraction',
    label: 'Attractions',
    heroTabLabel: 'Attraction',
    path: '#/attractions',
    icon: Mountain,
    emoji: '🏔',
    iconColor: 'text-emerald-400',
    supportsHeroTab: true,
  },
  {
    id: 'stays',
    tabId: 'homestay',
    label: 'Stays',
    heroTabLabel: 'Homestay',
    path: '#/homestays',
    icon: Home,
    emoji: '🏡',
    iconColor: 'text-sky-400',
    supportsHeroTab: true,
  },
  {
    id: 'taxi',
    tabId: 'taxi',
    label: 'Taxi',
    heroTabLabel: 'Taxi',
    path: '#/taxi',
    icon: Car,
    emoji: '🚖',
    iconColor: 'text-amber-300',
    supportsHeroTab: true,
  },
  {
    id: 'explore',
    tabId: 'explore',
    label: 'Explore',
    heroTabLabel: 'Explore',
    path: '#/explore',
    icon: Route,
    emoji: '🧭',
    iconColor: 'text-emerald-400',
    supportsHeroTab: true,
  },
  {
    id: 'offers',
    tabId: 'offers',
    label: 'Offers',
    heroTabLabel: 'Offers',
    path: '#/offers',
    icon: Gift,
    emoji: '🎁',
    iconColor: 'text-rose-400',
    badge: 'NEW',
    badgeColor: 'orange-red',
    supportsHeroTab: true,
  },
  {
    id: 'ai-planner',
    tabId: 'ai-planner',
    label: 'AI Planner',
    heroTabLabel: 'AI Planner',
    path: '#/ai-planner',
    icon: Sparkles,
    emoji: '✨',
    iconColor: 'text-amber-300',
    isAi: true,
    supportsHeroTab: false,
  },
];

// Helper to get Hero Search Tabs dynamically from shared config
export const HERO_SEARCH_TABS = MAIN_NAVIGATION.filter(item => item.supportsHeroTab);

// Rotating dynamic placeholder queries specifically for the Offers search tab
export const OFFERS_ROTATING_PLACEHOLDERS = [
  'Darjeeling Offers...',
  'Gangtok Deals...',
  'Homestay Offers...',
  'Taxi Offers...',
  'Weekend Packages...',
  'Festival Offers...',
];
