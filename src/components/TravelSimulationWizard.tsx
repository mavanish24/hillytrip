import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, Compass, Car, Sparkles, ArrowRight, Check, RefreshCw, 
  ChevronRight, ChevronLeft, Calendar, HelpCircle, Shield, Phone, 
  Map, Star, Home, ArrowUpRight, CheckSquare, ListPlus
} from 'lucide-react';
import { Hub, Destination, Attraction, Homestay, Route } from '../types';
import { getItemSlug } from '../utils/slug';

interface TravelSimulationWizardProps {
  hubs: Hub[];
  destinations: Destination[];
  attractions: Attraction[];
  homestays: Homestay[];
  routes: Route[];
  themeMode: 'light' | 'dark';
  onNavigate: (path: string) => void;
  setSearchFrom: (val: string) => void;
  setSearchTo: (val: string) => void;
  onExecuteSearch: (fromId: string, toId: string) => void;
}

export default function TravelSimulationWizard({
  hubs,
  destinations,
  attractions,
  homestays,
  routes,
  themeMode,
  onNavigate,
  setSearchFrom,
  setSearchTo,
  onExecuteSearch
}: TravelSimulationWizardProps) {
  // Wizard steps: 1 = Starting point, 2 = Travel style, 3 = Vehicle, 4 = Results/Plan
  const [step, setStep] = useState<number>(1);
  const [startPoint, setStartPoint] = useState<string>('njp'); // Default: NJP (New Jalpaiguri)
  const [travelStyle, setTravelStyle] = useState<string>('leisure'); // leisure, trekking, offbeat
  const [needsVehicle, setNeedsVehicle] = useState<boolean>(true);

  // Restart wizard
  const handleReset = () => {
    setStep(1);
    setStartPoint('njp');
    setTravelStyle('leisure');
    setNeedsVehicle(true);
  };

  // Curate data based on wizard responses
  const getCuratedResults = () => {
    // 1. Map custom destination recommendations
    let recommendedDestIds: string[] = [];
    let customRouteLabel = '';
    let customRouteSegments: string[] = [];
    let finalTargetDestId = '';

    const startLabel = startPoint === 'njp' 
      ? 'NJP (New Jalpaiguri Railway Station)' 
      : startPoint === 'bagdogra' 
        ? 'Bagdogra International Airport' 
        : 'Siliguri Junction Bus Stand';

    if (travelStyle === 'trekking') {
      recommendedDestIds = ['lava', 'rishop', 'pedong'];
      finalTargetDestId = 'rishop';
      customRouteSegments = [startPoint, 'sevoke', 'teesta bazar', 'kalimpong', 'algara', 'lava', 'rishop'];
      customRouteLabel = `${startLabel} → Kalimpong Pinewood Ridge → Lava Misty High Pass → Rishop Alpine Peak`;
    } else if (travelStyle === 'offbeat') {
      recommendedDestIds = ['sittong', 'kurseong', 'mirik'];
      finalTargetDestId = 'sittong';
      customRouteSegments = [startPoint, 'sevoke', 'kalijhora', 'sittong'];
      customRouteLabel = `${startLabel} → Sevoke Coronation Bridge → Kalijhora Teesta Gorge → Sittong Rustic Orange Valleys`;
    } else {
      // Leisure
      recommendedDestIds = ['darjeeling', 'kalimpong', 'kurseong'];
      finalTargetDestId = 'darjeeling';
      customRouteSegments = [startPoint, 'kurseong', 'sonada', 'ghoom', 'darjeeling'];
      customRouteLabel = `${startLabel} → Kurseong Toy Train Valley → Ghoom Alpine Ridge → Darjeeling Mall Road Queen Peak`;
    }

    // Filter actual destinations
    const curatedDests = destinations.filter(d => 
      recommendedDestIds.includes(d.id.toLowerCase()) || 
      recommendedDestIds.some(recId => d.id.toLowerCase().includes(recId))
    ).slice(0, 3);

    // Fallbacks if database lacks exact matches
    const fallbackDests = destinations.slice(0, 3);
    const finalDests = curatedDests.length > 0 ? curatedDests : fallbackDests;

    // Filter actual homestays nested in recommended destinations
    const targetDestIds = finalDests.map(d => d.id);
    const curatedHomestays = homestays.filter(h => 
      targetDestIds.includes(h.destinationId) ||
      targetDestIds.some(id => h.destinationId?.toLowerCase().includes(id.toLowerCase()))
    ).slice(0, 3);

    const fallbackHomestays = homestays.slice(0, 3);
    const finalHomestays = curatedHomestays.length > 0 ? curatedHomestays : fallbackHomestays;

    // Filter scenic spots / attractions in recommended destinations
    const curatedAttractions = attractions.filter(a => 
      targetDestIds.includes(a.destinationId) ||
      targetDestIds.some(id => a.destinationId?.toLowerCase().includes(id.toLowerCase()))
    ).slice(0, 4);

    const fallbackAttractions = attractions.slice(0, 4);
    const finalAttractions = curatedAttractions.length > 0 ? curatedAttractions : fallbackAttractions;

    // Recommended actions & notes
    let guidanceNotes = '';
    if (travelStyle === 'trekking') {
      guidanceNotes = 'High Altitude Warning: Lava and Rishop lie above 7,000 feet. Please carry heavy woolens, check for road mudslides via the Live Transit Bulletin, and prepare a survival first-aid box.';
    } else if (travelStyle === 'offbeat') {
      guidanceNotes = 'Signal Advisory Mode: Rural or deep offbeat villages like Sittong experience frequent cellular drops. Remember to preload and utilize the Offline Travel Hub in your settings for navigation guidance.';
    } else {
      guidanceNotes = 'Popular High-Season Alert: Darjeeling and Kalimpong can be heavily crowded. Book private homestays directly in advance and secure reliable cab services to avoid last-minute price gouging.';
    }

    return {
      startLabel,
      finalTargetDestId,
      customRouteLabel,
      customRouteSegments,
      destinationsList: finalDests,
      homestaysList: finalHomestays,
      attractionsList: finalAttractions,
      guidanceNotes
    };
  };

  const results = getCuratedResults();

  // Step indicators helper
  const renderStepIndicators = () => (
    <div className="flex items-center justify-center gap-1.5 md:gap-3 mb-8 select-none">
      {[1, 2, 3, 4].map((s) => (
        <React.Fragment key={s}>
          <div className="flex items-center gap-2">
            <div 
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all duration-300 ${
                step === s 
                  ? 'bg-emerald-500 text-slate-950 scale-110 shadow-lg shadow-emerald-500/20' 
                  : step > s 
                    ? 'bg-emerald-650 text-white' 
                    : 'bg-slate-800 text-slate-500 border border-slate-700'
              }`}
            >
              {step > s ? <Check className="w-3.5 h-3.5 stroke-2" /> : s}
            </div>
            <span className={`text-[10px] md:text-xs font-bold font-mono uppercase hidden sm:inline ${
              step === s ? 'text-emerald-400' : 'text-slate-500'
            }`}>
              {s === 1 ? 'Origin' : s === 2 ? 'Travel Style' : s === 3 ? 'Transport' : 'Result'}
            </span>
          </div>
          {s < 4 && (
            <div className={`h-0.5 w-6 md:w-12 transition-all duration-300 ${
              step > s ? 'bg-emerald-500/55' : 'bg-slate-800'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div 
      id="travel-simulation-wizard-card"
      className="w-full bg-slate-900 border border-slate-850/60 dark:border-slate-800/60 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden text-white"
    >
      {/* Decorative vector overlays */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-emerald-500/5 to-transparent rounded-full -translate-y-12 translate-x-12 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-radial from-blue-500/5 to-transparent rounded-full translate-y-12 -translate-x-12 blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Header Block */}
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 mb-2 select-none">
            <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
            Instant Route Planner
          </span>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight" id="wizard-title">
            Himalayan Onboarding Travel Simulator
          </h2>
          <p className="text-slate-400 text-xs md:text-sm mt-1 max-w-xl mx-auto font-sans font-medium">
            Answer 3 quick choices to simulate an curated map connecting routes, taxi stands, private homestays, and hidden mountain loops.
          </p>
        </div>

        {/* Dynamic Step Progress bar */}
        {renderStepIndicators()}

        {/* Steps interactive layout */}
        <AnimatePresence mode="wait">
          
          {/* STEP 1: Starting point */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-400" />
                Step 1: Choose your starting gateway point
              </h3>
              <p className="text-slate-405 text-xs font-sans font-medium">
                Most Himalayan journeys in the Darjeeling-Kalimpong sector start from these rail, flight, or bus hubs in the lower foothills.
              </p>

              <div id="origin-options-grid" className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { id: 'njp', name: 'NJP (New Jalpaiguri)', desc: 'The most popular historic railway terminal for trains arriving from Delhi, Kolkata or Guwahati.', icon: '🚂' },
                  { id: 'bagdogra', name: 'Bagdogra Airport', desc: 'The primary international air terminal with frequent domestic flights from major metro hubs.', icon: '✈️' },
                  { id: 'siliguri', name: 'Siliguri Junction', desc: 'The major bus station for regional state transport, local shared cabs, and luxury coaches.', icon: '🚌' },
                ].map((option) => (
                  <button
                    key={option.id}
                    id={`wizard-origin-btn-${option.id}`}
                    onClick={() => setStartPoint(option.id)}
                    className={`p-5 rounded-2xl border text-left cursor-pointer transition-all duration-200 flex flex-col justify-between h-44 ${
                      startPoint === option.id 
                        ? 'bg-slate-800 border-emerald-500 shadow-md shadow-emerald-500/10' 
                        : 'bg-slate-850/40 border-slate-800 hover:border-slate-700 hover:bg-slate-850/70'
                    }`}
                  >
                    <span className="text-3xl select-none mb-3">{option.icon}</span>
                    <div>
                      <h4 className="font-extrabold text-slate-100 flex items-center justify-between">
                        {option.name}
                        {startPoint === option.id && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 font-medium font-sans leading-normal">
                        {option.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-end pt-4">
                <button
                  id="wizard-next-step-1"
                  onClick={() => setStep(2)}
                  className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-black px-6 py-3 rounded-xl text-sm flex items-center gap-2 transition cursor-pointer"
                >
                  Next Step: Travel Style <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Travel style */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
                <Compass className="w-5 h-5 text-emerald-400" />
                Step 2: Choose your travel style & speed
              </h3>
              <p className="text-slate-405 text-xs font-sans font-medium">
                Our database tailors destinations and lodging based on your physical comfort, interests, and offbeat exploration goals.
              </p>

              <div id="style-options-grid" className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    id: 'leisure',
                    name: 'Leisure & Luxury Peak',
                    desc: 'Scenic pine viewing roads, classic high-mountain tea lounges, heritage shopping centers, and robust comfort.',
                    icon: '🌸',
                    labelForDb: 'Misty Hill Station Resorts'
                  },
                  {
                    id: 'trekking',
                    name: 'Trekker & Backpacker Trail',
                    desc: 'Challenging pine forests, alpine river paths, wilderness wildlife trails, high-altitude lookout cabins.',
                    icon: '🥾',
                    labelForDb: 'High Altitude Wilderness'
                  },
                  {
                    id: 'offbeat',
                    name: 'Rustic Village Recesses',
                    desc: 'Eco-friendly rural agriculture villages, pristine orange groves, direct deep connections with Himalayan hosting families.',
                    icon: '🕵️',
                    labelForDb: 'Offbeat Quiet Retreats'
                  }
                ].map((option) => (
                  <button
                    key={option.id}
                    id={`wizard-style-btn-${option.id}`}
                    onClick={() => setTravelStyle(option.id)}
                    className={`p-5 rounded-2xl border text-left cursor-pointer transition-all duration-200 flex flex-col justify-between h-48 ${
                      travelStyle === option.id 
                        ? 'bg-slate-800 border-emerald-500 shadow-md shadow-emerald-500/10' 
                        : 'bg-slate-850/40 border-slate-800 hover:border-slate-700 hover:bg-slate-850/70'
                    }`}
                  >
                    <span className="text-3xl select-none mb-3">{option.icon}</span>
                    <div>
                      <h4 className="font-extrabold text-slate-100 flex items-center justify-between">
                        {option.name}
                        {travelStyle === option.id && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-1 font-medium font-sans leading-normal">
                        {option.desc}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex justify-between pt-4">
                <button
                  id="wizard-back-step-2"
                  onClick={() => setStep(1)}
                  className="bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold px-5 py-3 rounded-xl text-sm flex items-center gap-1.5 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  id="wizard-next-step-2"
                  onClick={() => setStep(3)}
                  className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-slate-950 font-black px-6 py-3 rounded-xl text-sm flex items-center gap-2 transition cursor-pointer"
                >
                  Next Step: Vehicle Needs <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Vehicle Needs */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-extrabold text-slate-100 flex items-center gap-2">
                <Car className="w-5 h-5 text-emerald-400" />
                Step 3: Tell us about vehicle preferences
              </h3>
              <p className="text-slate-405 text-xs font-sans font-medium">
                Himalayan terrains have strict, specialized taxi stand associations. Let us know if you need driver coordination details.
              </p>

              <div id="vehicle-options-grid" className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    need: true,
                    title: "Yes, need a private dedicated cab 𚖖",
                    desc: "Require certified mountain drivers, robust high-ground clearance 4WD/SUVs, and full point-to-point village transit mapping.",
                    color: "border-emerald-500/20"
                  },
                  {
                    need: false,
                    title: "No, traveling on shared cabs or hike trails 🥾",
                    desc: "Going on foot trails, scenic trekking paths, state bus links, or seeking local shared microbus stations independently.",
                    color: "border-indigo-500/20"
                  }
                ].map((option, idx) => (
                  <button
                    key={`vehicle-${idx}`}
                    id={`wizard-vehicle-btn-${idx}`}
                    onClick={() => setNeedsVehicle(option.need)}
                    className={`p-6 rounded-2xl border text-left cursor-pointer transition-all duration-200 flex flex-col justify-center gap-2 h-44 ${
                      needsVehicle === option.need
                        ? 'bg-slate-800 border-emerald-500 shadow-md shadow-emerald-500/10' 
                        : 'bg-slate-850/40 border-slate-800 hover:border-slate-700 hover:bg-slate-850/70'
                    }`}
                  >
                    <h4 className="font-extrabold text-slate-100 flex items-center justify-between">
                      {option.title}
                      {needsVehicle === option.need && <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 font-medium font-sans leading-relaxed">
                      {option.desc}
                    </p>
                  </button>
                ))}
              </div>

              <div className="flex justify-between pt-4">
                <button
                  id="wizard-back-step-3"
                  onClick={() => setStep(2)}
                  className="bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold px-5 py-3 rounded-xl text-sm flex items-center gap-1.5 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <button
                  id="wizard-simulate-btn"
                  onClick={() => setStep(4)}
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-slate-950 font-black px-8 py-3.5 rounded-xl text-sm flex items-center gap-2.5 transition active:scale-95 shadow-lg shadow-emerald-500/15 cursor-pointer uppercase font-mono tracking-wider"
                >
                  <Sparkles className="w-4 h-4 animate-spin" />
                  Simulate Custom Trip Map 📊
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 4: CURATED SIMULATION RESULTS */}
          {step === 4 && (
            <motion.div
              key="step-4"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.35 }}
              className="space-y-6 text-left"
            >
              
              {/* Back to start button */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-mono font-black uppercase text-emerald-400 tracking-wide">
                    Simulation Algorithm Successfully Calculated
                  </span>
                </div>
                <button
                  id="wizard-recalculate-btn"
                  onClick={handleReset}
                  className="text-slate-400 hover:text-white transition flex items-center gap-1 text-xs font-bold bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Re-Simulate
                </button>
              </div>

              {/* PART A: Dynamic Route Hop Map Diagram */}
              <div id="simulation-route-diagram" className="p-5 md:p-6 bg-slate-950/65 rounded-2xl border border-slate-800/75 select-none relative overflow-hidden">
                <div className="absolute top-2 right-2 bg-emerald-500/10 text-emerald-400 text-[9px] font-black font-mono border border-emerald-500/25 px-2 py-0.5 rounded uppercase">
                  Route Vector Graph
                </div>
                <h4 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-widest mb-4 flex items-center gap-1">
                  <Map className="w-4 h-4 text-emerald-400" /> Calculated Pathfinding Stream
                </h4>
                
                {/* Visual Hop Track */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 md:gap-2 overflow-x-auto py-2.5 scrollbar-hidden">
                  {results.customRouteSegments.map((segment, index, arr) => {
                    const hubData = hubs.find(h => h.id.toLowerCase() === segment.toLowerCase()) || 
                                    hubs.find(h => h.id.toLowerCase().includes(segment.toLowerCase()));
                    const nodeLabel = hubData ? hubData.name : segment.toUpperCase();
                    const isLast = index === arr.length - 1;
                    const isFirst = index === 0;

                    return (
                      <React.Fragment key={segment}>
                        <div className="flex items-center gap-3 md:flex-col md:gap-1.5 md:items-center text-left md:text-center shrink-0 min-w-[120px]">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-black border transition ${
                            isFirst 
                              ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/10' 
                              : isLast 
                                ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20 font-black animate-pulse' 
                                : 'bg-slate-800 text-slate-350 border-slate-700'
                          }`}>
                            {isFirst ? '🛫' : isLast ? '🏡' : '📍'}
                          </div>
                          <div className="flex flex-col md:items-center">
                            <span className="text-[11px] font-black text-slate-200 uppercase tracking-wide truncate max-w-[150px]">
                              {nodeLabel}
                            </span>
                            <span className="text-[9px] text-slate-505 font-medium font-mono">
                              {isFirst ? 'foothill gateway' : isLast ? 'final retreat' : `transit hop ${index}`}
                            </span>
                          </div>
                        </div>
                        
                        {!isLast && (
                          <div className="flex md:flex-grow items-center justify-center pl-4 md:pl-0">
                            {/* Horizontal line for desktop, vertical for mobile */}
                            <div className="w-0.5 h-6 bg-gradient-to-b from-slate-700 to-slate-800 md:w-full md:h-0.5 md:bg-gradient-to-r" />
                            <ArrowRight className="w-4 h-4 text-slate-650 shrink-0 mx-1 hidden md:block" />
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                <div className="mt-3.5 pt-3 border-t border-slate-850/60 flex items-center gap-2">
                  <span className="text-[10px] font-bold font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    Route Label
                  </span>
                  <p className="text-[11px] font-sans font-semibold text-slate-300 leading-normal">
                    {results.customRouteLabel}
                  </p>
                </div>
              </div>

              {/* Grid 2 Column: Curated destinations & lodging */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-2">
                
                {/* 1. Curated Destination Cards */}
                <div className="space-y-3.5">
                  <h4 className="text-sm font-bold text-slate-300 font-mono uppercase tracking-wider flex items-center justify-between select-none">
                    <span>🏔 Personalized Destinations to Visit</span>
                    <span className="text-[10.5px] text-sky-400">matching style</span>
                  </h4>

                  <div className="space-y-3">
                    {results.destinationsList.map((dest) => (
                      <div 
                        key={dest.id}
                        onClick={() => onNavigate(`#/destination/${getItemSlug(dest)}`)}
                        className="group flex gap-3.5 bg-slate-850/50 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/35 p-3.5 rounded-2xl transition duration-200 cursor-pointer"
                      >
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-800 shrink-0 relative">
                          <img 
                            src={dest.image} 
                            alt={dest.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                        </div>
                        <div className="flex-grow flex flex-col justify-between py-0.5">
                          <div>
                            <h5 className="font-extrabold text-slate-100 group-hover:text-emerald-400 text-sm transition">
                              {dest.name}
                            </h5>
                            <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                              {dest.description}
                            </p>
                          </div>
                          <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-800/40">
                            <span className="text-[9px] font-bold font-mono text-slate-500 uppercase">
                              🏡 {dest.tourismType}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5 group-hover:underline">
                              Explore <ArrowUpRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Curated Private Homestays */}
                <div className="space-y-3.5">
                  <h4 className="text-sm font-bold text-slate-300 font-mono uppercase tracking-wider flex items-center justify-between select-none">
                    <span>🏡 Exclusive Private Homestays</span>
                    <span className="text-[10.5px] text-emerald-400">Authentic Lodging</span>
                  </h4>

                  <div className="space-y-3">
                    {results.homestaysList.map((homestay) => (
                      <div 
                        key={homestay.id}
                        onClick={() => onNavigate(`#/destinations`)}
                        className="group flex gap-3.5 bg-slate-850/50 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/35 p-3.5 rounded-2xl transition duration-200 cursor-pointer"
                      >
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-850 shrink-0 relative">
                          <img 
                            src={homestay.images && homestay.images[0] ? homestay.images[0] : 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=400&auto=format&fit=crop'} 
                            alt={homestay.name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                        </div>
                        <div className="flex-grow flex flex-col justify-between py-0.5">
                          <div>
                            <h5 className="font-extrabold text-slate-100 group-hover:text-emerald-400 text-sm transition">
                              {homestay.name}
                            </h5>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {homestay.amenities && homestay.amenities.slice(0, 3).map((amenity, idx) => (
                                <span key={idx} className="bg-slate-800 text-slate-400 text-[8.5px] font-bold px-1.5 py-0.5 rounded border border-slate-750/50 font-mono">
                                  {amenity}
                                </span>
                              ))}
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-800/40">
                            <span className="text-[10.5px] font-bold text-yellow-400 font-mono">
                              ₹{homestay.priceMin} - ₹{homestay.priceMax} <span className="text-[8.5px] text-slate-500">/ night</span>
                            </span>
                            <span className="text-[10px] font-bold text-emerald-500 flex items-center gap-0.5 group-hover:underline">
                              Book / Inquire <ArrowUpRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* PART B: Scenic spots & taxi recommendation */}
              <div className="space-y-4">
                <h4 className="text-sm font-bold text-slate-300 font-mono uppercase tracking-wider select-none">
                  🌻 Scenic Spots & Interactive Activities to Check Out
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 select-none">
                  {results.attractionsList.map((attr) => (
                    <div 
                      key={attr.id}
                      onClick={() => onNavigate(`#/attraction/${getItemSlug(attr)}`)}
                      className="bg-slate-850/60 hover:bg-slate-800 border border-slate-800/80 hover:border-sky-505 p-3 rounded-xl transition text-center cursor-pointer group"
                    >
                      <span className="text-xl">
                        {attr.category === 'Monastery' ? '⛩️' : attr.category === 'Waterfall' ? '🌊' : attr.category === 'Viewpoint' ? '🌅' : attr.category === 'Trek' ? '🥾' : '🌲'}
                      </span>
                      <h5 className="font-extrabold text-[11px] text-slate-250 group-hover:text-sky-450 mt-1.5 truncate">
                        {attr.name}
                      </h5>
                      <span className="text-[9px] font-mono text-slate-500 tracking-wider uppercase block">
                        {attr.category}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Taxi Driver Details if Vehicle required */}
              {needsVehicle && (
                <div className="p-4 bg-amber-500/5 rounded-2xl border border-amber-500/15 flex flex-col md:flex-row items-center justify-between gap-4 select-none">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                      <Car className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <h5 className="font-extrabold text-amber-300 text-sm">
                        🚕 Certified Hill Cabs & Registered Drivers
                      </h5>
                      <p className="text-slate-400 text-[11px] font-sans font-medium mt-0.5 leading-normal">
                        Certified mountain drivers with full 4WD SUVs are matching this route segment! You can coordinate directly with taxi associations.
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onNavigate('#/book-car')}
                    className="w-full md:w-auto bg-amber-500 hover:bg-amber-600 font-black text-slate-950 px-5.5 py-2 rounded-xl text-xs flex items-center gap-1 shrink-0 uppercase tracking-wider transition active:scale-95 cursor-pointer"
                  >
                    View Registered Cabs <Phone className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Safety & Signal Alert Banner */}
              <div className="p-4 bg-blue-500/5 text-blue-300 rounded-2xl border border-blue-500/15 flex items-start gap-3 select-none">
                <Shield className="w-5 h-5 shrink-0 mt-0.5 text-blue-400" />
                <div>
                  <h5 className="font-extrabold text-sm text-blue-200">Himalayan Security & Signal Advisory</h5>
                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed mt-0.5">
                    {results.guidanceNotes}
                  </p>
                </div>
              </div>

              {/* Ultimate Call to Action: Perform actual Search with these inputs */}
              <div className="p-1 bg-gradient-to-r from-blue-600 via-emerald-500 to-teal-400 rounded-2xl">
                <div className="bg-slate-900 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-left">
                    <h4 className="font-black text-white text-base">
                      Trigger Mountain Pathfinding Core ⚡
                    </h4>
                    <p className="text-slate-400 text-xs font-sans font-medium mt-1 leading-normal max-w-lg">
                      Ready to execute? Let’s set your home route finder from <strong className="text-slate-200">{results.startLabel}</strong> to <strong className="text-slate-200">{hubs.find(h => h.id.toLowerCase() === results.finalTargetDestId.toLowerCase())?.name || results.finalTargetDestId.toUpperCase()}</strong> to map out multi-hop networks, transit tickets, and distance logs in real-time.
                    </p>
                  </div>
                  <button
                    id="wizard-execute-search-btn"
                    onClick={() => onExecuteSearch(startPoint, results.finalTargetDestId)}
                    className="w-full sm:w-auto bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-slate-950 font-black px-7 py-3 rounded-xl text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5 shrink-0 transition active:scale-95 cursor-pointer font-mono"
                  >
                    <Compass className="w-4 h-4 animate-spin" /> Launch Route Finder
                  </button>
                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </div>
  );
}
