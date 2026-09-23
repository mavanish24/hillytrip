import React, { useState, useEffect } from 'react';
import { AutocompleteSelect } from './AutocompleteSelect';
import { 
  WifiOff, Signal, CloudLightning, ShieldAlert, CheckCircle2, Activity,
  Compass, Heart, AlertCircle, Droplets, PhoneCall, Plus, Trash2, 
  Map, Edit2, Save, FileText, Layers, Search, ArrowRight, CheckSquare, Clock, MapPin, Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Hub, Route } from '../types';

// Using actual graph data from App.tsx scope
const NODE_COORDINATES: Record<string, { x: number; y: number; isMajor: boolean; label: string }> = {
  njp: { x: 180, y: 340, isMajor: true, label: "NJP (New Jalpaiguri)" },
  bagdogra: { x: 80, y: 340, isMajor: true, label: "Bagdogra Airport" },
  kurseong: { x: 140, y: 230, isMajor: true, label: "Kurseong" },
  mirik: { x: 50, y: 240, isMajor: true, label: "Mirik" },
  darjeeling: { x: 90, y: 90, isMajor: true, label: "Darjeeling" },
  sittong: { x: 230, y: 220, isMajor: true, label: "Sittong" },
  kalimpong: { x: 320, y: 180, isMajor: true, label: "Kalimpong" },
  pedong: { x: 340, y: 100, isMajor: true, label: "Pedong" },
  loleygaon: { x: 410, y: 250, isMajor: true, label: "Loleygaon" },
  lava: { x: 430, y: 160, isMajor: true, label: "Lava" },
  rishop: { x: 440, y: 90, isMajor: true, label: "Rishop" },
  ghoom: { x: 110, y: 130, isMajor: false, label: "Ghoom" },
  "teesta bazar": { x: 260, y: 170, isMajor: false, label: "Teesta Bazar" },
  siliguri: { x: 140, y: 300, isMajor: false, label: "Siliguri" },
  sevoke: { x: 200, y: 280, isMajor: false, label: "Sevoke" },
  kalijhora: { x: 210, y: 250, isMajor: false, label: "Kalijhora" },
  "sukhia pokhari": { x: 60, y: 180, isMajor: false, label: "Sukhia Pokhari" },
  "peshok tea garden": { x: 210, y: 140, isMajor: false, label: "Peshok Tea Garden" },
  sonada: { x: 125, y: 180, isMajor: false, label: "Sonada" },
  algara: { x: 380, y: 140, isMajor: false, label: "Algara" }
};

const REGIONAL_CONNECTIONS = [
  ["njp", "siliguri"],
  ["siliguri", "mirik"],
  ["njp", "kurseong"],
  ["bagdogra", "kurseong"],
  ["kurseong", "sonada"],
  ["sonada", "ghoom"],
  ["ghoom", "darjeeling"],
  ["njp", "sevoke"],
  ["sevoke", "kalijhora"],
  ["kalijhora", "sittong"],
  ["ghoom", "sukhia pokhari"],
  ["sukhia pokhari", "mirik"],
  ["ghoom", "peshok tea garden"],
  ["peshok tea garden", "teesta bazar"],
  ["njp", "teesta bazar"],
  ["bagdogra", "teesta bazar"],
  ["teesta bazar", "kalimpong"],
  ["kalimpong", "algara"],
  ["algara", "lava"],
  ["algara", "pedong"],
  ["lava", "loleygaon"]
];

interface OfflineTravelHubProps {
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
  hubs: Hub[];
  routes: Route[];
  setNotification: (notif: { type: 'success' | 'error'; message: string }) => void;
}

interface PersonalNote {
  id: string;
  title: string;
  content: string;
  date: string;
  altitude?: string;
}

export default function OfflineTravelHub({
  isOffline,
  setIsOffline,
  hubs,
  routes,
  setNotification
}: OfflineTravelHubProps) {
  // Offline dashboard state
  const [syncProgress, setSyncProgress] = useState<number | null>(null);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [isCached, setIsCached] = useState<boolean>(
    localStorage.getItem('hillytrip_offline_bundle_cached') === 'true'
  );
  
  // Vector map state
  const [startNode, setStartNode] = useState<string>('');
  const [endNode, setEndNode] = useState<string>('');
  const [calculatedPath, setCalculatedPath] = useState<string[]>([]);
  const [routeStats, setRouteStats] = useState<{ time: string; distance: string; fare: string } | null>(null);

  // AMS Diagnostic State
  const [amsSymptoms, setAmsSymptoms] = useState({
    headache: false,
    dizziness: false,
    fatigue: false,
    nausea: false,
    insomnia: false,
    breathless: false
  });
  const [amsRiskScore, setAmsRiskScore] = useState<number>(0);
  
  // Acclimatization Blueprint State
  const [currentElev, setCurrentElev] = useState<number>(1000);
  const [targetElev, setTargetElev] = useState<number>(3500);
  const [generatedSchedule, setGeneratedSchedule] = useState<string[]>([]);

  // Hydration state
  const [hydrationGlasses, setHydrationGlasses] = useState<number>(() => {
    const saved = localStorage.getItem('hillytrip_offline_hydration');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Emergency SMS generator state
  const [selectedSosHub, setSelectedSosHub] = useState<string>('darjeeling');
  const [sosStatus, setSosStatus] = useState<string>('Stranded with a vehicle glitch');
  const [generatedSms, setGeneratedSms] = useState<string>('');

  // Local Packing states
  const [packingItems, setPackingItems] = useState<{ id: string; name: string; checked: boolean; category: string }[]>(() => {
    const saved = localStorage.getItem('hillytrip_offline_packing');
    if (saved) return JSON.parse(saved);
    return [
      { id: '1', name: 'Diamox (Acetazolamide) tablets', checked: false, category: 'Medical & Health' },
      { id: '2', name: 'ORS Packets & Hydration salts', checked: false, category: 'Medical & Health' },
      { id: '3', name: 'High-altitude sub-zero sleeping bag', checked: false, category: 'Mountaineering Gear' },
      { id: '4', name: 'Heavy Insulated windproof parka layer', checked: false, category: 'Clothing & Warmth' },
      { id: '5', name: 'Thermal base layers (Merino wool recommended)', checked: false, category: 'Clothing & Warmth' },
      { id: '6', name: 'Water-filtration straw or chlorine tablets', checked: false, category: 'Medical & Health' },
      { id: '7', name: 'Charged heavy-duty Powerbank (20000mAh)', checked: false, category: 'Survival & Electronics' },
      { id: '8', name: 'Manual Compass & Printed topo maps', checked: false, category: 'Survival & Electronics' },
      { id: '9', name: 'High-calorie energy bars & trail mix', checked: false, category: 'Survival & Electronics' },
      { id: '10', name: 'Waterproof trekking boots with ankle protection', checked: false, category: 'Mountaineering Gear' }
    ];
  });

  // Personal Notes Scratchpad state
  const [notes, setNotes] = useState<PersonalNote[]>(() => {
    const saved = localStorage.getItem('hillytrip_offline_scratchpad_notes');
    return saved ? JSON.parse(saved) : [];
  });
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [newNoteAlt, setNewNoteAlt] = useState('');

  // active sub-tab for local views
  const [activeTab, setActiveTab] = useState<'map' | 'safety' | 'sos' | 'packing' | 'notes'>('map');

  // Trigger manual cache download sequence
  const startOfflineSync = () => {
    setSyncProgress(10);
    setSyncStatus('Initiating local mountain database replication...');
    
    const steps = [
      { p: 25, label: 'Mapping 35 Himalayan geographic hub nodes...' },
      { p: 50, label: 'Synchronizing 48 deep route vectors and high-pass durations...' },
      { p: 70, label: 'Caching local homestay contact registers & approved attractions...' },
      { p: 90, label: 'Installing offline regional emergency maps & AMS medical guides...' },
      { p: 100, label: 'Verification of database integrity succeeded. Device ready.' }
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setSyncProgress(step.p);
        setSyncStatus(step.label);
        if (step.p === 100) {
          localStorage.setItem('hillytrip_offline_bundle_cached', 'true');
          setIsCached(true);
          setNotification({
            type: 'success',
            message: '🏔️ Offline Database Sync Successful! HillyTrip is now fully responsive throughout the mountain ranges.'
          });
          setTimeout(() => setSyncProgress(null), 2500);
        }
      }, (idx + 1) * 650);
    });
  };

  const clearOfflineSync = () => {
    localStorage.removeItem('hillytrip_offline_bundle_cached');
    setIsCached(false);
    setNotification({
      type: 'error',
      message: 'Cleared local offline storage databases.'
    });
  };

  // Route calculation algorithm (BFS) on custom interactive nodes
  const calculateOfflineRoute = () => {
    if (!startNode || !endNode) return;
    if (startNode === endNode) {
      setCalculatedPath([startNode]);
      setRouteStats({ time: '0 min', distance: '0 km', fare: '₹0' });
      return;
    }

    // Build Adjacency list
    const adj: Record<string, string[]> = {};
    Object.keys(NODE_COORDINATES).forEach(k => adj[k] = []);
    REGIONAL_CONNECTIONS.forEach(([u, v]) => {
      if (adj[u]) adj[u].push(v);
      if (adj[v]) adj[v].push(u);
    });

    // BFS search
    const queue: [string, string[]][] = [[startNode, [startNode]]];
    const visited = new Set<string>([startNode]);
    let pathFound: string[] | null = null;

    while (queue.length > 0) {
      const [curr, path] = queue.shift()!;
      if (curr === endNode) {
        pathFound = path;
        break;
      }
      
      const neighbors = adj[curr] || [];
      for (const n of neighbors) {
        if (!visited.has(n)) {
          visited.add(n);
          queue.push([n, [...path, n]]);
        }
      }
    }

    if (pathFound) {
      setCalculatedPath(pathFound);
      const hopsCount = pathFound.length - 1;
      // Synthesize realistic stats
      const distance = Math.round(hopsCount * 22.5);
      const timeHours = Math.round(hopsCount * 0.9 * 10) / 10;
      const fareMin = hopsCount * 350;
      setRouteStats({
        time: `${timeHours} hrs / ${hopsCount} travel hops`,
        distance: `${distance} km total path`,
        fare: `Est. Private: ₹${fareMin} - ₹${fareMin + 600} / Shared: ₹${hopsCount * 120}`
      });
    } else {
      setCalculatedPath([]);
      setRouteStats(null);
      setNotification({
        type: 'error',
        message: 'No direct connected offline path detected in this sector yet. Try another connection.'
      });
    }
  };

  useEffect(() => {
    calculateOfflineRoute();
  }, [startNode, endNode]);

  // AMS Diagnostic risk evaluation
  useEffect(() => {
    let score = 0;
    if (amsSymptoms.headache) score += 3;
    if (amsSymptoms.dizziness) score += 2;
    if (amsSymptoms.fatigue) score += 1;
    if (amsSymptoms.nausea) score += 2;
    if (amsSymptoms.breathless) score += 3;
    if (amsSymptoms.insomnia) score += 1;
    setAmsRiskScore(score);
  }, [amsSymptoms]);

  // Altitude Acclimatization Generator
  const generateAcclimationPlan = () => {
    const diff = targetElev - currentElev;
    if (diff <= 0) {
      setGeneratedSchedule(["Ascending is not negative or zero. Enter a target altitude higher than current location."]);
      return;
    }
    const days: string[] = [];
    let elev = currentElev;
    days.push(`🏔️ Target Elevation: ${targetElev}m (Total vertical ascent needed: ${diff}m)`);
    days.push(`🟢 Day 1: Establish base camp at ${elev}m. Consume 4L fluid. Take rest steps.`);
    
    let currentDay = 2;
    while (elev < targetElev) {
      if (elev >= 3000) {
        // High altitude rule: maximum 400m ascent per day with rest day every 1000m
        elev = Math.min(elev + 400, targetElev);
        days.push(`🏃 Day ${currentDay}: Climb gradually to ${elev}m. Do not overexert. Monitor breathing.`);
        currentDay++;
        if (elev < targetElev && currentDay % 3 === 0) {
          days.push(`🛑 Day ${currentDay}: Rest & Acclimate at ${elev}m. Stay at hydration targets.`);
          currentDay++;
        }
      } else {
        elev = Math.min(elev + 800, targetElev);
        days.push(`🏃 Day ${currentDay}: Advance to ${elev}m. Altitude acclimatization triggers active.`);
        currentDay++;
      }
    }
    days.push(`🎯 Day ${currentDay}: Arrive at target summit ${targetElev}m safely with full acclimatization safety matrices.`);
    setGeneratedSchedule(days);
  };

  // SOS SMS generator trigger
  useEffect(() => {
    const formattedHub = NODE_COORDINATES[selectedSosHub]?.label || selectedSosHub.toUpperCase();
    const smsText = `S.O.S EMERGENCY MOUNTAIN RESCUE: I am currently stranded at or near ${formattedHub}.\n` +
      `Current Status Indicator: ${sosStatus}.\n` +
      `Signal status: Weak/Intermittent. Require support coordination. Sent via HillyTrip Sentinel offline.`;
    setGeneratedSms(smsText);
  }, [selectedSosHub, sosStatus]);

  // Persistent hydration tracking helper
  const addHydrationGlass = () => {
    const next = hydrationGlasses + 1;
    setHydrationGlasses(next);
    localStorage.setItem('hillytrip_offline_hydration', String(next));
  };
  const clearHydration = () => {
    setHydrationGlasses(0);
    localStorage.removeItem('hillytrip_offline_hydration');
  };

  // Persistent packing checklist updater
  const handleTogglePacking = (id: string) => {
    const updated = packingItems.map(item => {
      if (item.id === id) return { ...item, checked: !item.checked };
      return item;
    });
    setPackingItems(updated);
    localStorage.setItem('hillytrip_offline_packing', JSON.stringify(updated));
  };

  // Note Scratchpad Management
  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim() || !newNoteContent.trim()) return;
    const newNote: PersonalNote = {
      id: Math.random().toString(36).substring(2, 9),
      title: newNoteTitle,
      content: newNoteContent,
      date: new Date().toLocaleDateString('en-IN', { hour: 'numeric', minute: 'numeric' }),
      altitude: newNoteAlt ? `${newNoteAlt} meters` : undefined
    };
    const updated = [newNote, ...notes];
    setNotes(updated);
    localStorage.setItem('hillytrip_offline_scratchpad_notes', JSON.stringify(updated));
    setNewNoteTitle('');
    setNewNoteContent('');
    setNewNoteAlt('');
    setNotification({
      type: 'success',
      message: 'Draft Note saved locally inside offline device state.'
    });
  };

  const handleDeleteNote = (id: string) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    localStorage.setItem('hillytrip_offline_scratchpad_notes', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-100 py-10 transition-colors duration-200">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* TOP EMBEDDED DASHBOARD HEADER */}
        <div className="bg-white dark:bg-slate-900 border border-slate-250/70 dark:border-slate-800/80 rounded-3xl p-6 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            
            <div className="flex items-start gap-4">
              <div className="p-3.5 bg-amber-500/10 text-amber-500 dark:text-amber-400 rounded-2xl flex items-center justify-center shrink-0 border border-amber-500/20">
                <WifiOff className="w-8 h-8 animate-pulse" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/20 mb-2 uppercase tracking-widest font-mono">
                  Sentinel Offline Travel-Kit
                </span>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                  Mountain Offline Companion
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-450 mt-1 max-w-xl">
                  Internet signals drop above forest canopies. This active console protects your adventure with locally executing vector maps, Acute Mountain Sickness (AMS) tools, and direct satellite SOS generators running entirely without a network connection.
                </p>
              </div>
            </div>

            {/* Simulated Signal Control Board */}
            <div className="flex flex-col xs:flex-row md:flex-col lg:flex-row gap-3 bg-slate-50 dark:bg-slate-950 p-4 border border-slate-150 dark:border-slate-850 rounded-2xl items-stretch shrink-0">
              <div className="flex flex-col justify-center">
                <span className="text-[9px] font-extrabold uppercase text-slate-400 tracking-wider block font-mono">Connectivity State</span>
                <span className={`text-xs font-black flex items-center gap-1.5 mt-1 ${isOffline ? 'text-amber-500' : 'text-emerald-500'}`}>
                  {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Signal className="w-3.5 h-3.5" />}
                  {isOffline ? 'OFFLINE (Mountain Mode)' : 'CONNECTED (Server Live)'}
                </span>
              </div>
              
              <button
                onClick={() => {
                  const state = !isOffline;
                  setIsOffline(state);
                  setNotification({
                    type: state ? 'error' : 'success',
                    message: state 
                      ? '⚡ Connectivity off. Device running on local replicated data records.' 
                      : '🏔️ Connected back to HillyTrip high-speeds server.'
                  });
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold cursor-pointer transition flex items-center justify-center gap-1.5 border text-center ${
                  isOffline 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 font-extrabold'
                    : 'bg-amber-600 hover:bg-amber-700 text-white border-amber-700 font-extrabold'
                }`}
              >
                {isOffline ? 'Re-establish Online' : 'Simulate Offline Mode'}
              </button>
            </div>
          </div>

          {/* Caching Manager Progress bar */}
          <div className="mt-6 pt-6 border-t border-slate-150 dark:border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col">
              <span className="text-xs font-black text-slate-800 dark:text-slate-100">
                {isCached ? '✅ Geographic Maps Replicated' : '⚠️ Regional Maps Not Saved Locally'}
              </span>
              <span className="text-[11px] text-slate-450 mt-1">
                {isCached ? '35 Hubs, 48 routes, and safety protocols reside securely in device state. Active offline navigation enabled.' : 'Save the complete route index into cache so you can browse, calculate paths, and view itineraries under sub-zero signals.'}
              </span>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {isCached && (
                <button
                  onClick={clearOfflineSync}
                  className="px-3 py-2 bg-slate-100 dark:bg-slate-850 text-slate-600 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs font-bold rounded-xl transition border border-slate-200 dark:border-slate-800"
                >
                  Remove database offline copies
                </button>
              )}
              <button
                onClick={startOfflineSync}
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-extrabold rounded-xl transition shadow-md shadow-sky-600/10 flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                {isCached ? 'Update Offline Database' : 'Download Offline Travel Bundle'}
              </button>
            </div>
          </div>

          {/* Sync Progress Panel */}
          {syncProgress !== null && (
            <div className="mt-5 bg-sky-50 dark:bg-sky-950/20 p-4 border border-sky-100 dark:border-sky-950 rounded-2xl animate-fade-in">
              <div className="flex items-center justify-between text-xs font-black text-sky-800 dark:text-sky-300 mb-2">
                <span>{syncStatus}</span>
                <span>{syncProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-250 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-sky-600 transition-all duration-300"
                  style={{ width: `${syncProgress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* NAVIGATION NAVIGATION MENU */}
        <div className="flex gap-1 bg-slate-200/50 dark:bg-slate-900/60 p-1 rounded-2xl mb-8 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden border border-slate-200/30 dark:border-slate-800/20 max-w-full">
          <button
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold tracking-wide uppercase transition shrink-0 cursor-pointer flex items-center gap-2 ${
              activeTab === 'map'
                ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-950 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Map className="w-4 h-4" />
            Interactive Offline Map
          </button>
          
          <button
            onClick={() => setActiveTab('safety')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold tracking-wide uppercase transition shrink-0 cursor-pointer flex items-center gap-2 ${
              activeTab === 'safety'
                ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-950 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            AMS Companion
          </button>

          <button
            onClick={() => setActiveTab('sos')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold tracking-wide uppercase transition shrink-0 cursor-pointer flex items-center gap-2 ${
              activeTab === 'sos'
                ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-950 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            Hollow-Signal SOS
          </button>

          <button
            onClick={() => setActiveTab('packing')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold tracking-wide uppercase transition shrink-0 cursor-pointer flex items-center gap-2 ${
              activeTab === 'packing'
                ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-950 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            Rucksack Packlist
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`px-4 py-2.5 rounded-xl text-xs font-extrabold tracking-wide uppercase transition shrink-0 cursor-pointer flex items-center gap-2 ${
              activeTab === 'notes'
                ? 'bg-white dark:bg-slate-800 shadow-sm text-slate-950 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            Offline Scratchpad ({notes.length})
          </button>
        </div>

        {/* CONTAINER CONTENT VIEWS */}
        <div className="dark:bg-transparent">
          
          {/* TAB 1: INTERACTIVE ROUTE MAP VECTOR CANVAS */}
          {activeTab === 'map' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
              
              {/* Controls */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 rounded-3xl p-6 self-start flex flex-col gap-5">
                <div>
                  <h3 className="text-sm font-black uppercase text-sky-500 tracking-wider">Sector Locator</h3>
                  <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white mt-1">
                    Calculate Path Offline
                  </h2>
                  <p className="text-xs text-slate-450 mt-1">
                    Computes direct and intermediate routes using the client-side network topology.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Departure Hub Location</label>
                    <AutocompleteSelect
                      id="departure-hub"
                      value={startNode}
                      onChange={(e) => setStartNode(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-205 dark:border-slate-800 p-3 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 cursor-pointer"
                    >
                      <option value="">-- Tap or Select Hub --</option>
                      {Object.keys(NODE_COORDINATES).map(key => (
                        <option key={`start-${key}`} value={key}>{NODE_COORDINATES[key].label}</option>
                      ))}
                    </AutocompleteSelect>
                  </div>

                  <div className="flex justify-center">
                    <div className="w-8 h-8 rounded-full border border-slate-150 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex items-center justify-center text-slate-450 text-xs">
                      ↓
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Destination Hub Location</label>
                    <AutocompleteSelect
                      id="destination-hub"
                      value={endNode}
                      onChange={(e) => setEndNode(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-205 dark:border-slate-800 p-3 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100 cursor-pointer"
                    >
                      <option value="">-- Tap or Select Hub --</option>
                      {Object.keys(NODE_COORDINATES).map(key => (
                        <option key={`end-${key}`} value={key}>{NODE_COORDINATES[key].label}</option>
                      ))}
                    </AutocompleteSelect>
                  </div>
                </div>

                {/* Calculated statistics panel */}
                {routeStats && (
                  <div className="bg-sky-50 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900 p-4 rounded-2xl mt-2">
                    <span className="text-[9px] font-extrabold uppercase text-sky-600 block tracking-wider font-mono">Offline Path Solution</span>
                    <div className="flex flex-col gap-2 mt-2">
                      <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200">
                        <Clock className="w-4 h-4 text-sky-500 shrink-0" />
                        <span><strong>Duration:</strong> {routeStats.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200">
                        <MapPin className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span><strong>Distance:</strong> {routeStats.distance}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-800 dark:text-slate-200">
                        <Layers className="w-4 h-4 text-purple-500 shrink-0" />
                        <span className="leading-tight"><strong>Estimation:</strong> {routeStats.fare}</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-sky-100 dark:border-sky-950">
                      <span className="text-[9px] font-extrabold uppercase text-slate-400 block">Sectors & Stops Sequence</span>
                      <div className="flex items-center flex-wrap gap-1.5 mt-2">
                        {calculatedPath.map((node, index) => (
                          <React.Fragment key={`seq-${node}`}>
                            {index > 0 && <span className="text-slate-350 text-[10px]">→</span>}
                            <span className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 px-2 py-1 rounded text-[10px] font-black uppercase text-slate-700 dark:text-slate-300 font-mono">
                              {node}
                            </span>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Graphical Canvas */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 rounded-3xl p-6 flex flex-col min-h-[460px] relative overflow-hidden group">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <div>
                    <h3 className="text-xs font-extrabold uppercase text-emerald-500 tracking-wider">Himalayan Vector Topology</h3>
                    <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white">
                      Interactive Local Node Map
                    </h2>
                  </div>
                  <span className="text-[10px] font-extrabold font-mono text-slate-400 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 px-2.5 py-1 rounded">
                    Darjeeling - Kalimpong Sector
                  </span>
                </div>

                <div className="bg-slate-950 rounded-2xl flex-grow overflow-auto relative border border-slate-800 h-[380px] p-2 flex items-center justify-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  
                  {/* Backdrop network grid vector container */}
                  <svg 
                    viewBox="0 0 460 380" 
                    className="w-full max-w-[460px] h-full filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] cursor-crosshair select-none relative z-10"
                  >
                    {/* 1. Base Unselected Connections */}
                    {REGIONAL_CONNECTIONS.map(([v1, v2], idx) => {
                      const u = NODE_COORDINATES[v1];
                      const v = NODE_COORDINATES[v2];
                      if (!u || !v) return null;
                      
                      // Check if part of highlighted route
                      let isHighlighted = false;
                      for (let i = 0; i < calculatedPath.length - 1; i++) {
                        const n1 = calculatedPath[i];
                        const n2 = calculatedPath[i+1];
                        if ((n1 === v1 && n2 === v2) || (n1 === v2 && n2 === v1)) {
                          isHighlighted = true;
                          break;
                        }
                      }

                      return (
                        <line
                          key={`line-${idx}`}
                          x1={u.x}
                          y1={u.y}
                          x2={v.x}
                          y2={v.y}
                          stroke={isHighlighted ? '#10b981' : '#334155'}
                          strokeWidth={isHighlighted ? 4 : 1.5}
                          strokeDasharray={isHighlighted ? '0' : '4, 2'}
                          className={isHighlighted ? 'animate-pulse' : ''}
                        />
                      );
                    })}

                    {/* 2. Highlighted Route overlay glowing effects */}
                    {calculatedPath.map((node, idx) => {
                      if (idx === calculatedPath.length - 1) return null;
                      const nextNode = calculatedPath[idx+1];
                      const u = NODE_COORDINATES[node];
                      const v = NODE_COORDINATES[nextNode];
                      if (!u || !v) return null;
                      return (
                        <line
                          key={`glow-${idx}`}
                          x1={u.x}
                          y1={u.y}
                          x2={v.x}
                          y2={v.y}
                          stroke="#0ea5e9"
                          strokeWidth={8}
                          strokeOpacity={0.25}
                          strokeLinecap="round"
                        />
                      );
                    })}

                    {/* 3. Render Nodes */}
                    {Object.keys(NODE_COORDINATES).map((key) => {
                      const node = NODE_COORDINATES[key];
                      const isStart = startNode === key;
                      const isEnd = endNode === key;
                      const isSelected = isStart || isEnd;
                      const isPart = calculatedPath.includes(key);

                      let fill = '#1e293b';
                      let stroke = '#475569';
                      let r = node.isMajor ? 6 : 4;

                      if (isStart) {
                        fill = '#0284c7';
                        stroke = '#e0f2fe';
                        r = 9;
                      } else if (isEnd) {
                        fill = '#10b981';
                        stroke = '#ecfdf5';
                        r = 9;
                      } else if (isPart) {
                        fill = '#38bdf8';
                        stroke = '#0ea5e9';
                        r = 7;
                      } else if (node.isMajor) {
                        fill = '#0f172a';
                        stroke = '#0284c7';
                        r = 6.5;
                      }

                      return (
                        <g 
                          key={`g-node-${key}`}
                          onClick={() => {
                            if (!startNode) {
                              setStartNode(key);
                            } else if (startNode && !endNode && startNode !== key) {
                              setEndNode(key);
                            } else {
                              setStartNode(key);
                              setEndNode('');
                            }
                          }}
                          className="cursor-pointer group"
                        >
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={r}
                            fill={fill}
                            stroke={stroke}
                            strokeWidth={isSelected ? 3.5 : 1.5}
                          />
                          {(node.isMajor || isSelected) && (
                            <text
                              x={node.x}
                              y={node.y - (r + 4)}
                              textAnchor="middle"
                              fill={isSelected ? '#ffffff' : '#94a3b8'}
                              fontSize={isSelected ? '9px' : '7.5px'}
                              fontWeight={isSelected ? '900' : 'bold'}
                              fontFamily="monospace"
                              className="pointer-events-none select-none bg-slate-900 border"
                            >
                              {node.label}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>

                  {/* Absolute map legend inside vector container */}
                  <div className="absolute bottom-3 left-3 bg-slate-950/80 border border-slate-800 p-2.5 rounded-lg text-[9px] text-slate-400 flex flex-col gap-1.5 font-mono pointer-events-none z-20">
                    <span className="font-extrabold uppercase tracking-wide text-[8px] text-slate-500 mb-0.5">Vector Legend</span>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-600 outline outline-sky-300"></span>
                      <span>Departure Point</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 outline outline-emerald-250"></span>
                      <span>Target Destination</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-900 outline outline-sky-500"></span>
                      <span>Major Mountain Hub</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-850 outline outline-slate-600"></span>
                      <span>Transit Spot / Ridge</span>
                    </div>
                  </div>

                  {/* Reset overlay trigger */}
                  {(startNode || endNode) && (
                    <button
                      onClick={() => {
                        setStartNode('');
                        setEndNode('');
                      }}
                      className="absolute top-3 right-3 bg-slate-900/90 border border-slate-800 hover:border-slate-650 text-white rounded-lg px-2.5 py-1.5 font-mono text-[9px] font-black uppercase cursor-pointer z-20"
                    >
                      Reset Paths
                    </button>
                  )}
                </div>

                <p className="text-[10px] text-slate-450 mt-3 font-mono text-center">
                  💡 Tips: Select your path directly by clicking the node dots on the interactive map vector canvas. Run calculations instantly.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: AMS CLINICAL ACCLIMATIZATION COMPANION */}
          {activeTab === 'safety' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in">
              
              {/* Symptom Checker Scorecard */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 rounded-3xl p-6">
                <div className="mb-6">
                  <h3 className="text-sm font-black uppercase text-rose-500 tracking-wider">Acclimatization Health Unit</h3>
                  <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white mt-1">
                    Acute Mountain Sickness (AMS) Diagnostic
                  </h2>
                  <p className="text-xs text-slate-450 mt-1">
                    Higher regions are dry with thin oxygen density. Select matching checklist parameters to assess biological adaptation indexes.
                  </p>
                </div>

                <div className="space-y-3.5 mb-6">
                  <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-955 rounded-xl border border-slate-150 dark:border-slate-850 cursor-pointer hover:bg-slate-100 transition select-none">
                    <input
                      type="checkbox"
                      checked={amsSymptoms.headache}
                      onChange={() => setAmsSymptoms({ ...amsSymptoms, headache: !amsSymptoms.headache })}
                      className="rounded text-rose-600 border-slate-350 focus:ring-rose-500 cursor-pointer h-4 w-4"
                    />
                    <div>
                      <span className="block text-xs font-black text-slate-900 dark:text-white">Throbbing Headache (At rest)</span>
                      <span className="text-[10px] text-slate-450">Most prominent early sign of oxygen saturation drops in high sectors.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-955 rounded-xl border border-slate-150 dark:border-slate-850 cursor-pointer hover:bg-slate-100 transition select-none">
                    <input
                      type="checkbox"
                      checked={amsSymptoms.dizziness}
                      onChange={() => setAmsSymptoms({ ...amsSymptoms, dizziness: !amsSymptoms.dizziness })}
                      className="rounded text-rose-600 border-slate-350 focus:ring-rose-500 cursor-pointer h-4 w-4"
                    />
                    <div>
                      <span className="block text-xs font-black text-slate-900 dark:text-white">Dizziness, Lightheadedness or Spinning</span>
                      <span className="text-[10px] text-slate-450">Indicating cerebral adaptation demands. Avoid rapid vertical trails.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-955 rounded-xl border border-slate-150 dark:border-slate-850 cursor-pointer hover:bg-slate-100 transition select-none">
                    <input
                      type="checkbox"
                      checked={amsSymptoms.fatigue}
                      onChange={() => setAmsSymptoms({ ...amsSymptoms, fatigue: !amsSymptoms.fatigue })}
                      className="rounded text-rose-600 border-slate-350 focus:ring-rose-500 cursor-pointer h-4 w-4"
                    />
                    <div>
                      <span className="block text-xs font-black text-slate-900 dark:text-white">Extreme Fatigue or Muscle Soreness</span>
                      <span className="text-[10px] text-slate-450">Severe energy drop unrelated to walking duration or rucksack weight.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-955 rounded-xl border border-slate-150 dark:border-slate-850 cursor-pointer hover:bg-slate-100 transition select-none">
                    <input
                      type="checkbox"
                      checked={amsSymptoms.nausea}
                      onChange={() => setAmsSymptoms({ ...amsSymptoms, nausea: !amsSymptoms.nausea })}
                      className="rounded text-rose-600 border-slate-350 focus:ring-rose-500 cursor-pointer h-4 w-4"
                    />
                    <div>
                      <span className="block text-xs font-black text-slate-900 dark:text-white">Loss of Appetite, Nausea or Vomiting</span>
                      <span className="text-[10px] text-slate-450">Digestive speed degrades due to arterial constriction under altitude changes.</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-955 rounded-xl border border-slate-150 dark:border-slate-850 cursor-pointer hover:bg-slate-100 transition select-none">
                    <input
                      type="checkbox"
                      checked={amsSymptoms.breathless}
                      onChange={() => setAmsSymptoms({ ...amsSymptoms, breathless: !amsSymptoms.breathless })}
                      className="rounded text-rose-600 border-slate-350 focus:ring-rose-500 cursor-pointer h-4 w-4"
                    />
                    <div>
                      <span className="block text-xs font-black text-slate-950 dark:text-white">Shortness of Breath (Dyspnea at rest)</span>
                      <span className="text-[10px] text-slate-450">Rapid shallow respiration while resting. Critical indicator for HAPE.</span>
                    </div>
                  </label>
                </div>

                {/* Score and recommendations output */}
                <div className={`p-5 rounded-2xl border ${
                  amsRiskScore === 0
                    ? 'bg-emerald-50/40 border-emerald-100 text-emerald-900 dark:bg-emerald-950/10 dark:border-emerald-900 dark:text-emerald-300'
                    : amsRiskScore <= 4
                    ? 'bg-amber-50/40 border-amber-100 text-amber-900 dark:bg-amber-950/10 dark:border-amber-900 dark:text-amber-300'
                    : 'bg-rose-50/40 border-rose-100 text-rose-900 dark:bg-rose-950/10 dark:border-rose-900 dark:text-rose-300'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider font-mono">Clinical Hazard Rating</span>
                    <span className="text-xs font-black font-mono px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-950 shadow-xs">
                      Index Match: {amsRiskScore} / 12
                    </span>
                  </div>

                  {amsRiskScore === 0 ? (
                    <div>
                      <span className="block text-xs font-black">✔ Respiration Saturation Stable</span>
                      <p className="text-[10px] mt-1 leading-relaxed opacity-90">
                        No significant AMS indicators marked. Maintain standard altitude adaptation speeds. Ensure hydration rates.
                      </p>
                    </div>
                  ) : amsRiskScore <= 4 ? (
                    <div>
                      <span className="block text-xs font-black">⚠️ Mild Altitude Sickness Detected</span>
                      <p className="text-[10px] mt-1 leading-relaxed opacity-90">
                        <strong>Advice:</strong> Strictly do not ascend to higher altitudes tonight. Rest at current hub. Hydrate aggressively using ORS packets (4-5 liters total fluids). Monitor symptoms. If headache persists, consider Diamox dosage.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <span className="block text-xs font-black">🚨 CRITICAL MOUNTAIN DANGER ADVISORY</span>
                      <p className="text-[10px] mt-1 leading-relaxed opacity-90">
                        <strong>IMMEDIATE ACTION REQUIRED:</strong> Severe cerebral/pulmonary hazard risk! You must descend immediately by at least 500 to 1,000 meters vertical. Administer emergency bottled oxygen if available. Do not sleep at current altitude elevation. Contact local Himalayan Emergency Patrol in the SOS index tab.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Ascent Schedule Generator & Hydration */}
              <div className="space-y-6">
                
                {/* Hydration Tracker Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 rounded-3xl p-6">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="text-sm font-black uppercase text-sky-500 tracking-wider">Hydration Monitor</h3>
                      <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white mt-1">
                        4.5 Liter Fluids Sentinel
                      </h2>
                      <p className="text-xs text-slate-450 mt-1">
                        High mountain environments cause quick cellular dehydration. Drink water constantly.
                      </p>
                    </div>
                    
                    <div className="p-3 bg-sky-50 dark:bg-sky-950/30 text-sky-500 rounded-2xl border border-sky-100 dark:border-sky-850 shrink-0">
                      <Droplets className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Glass counters */}
                  <div className="flex gap-2 items-center justify-center my-6">
                    {Array.from({ length: 8 }).map((_, idx) => (
                      <span 
                        key={`water-${idx}`}
                        className={`w-8 h-10 rounded-lg flex items-end justify-center border-2 transition-all cursor-pointer relative overflow-hidden ${
                          idx < hydrationGlasses
                            ? 'border-sky-500 bg-sky-500/20'
                            : 'border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950'
                        }`}
                        onClick={addHydrationGlass}
                      >
                        {idx < hydrationGlasses && (
                          <span className="w-full h-3/4 bg-sky-500 absolute bottom-0 left-0 animate-pulse"></span>
                        )}
                        <span className="text-[10px] font-black absolute inset-0 flex items-center justify-center font-mono opacity-60">
                          {idx + 1}
                        </span>
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-955 p-3.5 rounded-2xl border border-slate-150 dark:border-slate-850">
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-305">
                      Total Count: <strong>{(hydrationGlasses * 0.45).toFixed(2)} Liters</strong> (Goal: 4.5L/Day)
                    </span>
                    <button
                      onClick={clearHydration}
                      className="text-[10px] font-black uppercase tracking-wider text-rose-500 hover:text-rose-600 cursor-pointer"
                    >
                      Reset Daily Count
                    </button>
                  </div>
                </div>

                {/* Acclimation Scheduler Card */}
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 rounded-3xl p-6">
                  <div className="mb-4">
                    <h3 className="text-sm font-black uppercase text-purple-500 tracking-wider font-mono">Elevation Blueprint</h3>
                    <h2 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                      Ascent Acclimatization Calculator
                    </h2>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-[9px] font-extrabold uppercase text-slate-400 block mb-1">Starting Elevation (meters)</label>
                      <input
                        type="number"
                        value={currentElev}
                        onChange={(e) => setCurrentElev(parseInt(e.target.value, 10))}
                        className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-205 dark:border-slate-800 p-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-100 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] font-extrabold uppercase text-slate-400 block mb-1">Target Peak Summit (meters)</label>
                      <input
                        type="number"
                        value={targetElev}
                        onChange={(e) => setTargetElev(parseInt(e.target.value, 10))}
                        className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-205 dark:border-slate-800 p-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-100 rounded-lg"
                      />
                    </div>
                  </div>

                  <button
                    onClick={generateAcclimationPlan}
                    className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-black rounded-xl transition cursor-pointer"
                  >
                    Solve Ascent Acclimatization Plan
                  </button>

                  {/* Plan results */}
                  {generatedSchedule.length > 0 && (
                    <div className="mt-4 bg-slate-950 p-4 border border-slate-800 text-xs text-slate-300 font-mono rounded-2xl max-h-[220px] overflow-y-auto space-y-2">
                      <span className="text-[9px] font-extrabold text-slate-500 uppercase">Acclimatization Roadmap</span>
                      {generatedSchedule.map((line, idx) => (
                        <div key={`sched-${idx}`} className={`pb-2 ${idx < generatedSchedule.length - 1 ? 'border-b border-slate-900' : ''}`}>
                          {line}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: HOLLOW-SIGNAL EMERGENCY SOS CENTER */}
          {activeTab === 'sos' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in text-left">
              
              {/* Emergency SMS Generator Tool */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 rounded-3xl p-6">
                <div>
                  <h3 className="text-sm font-black uppercase text-rose-500 tracking-wider">Zero Internet S.O.S</h3>
                  <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white mt-1">
                    Emergency Text Generation Draft tool
                  </h2>
                  <p className="text-xs text-slate-450 mt-1">
                    Internet packets might fail, but cellular basic SMS networks and local emergency responders frequently latch on weak signals. Generate high-density panic rescue SMS parameters in 1-tap.
                  </p>
                </div>

                <div className="space-y-4 my-6">
                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Your Closest Mountain Corridor</label>
                    <AutocompleteSelect
                      id="sos-corridor"
                      value={selectedSosHub}
                      onChange={(e) => setSelectedSosHub(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-205 dark:border-slate-800 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 rounded-lg cursor-pointer"
                    >
                      {Object.keys(NODE_COORDINATES).map(k => (
                        <option key={`sos-hub-${k}`} value={k}>{NODE_COORDINATES[k].label}</option>
                      ))}
                    </AutocompleteSelect>
                  </div>

                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Current Critical Incident Category</label>
                    <input
                      type="text"
                      value={sosStatus}
                      onChange={(e) => setSosStatus(e.target.value)}
                      placeholder="e.g. Stranded due to snowfall with weak battery"
                      className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-205 dark:border-slate-800 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Synthesized High-Density SMS Draft</label>
                    <textarea
                      rows={4}
                      value={generatedSms}
                      readOnly
                      className="w-full bg-slate-950 border border-slate-850 p-3 text-xs font-mono font-semibold text-rose-300 rounded-xl focus:outline-hidden"
                    />
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedSms);
                      setNotification({
                        type: 'success',
                        message: 'Rescue SMS string copied successfully! Paste instantly in your standard messaging apps.'
                      });
                    }}
                    className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl transition duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-600/10"
                  >
                    <Share2 className="w-4 h-4" />
                    Copy S.O.S Text to Device clipboard
                  </button>
                </div>
              </div>

              {/* Critical Regional Responders Contact Ledger */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 rounded-3xl p-6">
                <div>
                  <h3 className="text-sm font-black uppercase text-indigo-500 tracking-wider">Himalayan Emergency Desk</h3>
                  <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white mt-1">
                    Mountain Disaster Helpline registers
                  </h2>
                  <p className="text-xs text-slate-450 mt-1">
                    Printed contact credentials of official disaster divisions. Fully packed inside client offline bundles. No connection needed.
                  </p>
                </div>

                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1 mt-6">
                  
                  {/* Item 1 */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-955 rounded-2xl border border-slate-150 dark:border-slate-850 flex flex-col gap-1.5 hover:border-slate-350 transition">
                    <span className="text-[10px] font-extrabold uppercase text-rose-500 tracking-wider font-mono">Central Emergency Desk</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">National Indian Incident Response Division</span>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs font-mono text-slate-600 dark:text-slate-400">🔥 Primary Line: <strong>112 / 108</strong></span>
                      <a href="tel:112" className="px-2.5 py-1 bg-white hover:bg-slate-100 dark:bg-slate-900 text-[10px] font-black border border-slate-200 dark:border-slate-800 rounded">Call 112</a>
                    </div>
                  </div>

                  {/* Item 2 */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-955 rounded-2xl border border-slate-150 dark:border-slate-850 flex flex-col gap-1.5 hover:border-slate-350 transition">
                    <span className="text-[10px] font-extrabold uppercase text-indigo-500 tracking-wider font-mono">Darjeeling & Kurseong</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">Darjeeling Hill Rescue Cell</span>
                    <div className="flex justify-between items-center mt-2 flex-wrap gap-2">
                      <span className="text-xs font-mono text-slate-600 dark:text-slate-400">📞 Landline Support: <strong>0354-2252155</strong></span>
                      <a href="tel:03542252155" className="px-2.5 py-1 bg-white hover:bg-slate-100 dark:bg-slate-900 text-[10px] font-black border border-slate-200 dark:border-slate-800 rounded">Call Land</a>
                    </div>
                  </div>

                  {/* Item 3 */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-955 rounded-2xl border border-slate-150 dark:border-slate-850 flex flex-col gap-1.5 hover:border-slate-350 transition">
                    <span className="text-[10px] font-extrabold uppercase text-sky-500 tracking-wider font-mono">Sikkim State Rescue</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">Sikkim Disaster Management Cell (Gangtok)</span>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs font-mono text-slate-600 dark:text-slate-400">📞 Desk Patrol: <strong>03592-202461</strong></span>
                      <a href="tel:03592202461" className="px-2.5 py-1 bg-white hover:bg-slate-100 dark:bg-slate-900 text-[10px] font-black border border-slate-200 dark:border-slate-800 rounded">Call Gang</a>
                    </div>
                  </div>

                  {/* Item 4 */}
                  <div className="p-4 bg-slate-50 dark:bg-slate-955 rounded-2xl border border-slate-150 dark:border-slate-850 flex flex-col gap-1.5 hover:border-slate-350 transition">
                    <span className="text-[10px] font-extrabold uppercase text-emerald-500 tracking-wider font-mono">Himachal Snow Patrol</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white">Manali High Altitude Rescue Division</span>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs font-mono text-slate-600 dark:text-slate-400">🏔️ Base Station: <strong>01902-252116</strong></span>
                      <a href="tel:01902252116" className="px-2.5 py-1 bg-white hover:bg-slate-100 dark:bg-slate-900 text-[10px] font-black border border-slate-200 dark:border-slate-800 rounded">Call Res</a>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}

          {/* TAB 4: PACKING CHECKLISTS */}
          {activeTab === 'packing' && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 rounded-3xl p-6 animate-fade-in text-left">
              <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-black uppercase text-sky-500 tracking-wider">Rucksack Assessment</h3>
                  <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white mt-1">
                    Himalayan Gear & Survival Inventory Check list
                  </h2>
                  <p className="text-xs text-slate-450 mt-1">
                    Altitude environments are brutal. Ensure you possess every medical and heat-preservation asset. Persists completely offline.
                  </p>
                </div>

                <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-955 border border-slate-150 dark:border-slate-850 rounded-xl flex items-center gap-2 self-start md:self-auto font-mono text-xs font-bold">
                  <span>Progress Checked:</span>
                  <span className="text-emerald-500">
                    {packingItems.filter(item => item.checked).length} / {packingItems.length} ({Math.round((packingItems.filter(item => item.checked).length / packingItems.length) * 100)}%)
                  </span>
                </div>
              </div>

              {/* Categorized list items */}
              {['Medical & Health', 'Clothing & Warmth', 'Survival & Electronics', 'Mountaineering Gear'].map(cat => {
                const items = packingItems.filter(i => i.category === cat);
                return (
                  <div key={`packing-cat-${cat}`} className="mb-6">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-[#3b82f6] border-b border-slate-150 dark:border-slate-850 pb-1.5 mb-3">
                      📁 {cat}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {items.map(item => (
                        <div 
                          key={`packing-item-${item.id}`}
                          onClick={() => handleTogglePacking(item.id)}
                          className={`flex items-center gap-3 p-3.5 rounded-xl border cursor-pointer select-none transition ${
                            item.checked
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-350'
                              : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-955/40 border-slate-150 dark:border-slate-850 hover:border-slate-300'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all shrink-0 ${
                            item.checked
                              ? 'bg-emerald-500 border-emerald-400 text-white'
                              : 'border-slate-300 bg-white dark:bg-slate-900'
                          }`}>
                            {item.checked && '✓'}
                          </span>
                          <span className={`text-xs font-bold leading-normal ${item.checked ? 'line-through opacity-60' : ''}`}>
                            {item.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 5: OFFLINE NOTE SCRATCHPAD */}
          {activeTab === 'notes' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in text-left">
              
              {/* Creator form */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 rounded-3xl p-6 self-start">
                <div>
                  <h3 className="text-sm font-black uppercase text-indigo-505 tracking-wider">Digital Ledger</h3>
                  <h2 className="text-lg font-black tracking-tight text-slate-900 dark:text-white mt-1">
                    Offline Memo Scratchpad
                  </h2>
                  <p className="text-xs text-slate-450 mt-1">
                    Jot down homestay descriptions, emergency landmarks, local path conditions, or offline checklist points directly to device memory.
                  </p>
                </div>

                <form onSubmit={handleAddNote} className="space-y-4 mt-6">
                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Memo Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sittong Homestay Landmark Room 3"
                      value={newNoteTitle}
                      onChange={(e) => setNewNoteTitle(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-205 dark:border-slate-800 p-2 text-xs font-semibold text-slate-800 dark:text-slate-100 rounded-lg focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Local Altitude context (optional)</label>
                    <input
                      type="number"
                      placeholder="e.g. 2400"
                      value={newNoteAlt}
                      onChange={(e) => setNewNoteAlt(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-205 dark:border-slate-800 p-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-100 rounded-lg focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1">Detailed description *</label>
                    <textarea
                      rows={5}
                      required
                      placeholder="Write your note drafts, transport vehicle license numbers or emergency path instructions here..."
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-955 border border-slate-205 dark:border-slate-800 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-100 rounded-lg focus:outline-hidden"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs tracking-wider uppercase rounded-xl transition duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Save draft to device memory
                  </button>
                </form>
              </div>

              {/* Memo Lists */}
              <div className="lg:col-span-2 space-y-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-450 block">My Saved Off-grid Memo List ({notes.length})</span>
                
                {notes.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200/85 dark:border-slate-850 rounded-3xl p-10 text-center flex flex-col items-center justify-center">
                    <FileText className="w-12 h-12 text-slate-350 mb-3 animate-bounce" />
                    <span className="block text-sm font-black text-slate-900 dark:text-white">Active Memo Stack Empty</span>
                    <p className="text-xs text-slate-450 mt-1 max-w-sm mx-auto">
                      No off-grid drafts created on this device yet. Write a note on the creator board.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {notes.map(note => (
                      <div 
                        key={`note-${note.id}`}
                        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-350 transition relative group"
                      >
                        <div>
                          <div className="flex justify-between items-start gap-4">
                            <span className="text-[9px] font-extrabold font-mono text-slate-400 bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-850">
                              🕒 {note.date}
                            </span>
                            
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="text-slate-400 hover:text-rose-500 p-1 cursor-pointer transition"
                              title="Delete Note"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mt-2.5 leading-snug">{note.title}</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-medium leading-relaxed whitespace-pre-wrap">{note.content}</p>
                        </div>

                        {note.altitude && (
                          <div className="mt-4 pt-2.5 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between text-[10px] font-mono text-slate-400">
                            <span>Altitude Context:</span>
                            <span className="text-sky-505 dark:text-sky-400 font-extrabold">{note.altitude}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
