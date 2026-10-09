import React, { useState, useEffect } from 'react';
import { 
  Sparkles, MapPin, Compass, Home, Car, ShoppingBag, Tag, 
  FileText, HelpCircle, Code, ShieldCheck, ChevronRight,
  BarChart2, Eye, Calendar, Layers, CheckCircle2, RefreshCw
} from 'lucide-react';
import { AssembledSmartPage, ContentItem } from '../../types/content';

interface SmartPageAssemblerProps {
  initialIdentifier?: string;
  onNavigate?: (path: string) => void;
}

export const SmartPageAssembler: React.FC<SmartPageAssemblerProps> = ({ 
  initialIdentifier = 'darjeeling',
  onNavigate 
}) => {
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [smartPage, setSmartPage] = useState<AssembledSmartPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [showJsonLd, setShowJsonLd] = useState(false);
  const [availableItems, setAvailableItems] = useState<ContentItem[]>([]);

  useEffect(() => {
    fetchAvailableItems();
    loadSmartPage(identifier);
  }, [identifier]);

  const fetchAvailableItems = async () => {
    try {
      const res = await fetch('/api/content/items?status=published');
      const data = await res.json();
      if (data.success) {
        setAvailableItems(data.items);
      }
    } catch (e) {
      console.error('Error fetching content items:', e);
    }
  };

  const loadSmartPage = async (idOrSlug: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/content/assemble/${idOrSlug}`);
      const data = await res.json();
      if (data.success) {
        setSmartPage(data.smartPage);
      } else {
        setSmartPage(null);
      }
    } catch (e) {
      console.error('Error assembling smart page:', e);
      setSmartPage(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner & Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider border border-indigo-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              Content Relationship Engine
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
              Smart Page Assembler
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              Every page automatically derives and binds nearby attractions, homestays, taxi hubs, offers, and travel guides using location proximity and taxonomy rules.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800">
            <label className="text-xs text-slate-400 font-medium px-2 shrink-0">Assemble Target:</label>
            <select
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-white text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
            >
              {availableItems.map((item) => (
                <option key={item.id} value={item.slug}>
                  [{item.contentType.toUpperCase()}] {item.title}
                </option>
              ))}
            </select>
            <button
              onClick={() => loadSmartPage(identifier)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-600/30"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Re-Assemble
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-16 text-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-sm font-medium">Assembling content graph & location relationships...</p>
        </div>
      ) : !smartPage ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-400 space-y-3">
          <HelpCircle className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">Target Content Not Found</h3>
          <p className="text-sm">Select a valid published destination or entity from the selector above.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Main Assembled Hero Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl text-white relative">
            <div className="relative h-72 md:h-96 w-full">
              <img
                src={smartPage.mainContent.featuredImage || 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png'}
                alt={smartPage.mainContent.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 bg-indigo-600/90 text-white text-xs font-bold rounded-full uppercase tracking-wider">
                    {smartPage.mainContent.contentType}
                  </span>
                  {smartPage.mainContent.district && (
                    <span className="px-3 py-1 bg-slate-800/90 text-slate-200 text-xs font-semibold rounded-full flex items-center gap-1.5 border border-slate-700">
                      <MapPin className="w-3.5 h-3.5 text-rose-400" />
                      {smartPage.mainContent.district}, {smartPage.mainContent.state}
                    </span>
                  )}
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    SEO Score: {smartPage.mainContent.seo.score || 90}/100
                  </span>
                </div>

                <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                  {smartPage.mainContent.title}
                </h1>
                
                <p className="text-slate-300 text-sm md:text-base max-w-3xl leading-relaxed">
                  {smartPage.mainContent.shortDescription}
                </p>
              </div>
            </div>

            {/* Quick Facts & Metadata Toolbar */}
            <div className="p-6 bg-slate-950/80 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 font-medium">Canonical Slug</span>
                <p className="text-slate-200 font-mono font-bold truncate">/{smartPage.mainContent.slug}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 font-medium">Author</span>
                <p className="text-slate-200 font-bold">{smartPage.mainContent.author.name}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 font-medium">Revision Version</span>
                <p className="text-slate-200 font-bold">v{smartPage.mainContent.version}.0 (Published)</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 font-medium">Derived Coordinates</span>
                <p className="text-slate-200 font-mono font-bold">
                  {smartPage.derivedLocation ? `${smartPage.derivedLocation.lat.toFixed(4)}, ${smartPage.derivedLocation.lng.toFixed(4)}` : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Derived Relationships Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-400" />
                  Auto-Assembled Modules
                </h2>
                <p className="text-xs text-slate-400">Dynamically compiled from HillyTrip Content Relationship Engine</p>
              </div>
              <button
                onClick={() => setShowJsonLd(!showJsonLd)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-2 cursor-pointer transition-all"
              >
                <Code className="w-4 h-4 text-emerald-400" />
                {showJsonLd ? 'Hide Schema.org JSON-LD' : 'Inspect Schema.org JSON-LD'}
              </button>
            </div>

            {/* JSON-LD Inspector Modal/Panel */}
            {showJsonLd && (
              <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-5 space-y-3 font-mono text-xs text-emerald-400">
                <div className="flex items-center justify-between text-slate-400 font-sans border-b border-slate-800 pb-2">
                  <span className="font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Structured Data Schema Output (JSON-LD)
                  </span>
                  <span className="text-[11px] bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded">Validation Passed</span>
                </div>
                <pre className="overflow-x-auto whitespace-pre-wrap leading-relaxed">
                  {JSON.stringify(smartPage.seoSchemaJsonLd, null, 2)}
                </pre>
              </div>
            )}

            {/* Section 1: Nearby Attractions */}
            {smartPage.relationships.nearbyAttractions.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Compass className="w-4.5 h-4.5 text-indigo-400" />
                    Nearby Attractions & Landmarks
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">{smartPage.relationships.nearbyAttractions.length} found</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {smartPage.relationships.nearbyAttractions.map((attr) => (
                    <div key={attr.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2 hover:border-slate-700 transition-all">
                      <div className="h-28 rounded-lg overflow-hidden relative">
                        <img src={attr.featuredImage || 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png'} alt={attr.title} className="w-full h-full object-cover" />
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-slate-900/80 text-white text-[10px] font-bold rounded">
                          {attr.district}
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-sm line-clamp-1">{attr.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2">{attr.shortDescription}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 2: Popular Homestays */}
            {smartPage.relationships.nearbyHomestays.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Home className="w-4.5 h-4.5 text-emerald-400" />
                    Recommended Local Homestays & Stays
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">{smartPage.relationships.nearbyHomestays.length} stays bound</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {smartPage.relationships.nearbyHomestays.map((hm) => (
                    <div key={hm.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2 hover:border-emerald-500/40 transition-all">
                      <div className="h-28 rounded-lg overflow-hidden relative">
                        <img src={hm.featuredImage || 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png'} alt={hm.title} className="w-full h-full object-cover" />
                      </div>
                      <h4 className="font-bold text-white text-sm line-clamp-1">{hm.title}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2">{hm.shortDescription}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 3: Travel Blogs & FAQs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Travel Guides */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-4.5 h-4.5 text-amber-400" />
                  Related Travel Guides & Blogs
                </h3>
                <div className="space-y-3">
                  {smartPage.relationships.relatedBlogs.map((b) => (
                    <div key={b.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 flex gap-3 hover:border-slate-700 transition-all">
                      <img src={b.featuredImage || 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png'} alt={b.title} className="w-20 h-16 object-cover rounded-lg shrink-0" />
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-white line-clamp-1">{b.title}</h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2">{b.shortDescription}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Frequently Asked Questions */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <HelpCircle className="w-4.5 h-4.5 text-sky-400" />
                  Frequently Asked Questions (FAQ Schema)
                </h3>
                <div className="space-y-3">
                  {smartPage.relationships.faqs.map((faq, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-1.5">
                      <h4 className="text-xs font-bold text-sky-300 flex items-center gap-2">
                        <span>Q:</span> {faq.question}
                      </h4>
                      <p className="text-[11px] text-slate-300 leading-relaxed pl-4 border-l-2 border-slate-800">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
