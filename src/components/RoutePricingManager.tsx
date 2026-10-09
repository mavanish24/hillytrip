import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  MapPin, Check, X, Shield, Sparkles, CheckCircle, AlertCircle, 
  ChevronRight, RefreshCw, Layers, Compass, Plus, Trash2, 
  Car, Tag, Table as TableIcon, LayoutGrid, Info, Search, Save, AlertTriangle,
  Copy, Power, Eye, EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface Vehicle {
  id: string;
  vehicleName: string;
  vehicleType: string;
  registrationNumber?: string;
  seatingCapacity?: number;
  availabilityStatus?: string;
}

export interface RoutePricingItem {
  id: string;
  fromLocation: string;
  toLocation: string;
  status?: 'active' | 'inactive';
  sharedAvailable: boolean;
  sharedFare: number | string;
  vehiclePricing: {
    [vehicleIdOrName: string]: {
      enabled: boolean;
      fare: number | string;
    };
  };
}

interface RoutePricingManagerProps {
  user: any;
  onUpdateUser?: (updated: any) => void;
  onNavigate?: (path: string) => void;
  isWizardStep?: boolean;
  onStepComplete?: () => void;
}

// Master Region and District hierarchy for Service Area
export const SERVICE_REGIONS = [
  {
    id: 'north_bengal',
    name: 'North Bengal',
    state: 'West Bengal',
    districts: [
      { id: 'darjeeling', name: 'Darjeeling' },
      { id: 'kalimpong', name: 'Kalimpong' },
      { id: 'jalpaiguri', name: 'Jalpaiguri' },
      { id: 'alipurduar', name: 'Alipurduar' },
      { id: 'cooch_behar', name: 'Cooch Behar' },
      { id: 'siliguri', name: 'Siliguri (Urban Hub)' }
    ]
  },
  {
    id: 'sikkim',
    name: 'Sikkim',
    state: 'Sikkim',
    districts: [
      { id: 'east_sikkim', name: 'East Sikkim (Gangtok)' },
      { id: 'west_sikkim', name: 'West Sikkim (Geyzing)' },
      { id: 'north_sikkim', name: 'North Sikkim (Mangan)' },
      { id: 'south_sikkim', name: 'South Sikkim (Namchi)' },
      { id: 'pakyong', name: 'Pakyong' },
      { id: 'soreng', name: 'Soreng' }
    ]
  },
  {
    id: 'assam',
    name: 'Assam',
    state: 'Assam',
    districts: [
      { id: 'kamrup', name: 'Guwahati / Kamrup' },
      { id: 'cachar', name: 'Silchar / Cachar' },
      { id: 'bongaigaon', name: 'Bongaigaon' },
      { id: 'sonitpur', name: 'Tezpur / Sonitpur' },
      { id: 'dibrugarh', name: 'Dibrugarh' },
      { id: 'jorhat', name: 'Jorhat' }
    ]
  },
  {
    id: 'meghalaya',
    name: 'Meghalaya',
    state: 'Meghalaya',
    districts: [
      { id: 'shillong', name: 'Shillong / East Khasi Hills' },
      { id: 'sohra', name: 'Cherrapunji (Sohra)' },
      { id: 'dawki', name: 'Dawki / West Jaintia' },
      { id: 'tura', name: 'Tura / West Garo Hills' },
      { id: 'jowai', name: 'Jowai' }
    ]
  }
];

// Recommended standard HillyTrip routes
export const RECOMMENDED_ROUTES = [
  { from: 'NJP Railway Station', to: 'Darjeeling' },
  { from: 'NJP Railway Station', to: 'Kalimpong' },
  { from: 'NJP Railway Station', to: 'Gangtok' },
  { from: 'Bagdogra Airport', to: 'Darjeeling' },
  { from: 'Bagdogra Airport', to: 'Kalimpong' },
  { from: 'Siliguri Junction', to: 'Lava' },
  { from: 'Darjeeling', to: 'Takdah' },
  { from: 'Kalimpong', to: 'Lolegaon' }
];

// Master locations database for autocomplete
export const MASTER_LOCATIONS = [
  'NJP Railway Station',
  'NJP Taxi Stand',
  'Bagdogra Airport',
  'Siliguri Junction',
  'Siliguri Town',
  'Darjeeling',
  'Darjeeling Taxi Stand',
  'Kalimpong',
  'Kalimpong Taxi Stand',
  'Kalijhora',
  'Gangtok',
  'Gangtok Deorali Stand',
  'Lava',
  'Lolegaon',
  'Rishop',
  'Takdah',
  'Tinchuley',
  'Mirik',
  'Kurseong',
  'Pelling',
  'Ravangla',
  'Namchi',
  'Lachung',
  'Lachen',
  'Yuksom',
  'Zuluk',
  'Jorethang',
  'Pakyong',
  'Geyzing',
  'Mangan',
  'Soreng',
  'Jalpaiguri',
  'Alipurduar',
  'Cooch Behar',
  'Malbazar',
  'Sevoke',
  'Guwahati',
  'Shillong',
  'Cherrapunji',
  'Dawki',
  'Phuntsholing'
];

// Default fallback mountain vehicles if operator has no registered vehicles yet
export const DEFAULT_OPERATOR_FLEET: Vehicle[] = [
  { id: 'v_bolero', vehicleName: 'Bolero Neo / Sumo', vehicleType: 'SUV / MUV', seatingCapacity: 7 },
  { id: 'v_ertiga', vehicleName: 'Ertiga / XL6', vehicleType: 'MPV', seatingCapacity: 6 },
  { id: 'v_innova', vehicleName: 'Innova Crysta', vehicleType: 'Premium SUV', seatingCapacity: 7 },
  { id: 'v_traveller', vehicleName: 'Tempo Traveller', vehicleType: 'Minibus', seatingCapacity: 13 }
];

export default function RoutePricingManager({
  user,
  onUpdateUser,
  onNavigate,
  isWizardStep = false,
  onStepComplete
}: RoutePricingManagerProps) {
  // Service Area states
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([]);
  
  // Fleet states
  const [operatorVehicles, setOperatorVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(false);

  // Route pricing states
  const [routes, setRoutes] = useState<RoutePricingItem[]>([]);
  const [pricingViewMode, setPricingViewMode] = useState<'card' | 'table'>('card');

  // New route form inputs & autocomplete states
  const [fromQuery, setFromQuery] = useState('');
  const [toQuery, setToQuery] = useState('');
  const [fromSelected, setFromSelected] = useState('');
  const [toSelected, setToSelected] = useState('');
  const [fromDropdownOpen, setFromDropdownOpen] = useState(false);
  const [toDropdownOpen, setToDropdownOpen] = useState(false);
  
  // Notice & UI Feedback states
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [copyFromRouteId, setCopyFromRouteId] = useState<string>('');

  const fromInputRef = useRef<HTMLInputElement>(null);
  const toInputRef = useRef<HTMLInputElement>(null);

  // Load operator profile & vehicles on mount
  useEffect(() => {
    loadOperatorData();
  }, [user]);

  const loadOperatorData = async () => {
    if (!user) return;
    setLoadingVehicles(true);

    // 1. Load saved service coverage & routes from user profile or backend
    try {
      const savedCoverage = user.taxiOperatorDetails?.serviceCoverage || [];
      // If serviceCoverage items are string array, set them
      const coverageDistrictNames = savedCoverage.map((c: any) => typeof c === 'string' ? c : c.name || c.id);
      setSelectedDistricts(coverageDistrictNames);

      const savedRoutes = user.taxiOperatorDetails?.routePricing || user.taxiOperatorDetails?.fixedRoutes || [];
      if (Array.isArray(savedRoutes) && savedRoutes.length > 0) {
        setRoutes(savedRoutes.map((r: any) => ({
          ...r,
          status: r.status || 'active'
        })));
      } else {
        // Pre-populate with first 3 recommended routes as helpful starting defaults
        const defaultPricing: RoutePricingItem[] = RECOMMENDED_ROUTES.slice(0, 3).map((r, i) => ({
          id: `rt_rec_${i}_${Date.now()}`,
          fromLocation: r.from,
          toLocation: r.to,
          status: 'active',
          sharedAvailable: true,
          sharedFare: i === 0 ? 350 : i === 1 ? 400 : 500,
          vehiclePricing: {
            'Bolero Neo / Sumo': { enabled: true, fare: i === 0 ? 3500 : i === 1 ? 3800 : 4800 },
            'Ertiga / XL6': { enabled: true, fare: i === 0 ? 4200 : i === 1 ? 4500 : 5500 },
            'Innova Crysta': { enabled: true, fare: i === 0 ? 5200 : i === 1 ? 5600 : 6800 },
            'Tempo Traveller': { enabled: true, fare: i === 0 ? 7500 : i === 1 ? 7800 : 9200 }
          }
        }));
        setRoutes(defaultPricing);
      }

      // 2. Fetch operator's registered vehicles
      const targetId = user.id || user.email;
      const res = await fetch(`/api/taxi-operator/vehicles?userId=${targetId}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data && Array.isArray(json.data) && json.data.length > 0) {
          setOperatorVehicles(json.data);
        } else {
          setOperatorVehicles(DEFAULT_OPERATOR_FLEET);
        }
      } else {
        setOperatorVehicles(DEFAULT_OPERATOR_FLEET);
      }
    } catch (e) {
      console.warn('Error loading operator data, using default templates:', e);
      setOperatorVehicles(DEFAULT_OPERATOR_FLEET);
    } finally {
      setLoadingVehicles(false);
    }
  };

  // Active Fleet List (Fallback to default templates if empty)
  const activeFleet = useMemo(() => {
    if (operatorVehicles.length > 0) return operatorVehicles;
    return DEFAULT_OPERATOR_FLEET;
  }, [operatorVehicles]);

  // ----------------------------------------------------
  // PRE-FILL / DEFAULT PRICING HELPER
  // Pre-fill vehicle fares using operator's previously saved pricing
  // ----------------------------------------------------
  const getPreFilledVehiclePricing = (vKey: string, index: number, sourceRouteId?: string) => {
    // 1. If copying directly from a selected existing route
    if (sourceRouteId) {
      const sourceRoute = routes.find(r => r.id === sourceRouteId);
      if (sourceRoute?.vehiclePricing?.[vKey]) {
        return {
          enabled: sourceRoute.vehiclePricing[vKey].enabled ?? true,
          fare: sourceRoute.vehiclePricing[vKey].fare ?? 3500
        };
      }
    }

    // 2. Look for the last saved fare for this vehicle across existing routes
    for (let i = routes.length - 1; i >= 0; i--) {
      const savedFare = routes[i]?.vehiclePricing?.[vKey]?.fare;
      const isEnabled = routes[i]?.vehiclePricing?.[vKey]?.enabled;
      if (savedFare !== undefined && savedFare !== null && Number(savedFare) > 0) {
        return { enabled: isEnabled ?? true, fare: Number(savedFare) };
      }
    }

    // 3. Fallback vehicle defaults
    const lower = vKey.toLowerCase();
    let fare = 3500;
    if (lower.includes('ertiga') || lower.includes('xl6')) fare = 4200;
    else if (lower.includes('innova')) fare = 5200;
    else if (lower.includes('traveller')) fare = 7500;
    else fare = 3500 + index * 500;

    return { enabled: true, fare };
  };

  // ----------------------------------------------------
  // COPY PRICING FROM EXISTING ROUTE TO TARGET ROUTE
  // ----------------------------------------------------
  const handleCopyPricingFromRoute = (targetRouteId: string, sourceRouteId: string) => {
    if (!sourceRouteId) return;
    const sourceRoute = routes.find(r => r.id === sourceRouteId);
    if (!sourceRoute) return;

    setRoutes(prev => prev.map(rt => {
      if (rt.id === targetRouteId) {
        return {
          ...rt,
          sharedAvailable: sourceRoute.sharedAvailable,
          sharedFare: sourceRoute.sharedFare,
          vehiclePricing: JSON.parse(JSON.stringify(sourceRoute.vehiclePricing || {}))
        };
      }
      return rt;
    }));

    setSuccess(`Copied vehicle fares & availability from "${sourceRoute.fromLocation} → ${sourceRoute.toLocation}"`);
    setTimeout(() => setSuccess(null), 3000);
  };

  // ----------------------------------------------------
  // ROUTE STATUS TOGGLE (Active / Inactive)
  // ----------------------------------------------------
  const handleToggleRouteStatus = (routeId: string) => {
    setRoutes(prev => prev.map(rt => {
      if (rt.id === routeId) {
        const currentStatus = rt.status || 'active';
        const nextStatus = currentStatus === 'active' ? 'inactive' : 'active';
        return { ...rt, status: nextStatus };
      }
      return rt;
    }));
  };

  // Handle District Checkbox toggle
  const toggleDistrict = (districtName: string) => {
    setSelectedDistricts(prev => {
      if (prev.includes(districtName)) {
        return prev.filter(d => d !== districtName);
      } else {
        return [...prev, districtName];
      }
    });
  };

  // Handle Region Parent Checkbox toggle
  const toggleRegion = (regionDistricts: { id: string; name: string }[]) => {
    const districtNames = regionDistricts.map(d => d.name);
    const allChecked = districtNames.every(name => selectedDistricts.includes(name));

    if (allChecked) {
      // Uncheck all in this region
      setSelectedDistricts(prev => prev.filter(d => !districtNames.includes(d)));
    } else {
      // Check all in this region
      setSelectedDistricts(prev => Array.from(new Set([...prev, ...districtNames])));
    }
  };

  // Calculate Region Check State (Checked, Unchecked, or Indeterminate)
  const getRegionState = (regionDistricts: { id: string; name: string }[]) => {
    const districtNames = regionDistricts.map(d => d.name);
    const checkedCount = districtNames.filter(name => selectedDistricts.includes(name)).length;
    
    if (checkedCount === 0) return 'none';
    if (checkedCount === districtNames.length) return 'all';
    return 'some';
  };

  // Autocomplete Suggestions Filter
  const filteredFromLocations = useMemo(() => {
    if (!fromQuery.trim()) return MASTER_LOCATIONS;
    return MASTER_LOCATIONS.filter(loc => 
      loc.toLowerCase().includes(fromQuery.toLowerCase())
    );
  }, [fromQuery]);

  const filteredToLocations = useMemo(() => {
    if (!toQuery.trim()) return MASTER_LOCATIONS;
    return MASTER_LOCATIONS.filter(loc => 
      loc.toLowerCase().includes(toQuery.toLowerCase())
    );
  }, [toQuery]);

  // Add a recommended route
  const handleAddRecommendedRoute = (rec: { from: string; to: string }) => {
    setDuplicateWarning(null);
    if (routes.length >= 20) {
      setError('Maximum 20 fixed routes limit reached.');
      return;
    }

    // Check duplicate
    const isDuplicate = routes.some(r => 
      (r.fromLocation.toLowerCase() === rec.from.toLowerCase() && r.toLocation.toLowerCase() === rec.to.toLowerCase()) ||
      (r.fromLocation.toLowerCase() === rec.to.toLowerCase() && r.toLocation.toLowerCase() === rec.from.toLowerCase())
    );

    if (isDuplicate) {
      setDuplicateWarning(`The route "${rec.from} → ${rec.to}" already exists. Please update the fare in the list below.`);
      return;
    }

    // Build vehicle pricing pre-filled using operator's previously saved pricing or selected source
    const initialVehiclePricing: Record<string, { enabled: boolean; fare: number | string }> = {};
    activeFleet.forEach((v, idx) => {
      const vKey = v.vehicleName || v.vehicleType || v.id;
      initialVehiclePricing[vKey] = getPreFilledVehiclePricing(vKey, idx, copyFromRouteId);
    });

    let initialSharedFare = 350;
    if (copyFromRouteId) {
      const src = routes.find(r => r.id === copyFromRouteId);
      if (src && src.sharedFare) initialSharedFare = Number(src.sharedFare);
    }

    const newRoute: RoutePricingItem = {
      id: `rt_custom_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      fromLocation: rec.from,
      toLocation: rec.to,
      status: 'active',
      sharedAvailable: true,
      sharedFare: initialSharedFare,
      vehiclePricing: initialVehiclePricing
    };

    setRoutes(prev => [...prev, newRoute]);
    setSuccess(`Added recommended route: ${rec.from} → ${rec.to}`);
    setTimeout(() => setSuccess(null), 3000);
  };

  // Add custom route via autocomplete selection
  const handleAddCustomRoute = () => {
    setError(null);
    setDuplicateWarning(null);

    const fromVal = fromSelected || fromQuery.trim();
    const toVal = toSelected || toQuery.trim();

    if (!fromVal || !toVal) {
      setError('Please select both a valid From origin and Destination location.');
      return;
    }

    // Strict validation: must belong to MASTER_LOCATIONS
    const isFromValid = MASTER_LOCATIONS.some(l => l.toLowerCase() === fromVal.toLowerCase());
    const isToValid = MASTER_LOCATIONS.some(l => l.toLowerCase() === toVal.toLowerCase());

    if (!isFromValid || !isToValid) {
      setError('Please select origin and destination from the autocomplete suggestions.');
      return;
    }

    if (fromVal.toLowerCase() === toVal.toLowerCase()) {
      setError('From location and Destination cannot be the same.');
      return;
    }

    if (routes.length >= 20) {
      setError('Maximum 20 fixed routes limit reached.');
      return;
    }

    // Check duplicate
    const isDuplicate = routes.some(r => 
      (r.fromLocation.toLowerCase() === fromVal.toLowerCase() && r.toLocation.toLowerCase() === toVal.toLowerCase()) ||
      (r.fromLocation.toLowerCase() === toVal.toLowerCase() && r.toLocation.toLowerCase() === fromVal.toLowerCase())
    );

    if (isDuplicate) {
      setDuplicateWarning(`This route (${fromVal} → ${toVal}) already exists. Please update the fare instead.`);
      return;
    }

    // Pre-fill vehicle pricing using operator's previously saved rates or selected source route
    const initialVehiclePricing: Record<string, { enabled: boolean; fare: number | string }> = {};
    activeFleet.forEach((v, idx) => {
      const vKey = v.vehicleName || v.vehicleType || v.id;
      initialVehiclePricing[vKey] = getPreFilledVehiclePricing(vKey, idx, copyFromRouteId);
    });

    let initialSharedFare = 350;
    if (copyFromRouteId) {
      const src = routes.find(r => r.id === copyFromRouteId);
      if (src && src.sharedFare) initialSharedFare = Number(src.sharedFare);
    }

    const newRoute: RoutePricingItem = {
      id: `rt_custom_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      fromLocation: fromVal,
      toLocation: toVal,
      status: 'active',
      sharedAvailable: true,
      sharedFare: initialSharedFare,
      vehiclePricing: initialVehiclePricing
    };

    setRoutes(prev => [...prev, newRoute]);
    setFromQuery('');
    setToQuery('');
    setFromSelected('');
    setToSelected('');
    setSuccess(`Added route: ${fromVal} → ${toVal}`);
    setTimeout(() => setSuccess(null), 3000);
  };

  // Remove a route
  const handleRemoveRoute = (routeId: string) => {
    setRoutes(prev => prev.filter(r => r.id !== routeId));
  };

  // Update shared fare or availability
  const handleUpdateSharedPricing = (routeId: string, field: 'sharedAvailable' | 'sharedFare', value: any) => {
    setRoutes(prev => prev.map(r => {
      if (r.id === routeId) {
        return {
          ...r,
          [field]: value
        };
      }
      return r;
    }));
  };

  // Update vehicle-specific pricing on a route
  const handleUpdateVehiclePricing = (routeId: string, vehicleKey: string, field: 'enabled' | 'fare', value: any) => {
    setRoutes(prev => prev.map(r => {
      if (r.id === routeId) {
        const currentV = r.vehiclePricing?.[vehicleKey] || { enabled: true, fare: 3500 };
        return {
          ...r,
          vehiclePricing: {
            ...(r.vehiclePricing || {}),
            [vehicleKey]: {
              ...currentV,
              [field]: value
            }
          }
        };
      }
      return r;
    }));
  };

  // Save Service Area & Fixed Route Pricing to backend
  const handleSaveAll = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const targetUserId = user.id || user.email;

      // 1. Save Coverage Area
      const coverageRes = await fetch('/api/taxi-operator/service-coverage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: targetUserId,
          serviceCoverage: selectedDistricts
        })
      });

      if (!coverageRes.ok) {
        const errData = await coverageRes.json();
        throw new Error(errData.error || 'Failed to save Service Coverage Area.');
      }

      // 2. Save Fixed Route Pricing
      const profileRes = await fetch('/api/taxi-operator/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: targetUserId,
          routePricing: routes,
          serviceCoverage: selectedDistricts
        })
      });

      if (!profileRes.ok) {
        const errData = await profileRes.json();
        throw new Error(errData.error || 'Failed to save Route Pricing.');
      }

      const data = await profileRes.json();
      if (onUpdateUser && data.user) {
        onUpdateUser(data.user);
      }

      setSuccess('Service Coverage & Vehicle-wise Route Pricing saved successfully!');
      setTimeout(() => setSuccess(null), 4000);

      if (isWizardStep && onStepComplete) {
        onStepComplete();
      }
    } catch (e: any) {
      setError(e.message || 'An error occurred while saving.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 font-sans">
      
      {/* HEADER NOTICE BANNER */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-widest mb-2">
            <Compass className="w-4 h-4 animate-spin" style={{ animationDuration: '10s' }} /> Service Coverage & Fixed Route Pricing
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">
            Configure Operating Regions & Vehicle Fleet Rates
          </h2>
          <p className="text-slate-100 text-xs md:text-sm mt-1 max-w-2xl leading-relaxed">
            Select your operational coverage area and configure vehicle-specific rates for popular Himalayan corridors. When travelers query these routes, your exact vehicle pricing will be used automatically.
          </p>
        </div>
      </div>

      {/* ERROR & SUCCESS ALERTS */}
      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="bg-rose-50 border-l-4 border-rose-600 rounded-xl p-4 flex gap-3 text-rose-800 text-sm font-bold shadow-sm"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div className="flex-1">{error}</div>
            <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600 font-black">&times;</button>
          </motion.div>
        )}

        {duplicateWarning && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="bg-amber-50 border-l-4 border-amber-500 rounded-xl p-4 flex gap-3 text-amber-900 text-sm font-bold shadow-sm"
          >
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="flex-1">{duplicateWarning}</div>
            <button onClick={() => setDuplicateWarning(null)} className="text-amber-500 hover:text-amber-800 font-black">&times;</button>
          </motion.div>
        )}

        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-50 border-l-4 border-emerald-600 rounded-xl p-4 flex gap-3 text-emerald-800 text-sm font-bold shadow-sm"
          >
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="flex-1">{success}</div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================================================== */}
      {/* SECTION 1: SERVICE AREA (HIERARCHICAL SELECTION) */}
      {/* ==================================================== */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex justify-between items-start border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-500" /> 1. Operational Service Area
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Select regions and child districts where your drivers operate. Checking a parent region selects all its districts.
            </p>
          </div>
          <span className="bg-amber-100 text-amber-800 font-bold text-xs px-3 py-1 rounded-full border border-amber-200">
            {selectedDistricts.length} Districts Selected
          </span>
        </div>

        {/* REGIONS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SERVICE_REGIONS.map(region => {
            const regState = getRegionState(region.districts);
            return (
              <div key={region.id} className="bg-slate-50/80 border border-slate-200 rounded-2xl p-5 space-y-4">
                
                {/* PARENT REGION HEADER */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <label className="flex items-center gap-2.5 font-black text-slate-900 text-sm cursor-pointer select-none">
                    <button
                      type="button"
                      onClick={() => toggleRegion(region.districts)}
                      className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                        regState === 'all'
                          ? 'bg-amber-500 border-amber-500 text-white'
                          : regState === 'some'
                          ? 'bg-amber-100 border-amber-400 text-amber-700'
                          : 'bg-white border-slate-300 text-transparent hover:border-amber-400'
                      }`}
                    >
                      {regState === 'all' && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      {regState === 'some' && <span className="w-2.5 h-0.5 bg-amber-700 rounded-full" />}
                    </button>
                    <span>{region.name} ({region.state})</span>
                  </label>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    {regState === 'all' ? 'All Selected' : regState === 'some' ? 'Partially Selected' : 'Unselected'}
                  </span>
                </div>

                {/* CHILD DISTRICTS CHECKBOXES */}
                <div className="grid grid-cols-2 gap-2.5 pt-1">
                  {region.districts.map(dist => {
                    const isChecked = selectedDistricts.includes(dist.name);
                    return (
                      <label
                        key={dist.id}
                        onClick={() => toggleDistrict(dist.name)}
                        className={`flex items-center gap-2 p-2 rounded-xl text-xs font-semibold cursor-pointer border transition-all ${
                          isChecked
                            ? 'bg-amber-50 border-amber-200 text-amber-900 shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100/80'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                          isChecked ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-slate-300'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="truncate">{dist.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ==================================================== */}
      {/* SECTION 2: FIXED ROUTES & RECOMMENDED ROUTES */}
      {/* ==================================================== */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-amber-500" /> 2. Fixed Routes & Rates Configuration
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Select popular recommended corridors or search existing locations to add custom routes (Max 20).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-xs font-extrabold border ${
              routes.length >= 20 ? 'bg-rose-100 text-rose-800 border-rose-200' : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              {routes.length} / 20 Routes Added
            </span>
          </div>
        </div>

        {/* ⭐ RECOMMENDED ROUTES SECTION */}
        <div className="bg-amber-50/40 border border-amber-150 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" /> ⭐ Recommended HillyTrip Corridors
            </h4>
            <span className="text-[10px] text-amber-700 font-bold">Click to quickly add to your rates list</span>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {RECOMMENDED_ROUTES.map((rec, i) => {
              const exists = routes.some(r => 
                (r.fromLocation.toLowerCase() === rec.from.toLowerCase() && r.toLocation.toLowerCase() === rec.to.toLowerCase()) ||
                (r.fromLocation.toLowerCase() === rec.to.toLowerCase() && r.toLocation.toLowerCase() === rec.from.toLowerCase())
              );
              return (
                <button
                  key={i}
                  type="button"
                  disabled={exists || routes.length >= 20}
                  onClick={() => handleAddRecommendedRoute(rec)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                    exists
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 opacity-80 cursor-default'
                      : 'bg-white hover:bg-amber-100 text-slate-800 border-amber-200 shadow-2xs hover:border-amber-400'
                  }`}
                >
                  <span>{rec.from} → {rec.to}</span>
                  {exists ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Plus className="w-3.5 h-3.5 text-amber-600" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* + ADD ROUTE AUTOCOMPLETE FORM */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-amber-500" /> Add Additional Fixed Route
            </h4>

            {routes.length > 0 && (
              <div className="flex items-center gap-2">
                <label className="text-[10px] uppercase font-bold text-slate-500 whitespace-nowrap">Pre-fill pricing from:</label>
                <select
                  value={copyFromRouteId}
                  onChange={e => setCopyFromRouteId(e.target.value)}
                  className="bg-white border border-slate-300 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-amber-500 shadow-2xs"
                >
                  <option value="">▼ Auto-fill using saved vehicle fares</option>
                  {routes.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.fromLocation} → {r.toLocation}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end">
            
            {/* FROM AUTOCOMPLETE */}
            <div className="sm:col-span-2 relative">
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">From Origin *</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  ref={fromInputRef}
                  type="text"
                  placeholder="Type location e.g. NJP..."
                  value={fromQuery}
                  onChange={e => {
                    setFromQuery(e.target.value);
                    setFromSelected('');
                    setFromDropdownOpen(true);
                  }}
                  onFocus={() => setFromDropdownOpen(true)}
                  className="w-full bg-white border border-slate-300 rounded-xl py-2 pl-9 pr-3 text-xs font-bold text-slate-800 focus:outline-amber-500"
                />
              </div>

              {/* DROPDOWN */}
              {fromDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto z-30">
                  {filteredFromLocations.length > 0 ? (
                    filteredFromLocations.map((loc, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setFromQuery(loc);
                          setFromSelected(loc);
                          setFromDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-amber-50 text-slate-700 hover:text-amber-900 border-b border-slate-100 last:border-0 cursor-pointer"
                      >
                        📍 {loc}
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-xs text-slate-400 font-semibold italic text-center">
                      No matching location in database.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* DESTINATION AUTOCOMPLETE */}
            <div className="sm:col-span-2 relative">
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Destination *</label>
              <div className="relative">
                <Compass className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  ref={toInputRef}
                  type="text"
                  placeholder="Type destination e.g. Kalimpong..."
                  value={toQuery}
                  onChange={e => {
                    setToQuery(e.target.value);
                    setToSelected('');
                    setToDropdownOpen(true);
                  }}
                  onFocus={() => setToDropdownOpen(true)}
                  className="w-full bg-white border border-slate-300 rounded-xl py-2 pl-9 pr-3 text-xs font-bold text-slate-800 focus:outline-amber-500"
                />
              </div>

              {/* DROPDOWN */}
              {toDropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto z-30">
                  {filteredToLocations.length > 0 ? (
                    filteredToLocations.map((loc, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setToQuery(loc);
                          setToSelected(loc);
                          setToDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-amber-50 text-slate-700 hover:text-amber-900 border-b border-slate-100 last:border-0 cursor-pointer"
                      >
                        📍 {loc}
                      </button>
                    ))
                  ) : (
                    <div className="p-3 text-xs text-slate-400 font-semibold italic text-center">
                      No matching location in database.
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ADD ROUTE BUTTON */}
            <div>
              <button
                type="button"
                disabled={routes.length >= 20}
                onClick={handleAddCustomRoute}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 text-white font-extrabold px-4 py-2 rounded-xl text-xs transition shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Route
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================== */}
      {/* SECTION 3: VEHICLE-WISE PRICING & MULTI-ROUTE GRID */}
      {/* ==================================================== */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Tag className="w-5 h-5 text-amber-500" /> 3. Vehicle Availability & Fares Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Set status (Active/Inactive), enable/disable specific vehicles per route, and manage fare prices.
            </p>
          </div>

          {/* VIEW MODE TOGGLE */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setPricingViewMode('card')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                pricingViewMode === 'card' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Card View
            </button>
            <button
              type="button"
              onClick={() => setPricingViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                pricingViewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" /> Spreadsheet Grid
            </button>
          </div>
        </div>

        {routes.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-6">
            <Compass className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="font-bold text-slate-700 text-sm">No routes added yet</h4>
            <p className="text-xs text-slate-400 mt-1">Select from the recommended routes above or add a custom route to begin setting fares.</p>
          </div>
        ) : pricingViewMode === 'card' ? (

          /* ================= CARD VIEW ================= */
          <div className="space-y-6">
            {routes.map((rt, idx) => {
              const isRouteActive = (rt.status || 'active') === 'active';

              return (
                <div key={rt.id} className={`border rounded-2xl p-5 space-y-4 transition ${
                  isRouteActive ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-100/50 border-slate-300 opacity-75'
                }`}>
                  
                  {/* ROUTE HEADER */}
                  <div className="flex flex-wrap justify-between items-center gap-3 border-b border-slate-200 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                        {rt.fromLocation} <span className="text-amber-600 font-bold">⇄</span> {rt.toLocation}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* ROUTE STATUS TOGGLE */}
                      <button
                        type="button"
                        onClick={() => handleToggleRouteStatus(rt.id)}
                        className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition border cursor-pointer ${
                          isRouteActive
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                            : 'bg-slate-200 text-slate-600 border-slate-300 hover:bg-slate-300'
                        }`}
                        title="Click to toggle Active / Inactive status"
                      >
                        <Power className={`w-3.5 h-3.5 ${isRouteActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                        <span>{isRouteActive ? 'Active Route' : 'Inactive'}</span>
                      </button>

                      {/* COPY PRICING FROM OTHER ROUTE */}
                      {routes.length > 1 && (
                        <select
                          onChange={e => {
                            if (e.target.value) {
                              handleCopyPricingFromRoute(rt.id, e.target.value);
                              e.target.value = '';
                            }
                          }}
                          className="text-[11px] font-bold bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-slate-700 hover:border-amber-400 focus:outline-amber-500 cursor-pointer shadow-2xs"
                        >
                          <option value="">Copy Fares From...</option>
                          {routes.filter(r => r.id !== rt.id).map(r => (
                            <option key={r.id} value={r.id}>
                              {r.fromLocation} → {r.toLocation}
                            </option>
                          ))}
                        </select>
                      )}

                      {/* REMOVE BUTTON */}
                      <button
                        type="button"
                        onClick={() => handleRemoveRoute(rt.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                        title="Remove route"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* SHARED TAXI OPTIONS */}
                  <div className="bg-white border border-slate-200 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <label className="flex items-center gap-2 cursor-pointer font-extrabold text-slate-800 text-xs">
                        <input
                          type="checkbox"
                          checked={rt.sharedAvailable}
                          onChange={e => handleUpdateSharedPricing(rt.id, 'sharedAvailable', e.target.checked)}
                          className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
                        />
                        <span>Shared Taxi Service Available</span>
                      </label>
                    </div>

                    {rt.sharedAvailable && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500">Shared Fare / Seat:</span>
                        <div className="relative">
                          <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-400">₹</span>
                          <input
                            type="number"
                            value={rt.sharedFare}
                            onChange={e => handleUpdateSharedPricing(rt.id, 'sharedFare', Number(e.target.value) || '')}
                            placeholder="350"
                            className="w-28 bg-slate-50 border border-slate-300 rounded-lg py-1.5 pl-6 pr-2 text-xs font-extrabold text-slate-900 focus:outline-amber-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* RESERVED VEHICLES FLEET MATRIX */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider block">
                        Vehicle Availability & Reserved Fares
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Check/uncheck vehicles to control availability on this route
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {activeFleet.map((veh) => {
                        const vKey = veh.vehicleName || veh.vehicleType || veh.id;
                        const vConfig = rt.vehiclePricing?.[vKey] || { enabled: true, fare: 3500 };

                        return (
                          <div key={vKey} className={`p-3.5 rounded-xl border transition ${
                            vConfig.enabled 
                              ? 'bg-white border-amber-300 shadow-2xs' 
                              : 'bg-slate-100 border-slate-200 text-slate-400'
                          }`}>
                            <div className="flex justify-between items-center mb-2">
                              <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800 text-xs truncate">
                                <input
                                  type="checkbox"
                                  checked={vConfig.enabled}
                                  onChange={e => handleUpdateVehiclePricing(rt.id, vKey, 'enabled', e.target.checked)}
                                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 cursor-pointer"
                                />
                                <span className={`truncate ${vConfig.enabled ? 'text-slate-900 font-extrabold' : 'text-slate-500'}`}>
                                  {vKey}
                                </span>
                              </label>

                              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                                vConfig.enabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'
                              }`}>
                                {vConfig.enabled ? 'Available' : 'Off'}
                              </span>
                            </div>

                            {vConfig.enabled ? (
                              <div className="relative mt-1">
                                <span className="absolute left-2.5 top-2 text-xs font-bold text-slate-400">₹</span>
                                <input
                                  type="number"
                                  value={vConfig.fare}
                                  onChange={e => handleUpdateVehiclePricing(rt.id, vKey, 'fare', Number(e.target.value) || '')}
                                  placeholder="3500"
                                  className="w-full bg-slate-50 border border-slate-300 rounded-lg py-1.5 pl-6 pr-2 text-xs font-black text-slate-900 focus:outline-amber-500"
                                />
                              </div>
                            ) : (
                              <div className="mt-1 py-1.5 text-center text-[11px] font-bold text-slate-400 bg-slate-200/50 rounded-lg">
                                Not Available
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (

          /* ================= SPREADSHEET MULTI-ROUTE GRID ================= */
          <div className="overflow-x-auto border border-slate-200 rounded-2xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 font-extrabold uppercase text-[10px] tracking-wider">
                  <th className="p-3.5">Route Corridor</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5 text-center">Shared Fare</th>
                  {activeFleet.map(veh => (
                    <th key={veh.id} className="p-3.5 text-center">
                      {veh.vehicleName || veh.vehicleType}
                    </th>
                  ))}
                  <th className="p-3.5 text-center">Copy From</th>
                  <th className="p-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white font-medium text-slate-800">
                {routes.map((rt) => {
                  const isRouteActive = (rt.status || 'active') === 'active';

                  return (
                    <tr key={rt.id} className={`hover:bg-slate-50/80 transition ${
                      !isRouteActive ? 'bg-slate-50/50 opacity-75' : ''
                    }`}>
                      
                      {/* ROUTE NAME */}
                      <td className="p-3.5 font-bold text-slate-900 min-w-[180px]">
                        {rt.fromLocation} <span className="text-amber-500 font-normal">→</span> {rt.toLocation}
                      </td>

                      {/* STATUS TOGGLE */}
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleRouteStatus(rt.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold transition cursor-pointer ${
                            isRouteActive 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                              : 'bg-slate-200 text-slate-600 border border-slate-300'
                          }`}
                        >
                          {isRouteActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      {/* SHARED FARE */}
                      <td className="p-3.5 text-center min-w-[120px]">
                        <div className="relative inline-block w-24">
                          <span className="absolute left-2 top-2 text-xs font-bold text-slate-400">₹</span>
                          <input
                            type="number"
                            value={rt.sharedFare}
                            onChange={e => handleUpdateSharedPricing(rt.id, 'sharedFare', Number(e.target.value) || '')}
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg py-1.5 pl-5 pr-1 text-xs font-bold text-center text-slate-900"
                          />
                        </div>
                      </td>

                      {/* VEHICLE FARES & AVAILABILITY */}
                      {activeFleet.map(veh => {
                        const vKey = veh.vehicleName || veh.vehicleType || veh.id;
                        const vConfig = rt.vehiclePricing?.[vKey] || { enabled: true, fare: 3500 };

                        return (
                          <td key={vKey} className="p-3.5 text-center min-w-[130px]">
                            <div className="flex items-center justify-center gap-1">
                              <input
                                type="checkbox"
                                checked={vConfig.enabled}
                                onChange={e => handleUpdateVehiclePricing(rt.id, vKey, 'enabled', e.target.checked)}
                                className="w-3.5 h-3.5 rounded text-amber-500 cursor-pointer"
                                title="Toggle Vehicle Availability"
                              />
                              {vConfig.enabled ? (
                                <div className="relative inline-block w-20">
                                  <span className="absolute left-1.5 top-1.5 text-xs font-bold text-slate-400">₹</span>
                                  <input
                                    type="number"
                                    value={vConfig.fare}
                                    onChange={e => handleUpdateVehiclePricing(rt.id, vKey, 'fare', Number(e.target.value) || '')}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-lg py-1 pl-4 pr-1 text-xs font-extrabold text-center text-slate-900"
                                  />
                                </div>
                              ) : (
                                <span className="text-[10px] font-bold text-slate-400 italic">Off</span>
                              )}
                            </div>
                          </td>
                        );
                      })}

                      {/* COPY FROM */}
                      <td className="p-3.5 text-center">
                        <select
                          onChange={e => {
                            if (e.target.value) {
                              handleCopyPricingFromRoute(rt.id, e.target.value);
                              e.target.value = '';
                            }
                          }}
                          className="text-[10px] font-bold bg-white border border-slate-200 rounded px-2 py-1 text-slate-700 cursor-pointer"
                        >
                          <option value="">Copy...</option>
                          {routes.filter(r => r.id !== rt.id).map(r => (
                            <option key={r.id} value={r.id}>
                              {r.fromLocation} → {r.toLocation}
                            </option>
                          ))}
                        </select>
                      </td>

                      {/* ACTIONS */}
                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveRoute(rt.id)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* SAVE ACTION FOOTER */}
      <div className="pt-4 flex justify-end">
        <button
          type="button"
          disabled={saving}
          onClick={handleSaveAll}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold px-8 py-3.5 rounded-2xl text-sm transition shadow-lg hover:shadow-xl cursor-pointer flex items-center gap-2"
        >
          {saving ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Saving Configuration...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Coverage & Route Pricing
            </>
          )}
        </button>
      </div>

    </div>
  );
}
