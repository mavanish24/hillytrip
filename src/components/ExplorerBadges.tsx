import React, { useState } from 'react';
import { 
  Compass, Trophy, CheckCircle2, Lock, Unlock, Zap, MapPin, 
  Share2, Award, Printer, HeartHandshake, Eye, Sparkles
} from 'lucide-react';
import { Hub } from '../types';

interface Badge {
  id: string;
  title: string;
  description: string;
  emoji: string;
  requirement: string;
  colorClass: string;
  unlockedIf: (checkedIds: string[], hubs: Hub[]) => boolean;
}

interface ExplorerBadgesProps {
  hubs: Hub[];
  visitedHubIds: string[];
  onToggleHub: (hubId: string) => void;
  setNotification: (notif: { type: 'success' | 'error'; message: string }) => void;
}

export default function ExplorerBadges({
  hubs = [],
  visitedHubIds = [],
  onToggleHub,
  setNotification
}: ExplorerBadgesProps) {
  const safeVisitedHubIds = visitedHubIds || [];
  const safeHubs = hubs || [];
  const [showCertificate, setShowCertificate] = useState(false);

  // Gamified custom badge definitions
  const badgeDefinitions: Badge[] = [
    {
      id: 'badge-wanderer',
      title: 'Valley Wanderer',
      description: 'Acquired footing inside multiple isolated offbeat mountain settlements.',
      emoji: '🛖',
      requirement: 'Visit at least 2 village hubs',
      colorClass: 'from-amber-600 to-yellow-500 shadow-amber-500/10',
      unlockedIf: (checkedIds) => checkedIds.length >= 2
    },
    {
      id: 'badge-pilgrim',
      title: 'High Peak Pilgrim',
      description: 'Sustained acclimated adaptation across more than 5 distinct high altitude ridges.',
      emoji: '🏔️',
      requirement: 'Visit at least 5 village hubs',
      colorClass: 'from-blue-600 to-sky-500 shadow-sky-500/10',
      unlockedIf: (checkedIds) => checkedIds.length >= 5
    },
    {
      id: 'badge-transit',
      title: 'Caravan Pathfinder',
      description: 'Navigated the historic plains-to-hills base transit corridors.',
      emoji: '🚖',
      requirement: 'Check both base transits (NJP Airport and Siliguri town hubs)',
      colorClass: 'from-emerald-600 to-teal-500 shadow-teal-500/10',
      unlockedIf: (checkedIds) => checkedIds.includes('njp') && (checkedIds.includes('siliguri') || checkedIds.includes('bagdogra'))
    },
    {
      id: 'badge-highpass',
      title: 'Ridge Climber Maverick',
      description: 'Conquered the high-altitude forested sanctuaries of Lava, Rishop or Pedong segments.',
      emoji: '🦅',
      requirement: 'Check off Lava, Rishop or Pedong segments',
      colorClass: 'from-indigo-600 to-purple-500 shadow-purple-500/10',
      unlockedIf: (checkedIds) => checkedIds.includes('lava') || checkedIds.includes('rishop') || checkedIds.includes('pedong')
    },
    {
      id: 'badge-cultural',
      title: 'Darjeeling Insider',
      description: 'Immersed directly into the legendary heritage heart of tea gardens and ridge steam loops.',
      emoji: '🕉️',
      requirement: 'Visit historic Darjeeling base town hub',
      colorClass: 'from-orange-600 to-rose-500 shadow-rose-500/10',
      unlockedIf: (checkedIds) => checkedIds.includes('darjeeling') || checkedIds.includes('ghoom')
    }
  ];

  const totalScore = safeVisitedHubIds.length * 150 + badgeDefinitions.filter(b => b.unlockedIf(safeVisitedHubIds, safeHubs)).length * 500;
  
  const getRank = (score: number) => {
    if (score >= 3500) return 'High Altitude Sherpa Maverick';
    if (score >= 2000) return 'Himalayan Ridge Pathfinder';
    if (score >= 800) return 'Active Valley Wanderer';
    return 'Base Camp Aspirant';
  };

  const handleShareCertificate = () => {
    const unlocked = badgeDefinitions.filter(b => b.unlockedIf(safeVisitedHubIds, safeHubs)).map(b => b.emoji + ' ' + b.title).join(', ');
    const text = `🏔️ HILLITRIP TRAVEL ACCREDITATION: I am certified as a [${getRank(totalScore)}] with ${safeVisitedHubIds.length} village crossings locked in! Saved badges: ${unlocked || 'None yet'}. Join the intelligence mountain travel network at HillyTrip! 🛖`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div id="explorer-badges-root" className="space-y-8 text-slate-800 dark:text-slate-100">
      
      {/* Top Level Gamified Scoreboard Overview Card */}
      <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 text-white border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl text-left relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800" className="w-full h-full object-cover" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-stretch gap-6">
          <div className="space-y-3.5 flex-1">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] uppercase font-black tracking-wider font-mono">
              Mountain Explorer Loyalty Level
            </span>
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="text-2xl md:text-3xl font-black tracking-tight">{getRank(totalScore)}</h3>
              <Trophy className="w-6 h-6 text-amber-400 shrink-0" />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
              Gain points and unlock certification badges as you navigate through remote Himalayan villages, homestays, and high ridges. Keep returning to log your offbeat mountain tracks!
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-2">
              <div className="text-left">
                <span className="text-[10px] uppercase text-slate-400 block font-mono">Total score index</span>
                <span className="text-base font-black font-mono text-emerald-400">{totalScore} Points</span>
              </div>
              <div className="text-left">
                <span className="text-[10px] uppercase text-slate-400 block font-mono">Villages Visited</span>
                <span className="text-base font-black font-mono text-sky-400">{visitedHubIds.length} / {hubs.length || 0} locations</span>
              </div>
            </div>
          </div>

          <div className="shrink-0 flex items-center justify-start md:justify-center">
            {visitedHubIds.length > 0 && (
              <button
                onClick={() => setShowCertificate(true)}
                className="px-5 py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs font-mono uppercase tracking-wider rounded-xl transition shadow-md shadow-amber-600/10 flex items-center gap-2 cursor-pointer"
              >
                <Award className="w-4.5 h-4.5" />
                Inspect Travel Safe Certificate
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Badges Display Row */}
      <div className="space-y-4 text-left">
        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 font-mono">My Unlocked Achievements</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {badgeDefinitions.map(badge => {
            const unlocked = badge.unlockedIf(visitedHubIds, hubs);
            return (
              <div 
                key={badge.id}
                className={`p-4 rounded-2xl border transition relative flex flex-col items-center text-center justify-between gap-3 ${
                  unlocked
                    ? 'bg-gradient-to-tr bg-white dark:bg-slate-900 border-emerald-500/20 dark:border-emerald-500/30 shadow-md transform hover:scale-[1.02]'
                    : 'bg-slate-50/40 dark:bg-slate-900/40 border-slate-205 dark:border-slate-855 opacity-60'
                }`}
              >
                {/* Badge Icon circle */}
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr flex items-center justify-center text-3xl shrink-0 shadow-lg relative ${
                  unlocked ? badge.colorClass : 'from-slate-201 to-slate-250 dark:from-slate-850 dark:to-slate-950 text-slate-400 shadow-none border border-slate-300'
                }`}>
                  {unlocked ? (
                    <span>{badge.emoji}</span>
                  ) : (
                    <Lock className="w-5 h-5 text-slate-400" />
                  )}
                  
                  {unlocked && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 border border-white text-white flex items-center justify-center text-[8px] font-black leading-none">
                      ✓
                    </span>
                  )}
                </div>

                <div>
                  <h5 className="font-extrabold text-xs text-slate-900 dark:text-white leading-tight">
                    {badge.title}
                  </h5>
                  <p className="text-[10px] text-slate-450 mt-1 line-clamp-3">
                    {badge.description}
                  </p>
                </div>

                <span className="text-[9px] font-mono font-black uppercase text-slate-400 tracking-wider">
                  {badge.requirement}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Villages Checklist Grid layout */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 rounded-3xl p-6 text-left">
        <div className="border-b border-slate-100 dark:border-slate-805 pb-3 mb-5">
          <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-600" />
            Himalayan Villages Checked List
          </h4>
          <p className="text-[11px] text-slate-450 mt-0.5">
            Tick off the valley settlements, major high points and transit stations you have successfully reached. Gain 150 points per tick!
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
          {hubs.map((hub) => {
            const checked = visitedHubIds.includes(hub.id);
            return (
              <label 
                key={`check-badge-hub-${hub.id}`}
                className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all duration-150 cursor-pointer select-none text-[11px] ${
                  checked
                    ? 'bg-emerald-500/5 text-emerald-800 dark:text-emerald-300 border-emerald-500/25 font-bold shadow-2xs'
                    : 'bg-slate-50/40 dark:bg-slate-950/40 text-slate-550 dark:text-slate-450 border-slate-201 dark:border-slate-851 hover:bg-slate-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    onToggleHub(hub.id);
                    setNotification({
                      type: 'success',
                      message: checked 
                        ? `Removed checkpoint: ${hub.name}` 
                        : `Congratulations! Checkpoint reached: ${hub.name} (+150 Points)`
                    });
                  }}
                  className="rounded text-emerald-600 border-slate-350 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
                />
                <span className="truncate">{hub.name}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Sharing Certificate Modal overlay */}
      {showCertificate && (
        <div className="fixed inset-0 z-[10005] bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-805 rounded-3xl p-6 md:p-8 max-w-lg w-full text-center relative shadow-2xl space-y-6">
            <button
              onClick={() => setShowCertificate(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-800 dark:hover:text-white cursor-pointer select-none font-black text-sm"
            >
              ✕
            </button>

            <div className="border-4 border-amber-500/30 p-5 rounded-2xl space-y-4">
              <Award className="w-12 h-12 text-amber-500 mx-auto animate-bounce" />
              
              <div className="text-center">
                <span className="text-[10px] tracking-widest uppercase font-mono font-black text-amber-500 block mb-1">Mountain Exploration Registry</span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">HillyTrip Accredited Certificate</h3>
                <span className="inline-block w-16 h-1 bg-amber-500 rounded-full mt-1"></span>
              </div>

              <div className="py-2 inline-block">
                <p className="text-xs text-slate-500">This certifies that traveler</p>
                <h4 className="text-lg font-black text-slate-850 dark:text-emerald-400 mt-1 uppercase font-mono">Authentic Explorer Scout</h4>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm mx-auto font-medium">
                Has successfully checked off <strong className="text-sky-500 font-bold">{visitedHubIds.length} mountain checkpoints</strong>, unlocked premium regional travel accomplishments, and is recognized under the permanent rank of:
              </p>

              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border select-all font-mono font-black text-sm text-center text-slate-800 dark:text-slate-100">
                ⭐ {getRank(totalScore)}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  window.print();
                }}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 border dark:border-slate-700 font-extrabold text-xs font-mono uppercase tracking-wider rounded-xl hover:bg-slate-200 transition text-slate-700 dark:text-slate-205 cursor-pointer"
              >
                Print Certificate
              </button>
              <button
                onClick={handleShareCertificate}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs font-mono uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                Share Certificate
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
