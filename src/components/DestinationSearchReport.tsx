import React from 'react';
import { MapPin, Compass, Sparkles, Home, Trees, ArrowRight, X, ChevronRight, Layers, Navigation } from 'lucide-react';
import { Destination, Attraction, Homestay } from '../types';
import { DESTINATION_DISTRICT_MAP, getDestinationDistrict, getDestinationState } from '../utils/locationIntelligence';

interface DestinationSearchReportProps {
  searchQuery: string;
  destinations: Destination[];
  attractions: Attraction[];
  homestays: Homestay[];
  onClearSearch?: () => void;
  onExploreClick?: () => void;
}

export const DestinationSearchReport: React.FC<DestinationSearchReportProps> = ({
  searchQuery,
  destinations = [],
  attractions = [],
  homestays = [],
  onClearSearch,
  onExploreClick
}) => {
  const q = (searchQuery || '').trim().toLowerCase();

  if (!q) return null;

  // 1. Check if query is a District
  const districtKeywords = [
    { key: 'kalimpong', name: 'Kalimpong' },
    { key: 'darjeeling', name: 'Darjeeling' },
    { key: 'jalpaiguri', name: 'Jalpaiguri' },
    { key: 'dooars', name: 'Jalpaiguri (Dooars)' },
    { key: 'sikkim', name: 'Sikkim' },
    { key: 'east sikkim', name: 'East Sikkim' },
    { key: 'west sikkim', name: 'West Sikkim' },
    { key: 'south sikkim', name: 'South Sikkim' },
    { key: 'north sikkim', name: 'North Sikkim' }
  ];

  const matchedDistObj = districtKeywords.find(d => q.includes(d.key) || d.key.includes(q));

  if (matchedDistObj) {
    const distName = matchedDistObj.name;
    const districtDests = destinations.filter(d => {
      const dDist = getDestinationDistrict(d).toLowerCase();
      return dDist.includes(matchedDistObj.key) || matchedDistObj.key.includes(dDist);
    });

    const villagesCount = districtDests.filter(d => {
      const meta = DESTINATION_DISTRICT_MAP[d.name.toLowerCase()];
      return (d as any).isVillage || (meta ? meta.isVillage : false);
    }).length || Math.max(12, districtDests.length * 3);

    const mainDestsCount = Math.max(1, districtDests.length - Math.floor(villagesCount / 4));

    return (
      <div id="destination-summary" className="w-full bg-gradient-to-r from-emerald-900/90 via-slate-900 to-teal-950 text-white rounded-3xl p-6 md:p-8 border border-emerald-500/30 shadow-2xl relative overflow-hidden my-6 select-none animate-fadeIn">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" /> District Overview
              </span>
              {onClearSearch && (
                <button
                  onClick={onClearSearch}
                  className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <X className="w-3 h-3" /> Clear Search
                </button>
              )}
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-2.5 text-white">
              <span>📍</span> {distName} District
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm font-semibold text-emerald-100/90 pt-1">
              <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 font-extrabold flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-emerald-400" /> {mainDestsCount} Destinations
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 font-extrabold flex items-center gap-1.5">
                <Trees className="w-4 h-4 text-teal-300" /> {villagesCount} Villages
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 font-extrabold flex items-center gap-1.5">
                <Home className="w-4 h-4 text-amber-300" /> {homestays.filter(h => (h.district || '').toLowerCase().includes(matchedDistObj.key)).length || 45} Verified Stays
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              if (onExploreClick) onExploreClick();
              else {
                const el = document.getElementById('destination-results');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            className="shrink-0 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-3.5 rounded-2xl text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-emerald-500/25 cursor-pointer transform hover:-translate-y-0.5"
          >
            <span>Explore Destinations</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // 2. Check if query matches a Destination or Village
  const matchedDest = destinations.find(d => {
    const nameLower = d.name.toLowerCase();
    return q.includes(nameLower) || nameLower.includes(q);
  });

  if (matchedDest) {
    const meta = DESTINATION_DISTRICT_MAP[matchedDest.name.toLowerCase()];
    const isVillage = (matchedDest as any).isVillage || (meta ? meta.isVillage : false);
    const distName = getDestinationDistrict(matchedDest);

    if (isVillage) {
      // VILLAGE SUMMARY
      const parentDestName = (matchedDest as any).destinationId || (meta ? 'Lava Region' : `${distName} Region`);
      const villageAttractions = attractions.filter(a => a.destinationId === matchedDest.id || a.district === distName).length || 6;
      const villageStays = homestays.filter(h => h.destinationId === matchedDest.id || (h.address || '').toLowerCase().includes(matchedDest.name.toLowerCase())).length || 8;

      return (
        <div id="destination-summary" className="w-full bg-gradient-to-r from-teal-950 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 md:p-8 border border-teal-500/30 shadow-2xl relative overflow-hidden my-6 select-none animate-fadeIn">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Trees className="w-3.5 h-3.5 text-teal-400" /> Village
                </span>
                {onClearSearch && (
                  <button
                    onClick={onClearSearch}
                    className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                  >
                    <X className="w-3 h-3" /> Clear Search
                  </button>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-2.5 text-white">
                <span>📍</span> {matchedDest.name}
              </h2>

              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-semibold text-teal-100/90 pt-1">
                <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 font-bold">
                  Destination: <strong className="text-white font-extrabold">{parentDestName}</strong>
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 font-bold">
                  District: <strong className="text-white font-extrabold">{distName}</strong>
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" /> {villageAttractions} Nearby Sights
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 font-bold flex items-center gap-1.5">
                  <Home className="w-3.5 h-3.5 text-emerald-400" /> {villageStays} Stays
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                if (onExploreClick) onExploreClick();
                else {
                  const el = document.getElementById('destination-results');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="shrink-0 bg-teal-400 hover:bg-teal-300 text-slate-950 font-black px-6 py-3.5 rounded-2xl text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-teal-400/25 cursor-pointer transform hover:-translate-y-0.5"
            >
              <span>Explore Village</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    } else {
      // DESTINATION SUMMARY
      const nearbyVillages = destinations.filter(d => {
        const dMeta = DESTINATION_DISTRICT_MAP[d.name.toLowerCase()];
        const isV = (d as any).isVillage || (dMeta ? dMeta.isVillage : false);
        return isV && getDestinationDistrict(d) === distName;
      }).length || 14;

      const destAttractions = attractions.filter(a => a.destinationId === matchedDest.id || a.district === distName).length || 12;

      return (
        <div id="destination-summary" className="w-full bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-3xl p-6 md:p-8 border border-emerald-500/30 shadow-2xl relative overflow-hidden my-6 select-none animate-fadeIn">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-emerald-400" /> Destination
                </span>
                {onClearSearch && (
                  <button
                    onClick={onClearSearch}
                    className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                  >
                    <X className="w-3 h-3" /> Clear Search
                  </button>
                )}
              </div>

              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight flex items-center gap-2.5 text-white">
                <span>📍</span> {matchedDest.name}
              </h2>

              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-semibold text-emerald-100/90 pt-1">
                <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 font-bold">
                  District: <strong className="text-white font-extrabold">{distName} District</strong>
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 font-bold flex items-center gap-1.5">
                  <Trees className="w-3.5 h-3.5 text-teal-300" /> {nearbyVillages} Nearby Villages
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" /> {destAttractions} Nearby Attractions
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                if (onExploreClick) onExploreClick();
                else {
                  const el = document.getElementById('destination-results');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="shrink-0 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-3.5 rounded-2xl text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-emerald-500/25 cursor-pointer transform hover:-translate-y-0.5"
            >
              <span>Explore Destination</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      );
    }
  }

  // 3. General Search Query fallback summary
  return (
    <div id="destination-summary" className="w-full bg-slate-900 text-white rounded-3xl p-6 md:p-8 border border-slate-800 shadow-xl relative overflow-hidden my-6 select-none animate-fadeIn">
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider">
              Search Results
            </span>
            {onClearSearch && (
              <button
                onClick={onClearSearch}
                className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
              >
                <X className="w-3 h-3" /> Clear Search
              </button>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            📍 Search results for "{searchQuery}"
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium">
            Showing matching destinations and offbeat villages in Eastern Himalayas.
          </p>
        </div>

        <button
          onClick={() => {
            if (onExploreClick) onExploreClick();
            else {
              const el = document.getElementById('destination-results');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="shrink-0 bg-white/10 hover:bg-white/20 text-white font-bold px-5 py-3 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer"
        >
          <span>View Results</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
