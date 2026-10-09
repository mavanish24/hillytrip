import React from 'react';
import { 
  Users, 
  Camera, 
  PlusCircle, 
  Radio, 
  Star, 
  ShieldAlert, 
  WifiOff, 
  MessageSquare,
  ArrowRight,
  Sparkles,
  MapPin,
  TrendingUp,
  Award
} from 'lucide-react';
import { User, Hub, Route, Destination } from '../types';

interface CommunityHubViewProps {
  user: User | null;
  hubs: Hub[];
  routes: Route[];
  destinations: Destination[];
  bulletinReports: any[];
  navigate: (path: string) => void;
}

export const CommunityHubView: React.FC<CommunityHubViewProps> = ({
  user,
  hubs,
  routes,
  destinations,
  bulletinReports,
  navigate
}) => {
  const COMMUNITY_MODULES = [
    {
      id: 'moments',
      title: 'Traveller Moments',
      subtitle: 'Real photos, trail coordinates, and visual memories from explorers in the Himalayas.',
      path: '/moments',
      icon: Camera,
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-400',
      badge: 'Photos & Trails',
      stats: '1,200+ Moments'
    },
    {
      id: 'contribute',
      title: 'Contributor Desk',
      subtitle: 'Report newly opened homestays, updated taxi fares, or missing mountain shortcuts.',
      path: '/contribute',
      icon: PlusCircle,
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-400',
      badge: 'Community Powered',
      stats: 'Open to All'
    },
    {
      id: 'live-bulletin',
      title: 'Live Transit Bulletin',
      subtitle: 'Real-time road conditions, weather alerts, landslides, and shared syndicate status.',
      path: '/live-bulletin',
      icon: Radio,
      color: 'from-rose-500/20 to-pink-500/20 border-rose-500/30 text-rose-400',
      badge: 'Live Radar',
      stats: `${bulletinReports?.length || 8} Active Reports`
    },
    {
      id: 'feedback',
      title: 'Reviews & Feedback',
      subtitle: 'Verified traveler ratings and authentic reviews of homestays, drivers, and guides.',
      path: '/feedback',
      icon: Star,
      color: 'from-sky-500/20 to-blue-500/20 border-sky-500/30 text-sky-400',
      badge: 'Verified',
      stats: '4.9 ★ Average'
    },
    {
      id: 'survival-index',
      title: 'Survival Index',
      subtitle: 'Emergency mountain contacts, oxygen levels, ATMs, and high-altitude safety tips.',
      path: '/survival-index',
      icon: ShieldAlert,
      color: 'from-purple-500/20 to-indigo-500/20 border-purple-500/30 text-purple-400',
      badge: 'Safety First',
      stats: 'Crucial Guide'
    },
    {
      id: 'offline-center',
      title: 'Offline Travel Hub',
      subtitle: 'Download offline route maps, emergency numbers, and village trails for zero-signal zones.',
      path: '/offline-center',
      icon: WifiOff,
      color: 'from-cyan-500/20 to-teal-500/20 border-cyan-500/30 text-cyan-400',
      badge: 'No Signal Needed',
      stats: 'Offline Cache'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-10 animate-fade-in text-slate-100">
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full filter blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider">
            <Users className="w-3.5 h-3.5" />
            <span>Himalayan Traveler Network</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
            HillyTrip Community Hub
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            A collaborative network connecting travelers, mountain homestay hosts, local taxi syndicates, and field guides across North Bengal & Sikkim.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/moments')}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              Explore Moments
            </button>
            <button
              onClick={() => navigate('/contribute')}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs transition flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              Submit Field Report
            </button>
          </div>
        </div>
      </div>

      {/* Grid of Community Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {COMMUNITY_MODULES.map((mod) => {
          const Icon = mod.icon;
          return (
            <div
              key={mod.id}
              onClick={() => navigate(mod.path)}
              className="group relative bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${mod.color} border flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                    {mod.badge}
                  </span>
                </div>

                <h3 className="text-xl font-black text-white group-hover:text-amber-300 transition-colors">
                  {mod.title}
                </h3>
                <p className="text-slate-400 text-xs mt-2 leading-relaxed">
                  {mod.subtitle}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">{mod.stats}</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Enter <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CommunityHubView;
