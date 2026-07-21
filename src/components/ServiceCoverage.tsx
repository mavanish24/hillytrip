import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Search, MapPin, Check, X, Shield, Users, Calendar, 
  Map as MapIcon, Sliders, Sparkles, CheckCircle, AlertCircle, 
  ChevronRight, RefreshCw, Layers, MapPinned, HelpCircle, User,
  Globe, Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LocationItem {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  district: string;
  state: string;
}

interface ServiceCoverageProps {
  user: any;
  onUpdateUser?: (updated: any) => void;
}

export default function ServiceCoverage({ user, onUpdateUser }: ServiceCoverageProps) {
  // Master states
  const [masterLocations, setMasterLocations] = useState<LocationItem[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<LocationItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  
  // API and UI states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Admin feature states
  const [isAdmin, setIsAdmin] = useState(false);
  const [allOperators, setAllOperators] = useState<any[]>([]);
  const [selectedOperatorId, setSelectedOperatorId] = useState<string>('');
  const [selectedOperatorEmail, setSelectedOperatorEmail] = useState<string>('');
  const [loadingOperators, setLoadingOperators] = useState(false);

  // Search, filtration & autocomplete states
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeSearchIndex, setActiveSearchIndex] = useState(-1);
  const [searchDropdownOpen, setSearchDropdownOpen] = useState(false);
  
  // Filters
  const [stateFilter, setStateFilter] = useState('All');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All'); // mapped to districts/custom
  const [currentPreset, setCurrentPreset] = useState('Custom');

  // Last Updated track
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [lastUpdatedBy, setLastUpdatedBy] = useState<string | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('hillytrip_recent_searches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        setRecentSearches([]);
      }
    }
  }, []);

  // Check admin role
  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'Admin' || user.email === 'amrkmurarka@gmail.com')) {
      setIsAdmin(true);
      fetchOperators();
    }
  }, [user]);

  // Fetch Master Locations (Taxi Stands)
  const fetchMasterLocations = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/taxi-stands');
      if (!res.ok) throw new Error('Failed to load master taxi stands database.');
      const data = await res.json();
      
      // Convert master Record<string, details> to array
      const items: LocationItem[] = Object.entries(data).map(([name, val]: [string, any]) => ({
        id: name,
        name: name,
        latitude: Number(val.latitude) || 0,
        longitude: Number(val.longitude) || 0,
        elevation: val.elevation,
        district: val.district || 'Unknown',
        state: val.state || 'Unknown'
      }));
      setMasterLocations(items);
      return items;
    } catch (err: any) {
      console.error('Error fetching taxi stands:', err);
      setError(err.message || 'Could not fetch locations.');
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch Operators for Admin view
  const fetchOperators = async () => {
    setLoadingOperators(true);
    try {
      const res = await fetch('/api/admin/data/users');
      // Fallback: fetch from users endpoint if available, else standard admin user retrieve
      if (res.ok) {
        const usersList = await res.json();
        // filter operators
        const ops = (usersList || []).filter((u: any) => u.taxiOperatorStatus !== undefined || u.role === 'operator');
        setAllOperators(ops);
      }
    } catch (err) {
      console.warn('Could not fetch operator list for admin admin panel:', err);
    } finally {
      setLoadingOperators(false);
    }
  };

  // Fetch Specific Operator's service coverage
  const fetchServiceCoverage = async (targetUserId: string) => {
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`/api/taxi-operator/service-coverage?userId=${targetUserId}`);
      if (!res.ok) throw new Error('Failed to load operator service coverage.');
      const json = await res.json();
      if (json.success) {
        // Map saved coverage keys to actual master location items
        const savedIds = (json.serviceCoverage || []).map((loc: any) => typeof loc === 'string' ? loc : loc.id);
        const matched = masterLocations.filter(m => savedIds.includes(m.id));
        
        // If masterLocations isn't loaded yet, keep them as basic objects
        if (masterLocations.length === 0) {
          const loadedMaster = await fetchMasterLocations();
          const matches = loadedMaster.filter(m => savedIds.includes(m.id));
          setSelectedLocations(matches);
        } else {
          setSelectedLocations(matched);
        }
        
        setLastUpdated(json.updatedAt);
        setLastUpdatedBy(json.updatedBy);
      }
    } catch (err: any) {
      console.error('Error loading service coverage:', err);
      setError(err.message || 'Failed to fetch service coverage.');
    }
  };

  // Initial load
  useEffect(() => {
    const init = async () => {
      const master = await fetchMasterLocations();
      // default operator target
      const targetId = isAdmin && selectedOperatorId ? selectedOperatorId : user?.id;
      if (targetId && master.length > 0) {
        await fetchServiceCoverage(targetId);
      }
    };
    init();
  }, [user, isAdmin]);

  // Handle administrator operator change
  const handleOperatorChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const opId = e.target.value;
    setSelectedOperatorId(opId);
    if (opId) {
      const op = allOperators.find(o => o.id === opId);
      setSelectedOperatorEmail(op?.email || '');
      await fetchServiceCoverage(opId);
    } else {
      setSelectedOperatorEmail('');
      setSelectedLocations([]);
      setLastUpdated(null);
      setLastUpdatedBy(null);
    }
  };

  // Debounced search logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 150);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset keyboard index on search query change
  useEffect(() => {
    setActiveSearchIndex(-1);
  }, [searchQuery]);

  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
        setSearchDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter Master Locations based on inputs & search
  const filteredSuggestions = useMemo(() => {
    if (!debouncedQuery && !searchDropdownOpen) return [];

    let list = masterLocations;

    // Filter by Dropdowns first
    if (stateFilter !== 'All') {
      list = list.filter(item => item.state.toLowerCase() === stateFilter.toLowerCase());
    }
    if (districtFilter !== 'All') {
      list = list.filter(item => item.district.toLowerCase() === districtFilter.toLowerCase());
    }

    if (!debouncedQuery) {
      // If query is empty but dropdown is open, return the filtered list (limited) or recent searches
      return list.slice(0, 8);
    }

    const normQuery = debouncedQuery.toLowerCase().trim();

    // Special exact queries / abbreviations
    // "NJP" -> matches New Jalpaiguri Railway Station
    const isNJP = normQuery === 'njp';
    const isGan = normQuery === 'gan';
    const isKal = normQuery === 'kal';
    const isLach = normQuery === 'lach';
    const isSil = normQuery === 'sil';

    return list.filter(item => {
      const name = item.name.toLowerCase();
      const district = item.district.toLowerCase();
      const state = item.state.toLowerCase();

      if (isNJP && (name.includes('jalpaiguri') || name.includes('njp'))) return true;
      if (isGan && name.includes('gangtok')) return true;
      if (isKal && (name.includes('kalimpong') || district.includes('kalimpong'))) return true;
      if (isLach && (name.includes('lachen') || name.includes('lachung'))) return true;
      if (isSil && name.includes('siliguri')) return true;

      return name.includes(normQuery) || 
             district.includes(normQuery) || 
             state.includes(normQuery);
    });
  }, [masterLocations, debouncedQuery, stateFilter, districtFilter, searchDropdownOpen]);

  // Add/Remove locations
  const handleSelectLocation = (loc: LocationItem) => {
    if (!selectedLocations.some(item => item.id === loc.id)) {
      const updated = [...selectedLocations, loc];
      setSelectedLocations(updated);
      updatePresetCategory(updated);
      
      // Save search term in recents
      if (searchQuery.trim()) {
        const term = searchQuery.trim();
        const updatedRecents = [term, ...recentSearches.filter(t => t !== term)].slice(0, 5);
        setRecentSearches(updatedRecents);
        localStorage.setItem('hillytrip_recent_searches', JSON.stringify(updatedRecents));
      }
    }
    setSearchQuery('');
    setSearchDropdownOpen(false);
    setError(null);
  };

  const handleRemoveLocation = (locId: string) => {
    const updated = selectedLocations.filter(item => item.id !== locId);
    setSelectedLocations(updated);
    updatePresetCategory(updated);
    setError(null);
  };

  // Keyboard Navigation Handlers
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!searchDropdownOpen || filteredSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveSearchIndex(prev => (prev + 1) % filteredSuggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveSearchIndex(prev => (prev - 1 + filteredSuggestions.length) % filteredSuggestions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeSearchIndex >= 0 && activeSearchIndex < filteredSuggestions.length) {
        handleSelectLocation(filteredSuggestions[activeSearchIndex]);
      } else if (filteredSuggestions.length > 0) {
        handleSelectLocation(filteredSuggestions[0]);
      }
    } else if (e.key === 'Escape') {
      setSearchDropdownOpen(false);
    }
  };

  // Preset Mapping Logic
  const handleApplyPreset = (preset: string) => {
    setCurrentPreset(preset);
    let chosen: LocationItem[] = [];

    switch (preset) {
      case 'Entire North Bengal':
        chosen = masterLocations.filter(item => item.state === 'West Bengal');
        break;
      case 'Entire Sikkim':
        chosen = masterLocations.filter(item => item.state === 'Sikkim');
        break;
      case 'North Bengal + Sikkim':
        chosen = [...masterLocations];
        break;
      case 'Darjeeling Region':
        chosen = masterLocations.filter(item => item.district === 'Darjeeling');
        break;
      case 'Kalimpong Region':
        chosen = masterLocations.filter(item => item.district === 'Kalimpong');
        break;
      case 'Gangtok Region':
        chosen = masterLocations.filter(item => item.name.includes('Gangtok') || item.district === 'Gangtok');
        break;
      case 'Dooars':
        chosen = masterLocations.filter(item => ['Jalpaiguri', 'Alipurduar'].includes(item.district));
        break;
      case 'Custom':
      default:
        // do not change selected list, just toggle label
        return;
    }

    setSelectedLocations(chosen);
    setError(null);
  };

  // Synchronize preset tag with manual modifications
  const updatePresetCategory = (currentList: LocationItem[]) => {
    if (currentList.length === 0) {
      setCurrentPreset('Custom');
      return;
    }

    const currentIds = currentList.map(item => item.id).sort();
    
    const isEntireNB = masterLocations.filter(item => item.state === 'West Bengal').map(item => item.id).sort();
    const isEntireSikkim = masterLocations.filter(item => item.state === 'Sikkim').map(item => item.id).sort();
    const isAll = masterLocations.map(item => item.id).sort();
    const isDarjeeling = masterLocations.filter(item => item.district === 'Darjeeling').map(item => item.id).sort();
    const isKalimpong = masterLocations.filter(item => item.district === 'Kalimpong').map(item => item.id).sort();
    const isGangtok = masterLocations.filter(item => item.name.includes('Gangtok') || item.district === 'Gangtok').map(item => item.id).sort();
    const isDooars = masterLocations.filter(item => ['Jalpaiguri', 'Alipurduar'].includes(item.district)).map(item => item.id).sort();

    const equals = (a: string[], b: string[]) => a.length === b.length && a.every((v, i) => v === b[i]);

    if (equals(currentIds, isAll)) {
      setCurrentPreset('North Bengal + Sikkim');
    } else if (equals(currentIds, isEntireNB)) {
      setCurrentPreset('Entire North Bengal');
    } else if (equals(currentIds, isEntireSikkim)) {
      setCurrentPreset('Entire Sikkim');
    } else if (equals(currentIds, isDarjeeling)) {
      setCurrentPreset('Darjeeling Region');
    } else if (equals(currentIds, isKalimpong)) {
      setCurrentPreset('Kalimpong Region');
    } else if (equals(currentIds, isGangtok)) {
      setCurrentPreset('Gangtok Region');
    } else if (equals(currentIds, isDooars)) {
      setCurrentPreset('Dooars');
    } else {
      setCurrentPreset('Custom');
    }
  };

  // Save Service Coverage
  const handleSaveCoverage = async () => {
    setError(null);
    setSuccess(null);

    if (selectedLocations.length === 0) {
      setError('Operational Validation Alert: You must configure at least one service coverage location before saving.');
      return;
    }

    const targetUserId = isAdmin && selectedOperatorId ? selectedOperatorId : user?.id;
    if (!targetUserId) {
      setError('Authentication Error: Missing active Operator user reference ID.');
      return;
    }

    setSaving(true);

    try {
      // Save instantly using our custom Express endpoint
      const res = await fetch('/api/taxi-operator/service-coverage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: targetUserId,
          serviceCoverage: selectedLocations.map(loc => loc.id),
          updatedBy: user?.email || 'System Admin'
        })
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || 'Server rejected the operational service coverage update.');
      }

      const json = await res.json();
      if (json.success) {
        setSuccess('Success! Service Coverage configuration has been successfully saved and activated across the mountain network.');
        setLastUpdated(json.updatedAt);
        setLastUpdatedBy(json.updatedBy);
        
        // Update user context state locally if we updated our own profile
        if (targetUserId === user?.id && onUpdateUser) {
          const updatedUser = {
            ...user,
            taxiOperatorDetails: {
              ...(user.taxiOperatorDetails || {}),
              serviceCoverage: selectedLocations.map(loc => loc.id),
              serviceCoverageUpdatedAt: json.updatedAt,
              serviceCoverageUpdatedBy: json.updatedBy
            }
          };
          onUpdateUser(updatedUser);
        }

        // Hide success alert after 4 seconds
        setTimeout(() => setSuccess(null), 4000);
      }
    } catch (err: any) {
      console.error('Save error:', err);
      setError(err.message || 'Failed to sync service coverage across the matching network.');
    } finally {
      setSaving(false);
    }
  };

  // Quick statistics derivations
  const stats = useMemo(() => {
    const total = selectedLocations.length;
    const districts = Array.from(new Set(selectedLocations.map(item => item.district)));
    const states = Array.from(new Set(selectedLocations.map(item => item.state)));
    
    // Count elevations above 1500m (high mountain passes)
    const highAltitudeCount = selectedLocations.filter(l => l.elevation && l.elevation >= 1500).length;

    // Build district frequency breakdown
    const districtBreakdown: Record<string, number> = {};
    selectedLocations.forEach(item => {
      districtBreakdown[item.district] = (districtBreakdown[item.district] || 0) + 1;
    });

    return {
      total,
      districtCount: districts.length,
      districts,
      stateCount: states.length,
      states,
      highAltitudeCount,
      districtBreakdown
    };
  }, [selectedLocations]);

  // Geolocation Boundary bounds for Read-Only SVG Network Map
  const mapCoordinates = useMemo(() => {
    if (masterLocations.length === 0) return [];
    
    // Crop geographic bounds slightly around North Bengal and Sikkim
    const minLat = 26.5;
    const maxLat = 28.0;
    const minLon = 88.0;
    const maxLon = 89.6;

    return masterLocations.map(item => {
      // Scale coordinates into 0 - 100 percent viewport
      const x = ((item.longitude - minLon) / (maxLon - minLon)) * 100;
      const y = 100 - ((item.latitude - minLat) / (maxLat - minLat)) * 100; // invert y for SVG
      
      const isSelected = selectedLocations.some(sel => sel.id === item.id);

      return {
        ...item,
        x: `${Math.min(96, Math.max(4, x))}%`,
        y: `${Math.min(94, Math.max(6, y))}%`,
        isSelected
      };
    });
  }, [masterLocations, selectedLocations]);

  // Handle preset pill style mapping
  const getPresetButtonClass = (preset: string) => {
    const active = currentPreset === preset;
    return `px-3.5 py-2 rounded-xl text-xs font-bold border cursor-pointer transition-all ${
      active 
        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs scale-[1.02]' 
        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
    }`;
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER SECTION WITH OPERATOR SELECTION IF ADMIN */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1 bg-amber-50 rounded-lg text-amber-600 font-mono text-[9px] font-bold uppercase tracking-widest">
              Live Fleet Matching Ready
            </span>
            {isAdmin && (
              <span className="px-2 py-0.5 bg-rose-50 border border-rose-100 rounded-full text-[9px] font-extrabold text-rose-600 uppercase">
                Admin Console Mode
              </span>
            )}
          </div>
          <h2 className="text-xl font-black text-slate-800 tracking-tight">Operational Service Coverage</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure the specific towns, valley stands, and hubs where your fleet operates. HillyTrip automatically maps quote requests according to these terminals.
          </p>
        </div>
        
        {/* Save and status container */}
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <div className="hidden lg:block text-right pr-2">
              <span className="text-[10px] text-slate-400 block">Last Saved</span>
              <span className="text-[10px] font-extrabold text-slate-700 block">{new Date(lastUpdated).toLocaleDateString()} at {new Date(lastUpdated).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
          )}
          <button
            onClick={handleSaveCoverage}
            disabled={saving}
            className={`px-5 py-3 rounded-2xl text-xs font-black flex items-center gap-2 transition-all cursor-pointer ${
              saving
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : 'bg-slate-900 text-white hover:bg-slate-850 shadow-sm hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />
                Saving Coverage...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                Activate Coverage Grid
              </>
            )}
          </button>
        </div>
      </div>

      {/* ADMIN CONSOLE VIEW SWITCHER */}
      {isAdmin && (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-rose-100 text-rose-700 rounded-2xl">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">HillyTrip Administrator Coverage Editor</h4>
                <p className="text-[11px] text-slate-400 leading-relaxed max-w-xl">
                  You are logged in with administrative access. You can select any registered Mountain Operator from the directory list below to inspect, verify, or modify their service coverage.
                </p>
              </div>
            </div>
            <div className="w-full md:w-72">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Select Operator Profile</label>
              <select
                value={selectedOperatorId}
                onChange={handleOperatorChange}
                disabled={loadingOperators}
                className="w-full px-4 py-2.5 rounded-xl text-xs bg-white border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="">-- Choose Operator --</option>
                {allOperators.map(op => (
                  <option key={op.id} value={op.id}>
                    {op.taxiOperatorDetails?.businessName || op.business_name || op.email} ({op.taxiOperatorDetails?.ownerName || 'No Name'})
                  </option>
                ))}
              </select>
              {selectedOperatorEmail && (
                <span className="text-[10px] text-slate-400 mt-1 block pl-1 font-mono">{selectedOperatorEmail}</span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATION FEEDBACKS */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-rose-50 border border-rose-150 rounded-2xl flex items-start gap-3 text-rose-800"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-extrabold block">Network Validation Error</span>
              <p className="text-xs mt-0.5 leading-relaxed">{error}</p>
            </div>
          </motion.div>
        )}

        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-50 border border-emerald-150 rounded-2xl flex items-start gap-3 text-emerald-800"
          >
            <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-extrabold block">Coverage Live & Synced</span>
              <p className="text-xs mt-0.5 leading-relaxed">{success}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* SKELETON / LOADING LOADER */}
      {loading ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-100 shadow-xs flex flex-col items-center justify-center min-h-[350px]">
          <RefreshCw className="w-8 h-8 text-slate-300 animate-spin mb-4" />
          <span className="text-xs font-bold text-slate-500">Loading master mountain stands and current operator coverages...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT 7 COLUMNS: SEARCH, SELECTION, AND PRESETS */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* POPULAR PRESETS SECTION */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Regional Network Presets</h3>
              </div>
              <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
                Choose a pre-defined regional corridor mapping or click custom buttons. These presets instantly allocate all permitted stands under selected regions.
              </p>
              
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => handleApplyPreset('Entire North Bengal')}
                  className={getPresetButtonClass('Entire North Bengal')}
                >
                  West Bengal (Plains + Hills)
                </button>
                <button 
                  onClick={() => handleApplyPreset('Entire Sikkim')}
                  className={getPresetButtonClass('Entire Sikkim')}
                >
                  Entire Sikkim State
                </button>
                <button 
                  onClick={() => handleApplyPreset('North Bengal + Sikkim')}
                  className={getPresetButtonClass('North Bengal + Sikkim')}
                >
                  Sikkim + Bengal Corridor
                </button>
                <button 
                  onClick={() => handleApplyPreset('Darjeeling Region')}
                  className={getPresetButtonClass('Darjeeling Region')}
                >
                  Darjeeling District
                </button>
                <button 
                  onClick={() => handleApplyPreset('Kalimpong Region')}
                  className={getPresetButtonClass('Kalimpong Region')}
                >
                  Kalimpong District
                </button>
                <button 
                  onClick={() => handleApplyPreset('Gangtok Region')}
                  className={getPresetButtonClass('Gangtok Region')}
                >
                  Gangtok Terminal
                </button>
                <button 
                  onClick={() => handleApplyPreset('Dooars')}
                  className={getPresetButtonClass('Dooars')}
                >
                  Dooars Foothills
                </button>
              </div>
            </div>

            {/* SEARCH AND LOCATION SELECTOR */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-slate-400" />
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Select Operational Terminals</h3>
                </div>
                
                {/* Advanced Quick Filters */}
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Sliders className="w-3 h-3 text-slate-400" /> Filters:
                  </span>
                  
                  {/* State filter */}
                  <select
                    value={stateFilter}
                    onChange={(e) => { setStateFilter(e.target.value); setDistrictFilter('All'); }}
                    className="border-none bg-slate-50 font-bold text-slate-600 rounded-lg px-2 py-1 text-[11px] focus:outline-none"
                  >
                    <option value="All">All States</option>
                    <option value="West Bengal">West Bengal</option>
                    <option value="Sikkim">Sikkim</option>
                  </select>

                  {/* District filter */}
                  <select
                    value={districtFilter}
                    onChange={(e) => setDistrictFilter(e.target.value)}
                    className="border-none bg-slate-50 font-bold text-slate-600 rounded-lg px-2 py-1 text-[11px] focus:outline-none"
                  >
                    <option value="All">All Districts</option>
                    {stateFilter === 'West Bengal' && (
                      <>
                        <option value="Darjeeling">Darjeeling</option>
                        <option value="Kalimpong">Kalimpong</option>
                        <option value="Jalpaiguri">Jalpaiguri</option>
                        <option value="Alipurduar">Alipurduar</option>
                      </>
                    )}
                    {stateFilter === 'Sikkim' && (
                      <>
                        <option value="Sikkim">Sikkim Hills</option>
                      </>
                    )}
                    {stateFilter === 'All' && (
                      <>
                        <option value="Darjeeling">Darjeeling</option>
                        <option value="Kalimpong">Kalimpong</option>
                        <option value="Jalpaiguri">Jalpaiguri</option>
                        <option value="Alipurduar">Alipurduar</option>
                        <option value="Sikkim">Sikkim</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Input container */}
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Type to search (e.g., 'NJP', 'Siliguri', 'Lachen', 'Kalimpong')..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchDropdownOpen(true)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-11 pr-12 py-3.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white rounded-2xl border border-slate-100 focus:border-slate-300 focus:outline-none text-xs font-semibold text-slate-800 transition-all shadow-inner"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
                
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* SEARCH AUTOCOMPLETE DROPDOWN */}
              <AnimatePresence>
                {searchDropdownOpen && (
                  <motion.div
                    ref={dropdownRef}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 4 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute z-30 left-0 right-0 mt-1.5 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden max-h-72 overflow-y-auto"
                  >
                    {filteredSuggestions.length > 0 ? (
                      <div>
                        <div className="bg-slate-50 px-4 py-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider flex justify-between">
                          <span>Terminal Matches ({filteredSuggestions.length})</span>
                          <span className="font-mono text-[9px] lowercase">Use arrow keys & enter</span>
                        </div>
                        <ul className="divide-y divide-slate-50">
                          {filteredSuggestions.map((item, idx) => {
                            const isAlreadySelected = selectedLocations.some(s => s.id === item.id);
                            const isActive = idx === activeSearchIndex;
                            return (
                              <li 
                                key={item.id}
                                onClick={() => handleSelectLocation(item)}
                                className={`px-4 py-3 flex items-center justify-between text-xs cursor-pointer transition-all ${
                                  isActive ? 'bg-slate-100/80' : 'hover:bg-slate-50'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`p-1.5 rounded-lg ${isAlreadySelected ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                                    <MapPin className="w-3.5 h-3.5" />
                                  </div>
                                  <div>
                                    <span className={`font-black ${isAlreadySelected ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                                      {item.name}
                                    </span>
                                    <span className="text-[10px] text-slate-400 block mt-0.5 font-medium">
                                      {item.district} District • {item.state} {item.elevation ? `• Alt: ${item.elevation}m` : ''}
                                    </span>
                                  </div>
                                </div>
                                {isAlreadySelected ? (
                                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1">
                                    <Check className="w-3 h-3 stroke-[3]" /> Active
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-bold group-hover:text-slate-700">
                                    Add Location +
                                  </span>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ) : (
                      <div className="p-6 text-center text-slate-400 text-xs">
                        {searchQuery ? (
                          <>
                            <AlertCircle className="w-5 h-5 text-slate-300 mx-auto mb-2" />
                            No matching taxi stands or terminals found for "{searchQuery}".
                            <span className="block text-[10px] text-slate-400 mt-1 leading-relaxed">
                              Tip: Check your State/District filters, or search for broader keywords like Bengal, Sikkim, NJP, Siliguri, or Gangtok.
                            </span>
                          </>
                        ) : (
                          <>
                            {recentSearches.length > 0 && (
                              <div className="text-left">
                                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block mb-2 pl-2">Recent Searches</span>
                                <div className="flex flex-wrap gap-1.5 p-2">
                                  {recentSearches.map((term, i) => (
                                    <button
                                      key={i}
                                      onClick={() => { setSearchQuery(term); searchInputRef.current?.focus(); }}
                                      className="px-2.5 py-1 bg-slate-50 border border-slate-150 text-slate-600 text-[10px] rounded-lg font-semibold hover:bg-slate-100 cursor-pointer"
                                    >
                                      {term}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                            <div className="py-4 text-center">
                              <MapPin className="w-5 h-5 text-slate-300 mx-auto mb-1.5" />
                              <span className="block text-[10px] text-slate-400">Search above, or select from filters & presets</span>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* SELECTED LOCATIONS GRID CHIPS */}
              <div className="mt-6 border-t border-slate-100 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    Selected Coverage Points ({selectedLocations.length})
                  </h4>
                  {selectedLocations.length > 0 && (
                    <button
                      onClick={() => { if(confirm('Clear all coverage?')) setSelectedLocations([]); }}
                      className="text-[10px] text-rose-600 hover:text-rose-700 font-bold cursor-pointer transition-all"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {selectedLocations.length > 0 ? (
                  <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto p-1.5 bg-slate-50/50 rounded-2xl border border-slate-100/50">
                    {selectedLocations.map(loc => (
                      <div 
                        key={loc.id}
                        className="flex items-center gap-1.5 bg-white border border-slate-150 pl-2.5 pr-1.5 py-1.5 rounded-xl text-xs font-black text-slate-800 shadow-2xs hover:border-slate-300 group"
                      >
                        <span className="text-[10px] text-emerald-600">✓</span>
                        <span>{loc.name}</span>
                        <button
                          onClick={() => handleRemoveLocation(loc.id)}
                          className="p-0.5 rounded-md hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-all cursor-pointer ml-1"
                        >
                          <X className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400">
                    <MapPinned className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <span className="text-xs font-bold text-slate-500 block">No Active Coverage Configured</span>
                    <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto leading-relaxed">
                      Select individual terminals above or apply a regional preset to activate your service matching grid.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* COVERAGE STATISTICS BREAKDOWN */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Layers className="w-4 h-4 text-slate-400" />
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">District & State Breakdown</h3>
              </div>
              
              {selectedLocations.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* District count list */}
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-3">Districts Served</h4>
                    <div className="space-y-2">
                      {Object.entries(stats.districtBreakdown).map(([dist, count]) => {
                        const totalInDistrict = masterLocations.filter(m => m.district === dist).length;
                        const percentage = Math.round((count / totalInDistrict) * 100);
                        return (
                          <div key={dist} className="space-y-1">
                            <div className="flex justify-between items-center text-xs">
                              <span className="font-extrabold text-slate-700">{dist} District</span>
                              <span className="font-mono text-slate-500 font-bold">{count} / {totalInDistrict} Stands ({percentage}%)</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Operational Capabilities Summary */}
                  <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-150">
                    <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Matching Engine Readiness</h4>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">High Altitude Permits (Alt &gt; 1500m):</span>
                        <span className="font-extrabold text-slate-800">{stats.highAltitudeCount} Covered</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">States Covered:</span>
                        <span className="font-extrabold text-slate-800">{stats.states.join(' & ') || 'None'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500">Matching Status:</span>
                        <span className={`font-bold ${stats.total > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                          ● {stats.total > 0 ? 'Eligible for Auto-Matching' : 'Incomplete Configuration'}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 leading-relaxed border-t border-slate-150 pt-2.5 mt-1 block">
                        Our Smart Matching Engine matches routes only if BOTH start and end locations are checked in your active operational coverage grid.
                      </div>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="text-center text-slate-400 py-6 text-xs">
                  Please select locations to inspect district coverage metrics.
                </div>
              )}
            </div>

          </div>

          {/* RIGHT 5 COLUMNS: SUMMARY & READ-ONLY SVG MAP PREVIEW */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* COVERAGE STATISTICS SUMMARY CARD */}
            <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-850 shadow-md">
              <span className="p-1 bg-white/10 text-white/80 rounded-md font-mono text-[9px] font-bold uppercase tracking-widest">
                Active Match Footprint
              </span>
              <h3 className="text-sm font-black text-white/95 mt-2 mb-4 tracking-tight">Service Coverage Summary</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <span className="text-[10px] text-white/50 block font-bold uppercase">Total Terminals</span>
                  <span className="text-3xl font-black mt-1 block tracking-tight text-amber-400">{stats.total}</span>
                  <span className="text-[9px] text-white/40 block mt-1">Stands & Hubs Active</span>
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <span className="text-[10px] text-white/50 block font-bold uppercase">Districts Covered</span>
                  <span className="text-3xl font-black mt-1 block tracking-tight text-amber-400">{stats.districtCount}</span>
                  <span className="text-[9px] text-white/40 block mt-1">Across Sikkim & NB</span>
                </div>
              </div>

              {/* Quick instructions list */}
              <div className="mt-6 border-t border-white/10 pt-4 space-y-3">
                <div className="flex gap-2.5 text-xs text-white/70 leading-relaxed">
                  <div className="w-5 h-5 rounded-full bg-amber-400/10 text-amber-400 flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">1</div>
                  <p>HillyTrip coordinates all route pricing and booking requests.</p>
                </div>
                <div className="flex gap-2.5 text-xs text-white/70 leading-relaxed">
                  <div className="w-5 h-5 rounded-full bg-amber-400/10 text-amber-400 flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">2</div>
                  <p>Check any stands where you have physical vehicles, drivers, or route permits.</p>
                </div>
                <div className="flex gap-2.5 text-xs text-white/70 leading-relaxed">
                  <div className="w-5 h-5 rounded-full bg-amber-400/10 text-amber-400 flex items-center justify-center flex-shrink-0 text-[10px] font-bold mt-0.5">3</div>
                  <p>You'll receive lead queries where BOTH pickup and drop stands reside in your active coverage footprint.</p>
                </div>
              </div>
            </div>

            {/* READ-ONLY GEOGRAPHIC NETWORK SVG MAP */}
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MapIcon className="w-4 h-4 text-slate-400" />
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Himalayan Transit Map</h3>
                </div>
                <span className="text-[10px] text-slate-400 font-bold bg-slate-50 border border-slate-150 px-2.5 py-1 rounded-full">
                  Read Only Grid
                </span>
              </div>

              <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
                Topographic coordinate schematic plotting physical taxi stands across North Bengal and Sikkim. Glowing terminals denote your configured active network.
              </p>

              {/* The Interactive Map canvas */}
              <div className="bg-slate-900 aspect-square rounded-2xl relative overflow-hidden border border-slate-800 flex flex-col justify-between p-4 shadow-inner group">
                
                {/* Visual grid lines overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />
                
                {/* Schematic Map Title / Coordinates */}
                <div className="z-10 flex justify-between items-start text-[8px] font-mono text-slate-500 font-bold uppercase pointer-events-none">
                  <span>Sikkim Hills (North Grid)</span>
                  <span>Teesta River Corridor</span>
                </div>

                {/* Plotting points & actual coordinates */}
                <div className="absolute inset-4 z-10">
                  
                  {/* Decorative geographic landmarks */}
                  {/* Mount Kanchenjunga decorative icon/text top-left */}
                  <div className="absolute top-1 left-2 text-[9px] font-bold text-slate-600/70 pointer-events-none flex items-center gap-1">
                    ▲ Mt. Kanchenjunga (8586m)
                  </div>
                  {/* Teesta River visual line (schematic blue path from North to South) */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
                    <path 
                      d="M 60,0 C 58,25 45,45 52,65 C 55,75 42,85 40,100" 
                      fill="none" 
                      stroke="#38bdf8" 
                      strokeWidth="2" 
                      strokeDasharray="4 2"
                    />
                  </svg>
                  
                  {/* Render stands points */}
                  {mapCoordinates.map(point => (
                    <div
                      key={point.id}
                      style={{ left: point.x, top: point.y }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 group/point z-20"
                    >
                      {/* Interactive glowing ring on select */}
                      {point.isSelected ? (
                        <>
                          <span className="absolute -inset-2.5 bg-amber-500/20 rounded-full animate-ping pointer-events-none" />
                          <span className="w-3 h-3 bg-amber-400 border-2 border-slate-900 rounded-full block shadow-md shadow-amber-400/50 cursor-pointer transition-transform hover:scale-125" />
                        </>
                      ) : (
                        <span className="w-1.5 h-1.5 bg-slate-600/75 border border-slate-800 rounded-full block cursor-pointer transition-all hover:bg-slate-400 hover:scale-125" />
                      )}
                      
                      {/* Premium Hover tooltip */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-950 border border-slate-800 text-white text-[9px] px-2 py-1.5 rounded-lg opacity-0 group-hover/point:opacity-100 transition-opacity whitespace-nowrap shadow-xl font-bold z-30 pointer-events-none">
                        <span className="block text-white/95">{point.name}</span>
                        <span className="text-[8px] text-slate-400 block font-normal mt-0.5">
                          {point.district} • {point.elevation ? `${point.elevation}m` : 'Hill Station'}
                        </span>
                        <span className={`text-[8px] block mt-1 ${point.isSelected ? 'text-amber-400' : 'text-slate-500'}`}>
                          {point.isSelected ? '✓ Covered Terminal' : '✗ Unconfigured'}
                        </span>
                      </div>
                    </div>
                  ))}

                </div>

                {/* Bottom grid footer details */}
                <div className="z-10 flex justify-between items-end text-[8px] font-mono text-slate-500 font-bold uppercase pointer-events-none mt-auto">
                  <span>Siliguri plains (South Grid)</span>
                  <span>Map Scale: 1:450,000</span>
                </div>

              </div>

              {/* Map legend */}
              <div className="mt-4 flex justify-between items-center text-[10px] text-slate-500 font-bold border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-slate-900 inline-block" />
                  <span>Active Cover Stand</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-500 inline-block" />
                  <span>Other Master Stands</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-1 border-b-2 border-blue-400/30 border-dashed inline-block" />
                  <span>Himalayan River Basin</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
