import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Send, 
  X, 
  MapPin, 
  Bot, 
  Trash2, 
  ExternalLink, 
  CloudSun, 
  AlertTriangle, 
  Navigation, 
  HelpCircle,
  Clock,
  Map,
  Globe,
  Sliders,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  User,
  Wallet,
  Calendar,
  Compass,
  Car
} from 'lucide-react';
import { useThemeEngine } from './ThemeContext';

export interface SessionMemory {
  source?: string;
  destination?: string;
  budget?: string;
  days?: string;
  month?: string;
  travellerType?: string;
  vehicle?: string;
  interests?: string[];
  preferredStay?: string;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  modelUsed?: string;
  citations?: Array<{ title: string; url: string; type: 'web' | 'maps' }>;
  byAI?: boolean;
}

interface AiTravelGuideChatbotProps {
  currentPath: string;
  activeDestDetail?: any;
  activeHomeDetail?: any;
  activeAttrDetail?: any;
}

export default function AiTravelGuideChatbot({
  currentPath,
  activeDestDetail,
  activeHomeDetail,
  activeAttrDetail
}: AiTravelGuideChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [gpsActive, setGpsActive] = useState(false);
  const [showWelcomeTooltip, setShowWelcomeTooltip] = useState(false);

  const [memory, setMemory] = useState<SessionMemory>({
    source: '',
    destination: '',
    budget: '',
    days: '',
    month: '',
    travellerType: '',
    vehicle: '',
    interests: [],
    preferredStay: ''
  });
  const [showPreferences, setShowPreferences] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const { activeTheme } = useThemeEngine();

  // Load saved chat history or display initial welcome
  useEffect(() => {
    try {
      const savedMemory = localStorage.getItem('hillytrip_session_memory');
      if (savedMemory) {
        setMemory(JSON.parse(savedMemory));
      }
    } catch (e) {
      console.error('Failed to parse saved memory:', e);
    }

    try {
      const saved = localStorage.getItem('hillytrip_ai_chat');
      if (saved) {
        const parsed = JSON.parse(saved);
        setMessages(parsed.map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp)
        })));
      } else {
        // Initial welcome message
        const welcomeMsg: Message = {
          id: 'welcome',
          role: 'model',
          text: `Namaste! 🏔️ I am your **HillyTrip AI Travel Guide**, available 24/7 to assist you. 

I can:
- 🗺️ Create **personalized, day-by-day itineraries**
- 🚗 Suggest **routes & nearest taxi options**
- 🌦️ Provide **live weather & landslide road alerts** (via Google Search)
- 📍 Find **nearby homestays, petrol pumps & restaurants** (via Google Maps)

Where are we heading next? Tell me, or click one of the suggested prompts below!`,
          timestamp: new Date()
        };
        setMessages([welcomeMsg]);
      }
    } catch (e) {
      console.error('Failed to parse saved chat history:', e);
    }

    // Geolocation attempt
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setGpsActive(true);
        },
        (error) => {
          console.log('[GPS Geolocation] Location permission not granted or available:', error.message);
        }
      );
    }

    // Delay welcome tooltip
    const tooltipTimer = setTimeout(() => {
      setShowWelcomeTooltip(true);
    }, 4000);

    return () => clearTimeout(tooltipTimer);
  }, []);

  // Save conversation history to local storage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('hillytrip_ai_chat', JSON.stringify(messages));
    }
  }, [messages]);

  // Scroll messages on new updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);
    setShowWelcomeTooltip(false);

    try {
      // Determine context ID if user is on a detail page
      let contextId = undefined;
      if (currentPath.startsWith('/destination/') || currentPath.startsWith('/destinations/')) {
        contextId = activeDestDetail?.destination?.id || activeDestDetail?.id;
      } else if (currentPath.startsWith('/homestay/') || currentPath.startsWith('/homestays/')) {
        contextId = activeHomeDetail?.homestay?.id || activeHomeDetail?.id;
      } else if (currentPath.startsWith('/attraction/') || currentPath.startsWith('/attractions/')) {
        contextId = activeAttrDetail?.attraction?.id || activeAttrDetail?.id;
      }

      // We maintain the last 6 messages in history to optimize context size and speed
      const recentHistory = messages
        .filter(m => m.id !== 'welcome')
        .slice(-6)
        .map(m => ({
          role: m.role,
          text: m.text
        }));

      const res = await fetch('/api/ai-assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: recentHistory,
          latLng: userLocation,
          contextId,
          memory: memory
        })
      });

      if (!res.ok) {
        throw new Error('Our mountain server failed to respond.');
      }

      const data = await res.json();

      if (data.updatedMemory) {
        setMemory(data.updatedMemory);
        localStorage.setItem('hillytrip_session_memory', JSON.stringify(data.updatedMemory));
      }

      const assistantMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'model',
        text: data.reply,
        timestamp: new Date(),
        modelUsed: data.modelUsed,
        citations: data.citations,
        byAI: data.byAI
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      const errMsg: Message = {
        id: `error-${Date.now()}`,
        role: 'model',
        text: `⚠️ *Apologies, traveler.* I encountered an issue getting information from our mountain grid: "${err?.message || 'Connection offline'}". Please verify your connection or retry in a moment.`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Do you want to reset your conversation with your AI Guide?')) {
      const welcomeMsg: Message = {
        id: 'welcome',
        role: 'model',
        text: `Namaste! 🏔️ Conversation reset. Your AI Guide is fresh and ready.

Where can I assist you with HillyTrip bookings, safety road alerts, or personalized day plans?`,
        timestamp: new Date()
      };
      setMessages([welcomeMsg]);
      setMemory({
        source: '',
        destination: '',
        budget: '',
        days: '',
        month: '',
        travellerType: '',
        vehicle: '',
        interests: [],
        preferredStay: ''
      });
      localStorage.removeItem('hillytrip_ai_chat');
      localStorage.removeItem('hillytrip_session_memory');
    }
  };

  // Suggestion presets
  const presets = [
    { label: '🌤️ Lachen Weather', query: 'What is the current weather forecast for Lachen?' },
    { label: '⚠️ Road Conditions', query: 'Are there any landslide alerts or road closures in North Sikkim right now?' },
    { label: '🎒 3-Day Trek Plan', query: 'Plan a personalized 3-day adventurous trek itinerary in Sikkim including local homestays.' },
    { label: '⛽ Nearest Petrol', query: 'Find nearest petrol pump and taxi stand to Lachung and tell me distances.' },
    { label: '✨ Hidden Gems', query: 'What are some hidden gem villages and offbeat attractions verified in HillyTrip database?' }
  ];

  // Helper to format messages with bolding and bullet lists beautifully
  const formatText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let content = line;
      
      // Bold Markdown replacement
      const boldRegex = /\*\*(.*?)\*\*/g;
      const italicRegex = /\*(.*?)\*/g;
      
      let elements: React.ReactNode[] = [];
      let lastIndex = 0;
      let match;
      
      // Handle simple markdown line conversions
      if (line.startsWith('- ') || line.startsWith('* ')) {
        const listContent = line.substring(2);
        return (
          <li key={idx} className="ml-4 list-disc text-slate-750 dark:text-slate-300 leading-relaxed text-[12.5px] mt-1 font-sans">
            {listContent.replace(/\*\*/g, '')}
          </li>
        );
      }

      if (line.startsWith('### ')) {
        return <h4 key={idx} className="font-extrabold text-[13px] text-slate-900 dark:text-white mt-3.5 mb-1.5 uppercase tracking-wider">{line.substring(4)}</h4>;
      }
      if (line.startsWith('## ') || line.startsWith('# ')) {
        return <h3 key={idx} className="font-black text-sm text-slate-900 dark:text-white mt-4 mb-2 border-b border-slate-100 dark:border-slate-800/60 pb-1">{line.replace(/#/g, '').trim()}</h3>;
      }

      // Check for bullet lists inside text block
      return (
        <p key={idx} className="text-[12.5px] text-slate-750 dark:text-slate-300 leading-relaxed font-medium font-sans mb-2">
          {content.split('**').map((part, pIdx) => {
            if (pIdx % 2 === 1) {
              return <strong key={pIdx} className="font-black text-slate-900 dark:text-white">{part}</strong>;
            }
            return part;
          })}
        </p>
      );
    });
  };

  // Visibility constraints
  const isHidden = () => {
    const cleanPath = currentPath.toLowerCase();
    const hiddenPrefixes = ['/admin', '/partner-dashboard', '/dashboard', '/register'];
    return hiddenPrefixes.some(prefix => cleanPath.startsWith(prefix));
  };

  if (isHidden()) return null;

  // Visual highlights from current theme engine context
  const primaryThemeColor = activeTheme?.primaryColor || '#10b981';

  return (
    <div id="hillytrip-ai-advisor-system" className="fixed bottom-5 left-5 sm:bottom-8 sm:left-8 z-50 flex items-end">
      
      {/* 🔮 Chat window drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40, x: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40, x: -20 }}
            transition={{ type: 'spring', stiffness: 280, damping: 26 }}
            className="w-[92vw] sm:w-[410px] h-[550px] bg-white dark:bg-slate-950 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 dark:border-slate-850 flex flex-col overflow-hidden mb-18"
            style={{ borderTopColor: primaryThemeColor, borderTopWidth: '3px' }}
          >
            {/* Header */}
            <div className="px-4 py-4.5 bg-slate-50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-850 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-sm border border-slate-200/50 dark:border-slate-800 shrink-0">
                  <img 
                    src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=150&h=150&q=80" 
                    alt="AI Mountain Advisor"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider font-sans">
                      AI Travel Guide
                    </h3>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 font-mono flex items-center gap-1">
                    {gpsActive ? (
                      <>
                        <MapPin className="w-3 h-3 text-emerald-500 shrink-0" />
                        <span>GPS ACTIVE ({userLocation?.latitude.toFixed(2)}, {userLocation?.longitude.toFixed(2)})</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3 h-3 text-purple-400 shrink-0" />
                        <span>HillyTrip Smart Assistant</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Header actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handleClearHistory}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
                  title="Clear conversation history"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 🛠️ Travel OS Preference Profile Dashboard */}
            <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/80 flex flex-col shrink-0">
              <button
                onClick={() => setShowPreferences(!showPreferences)}
                className="w-full flex items-center justify-between px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-850/50 transition cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Sliders className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                  <span className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-widest font-mono">
                    Travel Profile Dashboard
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  {memory.destination && (
                    <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono">
                      {memory.destination}
                    </span>
                  )}
                  {showPreferences ? (
                    <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </div>
              </button>

              {showPreferences && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-100 dark:border-slate-800/40 grid grid-cols-2 gap-2 max-h-[170px] overflow-y-auto no-scrollbar">
                  {/* Source */}
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider font-mono">Starting From</label>
                    <input
                      type="text"
                      placeholder="e.g. Siliguri"
                      value={memory.source || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMemory(prev => {
                          const updated = { ...prev, source: val };
                          localStorage.setItem('hillytrip_session_memory', JSON.stringify(updated));
                          return updated;
                        });
                      }}
                      className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>

                  {/* Destination */}
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider font-mono">Going To</label>
                    <input
                      type="text"
                      placeholder="e.g. Takdah"
                      value={memory.destination || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMemory(prev => {
                          const updated = { ...prev, destination: val };
                          localStorage.setItem('hillytrip_session_memory', JSON.stringify(updated));
                          return updated;
                        });
                      }}
                      className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>

                  {/* Budget */}
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider font-mono">Max Budget</label>
                    <input
                      type="text"
                      placeholder="e.g. ₹15,000"
                      value={memory.budget || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMemory(prev => {
                          const updated = { ...prev, budget: val };
                          localStorage.setItem('hillytrip_session_memory', JSON.stringify(updated));
                          return updated;
                        });
                      }}
                      className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>

                  {/* Duration */}
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider font-mono">Trip Days</label>
                    <input
                      type="text"
                      placeholder="e.g. 3"
                      value={memory.days || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMemory(prev => {
                          const updated = { ...prev, days: val };
                          localStorage.setItem('hillytrip_session_memory', JSON.stringify(updated));
                          return updated;
                        });
                      }}
                      className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1 text-[11px] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                    />
                  </div>

                  {/* Month */}
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider font-mono">Month</label>
                    <select
                      value={memory.month || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMemory(prev => {
                          const updated = { ...prev, month: val };
                          localStorage.setItem('hillytrip_session_memory', JSON.stringify(updated));
                          return updated;
                        });
                      }}
                      className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                    >
                      <option value="">Choose Month...</option>
                      <option value="January">January</option>
                      <option value="February">February</option>
                      <option value="March">March</option>
                      <option value="April">April</option>
                      <option value="May">May</option>
                      <option value="June">June</option>
                      <option value="July">July</option>
                      <option value="August">August</option>
                      <option value="September">September</option>
                      <option value="October">October</option>
                      <option value="November">November</option>
                      <option value="December">December</option>
                    </select>
                  </div>

                  {/* Traveller Type */}
                  <div className="flex flex-col gap-0.5">
                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider font-mono">Travellers</label>
                    <select
                      value={memory.travellerType || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMemory(prev => {
                          const updated = { ...prev, travellerType: val };
                          localStorage.setItem('hillytrip_session_memory', JSON.stringify(updated));
                          return updated;
                        });
                      }}
                      className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500 font-medium"
                    >
                      <option value="">Who is traveling?</option>
                      <option value="Solo">Solo Traveler</option>
                      <option value="Couple">Couple / Honeymoon</option>
                      <option value="Family">Family Vacation</option>
                      <option value="Friends">Friends Group</option>
                      <option value="Seniors">Senior Citizens</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Messages Body */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50/50 dark:bg-slate-955 select-text">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2.5 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    
                    {/* Icon */}
                    {msg.role === 'model' && (
                      <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 mt-0.5 border border-slate-200/50 dark:border-slate-800">
                        <img 
                          src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=100&h=100&q=80" 
                          alt="AI Guide Avatar"
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    {/* Bubble */}
                    <div className="space-y-1.5">
                      <div
                        className={`px-3.5 py-2.5 rounded-2xl shadow-2xs ${
                          msg.role === 'user'
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-semibold'
                            : 'bg-white dark:bg-slate-900 text-slate-850 dark:text-slate-200 border border-slate-100 dark:border-slate-800/80'
                        }`}
                      >
                        {formatText(msg.text)}

                        {/* Grounding Attribution badge if present */}
                        {msg.role === 'model' && (
                          <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[9px] font-bold text-slate-400 font-mono select-none">
                            {msg.byAI === false ? (
                              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                                <span>VERIFIED HILLYTRIP INTELLIGENCE (0 TOKENS)</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-indigo-500 dark:text-indigo-400 font-medium">
                                <Sparkles className="w-3.5 h-3.5 shrink-0 animate-pulse" />
                                <span>AI ENGINE REASONING</span>
                              </div>
                            )}
                            {msg.modelUsed && (
                              <span className="text-[8px] opacity-80 uppercase tracking-wider font-semibold">
                                {msg.modelUsed}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Display Citations/Links as elegant mini-pills */}
                      {msg.role === 'model' && msg.citations && msg.citations.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-0.5 select-none">
                          {msg.citations.map((cite, cIdx) => (
                            <a
                              key={cIdx}
                              href={cite.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-lg text-[10px] font-black text-sky-500 hover:text-sky-600 transition"
                            >
                              {cite.type === 'maps' ? <Map className="w-3 h-3 text-emerald-500" /> : <Globe className="w-3 h-3 text-sky-400" />}
                              <span className="max-w-[120px] truncate">{cite.title}</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-2.5 max-w-[85%] flex-row">
                    <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 mt-0.5 animate-pulse border border-slate-200/50 dark:border-slate-800">
                      <img 
                        src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=100&h=100&q=80" 
                        alt="AI Guide Loading Avatar"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="bg-white dark:bg-slate-900 px-4 py-3.5 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-2xs flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-[10px] font-black text-slate-400 font-mono uppercase tracking-widest animate-pulse">
                        Grounding query...
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Preset Query Tags (chips) */}
            <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-850 overflow-x-auto whitespace-nowrap bg-white dark:bg-slate-950 select-none no-scrollbar flex gap-1.5 shrink-0">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(preset.query)}
                  className="px-2.5 py-1 border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-650 bg-slate-50 dark:bg-slate-900/40 text-[11px] font-bold text-slate-600 dark:text-slate-350 rounded-full transition shrink-0 cursor-pointer text-xs"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-850 bg-white dark:bg-slate-950 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage(inputValue);
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about weather, route ETA, homestays..."
                  className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-emerald-500 transition font-sans"
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="p-2.5 rounded-xl text-white flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                  style={{ backgroundColor: primaryThemeColor }}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🚀 Floating Trigger Button & Tooltip */}
      <div className="flex items-center gap-3 select-none">
        {/* Floating Bubble Tooltip */}
        <AnimatePresence>
          {showWelcomeTooltip && !isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, x: -15 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.85, x: -15 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
              className="relative flex items-center bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 px-4 py-2.5 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 text-xs font-semibold whitespace-nowrap"
            >
              {/* Close Tooltip Button */}
              <button 
                onClick={() => setShowWelcomeTooltip(false)}
                className="absolute -top-1.5 -left-1.5 p-0.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>

              <div className="flex flex-col text-left pl-1">
                <span className="font-extrabold text-[11px] text-purple-600 dark:text-purple-400 uppercase tracking-wider">
                  24/7 Travel Advisor
                </span>
                <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300 mt-0.5">
                  Ask HillyTrip AI Guide
                </span>
              </div>

              {/* Small arrow pointing left to trigger bubble */}
              <div className="absolute left-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 rotate-45 bg-white dark:bg-slate-900 border-l border-b border-slate-100 dark:border-slate-800" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Action Button */}
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setShowWelcomeTooltip(false);
          }}
          className="w-14 h-14 sm:w-16 sm:h-16 rounded-full text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer shrink-0 relative group p-0 overflow-visible"
          style={{ backgroundColor: primaryThemeColor }}
          aria-label="Toggle AI Travel Guide Chat"
          title="Talk with HillyTrip 24/7 AI Travel Assistant"
        >
          {isOpen ? (
            <X className="w-6 h-6 animate-fade-in" />
          ) : (
            <>
              <div className="w-full h-full rounded-full overflow-hidden p-0.5 flex items-center justify-center">
                <img 
                  src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=180&h=180&q=80" 
                  alt="AI Assistant"
                  className="w-full h-full rounded-full object-cover transition-transform duration-500 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-emerald-500 to-teal-500 p-1.5 rounded-full shadow-md border border-white dark:border-slate-900 text-white">
                <Sparkles className="w-3 h-3 animate-pulse" />
              </span>
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </span>
            </>
          )}
        </button>
      </div>

    </div>
  );
}
