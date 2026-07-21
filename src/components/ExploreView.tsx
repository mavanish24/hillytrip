import React, { useState } from 'react';
import { 
  Compass, MapPin, Home, Sparkles, Route, Globe, BookOpen, AlertCircle, 
  ArrowRight, Video, List, Info, Utensils, Star, Image, Calendar, Newspaper
} from 'lucide-react';
import { motion } from 'motion/react';

interface ExploreViewProps {
  navigate: (path: string) => void;
}

export default function ExploreView({ navigate }: ExploreViewProps) {
  const [selectedGuideTopic, setSelectedGuideTopic] = useState<string | null>(null);

  const exploreCategories = [
    { id: 'destinations', label: 'Destinations', emoji: '🏔️', color: 'border-emerald-500 hover:bg-emerald-50/5 dark:hover:bg-emerald-950/5', desc: 'Explore pristine alpine valleys, glaciers, and high-altitude hubs.', path: '#/destinations', icon: MapPin },
    { id: 'homestays', label: 'Homestays', emoji: '🏡', color: 'border-teal-500 hover:bg-teal-50/5 dark:hover:bg-teal-950/5', desc: 'Cozy, verified local houses and wooden mountain cabins.', path: '#/homestays', icon: Home },
    { id: 'attractions', label: 'Attractions', emoji: '✨', color: 'border-purple-500 hover:bg-purple-50/5 dark:hover:bg-purple-950/5', desc: 'Monasteries, engineering landmarks, and waterfall treks.', path: '#/attractions', icon: Sparkles },
    { id: 'routes', label: 'Routes', emoji: '🛣️', color: 'border-sky-500 hover:bg-sky-50/5 dark:hover:bg-sky-950/5', desc: 'High road traverses, pass directories, and difficulty rankings.', path: '#/routes', icon: Route },
    { id: 'travel-guides', label: 'Travel Guide', emoji: '📖', color: 'border-indigo-500 hover:bg-indigo-50/5 dark:hover:bg-indigo-950/5', desc: 'Destination articles, travel vlogs, local cuisines and events.', path: '#/travel-guides', icon: Globe }
  ];

  const guideTopics = [
    { id: 'dest_guides', title: 'Destination Guides', desc: 'Full breakdowns of routes, peaks and hubs.', icon: MapPin, color: 'text-emerald-500 bg-emerald-500/10' },
    { id: 'itineraries', title: 'Suggested Itineraries', desc: 'Handcrafted plans for 3-day to 10-day expeditions.', icon: List, color: 'text-teal-500 bg-teal-500/10' },
    { id: 'vlogs', title: 'Travel Vlogs', desc: 'Immersive visual stories shared by extreme roadtrippers.', icon: Video, color: 'text-red-500 bg-red-500/10' },
    { id: 'tips', title: 'Travel Tips', desc: 'Altitude acclimatization, essential gear and permit updates.', icon: Info, color: 'text-yellow-600 bg-yellow-500/10' },
    { id: 'updates', title: 'Road & Travel Updates', desc: 'Real-time transit bulletins and landslide pass statuses.', icon: AlertCircle, color: 'text-rose-500 bg-rose-500/10' },
    { id: 'food', title: 'Food & Local Cuisine', desc: 'Try Thukpa, butter tea, organic honey, and native grains.', icon: Utensils, color: 'text-amber-500 bg-amber-500/10' },
    { id: 'festivals', title: 'Festivals & Events', desc: 'Experience vibrant monastic dances and local winter fairs.', icon: Calendar, color: 'text-purple-500 bg-purple-500/10' },
    { id: 'stories', title: 'Photo Stories', desc: 'Visual captures of native culture and night sky stargazing.', icon: Image, color: 'text-pink-500 bg-pink-500/10' },
    { id: 'articles', title: 'Latest Articles', desc: 'Deep-dive editorials about mountain conservancies.', icon: Newspaper, color: 'text-sky-500 bg-sky-500/10' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 selection:bg-emerald-500/10">
      
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-950 text-white rounded-3xl p-8 md:p-12 shadow-xl border border-slate-850 relative overflow-hidden">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-400 via-indigo-900 to-transparent"></div>
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="bg-sky-500/10 text-sky-400 border border-sky-500/30 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 animate-spin-slow" /> Discover the Himalayas
          </span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            The Ultimate Traveller's Directory
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Navigate through majestic destinations, book verified homestays, discover hidden high-altitude attractions, and review scenic routes designed specifically for modern mountain explorers.
          </p>
        </div>
      </div>

      {/* EXPLORE DIRECTORY GRID */}
      <div className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Browse Categories</h2>
          <p className="text-xs text-slate-500">Every resource you need to navigate and stay in high mountain country.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {exploreCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => navigate(cat.path)}
              className={`group bg-white dark:bg-slate-900 border ${cat.color} p-6 rounded-2xl text-left cursor-pointer transition duration-200 hover:shadow-md flex flex-col justify-between h-48`}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-2xl select-none">{cat.emoji}</span>
                  <cat.icon className="w-4 h-4 text-slate-400 shrink-0" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-mono">{cat.label}</h3>
                  <p className="text-[11px] text-slate-400 leading-normal">{cat.desc}</p>
                </div>
              </div>
              <div className="text-[9px] font-black text-slate-400 group-hover:text-emerald-500 uppercase tracking-widest flex items-center gap-1">
                <span>Explore</span>
                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* HILLYTRIP TRAVEL GUIDE MODULE */}
      <div className="space-y-6 bg-slate-50 dark:bg-slate-900/40 p-6 md:p-8 rounded-3xl border border-slate-150 dark:border-slate-850/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500 shrink-0" />
              <span>HillyTrip Travel Guide</span>
            </h2>
            <p className="text-xs text-slate-500">Bespoke local insights, packing itineraries, cultural logs, and food reviews.</p>
          </div>
          <button
            onClick={() => navigate('#/travel-guides')}
            className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            <span>Launch Guide Library</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* TOPICS LIST */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {guideTopics.map(topic => (
            <button
              key={topic.id}
              onClick={() => {
                setSelectedGuideTopic(topic.title);
                navigate('#/travel-guides');
              }}
              className="group p-5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl text-left cursor-pointer hover:border-indigo-500/40 transition hover:shadow-xs flex gap-4"
            >
              <div className={`w-10 h-10 ${topic.color} rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                <topic.icon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-indigo-500 transition-colors leading-tight">{topic.title}</h3>
                <p className="text-[10px] text-slate-400 leading-normal">{topic.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
}
