import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Calendar, MapPin, Clock, DollarSign, 
  ChevronRight, Heart, Share2, Save, Printer, RefreshCw, 
  ShieldCheck, Car, Home, AlertCircle, CheckCircle2, 
  Info, Compass, ArrowRight, Eye, MessageSquare, Coffee, Sun, Cloud, Utensils,
  Sliders, Route, Award, Check
} from 'lucide-react';
import { TripPlan, AttractionDetailsCard, RankedHomestayRecommendation } from '../services/planner/SmartPlannerEngine';
import { HillyV1Mascot } from './HillyV1Mascot';

interface SmartPlannerDashboardProps {
  plan: TripPlan;
  onModifyTrip: (action: string) => void;
  onResetWizard: () => void;
  onSelectAttraction?: (attractionName: string) => void;
  onSelectHomestay?: (homestay: any) => void;
  onBookTaxi?: (taxiInfo: any) => void;
}

export default function SmartPlannerDashboard({
  plan,
  onModifyTrip,
  onResetWizard,
  onSelectAttraction,
  onSelectHomestay,
  onBookTaxi
}: SmartPlannerDashboardProps) {
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [selectedAttractionModal, setSelectedAttractionModal] = useState<AttractionDetailsCard | null>(null);
  const [selectedHomestayModal, setSelectedHomestayModal] = useState<RankedHomestayRecommendation | null>(null);
  const [customModifyInput, setCustomModifyInput] = useState('');
  const [isModifying, setIsModifying] = useState(false);
  const [savedSuccessNotif, setSavedSuccessNotif] = useState(false);

  const modifyPanelRef = useRef<HTMLDivElement>(null);

  const activeDay = plan.dailyPlans[activeDayIndex] || plan.dailyPlans[0];

  const handleQuickModify = (action: string) => {
    setIsModifying(true);
    onModifyTrip(action);
    setTimeout(() => setIsModifying(false), 500);
  };

  const handleCustomModifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customModifyInput.trim()) return;
    setIsModifying(true);
    onModifyTrip(customModifyInput.trim());
    setCustomModifyInput('');
    setTimeout(() => setIsModifying(false), 500);
  };

  const handleSaveTrip = () => {
    try {
      const existing = JSON.parse(localStorage.getItem('hillytrip_saved_plans') || '[]');
      existing.unshift({ ...plan, savedAt: new Date().toISOString() });
      localStorage.setItem('hillytrip_saved_plans', JSON.stringify(existing.slice(0, 10)));
      setSavedSuccessNotif(true);
      setTimeout(() => setSavedSuccessNotif(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleShareTrip = () => {
    if (navigator.share) {
      navigator.share({
        title: `HillyTrip ${plan.input.days}-Day Itinerary`,
        text: `Check out my custom ${plan.input.days}-day trip to ${activeDay?.destinationName || 'Himalayas'} generated with HillyTrip!`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const scrollToModify = () => {
    if (modifyPanelRef.current) {
      modifyPanelRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="w-full bg-slate-950 text-slate-100 min-h-screen font-sans pb-20">
      
      {/* 1. HERO SUMMARY BAR */}
      <header className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/90 border-b border-slate-800/80 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Title & Metadata */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/10">
                <HillyV1Mascot pose="standing" size="sm" isAnimated={false} showNameTag={false} />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                    <Award className="w-3 h-3 text-emerald-400" />
                    Match Score: {plan.tripScore}/100
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/30">
                    {plan.input.month || 'October'} • {plan.input.budget || 'Moderate'}
                  </span>
                </div>
                <h1 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                  {plan.input.days}-Day {plan.input.tripType || 'Himalayan'} Journey
                </h1>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                  Starting from <strong className="text-slate-200">{plan.input.startingLocation}</strong>
                </p>
              </div>
            </div>

            {/* Action Toolbar */}
            <div className="flex items-center gap-2 self-start md:self-auto shrink-0 flex-wrap">
              <button
                onClick={handleSaveTrip}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-all shadow-sm cursor-pointer"
              >
                <Save className="w-3.5 h-3.5 text-emerald-400" />
                <span>{savedSuccessNotif ? 'Saved!' : 'Save'}</span>
              </button>
              
              <button
                onClick={handleShareTrip}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-all shadow-sm cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Share</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-all shadow-sm cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-amber-400" />
                <span>Print</span>
              </button>

              <button
                onClick={scrollToModify}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5 border border-emerald-500/30 text-emerald-300 transition-all shadow-sm cursor-pointer"
              >
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                <span>Modify Trip</span>
              </button>

              <button
                onClick={onResetWizard}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>New Trip</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* 2. TRIP OVERVIEW CARDS (6 Grid Metrics) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          
          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-md hover:border-emerald-500/30 transition-all">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <DollarSign className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Est. Budget</span>
            </div>
            <div className="text-base sm:text-lg font-black text-amber-300 truncate">
              ₹{plan.summary.totalBudget.toLocaleString('en-IN')}
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">All-inclusive est.</span>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-md hover:border-emerald-500/30 transition-all">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Route className="w-4 h-4 text-sky-400 shrink-0" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Distance</span>
            </div>
            <div className="text-base sm:text-lg font-black text-sky-300 truncate">
              {plan.summary.totalDistanceKm} km
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">{plan.summary.totalDrivingHours} hrs driving</span>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-md hover:border-emerald-500/30 transition-all">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Calendar className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Duration</span>
            </div>
            <div className="text-base sm:text-lg font-black text-emerald-300 truncate">
              {plan.input.days} Days / {plan.summary.totalNights} Nights
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">Custom roadmap</span>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-md hover:border-emerald-500/30 transition-all">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Home className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Homestays</span>
            </div>
            <div className="text-base sm:text-lg font-black text-purple-300 truncate">
              {plan.summary.homestaysCount} Stays
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">Verified local hosts</span>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-md hover:border-emerald-500/30 transition-all">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Car className="w-4 h-4 text-amber-400 shrink-0" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Transit</span>
            </div>
            <div className="text-base sm:text-lg font-black text-white truncate">
              {plan.summary.recommendedTaxiOption?.type || plan.input.transport || 'Reserved SUV'}
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">Mountain drivers</span>
          </div>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-md hover:border-emerald-500/30 transition-all">
            <div className="flex items-center gap-2 text-slate-400 mb-1">
              <Compass className="w-4 h-4 text-rose-400 shrink-0" />
              <span className="text-[11px] font-bold uppercase tracking-wider">Attractions</span>
            </div>
            <div className="text-base sm:text-lg font-black text-rose-300 truncate">
              {plan.summary.attractionsCount} Landmarks
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">Handpicked spots</span>
          </div>

        </div>
      </section>

      {/* 3. MAIN 12-COLUMN DASHBOARD GRID */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          
          {/* MAIN ITINERARY COLUMN (8 Cols) */}
          <div className="lg:col-span-8 space-y-8">

            {/* DAY SELECTOR TABS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  Daily Itinerary Schedule
                </h2>
                <span className="text-xs text-slate-400">Select Day to View Details</span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {plan.dailyPlans.map((day, idx) => {
                  const isActive = idx === activeDayIndex;
                  return (
                    <button
                      key={day.dayNumber}
                      onClick={() => setActiveDayIndex(idx)}
                      className={`px-4 py-3 rounded-2xl text-xs sm:text-sm font-black transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                        isActive
                          ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20 scale-[1.02]'
                          : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      <span>Day {day.dayNumber}</span>
                      <span className={`text-[11px] font-medium hidden sm:inline ${isActive ? 'text-slate-900/80' : 'text-slate-400'}`}>
                        ({day.destinationName})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ACTIVE DAY HEADER CARD */}
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{activeDay.startPoint} ➔ {activeDay.destinationName}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white">
                    Day {activeDay.dayNumber}: {activeDay.title}
                  </h3>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Est. Day Cost</span>
                    <span className="text-sm font-black text-amber-300">₹{activeDay.metrics.estimatedCost.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Distance</span>
                    <span className="text-sm font-black text-sky-300">{activeDay.metrics.distanceKm} km</span>
                  </div>
                  <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Drive Time</span>
                    <span className="text-sm font-black text-emerald-300">{Math.round(activeDay.metrics.drivingTimeMins / 60 * 10) / 10} hrs</span>
                  </div>
                </div>
              </div>

              {/* TIMELINE LIST */}
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  Day Timeline & Activities
                </h4>

                <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                  {activeDay.timeline.map((step, sIdx) => (
                    <div 
                      key={sIdx} 
                      className="relative p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="absolute -left-6 top-5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-slate-950" />

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                            {step.time}
                          </span>
                          <span className="text-sm font-bold text-white">{step.title}</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{step.description}</p>
                      </div>

                      {step.attractionData && (
                        <button
                          onClick={() => setSelectedAttractionModal(step.attractionData!)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-bold shrink-0 self-start sm:self-auto flex items-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* RECOMMENDED ATTRACTIONS SECTION */}
            {activeDay.attractions.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-emerald-400" />
                    Recommended Attractions for Day {activeDay.dayNumber}
                  </h3>
                  <span className="text-xs text-slate-400">{activeDay.attractions.length} Landmarks</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeDay.attractions.map(attr => (
                    <div 
                      key={attr.id} 
                      className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 shadow-lg group"
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-sky-500/20 text-sky-300 border border-sky-400/30">
                              {attr.category}
                            </span>
                            <h4 className="text-base font-black text-white group-hover:text-emerald-300 transition-colors">
                              {attr.name}
                            </h4>
                          </div>
                          <span className="text-xs font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-400/20 shrink-0">
                            {attr.entryFee}
                          </span>
                        </div>

                        <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                          {attr.description}
                        </p>

                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-[11px] text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span className="truncate">{attr.openingHours}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="truncate">{attr.timeRequired}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                            <span className="truncate">{attr.distanceFromHub}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Sun className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                            <span className="truncate">{attr.bestVisitTime}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-[11px] pt-1">
                          <span className={`flex items-center gap-1 ${attr.hasParking ? 'text-emerald-400' : 'text-slate-500'}`}>
                            🅿️ Parking {attr.hasParking ? 'Available' : 'Limited'}
                          </span>
                          <span className={`flex items-center gap-1 ${attr.hasWashroom ? 'text-emerald-400' : 'text-slate-500'}`}>
                            🚻 Washroom {attr.hasWashroom ? 'Available' : 'N/A'}
                          </span>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2">
                        <span className="text-[10px] text-slate-400 truncate">
                          Near: {attr.nearbyAttractions.slice(0, 2).join(', ')}
                        </span>
                        <button
                          onClick={() => setSelectedAttractionModal(attr)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer shadow-md"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Spot</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* RECOMMENDED HOMESTAYS FOR TONIGHT */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Home className="w-4 h-4 text-purple-400" />
                  Recommended Night Stay ({activeDay.destinationName})
                </h3>
                <span className="text-xs text-slate-400">Top Ranked Stays</span>
              </div>

              <div className="space-y-4">
                {activeDay.topHomestays.map((item, hIdx) => (
                  <div 
                    key={item.homestay.id || hIdx}
                    className={`p-5 rounded-3xl border transition-all ${
                      item.isTopPick 
                        ? 'bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/60 border-emerald-500/40 shadow-xl shadow-emerald-950/20' 
                        : 'bg-slate-900 border-slate-800'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {item.isTopPick ? (
                            <span className="px-3 py-1 rounded-full text-[10px] font-black bg-emerald-500 text-slate-950 uppercase tracking-wider">
                              ⭐ Rank #1 Top Choice
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                              Rank #{item.rank}
                            </span>
                          )}
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" />
                            Verified Host
                          </span>
                        </div>

                        <h4 className="text-lg font-black text-white">
                          🏡 {item.homestay.name}
                        </h4>

                        {/* Why recommended */}
                        <div className="space-y-1.5 bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80">
                          <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wider block">
                            Why recommended for your trip:
                          </span>
                          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-300">
                            {item.reasons.map((r, rIdx) => (
                              <li key={rIdx} className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                <span>{r}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="flex flex-col items-end justify-between shrink-0 space-y-4 self-stretch sm:self-auto">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Estimated Tariff</span>
                          <span className="text-xl font-black text-amber-300">₹{item.estimatedNightCost.toLocaleString('en-IN')}</span>
                          <span className="text-[10px] text-slate-400 block">per room / night</span>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <button
                            onClick={() => {
                              if (onSelectHomestay) onSelectHomestay(item.homestay);
                              else setSelectedHomestayModal(item);
                            }}
                            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
                          >
                            View Stay
                          </button>
                          
                          <button
                            onClick={() => {
                              const slug = (item.homestay.id || item.homestay.slug || '').replace(/^home-/, '');
                              window.location.hash = `#/enquire?listingType=homestay&listingId=${slug}`;
                            }}
                            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition-colors cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Message Host</span>
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RECOMMENDED TAXI TRANSIT */}
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-300 shrink-0">
                  <Car className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-400 block">
                    Recommended Route Taxi
                  </span>
                  <h4 className="text-base font-black text-white">
                    {activeDay.recommendedTaxi.vehicleType} ({activeDay.recommendedTaxi.routeName})
                  </h4>
                  <p className="text-xs text-slate-300">
                    {activeDay.recommendedTaxi.notes}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Estimated Fare</span>
                  <span className="text-lg font-black text-amber-300">₹{activeDay.recommendedTaxi.fare.toLocaleString('en-IN')}</span>
                </div>
                <button
                  onClick={() => {
                    if (onBookTaxi) onBookTaxi(activeDay.recommendedTaxi);
                    else alert(`Reserving taxi for ${activeDay.recommendedTaxi.routeName}...`);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-black transition-colors shadow-md cursor-pointer"
                >
                  Book Taxi
                </button>
              </div>
            </div>

          </div>

          {/* STICKY RIGHT SIDEBAR (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-24 space-y-6">

              {/* TRIP SCORE & QUALITY SUMMARY */}
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-base font-black text-white">
                      Trip Quality & Score
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-slate-950">
                    {plan.tripScore}/100
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-300">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                    Optimization Highlights:
                  </span>
                  <ul className="space-y-1.5">
                    {plan.scoreReasons.map((reason, rIdx) => (
                      <li key={rIdx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* BUDGET BREAKDOWN CARD */}
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-amber-400" />
                    Budget Breakdown
                  </h3>
                  <span className="text-xs font-extrabold text-amber-300">
                    Total: ₹{plan.summary.totalBudget.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">Homestays ({plan.summary.totalNights} Nights)</span>
                    <span className="font-extrabold text-white">₹{plan.summary.budgetBreakdown.homestays.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">Transit & Route Taxis</span>
                    <span className="font-extrabold text-white">₹{plan.summary.budgetBreakdown.transit.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">Sightseeing & Entry Fees</span>
                    <span className="font-extrabold text-white">₹{plan.summary.budgetBreakdown.sightseeing.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">Food & Local Dining Est.</span>
                    <span className="font-extrabold text-white">₹{plan.summary.budgetBreakdown.foodEstimate.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* WEATHER FORECAST CARD */}
              <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs uppercase tracking-wider">
                  <Sun className="w-4 h-4 text-amber-400" />
                  Seasonal Weather ({plan.input.month || 'October'})
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {plan.summary.weatherSummary}
                </p>
              </div>

              {/* MODIFY TRIP PANEL */}
              <div ref={modifyPanelRef} className="p-5 rounded-3xl bg-slate-900 border border-emerald-500/30 shadow-2xl space-y-4">
                
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-emerald-400" />
                    <h3 className="text-base font-black text-white">
                      Modify Trip
                    </h3>
                  </div>
                  {isModifying && <span className="text-xs text-amber-300 animate-pulse">Updating...</span>}
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Quick Adjustments:
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleQuickModify('reduce_budget')}
                      className="p-2.5 rounded-xl text-xs font-bold bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-slate-200 transition-all text-left flex items-center gap-1.5 cursor-pointer"
                    >
                      💰 Lower Budget
                    </button>
                    <button
                      onClick={() => handleQuickModify('add_waterfall')}
                      className="p-2.5 rounded-xl text-xs font-bold bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-sky-500/40 text-slate-200 transition-all text-left flex items-center gap-1.5 cursor-pointer"
                    >
                      🌊 Add Waterfall
                    </button>
                    <button
                      onClick={() => handleQuickModify('homestays_only')}
                      className="p-2.5 rounded-xl text-xs font-bold bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-slate-200 transition-all text-left flex items-center gap-1.5 cursor-pointer"
                    >
                      🏡 Homestays Only
                    </button>
                    <button
                      onClick={() => handleQuickModify('one_more_day')}
                      className="p-2.5 rounded-xl text-xs font-bold bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-purple-500/40 text-slate-200 transition-all text-left flex items-center gap-1.5 cursor-pointer"
                    >
                      📅 +1 More Day
                    </button>
                    <button
                      onClick={() => handleQuickModify('avoid_long_drives')}
                      className="p-2.5 rounded-xl text-xs font-bold bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-rose-500/40 text-slate-200 transition-all text-left flex items-center gap-1.5 cursor-pointer"
                    >
                      🚗 Less Driving
                    </button>
                    <button
                      onClick={() => handleQuickModify('remove_monasteries')}
                      className="p-2.5 rounded-xl text-xs font-bold bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-slate-200 transition-all text-left flex items-center gap-1.5 cursor-pointer"
                    >
                      ⛩️ No Monasteries
                    </button>
                  </div>
                </div>

                {/* Custom Instruction Input */}
                <form onSubmit={handleCustomModifySubmit} className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                    Custom Preference:
                  </span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder='e.g. "Senior citizen friendly", "Focus on food"'
                      value={customModifyInput}
                      onChange={e => setCustomModifyInput(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold transition-colors cursor-pointer shrink-0"
                    >
                      Apply
                    </button>
                  </div>
                </form>

              </div>

            </div>
          </div>

        </div>
      </main>

      {/* ATTRACTION DETAILS MODAL */}
      <AnimatePresence>
        {selectedAttractionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-sky-500/20 text-sky-300 border border-sky-400/30">
                    {selectedAttractionModal.category}
                  </span>
                  <h3 className="text-xl font-black text-white">
                    {selectedAttractionModal.name}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedAttractionModal(null)}
                  className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedAttractionModal.description}
              </p>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <div>
                  <span className="text-slate-400 block text-[10px]">Opening Hours</span>
                  <span className="font-bold text-emerald-300">{selectedAttractionModal.openingHours}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Entry Fee</span>
                  <span className="font-bold text-amber-300">{selectedAttractionModal.entryFee}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Time Required</span>
                  <span className="font-bold text-white">{selectedAttractionModal.timeRequired}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Best Visit Time</span>
                  <span className="font-bold text-sky-300">{selectedAttractionModal.bestVisitTime}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs pt-1">
                <span>🅿️ Parking: {selectedAttractionModal.hasParking ? 'Available' : 'Limited'}</span>
                <span>🚻 Washroom: {selectedAttractionModal.hasWashroom ? 'Available' : 'N/A'}</span>
              </div>

              <button
                onClick={() => setSelectedAttractionModal(null)}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg cursor-pointer"
              >
                Close Details
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* HOMESTAY DETAILS MODAL */}
      <AnimatePresence>
        {selectedHomestayModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl"
            >
              <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                    Verified Local Homestay
                  </span>
                  <h3 className="text-xl font-black text-white">
                    🏡 {selectedHomestayModal.homestay.name}
                  </h3>
                </div>
                <button 
                  onClick={() => setSelectedHomestayModal(null)}
                  className="p-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedHomestayModal.homestay.description || 'Cozy family-run wooden homestay with authentic mountain hospitality and organic meals.'}
              </p>

              <div className="space-y-1.5 bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 block">
                  Why recommended for your trip:
                </span>
                <ul className="space-y-1 text-xs text-slate-300">
                  {selectedHomestayModal.reasons.map((r, rIdx) => (
                    <li key={rIdx} className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <div>
                  <span className="text-slate-400 block text-[10px]">Estimated Night Tariff</span>
                  <span className="text-lg font-black text-amber-300">₹{selectedHomestayModal.estimatedNightCost.toLocaleString('en-IN')} / night</span>
                </div>
                <button
                  onClick={() => {
                    const slug = (selectedHomestayModal.homestay.id || selectedHomestayModal.homestay.slug || '').replace(/^home-/, '');
                    window.location.hash = `#/enquire?listingType=homestay&listingId=${slug}`;
                    setSelectedHomestayModal(null);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-lg cursor-pointer flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Message Host</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
