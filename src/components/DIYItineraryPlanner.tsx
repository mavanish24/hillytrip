import React, { useState, useEffect } from 'react';
import { AutocompleteSelect } from './AutocompleteSelect';
import { 
  Calendar, Compass, Plus, Trash2, MapPin, Sparkles, Home, 
  Layers, Printer, Download, Save, AlertTriangle, Eye, ArrowRight,
  Info, Clock, HelpCircle, FileText
} from 'lucide-react';
import { Destination, Attraction, Homestay, Route } from '../types';

interface DayPlan {
  dayNum: number;
  destinationId: string;
  attractionId: string;
  homestayId: string;
  activities: string;
}

interface DIYItineraryPlannerProps {
  destinations: Destination[];
  attractions: Attraction[];
  homestays: Homestay[];
  routes: Route[];
  savedItineraries: any[];
  onSaveItinerary: (itinerary: any) => void;
  onDeleteItinerary: (id: string) => void;
  setNotification: (notif: { type: 'success' | 'error'; message: string }) => void;
}

export default function DIYItineraryPlanner({
  destinations,
  attractions,
  homestays,
  routes,
  savedItineraries,
  onSaveItinerary,
  onDeleteItinerary,
  setNotification
}: DIYItineraryPlannerProps) {
  const [tripTitle, setTripTitle] = useState('My Summer Himalayan Trek');
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    today.setDate(today.getDate() + 14); // Default to 2 weeks from now
    return today.toISOString().split('T')[0];
  });
  const [numDays, setNumDays] = useState(3);
  const [daysData, setDaysData] = useState<DayPlan[]>([]);
  const [activeTab, setActiveTab] = useState<'create' | 'saved'>('create');
  const [viewingItineraryId, setViewingItineraryId] = useState<string | null>(null);

  // Initialize and adjust days data when numDays changes
  useEffect(() => {
    setDaysData(prev => {
      const updated = [...prev];
      if (updated.length < numDays) {
        // Add days
        for (let i = updated.length + 1; i <= numDays; i++) {
          updated.push({
            dayNum: i,
            destinationId: destinations[0]?.id || '',
            attractionId: '',
            homestayId: '',
            activities: ''
          });
        }
      } else if (updated.length > numDays) {
        // Truncate days
        return updated.slice(0, numDays);
      }
      return updated;
    });
  }, [numDays, destinations]);

  const handleDayChange = (dayIndex: number, field: keyof DayPlan, value: any) => {
    setDaysData(prev => prev.map((day, idx) => {
      if (idx !== dayIndex) return day;
      const updatedDay = { ...day, [field]: value };
      
      // Auto-reset attraction or homestay if destination changes to prevent mismatch
      if (field === 'destinationId') {
        updatedDay.attractionId = '';
        updatedDay.homestayId = '';
      }
      return updatedDay;
    }));
  };

  // Helper: Find route specs between any two destinations
  const findInterStopRoute = (fromDestName: string, toDestName: string) => {
    if (!fromDestName || !toDestName || fromDestName === toDestName) return null;
    
    // Perform loose lookup in the routes list
    const exactWordMatch = routes.find(r => {
      const pathWords = r.path.map(p => p.toLowerCase());
      const querySrc = fromDestName.toLowerCase();
      const queryDst = toDestName.toLowerCase();
      
      return (pathWords.includes(querySrc) && pathWords.includes(queryDst)) ||
             r.fromHubId.toLowerCase().includes(querySrc) ||
             r.toHubId.toLowerCase().includes(queryDst);
    });

    return exactWordMatch || null;
  };

  // Calculate stats across continuous itinerary days
  const calculateItineraryStats = (plans: DayPlan[]) => {
    let totalDist = 0;
    let totalHours = 0;
    const warnings: string[] = [];

    for (let i = 0; i < plans.length - 1; i++) {
      const fromDest = destinations.find(d => d.id === plans[i].destinationId);
      const toDest = destinations.find(d => d.id === plans[i+1].destinationId);

      if (fromDest && toDest && fromDest.id !== toDest.id) {
        const routeObj = findInterStopRoute(fromDest.name, toDest.name);
        if (routeObj) {
          totalDist += routeObj.distance || 0;
          // Guess 35km/h mountain average speed
          totalHours += (routeObj.distance || 0) / 35;
        } else {
          // No direct highway detected path
          warnings.push(`Day ${plans[i].dayNum} to ${plans[i+1].dayNum}: No direct connected highway detected between ${fromDest.name} and ${toDest.name} in current records. Pack carefully or coordinate dynamic local taxi hubs.`);
          // Add a default estimate anyway for travel index
          totalDist += 45;
          totalHours += 1.5;
        }
      }
    }

    return {
      distance: totalDist,
      durationHrs: Math.round(totalHours * 10) / 10,
      warnings
    };
  };

  const currentStats = calculateItineraryStats(daysData);

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tripTitle.trim()) {
      setNotification({ type: 'error', message: 'Enter a valid title for your custom itinerary.' });
      return;
    }

    const newItinerary = {
      id: 'itinerary-' + Math.random().toString(36).substring(2, 9),
      title: tripTitle,
      startDate,
      numDays,
      days: daysData,
      createdAt: new Date().toISOString(),
      stats: {
        distance: currentStats.distance,
        durationHrs: currentStats.durationHrs
      }
    };

    onSaveItinerary(newItinerary);
    setTripTitle('');
    setNumDays(3);
    setNotification({
      type: 'success',
      message: '🏔️ Itinerary saved successfully inside your persistent local mountain travel bank!'
    });
    setActiveTab('saved');
    setViewingItineraryId(newItinerary.id);
  };

  const getExportString = (itinerary: any) => {
    let out = `🏔️ HILLITRIP TRAVEL SHEET: ${itinerary.title}\n`;
    out += `Start Date of Travel: ${itinerary.startDate} (${itinerary.numDays} Days)\n`;
    out += `Estimated Local Mileage: ${itinerary.stats?.distance || 0} km total connected loops\n`;
    out += `=========================================\n\n`;

    itinerary.days.forEach((d: DayPlan) => {
      const dest = destinations.find(x => x.id === d.destinationId);
      const attr = attractions.find(x => x.id === d.attractionId);
      const home = homestays.find(x => x.id === d.homestayId);

      out += `📍 DAY ${d.dayNum}: ${dest?.name || 'Mountain Trail'}\n`;
      if (attr) out += `- Primary Local Sights: ${attr.name} (${attr.category || 'Sight'})\n`;
      if (home) out += `- Homestay Lodge Accommodation: ${home.name} (Contact: ${home.contact})\n`;
      if (d.activities) out += `- Activities Planned: ${d.activities}\n`;
      out += `\n`;
    });

    out += `Generated via HillyTrip Sentinel Intelligent Travel Planner. Safe Climbing! 🛖`;
    return out;
  };

  const handleShareWhatsApp = (itinerary: any) => {
    const text = getExportString(itinerary);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopyText = (itinerary: any) => {
    const text = getExportString(itinerary);
    navigator.clipboard.writeText(text);
    setNotification({ type: 'success', message: 'Travel itinerary copy pasted on clipboard.' });
  };

  const activeViewingItinerary = savedItineraries.find(it => it.id === viewingItineraryId) || savedItineraries[0];

  return (
    <div id="diy-planner-root" className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-200/80 dark:border-slate-800 shadow-md">
      {/* Sub tabs switch */}
      <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl mb-6 border border-slate-200/30 dark:border-slate-850">
        <button
          onClick={() => {
            setActiveTab('create');
            setViewingItineraryId(null);
          }}
          className={`flex-1 py-2 text-xs font-black tracking-wide uppercase rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'create'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          Create New Itinerary
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`flex-1 py-2 text-xs font-black tracking-wide uppercase rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'saved'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Saved Travels Index ({savedItineraries.length})
        </button>
      </div>

      {activeTab === 'create' ? (
        <form onSubmit={handleSaveSubmit} className="space-y-6 text-left">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Calendar className="w-6 h-6 text-emerald-600" />
              Interactive Multi-Day Planner
            </h3>
            <p className="text-xs text-slate-450 dark:text-slate-400 mt-1 max-w-xl">
              Design a sequential, high-altitude road itinerary. HillyTrip dynamically matches intermediate travel legs, calculates total loop distances and alerts of high-pass road safety notices offline.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="text-[10px] uppercase font-black text-slate-450 tracking-wider block mb-1">Itinerary Title</label>
              <input
                type="text"
                required
                value={tripTitle}
                onChange={(e) => setTripTitle(e.target.value)}
                placeholder="e.g. Darjeeling Offbeat Family Monsoon Explorations"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 placeholder-slate-400"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-black text-slate-450 tracking-wider block mb-1">Start Date</label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 bg-slate-50 dark:bg-slate-950 p-4 border border-slate-150 dark:border-slate-850 rounded-2xl">
            <div className="flex flex-col">
              <span className="text-xs font-black text-slate-800 dark:text-slate-300">Total Adventure Days Duration</span>
              <span className="text-[10px] text-slate-450 mt-0.5">Increments day plan fields and routes below.</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setNumDays(Math.max(1, numDays - 1))}
                className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 text-slate-700 dark:text-white hover:bg-slate-100 text-sm font-bold flex items-center justify-center cursor-pointer select-none"
              >
                -
              </button>
              <span className="w-10 text-center font-mono font-black text-base dark:text-white">{numDays}</span>
              <button
                type="button"
                onClick={() => setNumDays(Math.min(10, numDays + 1))}
                className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900 text-slate-700 dark:text-white hover:bg-slate-100 text-sm font-bold flex items-center justify-center cursor-pointer select-none"
              >
                +
              </button>
            </div>
          </div>

          {/* Day fields list */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider font-mono">Day-by-Day Road Stops</h4>
            {daysData.map((day, dIdx) => {
              // Filter attractions and homestays of the selected destination for safety
              const localAttractions = attractions.filter(a => a.destinationId === day.destinationId);
              const localHomestays = homestays.filter(h => h.destinationId === day.destinationId);

              return (
                <div 
                  key={`day-plan-form-${day.dayNum}`}
                  className="bg-slate-50/40 dark:bg-slate-900/50 border border-slate-150 dark:border-slate-850 rounded-2xl p-4 md:p-5 relative overflow-hidden text-left"
                >
                  <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-emerald-600"></div>
                  
                  <div className="flex items-center justify-between border-b border-slate-150/50 dark:border-slate-850/50 pb-3 mb-4">
                    <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono">
                      🗓️ DAY {day.dayNum} Stop
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold font-mono">Planned Leg</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[9px] uppercase font-black text-slate-400 block mb-1">Villages & Hub Base *</label>
                      <AutocompleteSelect
                        id="itinerary-village-select"
                        required
                        value={day.destinationId}
                        onChange={(e) => handleDayChange(dIdx, 'destinationId', e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                      >
                        {destinations.map(d => (
                          <option key={`day-${day.dayNum}-dest-${d.id}`} value={d.id}>{d.name}</option>
                        ))}
                      </AutocompleteSelect>
                    </div>

                    <div>
                      <label className="text-[9px] uppercase font-black text-slate-400 block mb-1">Scenic Spot / Attraction</label>
                      <AutocompleteSelect
                        id="itinerary-attraction-select"
                        value={day.attractionId}
                        onChange={(e) => handleDayChange(dIdx, 'attractionId', e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                      >
                        <option value="">-- Pitch Scenic Point (Optional) --</option>
                        {localAttractions.length > 0 ? (
                          localAttractions.map(a => (
                            <option key={`day-${day.dayNum}-attr-${a.id}`} value={a.id}>{a.name}</option>
                          ))
                        ) : (
                          <optgroup label="All Attractions (Other areas)">
                            {attractions.map(a => (
                              <option key={`day-${day.dayNum}-attr-all-${a.id}`} value={a.id}>{a.name} ({destinations.find(ds => ds.id === a.destinationId)?.name})</option>
                            ))}
                          </optgroup>
                        )}
                      </AutocompleteSelect>
                    </div>

                    <div>
                      <label className="text-[9px] uppercase font-black text-slate-400 block mb-1">Scenic Homestay Lodge</label>
                      <AutocompleteSelect
                        id="itinerary-homestay-select"
                        value={day.homestayId}
                        onChange={(e) => handleDayChange(dIdx, 'homestayId', e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-xs font-bold text-slate-800 dark:text-white"
                      >
                        <option value="">-- Pick Local stay (Optional) --</option>
                        {localHomestays.length > 0 ? (
                          localHomestays.map(h => (
                            <option key={`day-${day.dayNum}-stay-${h.id}`} value={h.id}>{h.name}</option>
                          ))
                        ) : (
                          <optgroup label="All Homestays (Other areas)">
                            {homestays.map(h => (
                              <option key={`day-${day.dayNum}-stay-all-${h.id}`} value={h.id}>{h.name} ({destinations.find(ds => ds.id === h.destinationId)?.name})</option>
                            ))}
                          </optgroup>
                        )}
                      </AutocompleteSelect>
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="text-[9px] uppercase font-black text-slate-400 block mb-1">Local Activities & Exploration Plan</label>
                    <input
                      type="text"
                      value={day.activities}
                      onChange={(e) => handleDayChange(dIdx, 'activities', e.target.value)}
                      placeholder="e.g. Alpine woodland ridge hiking, tea estate tour, early orchid path photography..."
                      className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-xs text-slate-850 dark:text-slate-100 font-medium"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Computed stats summary */}
          <div className="bg-sky-50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900 rounded-2xl p-5 space-y-3">
            <span className="text-[10px] font-extrabold uppercase text-sky-600 block tracking-wider font-mono">Dynamic Itinerary Metrics</span>
            <div className="grid grid-cols-2 gap-4 text-slate-800 dark:text-slate-250">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-sky-500 shrink-0" />
                <div className="text-left">
                  <span className="text-[10px] uppercase text-slate-400 block font-mono">Total Local Highway Distance</span>
                  <span className="text-xs font-black font-sans text-slate-900 dark:text-white">{currentStats.distance} Kilometers</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-500 shrink-0" />
                <div className="text-left">
                  <span className="text-[10px] uppercase text-slate-400 block font-mono">Estimated In-Car Duration</span>
                  <span className="text-xs font-black font-sans text-slate-900 dark:text-white">~ {currentStats.durationHrs} hours travel time</span>
                </div>
              </div>
            </div>

            {currentStats.warnings.length > 0 && (
              <div className="bg-amber-50/40 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/40 p-3.5 rounded-xl mt-3 space-y-1.5">
                <span className="text-xs font-black text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  Himalayan Transportation Warnings Found:
                </span>
                <ul className="list-disc pl-5 text-[10px] text-slate-500 dark:text-slate-400 space-y-1 text-left">
                  {currentStats.warnings.map((w, idx) => (
                    <li key={`it-warn-${idx}`}>{w}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs font-mono uppercase tracking-wider py-4 rounded-xl shadow-md cursor-pointer transition flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Verify Itinerary Stop Specs & Save Plan
          </button>
        </form>
      ) : (
        /* SAVED TRAVEL PLANS LIST */
        <div id="saved-itineraries-view" className="space-y-6 text-left">
          {savedItineraries.length === 0 ? (
            <div className="text-center py-16 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-150 dark:border-slate-850">
              <Compass className="w-12 h-12 text-slate-350 mx-auto mb-3" />
              <h4 className="font-extrabold text-slate-700 dark:text-slate-300">No Custom Travel Sheets Cached</h4>
              <p className="text-xs text-slate-450 mt-1.5 max-w-sm mx-auto">
                Utilize the Trip Planner tab to design custom multi-day journeys. They are persistent on your device and will load even under dry mountain network dropouts!
              </p>
              <button
                onClick={() => setActiveTab('create')}
                className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 font-extrabold text-white text-xs rounded-xl cursor-pointer"
              >
                Launch Builder
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Sidebar directory list */}
              <div className="bg-slate-50 dark:bg-slate-950 p-4 border border-slate-150 dark:border-slate-850 rounded-2xl flex flex-col gap-2.5 h-[480px] overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider font-mono">Itineraries Dossier</span>
                {savedItineraries.map(it => {
                  const isActive = viewingItineraryId === it.id || (viewingItineraryId === null && savedItineraries[0]?.id === it.id);
                  return (
                    <button
                      key={`dir-list-${it.id}`}
                      onClick={() => setViewingItineraryId(it.id)}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        isActive 
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-3xs'
                          : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-850 hover:bg-slate-100'
                      }`}
                    >
                      <span className="block font-black text-xs leading-snug line-clamp-2">{it.title}</span>
                      <div className="flex items-center gap-3 mt-2 text-[9px] font-mono opacity-80">
                        <span>🗓️ {it.startDate}</span>
                        <span>🛣️ {it.numDays} Days</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Detailed Active Travel Sheet */}
              <div className="lg:col-span-2 space-y-4">
                {activeViewingItinerary ? (
                  <div className="border border-slate-150 dark:border-slate-805 rounded-2xl bg-slate-50/20 dark:bg-slate-950/20 p-5">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-5 border-b border-slate-150/50 dark:border-slate-800 pb-4">
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-wider font-mono">
                          Travel Plan Sheet
                        </span>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1 leading-snug">
                          {activeViewingItinerary.title}
                        </h3>
                        <p className="text-[10px] text-slate-400 font-mono mt-1">
                          Commenced on {activeViewingItinerary.startDate} • Created {new Date(activeViewingItinerary.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end xs:self-auto">
                        <button
                          onClick={() => handleCopyText(activeViewingItinerary)}
                          title="Copy text report"
                          className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-400 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleShareWhatsApp(activeViewingItinerary)}
                          title="Share to WhatsApp"
                          className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-400 rounded-lg text-emerald-500 hover:bg-emerald-50 transition cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Delete this saved itinerary copy?')) {
                              onDeleteItinerary(activeViewingItinerary.id);
                              setNotification({ type: 'success', message: 'Sectors plan deleted.' });
                            }
                          }}
                          title="Delete plan"
                          className="p-2 bg-white dark:bg-slate-900 border border-slate-205 dark:border-slate-800 hover:bg-rose-50 hover:text-rose-600 text-slate-400 rounded-lg transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Timeline stops rendering */}
                    <div className="relative border-l border-emerald-500/30 pl-5 ml-2.5 space-y-6 py-1">
                      {activeViewingItinerary.days?.map((day: DayPlan) => {
                        const dest = destinations.find(x => x.id === day.destinationId);
                        const attr = attractions.find(x => x.id === day.attractionId);
                        const home = homestays.find(x => x.id === day.homestayId);

                        return (
                          <div key={`view-day-it-${day.dayNum}`} className="relative text-left">
                            {/* Dot indicator */}
                            <div className="absolute -left-[27px] top-1.5 w-3.5 h-3.5 rounded-full bg-white dark:bg-slate-900 border-2 border-emerald-500 flex items-center justify-center shrink-0 z-10">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                            </div>

                            <span className="text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400 font-mono tracking-widest block">
                              Leg Day {day.dayNum}
                            </span>
                            
                            <h4 className="text-base font-extrabold text-slate-850 dark:text-white mt-1">
                              {dest?.name || 'Mountain Settlement'}
                            </h4>

                            {day.activities && (
                              <p className="text-xs text-slate-550 dark:text-slate-350 italic mt-1 leading-relaxed">
                                "{day.activities}"
                              </p>
                            )}

                            <div className="flex flex-wrap gap-2.5 mt-3">
                              {attr && (
                                <span className="bg-purple-100 bg-opacity-40 hover:bg-opacity-60 text-purple-800 dark:bg-purple-950/20 dark:text-purple-300 border border-purple-200/50 dark:border-purple-800/40 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 font-sans">
                                  <Sparkles className="w-3 h-3 text-purple-500" />
                                  Sight: {attr.name} ({attr.category || 'High point'})
                                </span>
                              )}
                              {home && (
                                <span className="bg-emerald-100 bg-opacity-40 hover:bg-opacity-60 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40 text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 font-sans">
                                  <Home className="w-3 h-3 text-emerald-500" />
                                  Accommodation: {home.name} ({dest?.name || 'Mountain Base'})
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-400 text-xs py-20">Select an itinerary folder to inspect details.</div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
