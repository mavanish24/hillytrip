import React, { useState, useEffect } from 'react';
import {
  LocationItem,
  EntityType,
  NearBySearchResult,
  DistanceCalculationResult,
  RouteDefinition,
  TravelCircuit
} from '../../types/location';
import { InteractiveLeafletMap } from './InteractiveLeafletMap';
import {
  Map,
  Compass,
  Search,
  SlidersHorizontal,
  Navigation,
  Layers,
  Mountain,
  Home,
  Car,
  Building2,
  Users,
  Route,
  ArrowRight,
  Clock,
  Sparkles,
  ChevronRight,
  MapPin,
  CheckCircle2,
  X,
  Phone,
  Star,
  Maximize2
} from 'lucide-react';

export const GlobalMapExplorer: React.FC = () => {
  // State
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [routes, setRoutes] = useState<RouteDefinition[]>([]);
  const [circuits, setCircuits] = useState<TravelCircuit[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null);
  const [selectedCircuit, setSelectedCircuit] = useState<TravelCircuit | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [radiusKm, setRadiusKm] = useState<number>(25);
  const [nearMeActive, setNearMeActive] = useState<boolean>(false);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Active Layers Toggle
  const [activeLayers, setActiveLayers] = useState<Record<string, boolean>>({
    destination: true,
    attraction: true,
    homestay: true,
    taxi_stand: true,
    business: true,
    guide: true,
    route: true
  });

  // Views & Modals
  const [viewMode, setViewMode] = useState<'split' | 'map_only' | 'list_only'>('split');
  const [activeTab, setActiveTab] = useState<'explore' | 'distance_calc' | 'circuits'>('explore');

  // Distance Calculator State
  const [calcOrigin, setCalcOrigin] = useState<string>('');
  const [calcDest, setCalcDest] = useState<string>('');
  const [calcMode, setCalcMode] = useState<'driving' | 'walking' | 'public_transport'>('driving');
  const [calcResult, setCalcResult] = useState<DistanceCalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Fetch initial data
  useEffect(() => {
    fetchLocations();
    fetchRoutesAndCircuits();
  }, [searchQuery, selectedDistrict]);

  const fetchLocations = async () => {
    try {
      let url = '/api/location/items?';
      if (searchQuery) url += `query=${encodeURIComponent(searchQuery)}&`;
      if (selectedDistrict !== 'all') url += `district=${encodeURIComponent(selectedDistrict)}&`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.locations) {
        setLocations(data.locations);
        if (!selectedLocation && data.locations.length > 0) {
          setSelectedLocation(data.locations[0]);
        }
      }
    } catch (e) {
      console.error('Failed fetching locations:', e);
    }
  };

  const fetchRoutesAndCircuits = async () => {
    try {
      const [resR, resC] = await Promise.all([fetch('/api/routes'), fetch('/api/circuits')]);
      const dataR = await resR.json();
      const dataC = await resC.json();
      if (dataR.success) setRoutes(dataR.routes);
      if (dataC.success) setCircuits(dataC.circuits);
    } catch (e) {
      console.error('Failed fetching routes/circuits:', e);
    }
  };

  // Near Me Trigger
  const handleNearMe = () => {
    if ('geolocation' in navigator) {
      setNearMeActive(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserCoords(coords);
          fetchNearbyLocations(coords.lat, coords.lng, radiusKm);
        },
        (err) => {
          console.warn('Geolocation denied or failed, defaulting to Darjeeling center:', err);
          // Default to Darjeeling Chowrasta
          const coords = { lat: 27.0428, lng: 88.2663 };
          setUserCoords(coords);
          fetchNearbyLocations(coords.lat, coords.lng, radiusKm);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  const fetchNearbyLocations = async (lat: number, lng: number, radKm: number) => {
    try {
      const res = await fetch(`/api/location/nearby?lat=${lat}&lng=${lng}&radiusKm=${radKm}`);
      const data = await res.json();
      if (data.success && data.results) {
        const nearLocs = data.results.map((r: NearBySearchResult) => r.location);
        setLocations(nearLocs);
        if (nearLocs.length > 0) setSelectedLocation(nearLocs[0]);
      }
    } catch (e) {
      console.error('Failed fetching nearby locations:', e);
    }
  };

  // Distance Calculation
  const handleCalculateDistance = async () => {
    if (!calcOrigin || !calcDest) return;

    const origLoc = locations.find((l) => l.id === calcOrigin || l.name === calcOrigin);
    const destLoc = locations.find((l) => l.id === calcDest || l.name === calcDest);

    if (!origLoc || !destLoc) {
      alert('Please select valid origin and destination locations.');
      return;
    }

    setIsCalculating(true);
    try {
      const res = await fetch('/api/location/distance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          origin: { lat: origLoc.lat, lng: origLoc.lng },
          destination: { lat: destLoc.lat, lng: destLoc.lng },
          mode: calcMode
        })
      });
      const data = await res.json();
      if (data.success) {
        setCalcResult(data.calculation);
      }
    } catch (e) {
      console.error('Failed distance calculation:', e);
    } finally {
      setIsCalculating(false);
    }
  };

  // Layer toggle handler
  const toggleLayer = (layerKey: string) => {
    setActiveLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  return (
    <div className="w-full bg-slate-900 text-slate-100 min-h-screen flex flex-col font-sans">
      {/* Platform Header */}
      <header className="bg-slate-900/90 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Compass className="w-6 h-6 text-white animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
              HillyTrip Location Platform
              <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-mono">
                ENGINE V5.0
              </span>
            </h1>
            <p className="text-xs text-slate-400">Universal Geospatial, Routing & Map Service for Eastern Himalayas</p>
          </div>
        </div>

        {/* Top Navigation Tabs */}
        <div className="flex items-center bg-slate-800/80 p-1 rounded-xl border border-slate-700/80 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('explore')}
            className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'explore' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            Map & POI Explorer
          </button>
          <button
            onClick={() => setActiveTab('circuits')}
            className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'circuits' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Route className="w-3.5 h-3.5" />
            Popular Circuits ({circuits.length})
          </button>
          <button
            onClick={() => setActiveTab('distance_calc')}
            className={`px-3.5 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
              activeTab === 'distance_calc' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            Distance Matrix Engine
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 p-4 lg:p-6 max-w-[1700px] w-full mx-auto space-y-6">
        {/* Search & Map Control Toolbar */}
        <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 shadow-xl space-y-4">
          <div className="flex flex-wrap lg:flex-nowrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[260px]">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search towns, homestays, attractions, viewpoints, taxi stands..."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>

            {/* Near Me Button */}
            <button
              onClick={handleNearMe}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition shadow-sm ${
                nearMeActive
                  ? 'bg-emerald-600 text-white'
                  : 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white'
              }`}
            >
              <Navigation className="w-4 h-4" />
              {nearMeActive ? 'GPS Centered' : 'Near Me'}
            </button>

            {/* Radius Slider */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-xs">
              <span className="text-slate-400 font-medium">Radius:</span>
              <select
                value={radiusKm}
                onChange={(e) => {
                  const r = Number(e.target.value);
                  setRadiusKm(r);
                  if (userCoords) fetchNearbyLocations(userCoords.lat, userCoords.lng, r);
                }}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
              >
                <option value={2} className="bg-slate-900">2 km</option>
                <option value={5} className="bg-slate-900">5 km</option>
                <option value={10} className="bg-slate-900">10 km</option>
                <option value={25} className="bg-slate-900">25 km</option>
                <option value={50} className="bg-slate-900">50 km</option>
                <option value={100} className="bg-slate-900">100 km</option>
              </select>
            </div>

            {/* District Filter */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-xs">
              <span className="text-slate-400 font-medium">District:</span>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-slate-900">All Districts</option>
                <option value="Darjeeling" className="bg-slate-900">Darjeeling</option>
                <option value="Kalimpong" className="bg-slate-900">Kalimpong</option>
                <option value="Gangtok" className="bg-slate-900">Gangtok (East Sikkim)</option>
                <option value="Mangan" className="bg-slate-900">Mangan (North Sikkim)</option>
                <option value="Gyalshing" className="bg-slate-900">Gyalshing (West Sikkim)</option>
                <option value="Namchi" className="bg-slate-900">Namchi (South Sikkim)</option>
                <option value="Jalpaiguri" className="bg-slate-900">Jalpaiguri (Dooars)</option>
              </select>
            </div>
          </div>

          {/* Map Layer Toggles Bar */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-700/60 text-xs">
            <span className="text-slate-400 font-semibold flex items-center gap-1 mr-2">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Layers:
            </span>

            {[
              { key: 'destination', label: 'Destinations', icon: '📍', color: 'bg-violet-500/20 border-violet-500/40 text-violet-300' },
              { key: 'attraction', label: 'Attractions', icon: '🏔️', color: 'bg-amber-500/20 border-amber-500/40 text-amber-300' },
              { key: 'homestay', label: 'Homestays', icon: '🏡', color: 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' },
              { key: 'taxi_stand', label: 'Taxi Hubs', icon: '🚕', color: 'bg-yellow-500/20 border-yellow-500/40 text-yellow-300' },
              { key: 'business', label: 'Businesses', icon: '🏢', color: 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300' },
              { key: 'guide', label: 'Guides', icon: '🧭', color: 'bg-pink-500/20 border-pink-500/40 text-pink-300' }
            ].map((layer) => {
              const count = locations.filter((l) => l.entityType === layer.key).length;
              const isActive = activeLayers[layer.key] !== false;
              return (
                <button
                  key={layer.key}
                  onClick={() => toggleLayer(layer.key)}
                  className={`px-3 py-1.5 rounded-lg border font-medium flex items-center gap-1.5 transition ${
                    isActive
                      ? `${layer.color} font-bold shadow-sm`
                      : 'bg-slate-900/60 border-slate-700 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <span>{layer.icon}</span>
                  {layer.label}
                  <span className="text-[10px] opacity-75 font-mono">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab 1: Map & POI Explorer */}
        {activeTab === 'explore' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Interactive Leaflet Map */}
            <div className="lg:col-span-8 space-y-4">
              <InteractiveLeafletMap
                locations={locations}
                selectedLocation={selectedLocation}
                onSelectLocation={(loc) => setSelectedLocation(loc)}
                activeLayers={activeLayers}
                userCoords={userCoords}
                height="620px"
              />
            </div>

            {/* Sidebar: POI Results & Active Card Details */}
            <div className="lg:col-span-4 space-y-4 max-h-[620px] overflow-y-auto pr-1">
              {/* Selected Location Highlight Box */}
              {selectedLocation && (
                <div className="bg-gradient-to-br from-indigo-900/40 to-slate-800 border border-indigo-500/40 rounded-2xl p-5 space-y-3.5 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

                  {selectedLocation.imageUrl && (
                    <img
                      src={selectedLocation.imageUrl}
                      alt={selectedLocation.name}
                      className="w-full h-40 object-cover rounded-xl border border-slate-700/80"
                    />
                  )}

                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30">
                        {selectedLocation.entityType.replace('_', ' ')}
                      </span>
                      <h3 className="text-lg font-bold text-white mt-1">{selectedLocation.name}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                        {selectedLocation.district}, {selectedLocation.state}
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-emerald-400" />
                        {selectedLocation.rating || 4.8}
                      </div>
                      <span className="text-[10px] text-slate-400">({selectedLocation.reviewCount || 100} reviews)</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{selectedLocation.description}</p>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-700/60">
                    <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Elevation</span>
                      <span className="text-white font-semibold">⛰️ {selectedLocation.elevation || 1500} m</span>
                    </div>
                    <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                      <span className="text-slate-400 text-[10px] block">Coordinates</span>
                      <span className="text-white font-mono text-[11px]">{selectedLocation.lat.toFixed(3)}, {selectedLocation.lng.toFixed(3)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        setCalcDest(selectedLocation.id);
                        setActiveTab('distance_calc');
                      }}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      Calculate Route Here
                    </button>
                  </div>
                </div>
              )}

              {/* All Found Locations List */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
                  <span>Locations Found ({locations.length})</span>
                  <span className="text-[10px] text-indigo-400">Sorted by proximity</span>
                </h4>

                {locations.map((loc) => {
                  const isSelected = selectedLocation?.id === loc.id;
                  return (
                    <div
                      key={loc.id}
                      onClick={() => setSelectedLocation(loc)}
                      className={`p-3.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-slate-800 border-indigo-500 shadow-md ring-1 ring-indigo-500'
                          : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {loc.imageUrl && (
                          <img
                            src={loc.imageUrl}
                            alt={loc.name}
                            className="w-12 h-12 rounded-lg object-cover border border-slate-700 shrink-0"
                          />
                        )}
                        <div>
                          <h5 className="text-xs font-bold text-white line-clamp-1">{loc.name}</h5>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <span>{loc.district}</span>
                            <span>•</span>
                            <span className="text-emerald-400 font-medium">⛰️ {loc.elevation || 1500}m</span>
                          </p>
                        </div>
                      </div>

                      <ChevronRight className={`w-4 h-4 text-slate-500 transition ${isSelected ? 'text-indigo-400 translate-x-1' : ''}`} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Popular Circuits */}
        {activeTab === 'circuits' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Route className="w-4 h-4 text-indigo-400" />
                Select a Himalayan Travel Circuit
              </h3>

              {circuits.map((circ) => {
                const isSelected = selectedCircuit?.id === circ.id;
                return (
                  <div
                    key={circ.id}
                    onClick={() => setSelectedCircuit(circ)}
                    className={`p-5 rounded-2xl border transition cursor-pointer space-y-3 ${
                      isSelected
                        ? 'bg-slate-800 border-indigo-500 shadow-xl ring-1 ring-indigo-500'
                        : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800'
                    }`}
                  >
                    <div className="relative h-36 rounded-xl overflow-hidden border border-slate-700">
                      <img src={circ.bannerImage} alt={circ.circuitName} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                      <span className="absolute top-2 right-2 bg-indigo-600 text-white font-bold text-[10px] px-2.5 py-1 rounded-full shadow">
                        {circ.recommendedDays} Days / {circ.recommendedDays - 1} Nights
                      </span>
                      <h4 className="absolute bottom-2 left-3 right-3 text-sm font-bold text-white drop-shadow">
                        {circ.circuitName}
                      </h4>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2">{circ.description}</p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {circ.highlights.map((h, i) => (
                        <span key={i} className="text-[10px] bg-slate-900/80 border border-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                          ✨ {h}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Circuit Itinerary Inspector */}
            <div className="lg:col-span-7 bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-6">
              {selectedCircuit ? (
                <>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">
                      {selectedCircuit.region} Circuit
                    </span>
                    <h3 className="text-xl font-extrabold text-white mt-1">{selectedCircuit.circuitName}</h3>
                    <p className="text-xs text-slate-300 mt-1">{selectedCircuit.description}</p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Suggested Day-by-Day Itinerary
                    </h4>

                    {selectedCircuit.suggestedItinerary.map((item) => (
                      <div key={item.day} className="bg-slate-900/80 border border-slate-700 rounded-xl p-4 space-y-2">
                        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                          <span className="text-xs font-bold text-indigo-400 bg-indigo-500/20 px-2.5 py-0.5 rounded-full border border-indigo-500/30">
                            Day {item.day}: {item.title}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                            <Navigation className="w-3 h-3 text-indigo-400" />
                            {item.distanceKm} km drive
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
                        {item.overnightStay && (
                          <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 pt-1">
                            <Home className="w-3.5 h-3.5" />
                            Overnight: {item.overnightStay}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-16 text-slate-400 space-y-2">
                  <Route className="w-8 h-8 text-indigo-400 mx-auto opacity-50" />
                  <p className="text-xs">Select a circuit on the left to inspect its complete itinerary and waypoints.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Distance Matrix Calculator */}
        {activeTab === 'distance_calc' && (
          <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-6 shadow-xl space-y-6 max-w-3xl mx-auto">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Navigation className="w-5 h-5 text-indigo-400" />
                HillyTrip Distance & Travel Time Matrix Engine
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Calculates air distance, hill contour road distance, and travel times with Himalayan terrain adjustment factors.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Origin Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Point A (Origin)</label>
                <select
                  value={calcOrigin}
                  onChange={(e) => setCalcOrigin(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Select Origin Location --</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.district})
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Point B (Destination)</label>
                <select
                  value={calcDest}
                  onChange={(e) => setCalcDest(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">-- Select Destination Location --</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.district})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Travel Mode Toggle */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Travel Mode</label>
              <div className="flex gap-2">
                {[
                  { mode: 'driving', label: 'Car / Reserved Taxi', icon: Car },
                  { mode: 'public_transport', label: 'Shared Jeep / Bus', icon: Users },
                  { mode: 'walking', label: 'Trekking / Walking', icon: Route }
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.mode}
                      onClick={() => setCalcMode(item.mode as any)}
                      className={`flex-1 p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition ${
                        calcMode === item.mode
                          ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                          : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleCalculateDistance}
              disabled={isCalculating || !calcOrigin || !calcDest}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 transition shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
              {isCalculating ? 'Computing Matrix...' : 'Calculate Distance & Travel Time'}
            </button>

            {/* Result Matrix Card */}
            {calcResult && (
              <div className="bg-slate-900 border border-indigo-500/40 rounded-2xl p-5 space-y-4 animate-fade-in">
                <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                    Calculated Matrix Results
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Terrain Multiplier: {calcResult.terrainFactor}x</span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase block font-medium">Road Distance</span>
                    <span className="text-lg font-extrabold text-emerald-400">{calcResult.roadDistanceKm} km</span>
                  </div>

                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase block font-medium">Estimated Time</span>
                    <span className="text-lg font-extrabold text-indigo-400">{calcResult.formattedDuration}</span>
                  </div>

                  <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                    <span className="text-[10px] text-slate-400 uppercase block font-medium">Air Distance</span>
                    <span className="text-lg font-extrabold text-slate-300">{calcResult.airDistanceKm} km</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
