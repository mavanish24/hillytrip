import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, MapPin, Award, Star, Heart, Camera, Compass, Globe, 
  MessageSquare, Share2, CheckCircle2, ArrowLeft, Image as ImageIcon,
  Sparkles, Calendar, ShieldCheck, Flame, ChevronRight, Activity
} from 'lucide-react';
import { TravelPassport } from './TravelPassport';
import { 
  calculateExplorerScore, 
  getExplorerLevel, 
  DEFAULT_PASSPORT_REGIONS,
  CommunityUserStats 
} from '../lib/explorerSystem';

export interface PublicProfileData {
  id: string;
  name: string;
  username: string;
  avatarUrl: string;
  coverUrl: string;
  bio: string;
  homeLocation: string;
  memberSince: string;
  stats: CommunityUserStats;
  badges: Array<{ id: string; title: string; emoji: string; category: string }>;
  visitedDestinations: Array<{ name: string; state: string; image: string }>;
  visitedAttractions: Array<{ name: string; rating: number; image: string }>;
  moments: Array<{ id: string; title: string; text: string; image: string; likes: number; date: string }>;
  reviews: Array<{ id: string; title: string; rating: number; text: string; date: string }>;
  achievements: Array<{ id: string; title: string; description: string; date: string }>;
  recentActivity: Array<{ id: string; action: string; target: string; date: string }>;
}

export const MOCK_PUBLIC_PROFILES: Record<string, PublicProfileData> = {
  'tashi_explorer': {
    id: 'u-tashi',
    name: 'Tashi Namgyal',
    username: 'tashi_explorer',
    avatarUrl: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
    coverUrl: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
    bio: 'High-altitude Himalayan trekker, photographer & mountain conservationist based in Gangtok. Exploring remote ridges since 2018.',
    homeLocation: 'Gangtok, Sikkim, India',
    memberSince: 'March 2024',
    stats: {
      photosCount: 28,
      reviewsCount: 19,
      likesCount: 342,
      destinationsVisitedCount: 14,
      attractionsVisitedCount: 26,
      journeysCompletedCount: 8,
      badgesUnlockedCount: 5,
    },
    badges: [
      { id: 'b1', title: 'Himalayan Legend', emoji: '👑', category: 'Mastery' },
      { id: 'b2', title: 'Sikkim Circuit Veteran', emoji: '🏔️', category: 'Exploration' },
      { id: 'b3', title: 'Top Photo Contributor', emoji: '📸', category: 'Community' },
      { id: 'b4', title: 'High Pass Pathfinder', emoji: '🦅', category: 'Trekking' },
    ],
    visitedDestinations: [
      { name: 'Pelling', state: 'West Sikkim', image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png' },
      { name: 'Yuksom', state: 'West Sikkim', image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png' },
      { name: 'Lachen', state: 'North Sikkim', image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png' },
      { name: 'Darjeeling', state: 'West Bengal', image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png' },
    ],
    visitedAttractions: [
      { name: 'Gurudongmar Lake', rating: 5, image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png' },
      { name: 'Rumtek Monastery', rating: 5, image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png' },
      { name: 'Tiger Hill Sunrise Point', rating: 4.9, image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png' },
    ],
    moments: [
      {
        id: 'm1',
        title: 'Morning Reflections at Gurudongmar Lake',
        text: 'Reaching 17,800ft at dawn. The crystal waters reflecting the sacred snowy peaks of North Sikkim left our entire team speechless.',
        image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
        likes: 124,
        date: '3 days ago'
      },
      {
        id: 'm2',
        title: 'Takdah Tea Garden Pine Forests',
        text: 'Wandering through Takdah fog trails. The aroma of wild orchids and old cedar wood is unforgettable.',
        image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
        likes: 88,
        date: '1 week ago'
      }
    ],
    reviews: [
      {
        id: 'r1',
        title: 'Pine Crest Wood Cabin (Solang Valley)',
        rating: 5,
        text: 'Spectacular stay! Warm local hospitality, authentic wood fireplaces and freshly brewed Himalayan herbal tea.',
        date: '2 weeks ago'
      },
      {
        id: 'r2',
        title: 'North Sikkim 4x4 Transit Service',
        rating: 5,
        text: 'Extremely professional driver. Navigated the rugged mountain passes to Yumthang Valley effortlessly.',
        date: '1 month ago'
      }
    ],
    achievements: [
      { id: 'a1', title: 'High Altitude Master', description: 'Crossed 3 high passes above 15,000ft elevation.', date: 'June 2026' },
      { id: 'a2', title: 'Community Champion', description: 'Reached 300+ community likes across moments & reviews.', date: 'May 2026' }
    ],
    recentActivity: [
      { id: 'act1', action: 'Uploaded a photo moment', target: 'Gurudongmar Lake', date: '3 days ago' },
      { id: 'act2', action: 'Unlocked badge', target: 'Himalayan Legend 👑', date: '1 week ago' },
      { id: 'act3', action: 'Reviewed', target: 'Pine Crest Wood Cabin', date: '2 weeks ago' }
    ]
  },
  'sneha_travels': {
    id: 'u-sneha',
    name: 'Sneha Gupta',
    username: 'sneha_travels',
    avatarUrl: 'https://api.dicebear.com/7.x/initials/svg?seed=HillyTripTraveler',
    coverUrl: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
    bio: 'Solo traveler & homestay enthusiast. Documenting cultural heritage, local food recipes & tea garden trails.',
    homeLocation: 'Kolkata, West Bengal, India',
    memberSince: 'January 2025',
    stats: {
      photosCount: 16,
      reviewsCount: 12,
      likesCount: 185,
      destinationsVisitedCount: 8,
      attractionsVisitedCount: 15,
      journeysCompletedCount: 4,
      badgesUnlockedCount: 3,
    },
    badges: [
      { id: 'b1', title: 'Mountain Explorer', emoji: '🏔️', category: 'Exploration' },
      { id: 'b2', title: 'Valley Wanderer', emoji: '🛖', category: 'Culture' },
    ],
    visitedDestinations: [
      { name: 'Takdah', state: 'West Bengal', image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png' },
      { name: 'Ravangla', state: 'South Sikkim', image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png' },
    ],
    visitedAttractions: [
      { name: 'Buddha Park Ravangla', rating: 5, image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png' }
    ],
    moments: [
      {
        id: 'm1',
        title: 'Takdah Heritage Bungalow Afternoon Tea',
        text: 'Enjoying traditional Darjeeling First Flush tea while watching clouds roll over the forest canopy.',
        image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
        likes: 64,
        date: '5 days ago'
      }
    ],
    reviews: [
      {
        id: 'r1',
        title: 'Takdah Heritage Homestay',
        rating: 5,
        text: 'The hospitality of the Gurung family was phenomenal!',
        date: '1 week ago'
      }
    ],
    achievements: [
      { id: 'a1', title: 'Culture Collector', description: 'Visited 5 heritage village settlements.', date: 'July 2026' }
    ],
    recentActivity: [
      { id: 'act1', action: 'Posted a review', target: 'Takdah Heritage Homestay', date: '1 week ago' }
    ]
  }
};

interface PublicTravelerProfileProps {
  username?: string;
  profileData?: PublicProfileData;
  onNavigate?: (path: string) => void;
  navigate?: (path: string) => void;
  onBack?: () => void;
}

export const PublicTravelerProfile: React.FC<PublicTravelerProfileProps> = ({
  username = 'tashi_explorer',
  profileData,
  onNavigate,
  navigate,
  onBack
}) => {
  const handleNav = onNavigate || navigate;
  const profile = profileData || MOCK_PUBLIC_PROFILES[username] || MOCK_PUBLIC_PROFILES['tashi_explorer'];
  const [activeTab, setActiveTab] = useState<'overview' | 'passport' | 'moments' | 'reviews' | 'destinations'>('overview');

  const score = calculateExplorerScore(profile.stats);
  const { currentLevel, nextLevel, progressPercent } = getExplorerLevel(score);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-24">
      {/* Top Back Navigation Bar */}
      <div className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <button
          onClick={onBack || (() => onNavigate?.('#/'))}
          className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition cursor-pointer min-h-[44px] min-w-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explorer</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({ title: `${profile.name}'s HillyTrip Profile`, url: window.location.href });
              }
            }}
            className="p-2.5 rounded-full bg-slate-900 border border-white/10 hover:bg-slate-800 text-slate-300 hover:text-white transition min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            title="Share Traveler Identity Profile"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Cover Banner */}
      <div className="relative h-48 sm:h-64 lg:h-80 w-full overflow-hidden bg-slate-900">
        <img 
          src={profile.coverUrl} 
          alt="Cover" 
          className="w-full h-full object-cover" 
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
      </div>

      {/* Main Profile Header Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative -mt-20 z-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            {/* Avatar */}
            <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl p-1 bg-gradient-to-tr from-amber-500 via-emerald-400 to-sky-500 shadow-2xl shrink-0">
              <img 
                src={profile.avatarUrl} 
                alt={profile.name} 
                className="w-full h-full rounded-[22px] object-cover bg-slate-900 border-2 border-slate-950" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute -bottom-2 -right-2 px-2.5 py-1 rounded-full bg-slate-950 border border-amber-400/40 text-[10px] font-black text-amber-300 flex items-center gap-1 shadow-md">
                <span>{currentLevel.badgeEmoji}</span>
                <span>Lvl {currentLevel.level}</span>
              </div>
            </div>

            {/* Profile Info */}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">{profile.name}</h1>
                <span className="text-xs font-mono font-bold text-amber-400">@{profile.username}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" /> Verified Traveler
                </span>
              </div>

              <div className="mt-1 flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" /> {profile.homeLocation}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-sky-400" /> Member since {profile.memberSince}
                </span>
              </div>

              <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                {profile.bio}
              </p>
            </div>
          </div>

          {/* Explorer Level Badge Card */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 shadow-xl shrink-0 space-y-2 sm:w-64">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-amber-300 flex items-center gap-1">
                <Award className="w-4 h-4" /> Explorer Rank
              </span>
              <span className="font-mono text-xs font-black text-white">{score} pts</span>
            </div>
            <div className="text-sm font-black text-white flex items-center gap-1.5">
              <span>{currentLevel.badgeEmoji}</span>
              <span>{currentLevel.title}</span>
            </div>

            {/* Progress bar */}
            {nextLevel && (
              <div className="space-y-1">
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500" 
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                  <span>Level {currentLevel.level}</span>
                  <span>Level {nextLevel.level} ({progressPercent}%)</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* =========================================================
            PUBLIC COMMUNITY STATISTICS GRID (Only Public Community Stats!)
            ========================================================= */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 text-center space-y-1">
            <div className="text-xl sm:text-2xl font-black text-amber-400">📸 {profile.stats.photosCount}</div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Photos Uploaded</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 text-center space-y-1">
            <div className="text-xl sm:text-2xl font-black text-amber-300">⭐ {profile.stats.reviewsCount}</div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Reviews Submitted</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 text-center space-y-1">
            <div className="text-xl sm:text-2xl font-black text-rose-400">❤️ {profile.stats.likesCount}</div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Likes Received</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 text-center space-y-1">
            <div className="text-xl sm:text-2xl font-black text-emerald-400">🗺️ {profile.stats.destinationsVisitedCount}</div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Destinations Visited</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 text-center space-y-1">
            <div className="text-xl sm:text-2xl font-black text-sky-400">📍 {profile.stats.attractionsVisitedCount}</div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Attractions Visited</div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/80 border border-white/10 text-center space-y-1">
            <div className="text-xl sm:text-2xl font-black text-purple-400">🥾 {profile.stats.journeysCompletedCount}</div>
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Journeys Completed</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 gap-2 overflow-x-auto custom-scrollbar">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'passport', label: 'Travel Passport 🛂' },
            { id: 'moments', label: `Moments (${profile.moments.length})` },
            { id: 'reviews', label: `Reviews (${profile.reviews.length})` },
            { id: 'destinations', label: `Visited Places (${profile.visitedDestinations.length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 text-xs font-black transition-all cursor-pointer whitespace-nowrap border-b-2 min-h-[44px] ${
                activeTab === tab.id
                  ? 'border-amber-400 text-amber-300'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB CONTENTS */}
        {activeTab === 'passport' && (
          <TravelPassport userName={profile.name} explorerLevelTitle={currentLevel.title} />
        )}

        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Travel Passport Quick Overview */}
            <TravelPassport userName={profile.name} explorerLevelTitle={currentLevel.title} />

            {/* Badges Section */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 space-y-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" /> Community Badges & Accreditations
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {profile.badges.map(b => (
                  <div key={b.id} className="p-4 rounded-2xl bg-slate-950 border border-amber-500/20 flex flex-col items-center text-center space-y-1">
                    <span className="text-3xl">{b.emoji}</span>
                    <span className="text-xs font-black text-white">{b.title}</span>
                    <span className="text-[10px] text-amber-400 font-bold">{b.category}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Traveller Moments */}
            <div className="space-y-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Camera className="w-5 h-5 text-sky-400" /> Traveller Moments
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profile.moments.map(m => (
                  <div key={m.id} className="rounded-2xl overflow-hidden bg-slate-900 border border-white/10 group hover:border-amber-400/40 transition">
                    <div className="h-44 w-full overflow-hidden relative">
                      <img src={m.image} alt={m.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" referrerPolicy="no-referrer" />
                      <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-slate-950/80 text-[10px] font-bold text-rose-400 flex items-center gap-1">
                        <Heart className="w-3 h-3 fill-rose-400" /> {m.likes}
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <h4 className="text-sm font-black text-white group-hover:text-amber-300 transition">{m.title}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">{m.text}</p>
                      <div className="text-[10px] font-mono text-slate-400">{m.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Visited Destinations */}
            <div className="space-y-4">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-400" /> Visited Destinations & Spots
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {profile.visitedDestinations.map((d, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden bg-slate-900 border border-white/10 p-3 space-y-2">
                    <img src={d.image} alt={d.name} className="w-full h-24 object-cover rounded-xl" referrerPolicy="no-referrer" />
                    <div>
                      <div className="text-xs font-black text-white">{d.name}</div>
                      <div className="text-[10px] text-emerald-400 font-bold">{d.state}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements & Activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 space-y-4">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" /> Himalayan Achievements
                </h3>
                <div className="space-y-3">
                  {profile.achievements.map(ach => (
                    <div key={ach.id} className="p-3 rounded-xl bg-slate-950 border border-white/5 space-y-0.5">
                      <div className="text-xs font-black text-amber-300">{ach.title}</div>
                      <div className="text-xs text-slate-300">{ach.description}</div>
                      <div className="text-[9px] font-mono text-slate-500">{ach.date}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/80 border border-white/10 space-y-4">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-sky-400" /> Recent Community Activity
                </h3>
                <div className="space-y-3">
                  {profile.recentActivity.map(act => (
                    <div key={act.id} className="flex items-start justify-between text-xs p-2.5 rounded-xl bg-slate-950 border border-white/5">
                      <div>
                        <span className="font-bold text-slate-300">{act.action}</span>{' '}
                        <span className="font-black text-amber-300">{act.target}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">{act.date}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'moments' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {profile.moments.map(m => (
              <div key={m.id} className="rounded-2xl overflow-hidden bg-slate-900 border border-white/10 p-4 space-y-3">
                <img src={m.image} alt={m.title} className="w-full h-48 object-cover rounded-xl" referrerPolicy="no-referrer" />
                <h4 className="text-sm font-black text-white">{m.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{m.text}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-4">
            {profile.reviews.map(r => (
              <div key={r.id} className="p-5 rounded-2xl bg-slate-900 border border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-white">{r.title}</h4>
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" /> {r.rating} / 5
                  </div>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{r.text}</p>
                <div className="text-[10px] font-mono text-slate-500">{r.date}</div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'destinations' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {profile.visitedDestinations.map((d, i) => (
              <div key={i} className="rounded-2xl overflow-hidden bg-slate-900 border border-white/10 p-3 space-y-2">
                <img src={d.image} alt={d.name} className="w-full h-32 object-cover rounded-xl" referrerPolicy="no-referrer" />
                <div>
                  <div className="text-sm font-black text-white">{d.name}</div>
                  <div className="text-xs text-emerald-400 font-bold">{d.state}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicTravelerProfile;
