import React, { useState } from 'react';
import { 
  Sparkles, Compass, HelpCircle, Loader2, BookOpen, Briefcase, 
  Map, Copy, Check, Info, RefreshCw, Bot, Quote
} from 'lucide-react';

interface AiLocalAdvisorProps {
  name: string;
  category: string;
  description: string;
  destinationName?: string;
}

export default function AiLocalAdvisor({ name, category, description, destinationName }: AiLocalAdvisorProps) {
  const [activeTab, setActiveTab] = useState<'folklore' | 'itinerary' | 'packing' | 'hidden_secrets' | null>(null);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tabs = [
    {
      id: 'folklore' as const,
      label: 'Ancient Lore',
      icon: BookOpen,
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-50/50 dark:bg-amber-950/10',
      textColor: 'text-amber-800 dark:text-amber-400',
      activeBorder: 'border-amber-300 dark:border-amber-900',
      loaderMsg: 'summoning ancient legends and hill stories...',
      subtitle: 'Mythology, lore & spiritual background of the spot'
    },
    {
      id: 'itinerary' as const,
      label: 'Insider Itinerary',
      icon: Compass,
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50/50 dark:bg-emerald-950/10',
      textColor: 'text-emerald-800 dark:text-emerald-400',
      activeBorder: 'border-emerald-300 dark:border-emerald-900',
      loaderMsg: 'mapping an authentic 48-hour mountain journey...',
      subtitle: 'Optimal timings, dining points & sightseeing sequence'
    },
    {
      id: 'packing' as const,
      label: 'Safety & Gear',
      icon: Briefcase,
      color: 'from-indigo-500 to-blue-600',
      bgColor: 'bg-indigo-50/50 dark:bg-indigo-950/10',
      textColor: 'text-indigo-800 dark:text-indigo-400',
      activeBorder: 'border-indigo-300 dark:border-indigo-900',
      loaderMsg: 'calculating atmospheric elevations & required protective layering...',
      subtitle: 'Terrain difficulty, essential clothing & water safety'
    },
    {
      id: 'hidden_secrets' as const,
      label: 'Secret Spots',
      icon: Map,
      color: 'from-rose-500 to-pink-600',
      bgColor: 'bg-rose-50/50 dark:bg-rose-950/10',
      textColor: 'text-rose-800 dark:text-rose-400',
      activeBorder: 'border-rose-300 dark:border-rose-900',
      loaderMsg: 'consulting custom cartographer trails for photography viewpoints...',
      subtitle: '3 hidden adjacent paths normal commercial tourists miss'
    }
  ];

  const fetchAdvice = async (type: 'folklore' | 'itinerary' | 'packing' | 'hidden_secrets') => {
    setActiveTab(type);
    setLoading(true);
    setError(null);
    setContent('');
    setCopied(false);

    try {
      const response = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name,
          category,
          description,
          queryType: type,
          destinationName
        })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || 'Failed to communicate with our Himalayan guide model.');
      }

      const data = await response.json();
      setContent(data.advice || '');
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'The mountain advisor is currently busy. Please try again shortly.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentTabInfo = tabs.find(t => t.id === activeTab);

  return (
    <div id="ai-advisor-widget" className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-810 shadow-xs text-left transition-all relative overflow-hidden">
      {/* Visual background gradient decoration */}
      <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/5 rounded-full blur-2xl mt-[-20px] mr-[-20px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-indigo-500/5 rounded-full blur-2xl mb-[-20px] ml-[-20px] pointer-events-none" />

      {/* Header and badge */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-5 pb-5 border-b border-rose-100/10 dark:border-slate-800">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full uppercase tracking-wider mb-2 font-mono">
            <Sparkles className="w-3.5 h-3.5 animate-pulse text-emerald-500" /> Free AI Guide
          </span>
          <h3 className="font-extrabold text-xl sm:text-2xl text-slate-905 dark:text-white flex items-center gap-2">
            Himalayan Local AI Companion
          </h3>
          <p className="text-xs text-slate-505 dark:text-slate-400 mt-1">
            Summon ancient legends, bespoke 2-day itineraries, packing prep, and coordinates of photographic secret spots.
          </p>
        </div>
      </div>

      {/* Grid selector of query types */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        {tabs.map((tab) => {
          const TabIcon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => fetchAdvice(tab.id)}
              disabled={loading}
              className={`p-4 rounded-2xl border text-left flex items-start gap-3.5 transition duration-300 relative overflow-hidden group cursor-pointer ${
                isActive 
                  ? `${tab.bgColor} ${tab.activeBorder} ring-2 ring-emerald-500/15` 
                  : 'bg-slate-50/50 hover:bg-slate-50 border-slate-200 dark:bg-slate-800/10 dark:border-slate-800 dark:hover:bg-slate-800'
              }`}
            >
              <div className={`p-2.5 rounded-xl text-white bg-gradient-to-br ${tab.color} shrink-0 shadow-xs group-hover:scale-105 transition-transform duration-300`}>
                <TabIcon className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <span className={`font-extrabold text-sm block ${isActive ? tab.textColor : 'text-slate-800 dark:text-slate-200'}`}>
                  {tab.label}
                </span>
                <span className="text-[10px] text-slate-400 block leading-tight font-medium">
                  {tab.subtitle}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Content response area */}
      {activeTab && (
        <div className="border border-slate-200/90 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-950/20 rounded-2xl p-5 sm:p-6 animate-fade-in text-left">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center min-h-[160px]">
              <Loader2 className="w-10 h-10 text-emerald-600 animate-spin mb-3" />
              <p className="text-sm text-slate-600 dark:text-slate-350 font-semibold animate-pulse">
                {currentTabInfo?.loaderMsg}
              </p>
              <p className="text-[10px] text-slate-400 mt-2">
                This utilizes specialized Gemini-guided regional wisdom models
              </p>
            </div>
          ) : error ? (
            <div className="py-6 text-center text-rose-500 flex flex-col items-center gap-2">
              <Info className="w-8 h-8 text-rose-400" />
              <p className="text-sm font-semibold">{error}</p>
              <button 
                onClick={() => fetchAdvice(activeTab)} 
                className="mt-2 text-xs font-bold text-emerald-600 underline hover:text-emerald-500 transition cursor-pointer"
              >
                Try Re-fetching Insights
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className={`p-1.5 rounded-lg text-white bg-gradient-to-br ${currentTabInfo?.color}`}>
                    {currentTabInfo && <currentTabInfo.icon className="w-4 h-4" />}
                  </span>
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider font-mono">
                    {currentTabInfo?.label} Report
                  </span>
                </div>
                
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-emerald-300 dark:border-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 dark:hover:border-emerald-800 text-[10px] font-bold text-slate-650 dark:text-slate-300 flex items-center gap-1.5 transition shrink-0 cursor-pointer"
                  title="Copy insights to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="text-emerald-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>Copy Advice</span>
                    </>
                  )}
                </button>
              </div>

              {/* Render content paragraphs elegantly */}
              <div className="text-slate-700 dark:text-slate-350 text-sm leading-relaxed space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                {content.split('\n\n').map((para, pIdx) => {
                  const isBullet = para.trim().startsWith('*') || para.trim().startsWith('-');
                  const isHeader = para.trim().startsWith('#');
                  const isQuote = para.trim().startsWith('>') || (para.toLowerCase().includes('"') && currentTabInfo?.id === 'folklore' && pIdx === content.split('\n\n').length - 1);
                  
                  if (isQuote) {
                    return (
                      <div key={pIdx} className="bg-amber-500/10 border-l-4 border-amber-500 p-4 rounded-r-xl italic flex gap-3 my-2 text-slate-800 dark:text-amber-200">
                        <Quote className="w-5 h-5 text-amber-505 shrink-0 mt-0.5 opacity-60" />
                        <p className="text-xs sm:text-sm font-medium">
                          {para.replace(/^[>"\s']+|[>"\s']+$/g, '')}
                        </p>
                      </div>
                    );
                  }

                  if (isHeader) {
                    const cleanHeader = para.replace(/^[#\s]+/g, '');
                    return (
                      <h4 key={pIdx} className="font-extrabold text-sm sm:text-base text-slate-901 dark:text-white pt-2 flex items-center gap-2">
                        <span className="w-1.5 h-3.5 rounded-full bg-emerald-500 inline-block" />
                        {cleanHeader}
                      </h4>
                    );
                  }

                  if (isBullet) {
                    return (
                      <ul key={pIdx} className="space-y-1.5 my-2 pl-2">
                        {para.split('\n').map((line, lIdx) => {
                          const cleanLine = line.replace(/^[*-\s]+/g, '').trim();
                          if (!cleanLine) return null;
                          return (
                            <li key={lIdx} className="flex items-start gap-2 text-xs sm:text-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-2" />
                              <span>{cleanLine}</span>
                            </li>
                          );
                        })}
                      </ul>
                    );
                  }

                  return (
                    <p key={pIdx} className="text-xs sm:text-sm whitespace-pre-wrap leading-relaxed">
                      {para}
                    </p>
                  );
                })}
              </div>

              {/* Disclaimer */}
              <div className="flex items-start gap-2 bg-slate-100/60 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/30">
                <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-500 leading-normal">
                  All lore and trail advice represent local reference coordinates. Always verify active Himalayan pass weather notifications with your homestay host or cab operators before setting off.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
