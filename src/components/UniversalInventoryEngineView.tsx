// Universal Availability & Inventory Engine View for HillyTrip
// Fully configuration-driven, robust, modular UI for managing and searching inventory

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Boxes, 
  Calendar, 
  Settings, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Activity, 
  Sparkles, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  FileJson, 
  ChevronLeft, 
  ChevronRight, 
  Users, 
  Percent, 
  DollarSign, 
  RefreshCw, 
  Sliders, 
  Eye, 
  EyeOff,
  Briefcase,
  AlertOctagon,
  TrendingUp,
  MapPin,
  Camera,
  Layers,
  HelpCircle
} from 'lucide-react';
import { UniversalInventoryEngine, CATEGORY_DEFAULT_RULES } from '../lib/inventoryEngine';
import { InventoryItem, InventoryType, ReservedSlot, InventoryRuleSet, TimeSlot } from '../types/inventory';

interface UniversalInventoryEngineViewProps {
  navigate: (hash: string) => void;
  user?: any;
}

export default function UniversalInventoryEngineView({ navigate, user }: UniversalInventoryEngineViewProps) {
  const engine = UniversalInventoryEngine.getInstance();

  // Core Master State
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [reservations, setReservations] = useState<ReservedSlot[]>([]);
  const [activeTab, setActiveTab] = useState<'public' | 'dashboard' | 'rules'>('public');

  // Trigger State Refreshes
  const refreshEngineState = () => {
    setItems([...engine.getInventory()]);
    setReservations([...engine.getReservations()]);
  };

  useEffect(() => {
    refreshEngineState();
  }, []);

  // --- CALENDAR STATE ---
  const [calendarViewMode, setCalendarViewMode] = useState<'day' | 'week' | 'month'>('month');
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(new Date('2026-07-21')); // Anchored near seed reservations
  const [selectedCalendarItem, setSelectedCalendarItem] = useState<string>('inv-room-101-sherpa');

  // --- TRAVELER SEARCH STATE ---
  const [searchCategory, setSearchCategory] = useState<string>('All');
  const [searchStartDate, setSearchStartDate] = useState<string>('2026-07-22');
  const [searchEndDate, setSearchEndDate] = useState<string>('2026-07-25');
  const [searchGuestsCount, setSearchGuestsCount] = useState<number>(2);
  const [selectedTravelerItem, setSelectedTravelerItem] = useState<InventoryItem | null>(null);
  const [hideUnavailable, setHideUnavailable] = useState<boolean>(false);
  const [showDiagnosticId, setShowDiagnosticId] = useState<string | null>(null);
  
  // simulated API response for future booking engine integration
  const [simulatedContract, setSimulatedContract] = useState<any | null>(null);

  // --- MANAGEMENT STATE ---
  const [bulkSelectIds, setBulkSelectIds] = useState<string[]>([]);
  const [bulkPriceMultiplier, setBulkPriceMultiplier] = useState<number>(1.1);
  const [isAddingItem, setIsAddingItem] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // --- NEW ITEM FORM STATE ---
  const [formName, setFormName] = useState('');
  const [formType, setFormType] = useState<InventoryType>('Room');
  const [formBusinessId, setFormBusinessId] = useState('sherpa-lodge-lava');
  const [formBusinessName, setFormBusinessName] = useState('Sherpa Vista Homestay');
  const [formBusinessCategory, setFormBusinessCategory] = useState('homestay');
  const [formMaxGuests, setFormMaxGuests] = useState(2);
  const [formMinBookingSize, setFormMinBookingSize] = useState(1);
  const [formShared, setFormShared] = useState(false);
  const [formTotalQuantity, setFormTotalQuantity] = useState(3);
  const [formBaseRate, setFormBaseRate] = useState(1500);
  const [formUnitType, setFormUnitType] = useState<'night' | 'day' | 'trip' | 'hour' | 'person' | 'table' | 'session'>('night');
  const [formDescription, setFormDescription] = useState('');
  const [formAmenities, setFormAmenities] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Maintenance' | 'Temporarily Closed'>('Active');
  const [formImage, setFormImage] = useState('https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=600&auto=format&fit=crop');

  // --- AI INSIGHTS CACHE ---
  const [aiInsightItem, setAiInsightItem] = useState<string>('inv-room-101-sherpa');

  // Handle Create/Edit Submit
  const handleSaveInventoryItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDescription.trim()) return;

    const amenityList = formAmenities.split(',').map(a => a.trim()).filter(a => a.length > 0);

    const dataPayload = {
      businessId: formBusinessId,
      businessName: formBusinessName,
      businessCategory: formBusinessCategory,
      name: formName,
      type: formType,
      capacity: {
        maxGuests: Number(formMaxGuests),
        minBookingSize: Number(formMinBookingSize),
        shared: formShared,
        totalQuantity: Number(formTotalQuantity),
      },
      pricing: {
        baseRate: Number(formBaseRate),
        unitType: formUnitType,
        currency: 'INR',
        seasonalRates: formType === 'Room' ? [
          { name: 'Puja Holidays Peak', startDate: '2026-10-10', endDate: '2026-10-25', rateMultiplier: 1.4 },
          { name: 'Monsoon Discount', startDate: '2026-07-01', endDate: '2026-08-31', rateMultiplier: 0.8 }
        ] : []
      },
      status: formStatus,
      images: [formImage || 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=600&auto=format&fit=crop'],
      description: formDescription,
      amenities: amenityList,
      dynamicAttributes: {},
      blackoutDates: []
    };

    if (editingItem) {
      engine.updateInventoryItem({
        ...editingItem,
        ...dataPayload
      });
    } else {
      engine.addInventoryItem(dataPayload);
    }

    setIsAddingItem(false);
    setEditingItem(null);
    clearForm();
    refreshEngineState();
  };

  const handleEditClick = (item: InventoryItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormType(item.type);
    setFormBusinessId(item.businessId);
    setFormBusinessName(item.businessName);
    setFormBusinessCategory(item.businessCategory);
    setFormMaxGuests(item.capacity.maxGuests);
    setFormMinBookingSize(item.capacity.minBookingSize);
    setFormShared(item.capacity.shared);
    setFormTotalQuantity(item.capacity.totalQuantity);
    setFormBaseRate(item.pricing.baseRate);
    setFormUnitType(item.pricing.unitType);
    setFormDescription(item.description);
    setFormAmenities(item.amenities.join(', '));
    setFormStatus(item.status === 'Archived' ? 'Active' : item.status);
    setFormImage(item.images[0] || '');
    setIsAddingItem(true);
  };

  const handleDeleteClick = (id: string) => {
    if (confirm('Are you sure you want to permanently delete this inventory profile? This cleans up associated reservation timelines.')) {
      engine.deleteInventoryItem(id);
      refreshEngineState();
    }
  };

  const handleToggleStatus = (item: InventoryItem) => {
    const nextStatus = item.status === 'Active' ? 'Temporarily Closed' : 'Active';
    engine.updateInventoryItem({
      ...item,
      status: nextStatus
    });
    refreshEngineState();
  };

  const clearForm = () => {
    setFormName('');
    setFormDescription('');
    setFormAmenities('');
    setFormImage('https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=600&auto=format&fit=crop');
    setFormBaseRate(1500);
    setFormTotalQuantity(3);
    setFormMaxGuests(2);
    setFormMinBookingSize(1);
    setFormShared(false);
  };

  // Bulk operation
  const handleBulkPriceMultiplier = () => {
    if (bulkSelectIds.length === 0) {
      alert('Please select at least one inventory item below to bulk update prices.');
      return;
    }
    engine.bulkUpdatePrice(bulkSelectIds, bulkPriceMultiplier);
    setBulkSelectIds([]);
    refreshEngineState();
    alert(`Successfully applied ₹ Price multiplier x${bulkPriceMultiplier} to ${bulkSelectIds.length} item(s)!`);
  };

  // --- CALENDAR ENGINE CALCULATIONS ---
  const calendarMonthDays = useMemo(() => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay(); // Sunday = 0
    const totalDays = new Date(year, month + 1, 0).getDate();
    
    const days: { date: Date; dateStr: string; isCurrentMonth: boolean }[] = [];
    
    // Previous Month Days padding
    const prevMonthTotalDays = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, prevMonthTotalDays - i);
      days.push({
        date: d,
        dateStr: d.toISOString().split('T')[0],
        isCurrentMonth: false
      });
    }

    // Current Month Days
    for (let i = 1; i <= totalDays; i++) {
      const d = new Date(year, month, i);
      days.push({
        date: d,
        dateStr: d.toISOString().split('T')[0],
        isCurrentMonth: true
      });
    }

    // Next Month Days padding to round up grid to 42 items
    const remaining = 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      const d = new Date(year, month + 1, i);
      days.push({
        date: d,
        dateStr: d.toISOString().split('T')[0],
        isCurrentMonth: false
      });
    }

    return days;
  }, [currentCalendarDate]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const shiftCalendarMonth = (offset: number) => {
    const next = new Date(currentCalendarDate);
    next.setMonth(next.getMonth() + offset);
    setCurrentCalendarDate(next);
  };

  // Check state of selected calendar item on a specific day
  const getDayStatusForSelectedInventory = (dateStr: string) => {
    const selectedItem = items.find(i => i.id === selectedCalendarItem);
    if (!selectedItem) return { status: 'None', details: '' };

    // 1. Status Check
    if (selectedItem.status === 'Maintenance') {
      return { status: 'Maintenance', details: 'Full Unit in Maintenance Pipeline' };
    }
    if (selectedItem.status === 'Temporarily Closed') {
      return { status: 'Closed', details: 'Business Temporarily Suspended' };
    }

    // 2. Blackout dates check
    const checkDate = new Date(dateStr);
    for (const b of selectedItem.blackoutDates) {
      const bStart = new Date(b.startDate);
      const bEnd = new Date(b.endDate);
      if (checkDate >= bStart && checkDate <= bEnd) {
        return { status: 'Blocked', details: `Blackout: ${b.reason} (${b.notes || ''})` };
      }
    }

    // 3. Holiday hazard block check
    for (const s of selectedItem.pricing.seasonalRates) {
      if (s.rateMultiplier === 0) {
        const sStart = new Date(s.startDate);
        const sEnd = new Date(s.endDate);
        if (checkDate >= sStart && checkDate <= sEnd) {
          return { status: 'Blocked', details: `Seasonal Suspension: ${s.name}` };
        }
      }
    }

    // 4. Booking check
    const matchingReservations = reservations.filter(r => r.inventoryItemId === selectedCalendarItem);
    let totalBooked = 0;
    for (const res of matchingReservations) {
      const resStart = new Date(res.startDate);
      const resEnd = new Date(res.endDate);
      if (checkDate >= resStart && checkDate < resEnd) {
        totalBooked += res.quantityBooked;
      }
    }

    if (totalBooked >= selectedItem.capacity.totalQuantity) {
      return { status: 'Full', details: `Fully Reserved (${totalBooked}/${selectedItem.capacity.totalQuantity} Booked)` };
    }
    if (totalBooked > 0) {
      return { status: 'Partial', details: `Partially Booked (${totalBooked}/${selectedItem.capacity.totalQuantity} Booked)` };
    }

    return { status: 'Available', details: 'Fully Available' };
  };

  // --- DYNAMIC TRAVELER SEARCH CALCULATIONS ---
  const processedSearchResults = useMemo(() => {
    let filtered = items;
    if (searchCategory !== 'All') {
      filtered = filtered.filter(i => i.type === searchCategory);
    }

    const compiled = filtered.map(item => {
      const checkResult = engine.checkAvailability(
        item.id,
        searchStartDate,
        searchEndDate,
        1 // Checking basic unit availability
      );
      return {
        item,
        check: checkResult
      };
    });

    if (hideUnavailable) {
      return compiled.filter(c => c.check.isAvailable);
    }
    return compiled;
  }, [items, reservations, searchCategory, searchStartDate, searchEndDate, hideUnavailable]);

  // Handle generating simulated booking payload
  const handlePrepareBookingPayload = (item: InventoryItem, checkResult: any) => {
    const rules = CATEGORY_DEFAULT_RULES[item.type] || CATEGORY_DEFAULT_RULES['Room'];
    const contract = {
      _id: `contract_${Math.random().toString(36).substr(2, 9)}`,
      engineProtocolVersion: "HillyTrip-UAI-v1.0",
      timestamp: new Date().toISOString(),
      inventoryRef: {
        itemId: item.id,
        name: item.name,
        type: item.type,
        capacityMaxGuests: item.capacity.maxGuests,
        businessId: item.businessId,
        businessName: item.businessName
      },
      reservationSchedule: {
        startDate: searchStartDate,
        endDate: searchEndDate,
        unitQuantityRequested: 1,
        isSharedInventory: item.capacity.shared
      },
      financialQuote: {
        baseRateUnit: item.pricing.baseRate,
        seasonalMultiplierApplied: Number((checkResult.applicableRate / item.pricing.baseRate).toFixed(2)),
        negotiatedUnitRate: checkResult.applicableRate,
        currency: item.pricing.currency,
        calculatedTotalRevenue: checkResult.applicableRate * Math.max(1, Math.ceil((new Date(searchEndDate).getTime() - new Date(searchStartDate).getTime()) / (1000 * 60 * 60 * 24)))
      },
      ruleEngineClearanceCertificates: {
        turnaroundBufferTimeMinutes: rules.bufferTimeMinutes,
        minimumStayDaysConstraint: rules.minimumStayDays || 1,
        advanceBookingWindowDaysAllowed: rules.advanceBookingWindowDays,
        leadTimeHoursConstraint: rules.leadTimeHours
      },
      diagnosticSignatures: checkResult.breakdown
    };
    setSimulatedContract(contract);
  };

  // AI Forecasting analysis
  const aiForecastResult = useMemo(() => {
    const month = new Date(searchStartDate).getMonth() + 1;
    return engine.predictFutureOccupancy(aiInsightItem, month);
  }, [aiInsightItem, searchStartDate, items, reservations]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 font-sans animate-fade-in text-slate-800 dark:text-slate-100">
      
      {/* Upper Navigation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <Boxes className="w-5 h-5" />
            </span>
            <span className="text-xs font-mono font-bold tracking-widest text-emerald-600 dark:text-emerald-400 uppercase">HillyTrip Core Protocol</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">Universal Availability & Inventory Engine</h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl font-medium">
            Dynamic configuration-driven platform validating seasonal calendars, rule variables, blackout dates, and turnaround times before booking initiation.
          </p>
        </div>

        {/* View Selection Tab Controllers */}
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-800 shrink-0 self-start md:self-center">
          <button
            onClick={() => setActiveTab('public')}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${activeTab === 'public' ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'}`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>Traveler Query Portal</span>
          </button>
          
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${activeTab === 'dashboard' ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'}`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Owner Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-2 text-xs font-black rounded-xl transition-all duration-150 flex items-center gap-1.5 cursor-pointer ${activeTab === 'rules' ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'}`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Category Rules</span>
          </button>
        </div>
      </div>

      {/* Primary Tab Content Panels */}
      {activeTab === 'public' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Query Filters Column */}
          <div className="space-y-6 lg:col-span-1">
            <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-850 shadow-xs">
              <h3 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white mb-4 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-500" />
                <span>Availability Criteria</span>
              </h3>

              <div className="space-y-4">
                {/* Inventory Type Selector */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider mb-1.5">Inventory Category Type</label>
                  <select
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                    className="w-full h-11 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold px-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="All">All Categories (Unified Grid)</option>
                    <option value="Room">Rooms & Lodges</option>
                    <option value="Vehicle">Private Vehicles (SUV/Cabs)</option>
                    <option value="Seat">Shared Vehicle Seats</option>
                    <option value="Guided Tour">Guided Hikes & Walks</option>
                    <option value="Camping Slot">Campsite Pitching & Geo-Domes</option>
                    <option value="Restaurant Table">Restaurant Tables</option>
                    <option value="Rental Equipment">Rental Gears & Equipment</option>
                    <option value="Experience">Local Mountain Experiences</option>
                  </select>
                </div>

                {/* Date Check Ranges */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider mb-1.5">Check In / Start</label>
                    <input
                      type="date"
                      value={searchStartDate}
                      onChange={(e) => setSearchStartDate(e.target.value)}
                      className="w-full h-11 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold px-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider mb-1.5">Check Out / End</label>
                    <input
                      type="date"
                      value={searchEndDate}
                      onChange={(e) => setSearchEndDate(e.target.value)}
                      className="w-full h-11 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold px-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {/* Capacity Guests Target */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider mb-1.5">Guests count</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={searchGuestsCount}
                    onChange={(e) => setSearchGuestsCount(Number(e.target.value))}
                    className="w-full h-11 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold px-3 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Hide / Filter Options */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-900">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none py-1.5">
                    <input
                      type="checkbox"
                      checked={hideUnavailable}
                      onChange={(e) => setHideUnavailable(e.target.checked)}
                      className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                    <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      Hide completely unavailable inventories
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* AI Predictions Side panel */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl" />
              
              <h3 className="text-sm font-black uppercase tracking-wider mb-3 flex items-center gap-1.5 text-emerald-400">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>AI Intelligence Forecasting</span>
              </h3>
              
              <p className="text-slate-400 text-xs leading-relaxed mb-4">
                Simulated machine learning pipelines analysis predicting occupancy rates, seasonal foot traffic, and recommended price models.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-[9px] font-mono text-slate-400 uppercase tracking-wider mb-1">Target Assessment Unit</label>
                  <select
                    value={aiInsightItem}
                    onChange={(e) => setAiInsightItem(e.target.value)}
                    className="w-full h-9 bg-slate-850 border border-slate-850 rounded-lg text-[11px] font-semibold px-2 text-white focus:outline-none"
                  >
                    {items.map(item => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="bg-slate-850 p-3 rounded-2xl border border-slate-800">
                    <span className="block text-[9px] text-slate-400 uppercase tracking-wider font-mono">Predicted Load</span>
                    <span className="text-xl font-extrabold text-white mt-1 block">{aiForecastResult.forecastedOccupancyPct}%</span>
                    <span className="text-[9px] text-slate-500 font-medium block">Occupancy Forecast</span>
                  </div>
                  <div className="bg-slate-850 p-3 rounded-2xl border border-slate-800">
                    <span className="block text-[9px] text-slate-400 uppercase tracking-wider font-mono">Confidence index</span>
                    <span className="text-xl font-extrabold text-emerald-400 mt-1 block">{(aiForecastResult.confidenceScore * 100).toFixed(0)}%</span>
                    <span className="text-[9px] text-slate-500 font-medium block">Based on past density</span>
                  </div>
                </div>

                <div className="bg-slate-850 p-3 rounded-2xl border border-slate-800 text-xs">
                  <span className="font-bold text-slate-300 block mb-1">Pricing Strategy Suggestion</span>
                  <p className="text-slate-400 text-[11px] leading-normal">{aiForecastResult.suggestion}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Traveler Public View Grid */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-emerald-500" />
                <span>Search Query Results ({processedSearchResults.length})</span>
              </h2>
              <span className="text-xs font-mono text-slate-500 bg-slate-100 dark:bg-slate-900 px-2.5 py-1 rounded-lg">
                Check Dates: {searchStartDate} to {searchEndDate}
              </span>
            </div>

            {processedSearchResults.length === 0 ? (
              <div className="bg-white dark:bg-slate-950 p-12 rounded-3xl border border-slate-200 dark:border-slate-850 text-center space-y-3">
                <Sliders className="w-12 h-12 text-slate-300 mx-auto animate-bounce" />
                <h4 className="font-bold text-slate-800 dark:text-slate-200">No match found</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Try relaxing search criteria filters, changing category types, or selecting dates outside rainy monsoons.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {processedSearchResults.map(({ item, check }) => (
                  <div 
                    key={item.id}
                    className={`bg-white dark:bg-slate-950 rounded-3xl overflow-hidden border transition-all duration-200 flex flex-col justify-between ${check.isAvailable ? 'border-slate-200 dark:border-slate-850 shadow-xs' : 'border-rose-100 dark:border-rose-950/20 bg-rose-50/5'}`}
                  >
                    
                    {/* Upper Half */}
                    <div>
                      {/* Image Block with Tags */}
                      <div className="h-44 relative bg-slate-100 dark:bg-slate-900 overflow-hidden">
                        <img 
                          src={item.images[0]} 
                          alt={item.name} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">
                          {item.type}
                        </div>
                        
                        {/* Availability Tag */}
                        <div className={`absolute top-3 right-3 text-[10px] font-black px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1.5 ${check.isAvailable ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                          {check.isAvailable ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>AVAILABLE</span>
                            </>
                          ) : (
                            <>
                              <AlertOctagon className="w-3.5 h-3.5" />
                              <span>UNAVAILABLE</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Info Block */}
                      <div className="p-5">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.businessName}</span>
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-1 leading-tight">{item.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-2 leading-relaxed">{item.description}</p>
                        
                        {/* Capacity and Specs */}
                        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 dark:border-slate-900 text-xs text-slate-500">
                          <span className="flex items-center gap-1.5 font-semibold">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            Max Cap: {item.capacity.maxGuests}
                          </span>
                          <span className="flex items-center gap-1.5 font-semibold">
                            <Boxes className="w-3.5 h-3.5 text-slate-400" />
                            Stock: {item.capacity.totalQuantity} total
                          </span>
                        </div>

                        {/* Amenities */}
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {item.amenities.slice(0, 3).map((a, idx) => (
                            <span key={idx} className="text-[9px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-md">
                              {a}
                            </span>
                          ))}
                          {item.amenities.length > 3 && (
                            <span className="text-[9px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-900 text-slate-500 rounded-md">
                              +{item.amenities.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Lower Half (Pricing & Actions) */}
                    <div className="p-5 pt-0 bg-slate-50/50 dark:bg-slate-900/30 border-t border-slate-100 dark:border-slate-900">
                      
                      {/* Price Segment */}
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono block">Dynamic Rate Quote</span>
                          <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="text-lg font-black text-slate-900 dark:text-white">₹{check.applicableRate}</span>
                            <span className="text-xs text-slate-500">/{item.pricing.unitType}</span>
                            
                            {check.applicableRate !== check.originalRate && (
                              <span className="text-xs line-through text-slate-400 font-mono">₹{check.originalRate}</span>
                            )}
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[9px] text-slate-400 block font-mono">Turnaround Block</span>
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center justify-end gap-1 mt-0.5">
                            <Clock className="w-3.5 h-3.5 text-emerald-500" />
                            {CATEGORY_DEFAULT_RULES[item.type]?.bufferTimeMinutes || 60}m buffer
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {/* Show Diagnostics button */}
                        <button
                          onClick={() => setShowDiagnosticId(showDiagnosticId === item.id ? null : item.id)}
                          className="h-9 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-[11px] font-bold text-slate-600 dark:text-slate-300 cursor-pointer transition flex items-center justify-center gap-1.5"
                        >
                          <Activity className="w-3.5 h-3.5 text-slate-450" />
                          <span>Diagnostics</span>
                        </button>

                        {/* Integration Button */}
                        <button
                          disabled={!check.isAvailable}
                          onClick={() => handlePrepareBookingPayload(item, check)}
                          className={`h-9 rounded-xl text-[11px] font-black cursor-pointer transition flex items-center justify-center gap-1.5 ${check.isAvailable ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 cursor-not-allowed'}`}
                        >
                          <FileJson className="w-3.5 h-3.5" />
                          <span>API Contract</span>
                        </button>
                      </div>

                      {/* Diagnostic Breakdown Dropdown */}
                      {showDiagnosticId === item.id && (
                        <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 animate-fade-in">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block font-mono">Engine diagnostic traces:</span>
                          <div className="space-y-1.5">
                            {check.breakdown.map((log, idx) => (
                              <div key={idx} className="flex items-start gap-1.5 text-[10px] font-mono leading-relaxed text-slate-600 dark:text-slate-350">
                                <span className="text-emerald-500">▶</span>
                                <span>{log}</span>
                              </div>
                            ))}
                          </div>
                          {!check.isAvailable && check.reason && (
                            <div className="mt-2.5 p-2 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl text-[10px] font-bold flex items-center gap-1.5">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>{check.reason}</span>
                            </div>
                          )}
                        </div>
                      )}

                    </div>

                  </div>
                ))}
              </div>
            )}

            {/* API Contract Modal Output Panel */}
            {simulatedContract && (
              <div className="bg-slate-950 text-emerald-400 p-6 rounded-3xl border border-slate-850 shadow-2xl relative animate-fade-in mt-8">
                <button
                  onClick={() => setSimulatedContract(null)}
                  className="absolute top-4 right-4 text-slate-500 hover:text-white text-xs font-bold"
                >
                  Close
                </button>
                <div className="flex items-center gap-2 mb-3 border-b border-slate-900 pb-3">
                  <FileJson className="w-5 h-5 text-emerald-500" />
                  <div>
                    <h4 className="text-sm font-extrabold text-white">Dynamic API Verification Contract Signed</h4>
                    <span className="text-[9px] text-slate-500 font-mono block">JSON transaction envelope ready for Future Booking Engine payload ingestion</span>
                  </div>
                </div>
                
                <pre className="text-[10px] font-mono overflow-x-auto whitespace-pre p-4 bg-slate-900/50 rounded-2xl border border-slate-900 text-slate-300 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {JSON.stringify(simulatedContract, null, 2)}
                </pre>
              </div>
            )}

          </div>

        </div>
      )}

      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          
          {/* Owner upper controls card */}
          <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-500" />
                <span>Inventory Master Management Console</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-450 mt-1">
                Control individual units, trigger temporary closures, manage maintenance blocks, or run bulk coefficient updates across units.
              </p>
            </div>

            <div className="flex gap-2 shrink-0">
              <button
                onClick={() => {
                  clearForm();
                  setEditingItem(null);
                  setIsAddingItem(true);
                }}
                className="h-11 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black cursor-pointer transition flex items-center justify-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Register New Unit</span>
              </button>
            </div>
          </div>

          {/* New Unit Add / Edit Form Drawer overlay */}
          {isAddingItem && (
            <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-emerald-500/30 shadow-xl animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-4 mb-6">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-emerald-500" />
                  <span>{editingItem ? `Modify Unit ${editingItem.name}` : 'Register New Inventory Unit'}</span>
                </h3>
                <button
                  onClick={() => {
                    setIsAddingItem(false);
                    setEditingItem(null);
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 hover:text-slate-850 cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveInventoryItem} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Left Column: Core Fields */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider mb-1.5">Unit Name / Identifier</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Deluxe Pinewood Attic Suite 104"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        className="w-full h-11 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold px-3 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider mb-1.5">Inventory Category</label>
                        <select
                          value={formType}
                          onChange={(e) => setFormType(e.target.value as InventoryType)}
                          className="w-full h-11 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold px-3 focus:outline-none"
                        >
                          <option value="Room">Room</option>
                          <option value="Vehicle">Vehicle</option>
                          <option value="Seat">Seat</option>
                          <option value="Guided Tour">Guided Tour</option>
                          <option value="Camping Slot">Camping Slot</option>
                          <option value="Restaurant Table">Restaurant Table</option>
                          <option value="Rental Equipment">Rental Equipment</option>
                          <option value="Experience">Experience</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider mb-1.5">Status</label>
                        <select
                          value={formStatus}
                          onChange={(e) => setFormStatus(e.target.value as any)}
                          className="w-full h-11 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold px-3 focus:outline-none"
                        >
                          <option value="Active">Active</option>
                          <option value="Maintenance">Maintenance</option>
                          <option value="Temporarily Closed">Temporarily Closed</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider mb-1.5">Direct image URL</label>
                      <input
                        type="text"
                        value={formImage}
                        onChange={(e) => setFormImage(e.target.value)}
                        className="w-full h-11 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold px-3 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Middle Column: Business / Ownership Ref */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider mb-1.5">Business / Operator Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sherpa Vista Homestay"
                        value={formBusinessName}
                        onChange={(e) => setFormBusinessName(e.target.value)}
                        className="w-full h-11 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold px-3 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider mb-1.5">Business category tag</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. homestay"
                          value={formBusinessCategory}
                          onChange={(e) => setFormBusinessCategory(e.target.value)}
                          className="w-full h-11 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold px-3 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider mb-1.5">Business ID ref</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. sherpa-lodge"
                          value={formBusinessId}
                          onChange={(e) => setFormBusinessId(e.target.value)}
                          className="w-full h-11 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold px-3 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider mb-1.5">Brief description</label>
                      <textarea
                        required
                        rows={2}
                        placeholder="Specify interior layouts, view metrics, and special inclusions..."
                        value={formDescription}
                        onChange={(e) => setFormDescription(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold p-3 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Right Column: Capacity & Pricing */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider mb-1.5">Base Rate (₹ INR)</label>
                        <input
                          type="number"
                          required
                          value={formBaseRate}
                          onChange={(e) => setFormBaseRate(Number(e.target.value))}
                          className="w-full h-11 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold px-3 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider mb-1.5">Pricing Unit</label>
                        <select
                          value={formUnitType}
                          onChange={(e) => setFormUnitType(e.target.value as any)}
                          className="w-full h-11 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold px-3 focus:outline-none"
                        >
                          <option value="night">per night</option>
                          <option value="day">per day</option>
                          <option value="trip">per trip</option>
                          <option value="hour">per hour</option>
                          <option value="person">per person</option>
                          <option value="table">per table</option>
                          <option value="session">per session</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider mb-1">Max Guests</label>
                        <input
                          type="number"
                          value={formMaxGuests}
                          onChange={(e) => setFormMaxGuests(Number(e.target.value))}
                          className="w-full h-10 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold px-2 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider mb-1">Total Stock Qty</label>
                        <input
                          type="number"
                          value={formTotalQuantity}
                          onChange={(e) => setFormTotalQuantity(Number(e.target.value))}
                          className="w-full h-10 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold px-2 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider mb-1">Shared Item</label>
                        <select
                          value={formShared ? 'true' : 'false'}
                          onChange={(e) => setFormShared(e.target.value === 'true')}
                          className="w-full h-10 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold px-2 focus:outline-none"
                        >
                          <option value="false">No (Exclusive)</option>
                          <option value="true">Yes (Shared)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-450 uppercase tracking-wider mb-1.5">Amenities (Comma separated)</label>
                      <input
                        type="text"
                        placeholder="WiFi, Mountain View, Attached Toilet, Hot Water"
                        value={formAmenities}
                        onChange={(e) => setFormAmenities(e.target.value)}
                        className="w-full h-11 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold px-3 focus:outline-none"
                      />
                    </div>
                  </div>

                </div>

                <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-900 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingItem(false);
                      setEditingItem(null);
                    }}
                    className="h-11 px-5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="h-11 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition cursor-pointer"
                  >
                    {editingItem ? 'Save Updates' : 'Commit New Unit'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Bulk Update Controls Grid */}
          <div className="bg-slate-100 dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/60 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <Percent className="w-5 h-5" />
              </span>
              <div>
                <span className="text-[10px] text-slate-400 font-mono block">Bulk pricing update coefficient</span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Multiplier: {bulkPriceMultiplier}x (e.g. 1.15 = +15% price spike, 0.90 = 10% lower low season discount)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.05"
                value={bulkPriceMultiplier}
                onChange={(e) => setBulkPriceMultiplier(Number(e.target.value))}
                className="w-40 accent-emerald-500"
              />
              <button
                onClick={handleBulkPriceMultiplier}
                className="h-10 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-xs font-black cursor-pointer transition flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Apply to Selected ({bulkSelectIds.length})</span>
              </button>
            </div>
          </div>

          {/* Main Owner Units Table List */}
          <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200/80 dark:border-slate-850 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 text-slate-500 text-[10px] font-bold uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-850">
                    <th className="py-4 px-6 w-12 text-center">
                      <input
                        type="checkbox"
                        checked={bulkSelectIds.length === items.length && items.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setBulkSelectIds(items.map(i => i.id));
                          } else {
                            setBulkSelectIds([]);
                          }
                        }}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                    </th>
                    <th className="py-4 px-6">Unit Identifier</th>
                    <th className="py-4 px-6">Type</th>
                    <th className="py-4 px-6">Business Operator Reference</th>
                    <th className="py-4 px-6 text-center">In Stock Capacity</th>
                    <th className="py-4 px-6 text-right">Standard Base Rate</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-900 text-xs font-medium text-slate-700 dark:text-slate-300">
                  {items.map(item => {
                    const isSelected = bulkSelectIds.includes(item.id);
                    return (
                      <tr 
                        key={item.id} 
                        className={`hover:bg-slate-50/50 dark:hover:bg-slate-900/30 transition-colors ${isSelected ? 'bg-emerald-50/10 dark:bg-emerald-500/5' : ''}`}
                      >
                        <td className="py-4 px-6 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setBulkSelectIds([...bulkSelectIds, item.id]);
                              } else {
                                setBulkSelectIds(bulkSelectIds.filter(id => id !== item.id));
                              }
                            }}
                            className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                          />
                        </td>
                        <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                          <div className="flex items-center gap-3">
                            <img src={item.images[0]} alt="" className="w-10 h-10 object-cover rounded-lg shrink-0 border border-slate-100 dark:border-slate-800" />
                            <div>
                              <span className="block">{item.name}</span>
                              <span className="text-[10px] text-slate-400 font-mono">{item.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 rounded-md font-mono text-[10px] uppercase font-bold">
                            {item.type}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-semibold">
                          <div>
                            <span>{item.businessName}</span>
                            <span className="text-[10px] text-slate-400 block font-normal uppercase tracking-wider">{item.businessCategory}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center font-semibold">
                          <div>
                            <span>{item.capacity.totalQuantity} Units</span>
                            <span className="text-[10px] text-slate-400 block font-normal">(Max {item.capacity.maxGuests} guests each)</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right font-extrabold text-slate-900 dark:text-white font-mono text-sm">
                          ₹{item.pricing.baseRate}/{item.pricing.unitType}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            item.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                            item.status === 'Maintenance' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                            'bg-slate-100 dark:bg-slate-900 text-slate-500'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            {item.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleToggleStatus(item)}
                              title={item.status === 'Active' ? 'Temporarily Close Unit' : 'Activate Unit'}
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer transition"
                            >
                              {item.status === 'Active' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => handleEditClick(item)}
                              title="Edit Configuration"
                              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 hover:text-slate-950 dark:hover:text-white cursor-pointer transition"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteClick(item.id)}
                              title="Delete Unit Profile"
                              className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-950/20 hover:bg-rose-50/50 text-rose-500 cursor-pointer transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Reusable Calendar engine segment */}
          <div className="bg-white dark:bg-slate-950 rounded-3xl border border-slate-200/80 dark:border-slate-850 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-slate-200/80 dark:border-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-500" />
                  <span>Interactive Visual Occupancy Calendar</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Check occupancy states, seasonal closed blocks, and maintenance schedules day-by-day.
                </p>
              </div>

              {/* Calendar Controls */}
              <div className="flex items-center gap-3 self-start md:self-center">
                <select
                  value={selectedCalendarItem}
                  onChange={(e) => setSelectedCalendarItem(e.target.value)}
                  className="h-10 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold px-3 focus:outline-none"
                >
                  {items.map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>

                <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                  <button onClick={() => shiftCalendarMonth(-1)} className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition cursor-pointer">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-bold px-2 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {monthNames[currentCalendarDate.getMonth()]} {currentCalendarDate.getFullYear()}
                  </span>
                  <button onClick={() => shiftCalendarMonth(1)} className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition cursor-pointer">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Calendar Grid Container */}
            <div className="p-6">
              
              {/* Weekday Names Header */}
              <div className="grid grid-cols-7 gap-2 mb-2 text-center text-slate-400 text-[10px] font-bold uppercase tracking-widest font-mono">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => (
                  <div key={idx} className="py-2">{day}</div>
                ))}
              </div>

              {/* 42-cell Month Days Grid */}
              <div className="grid grid-cols-7 gap-2">
                {calendarMonthDays.map((cell, idx) => {
                  const dayState = getDayStatusForSelectedInventory(cell.dateStr);
                  
                  // Color picker based on occupancy status
                  let statusBg = 'bg-slate-50/50 dark:bg-slate-900/30 text-slate-400 dark:text-slate-600 border-slate-100 dark:border-slate-900';
                  if (cell.isCurrentMonth) {
                    if (dayState.status === 'Full') {
                      statusBg = 'bg-rose-500/10 border-rose-500/25 text-rose-600 dark:text-rose-400 font-extrabold';
                    } else if (dayState.status === 'Partial') {
                      statusBg = 'bg-amber-500/10 border-amber-500/25 text-amber-600 dark:text-amber-400 font-bold';
                    } else if (dayState.status === 'Blocked' || dayState.status === 'Maintenance' || dayState.status === 'Closed') {
                      statusBg = 'bg-slate-850 text-slate-400 border-slate-750 font-semibold';
                    } else if (dayState.status === 'Available') {
                      statusBg = 'bg-emerald-500/5 dark:bg-emerald-500/5 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-semibold';
                    } else {
                      statusBg = 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300';
                    }
                  }

                  return (
                    <div 
                      key={idx} 
                      title={`${cell.dateStr}: ${dayState.details}`}
                      className={`min-h-16 p-2 rounded-xl border flex flex-col justify-between transition-all relative group select-none ${statusBg}`}
                    >
                      <span className="text-xs font-bold font-mono">{cell.date.getDate()}</span>
                      
                      {/* Tooltip dynamic trigger */}
                      {cell.isCurrentMonth && dayState.status !== 'None' && (
                        <span className="text-[8px] font-bold block mt-1 uppercase tracking-wider truncate font-mono">
                          {dayState.status === 'Full' ? 'SOLD OUT' :
                           dayState.status === 'Partial' ? 'PARTIAL' :
                           dayState.status === 'Blocked' ? 'BLOCKED' :
                           dayState.status === 'Maintenance' ? 'MAINT' :
                           dayState.status === 'Closed' ? 'CLOSED' : 'OPEN'}
                        </span>
                      )}

                      {/* Floating hover description */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-900 text-white text-[9px] font-medium py-1 px-2.5 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition shadow-xl z-10 whitespace-nowrap font-mono">
                        {cell.dateStr}: {dayState.details}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Legends explanation row */}
              <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-slate-100 dark:border-slate-900 text-xs font-semibold text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-500/10 border border-emerald-500/20 block" />
                  <span>Available / Open</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-amber-500/10 border border-amber-500/20 block" />
                  <span>Partially Reserved</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-rose-500/10 border border-rose-500/20 block" />
                  <span>Fully Booked out (Sold out)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700 block" />
                  <span>Blackout / Closed / Maintenance</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {activeTab === 'rules' && (
        <div className="space-y-8 animate-fade-in">
          
          <div className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-850">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2 mb-1.5">
              <Sliders className="w-5 h-5 text-emerald-500" />
              <span>Category Rule Configuration Engine</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              These configurations specify rule limitations checked sequentially during traveler bookings. Any requested stays overlapping turnaround cleaning periods, minimum night limits, or cut-offs are rejected automatically.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(CATEGORY_DEFAULT_RULES).map(([category, rules]) => (
              <div key={category} className="bg-white dark:bg-slate-950 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-850 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-900 pb-3">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider font-mono">{category}</h3>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md font-mono font-bold uppercase">Configured</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-900">
                    <span className="text-slate-500">Advance booking window</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{rules.advanceBookingWindowDays} days max</span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-900">
                    <span className="text-slate-500">Same-day instant booking</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{rules.sameDayBookingAllowed ? `Allowed (Until ${rules.cutOffTime || 'N/A'})` : 'Disabled'}</span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-900">
                    <span className="text-slate-500">Minimum Lead Time</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{rules.leadTimeHours} hour(s)</span>
                  </div>

                  <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-900">
                    <span className="text-slate-500">Turnaround / Buffer clearance</span>
                    <span className="font-extrabold text-emerald-500 font-mono">{rules.bufferTimeMinutes} mins (Cleaning)</span>
                  </div>

                  {rules.minimumStayDays && (
                    <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-900">
                      <span className="text-slate-500">Minimum stay length</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">{rules.minimumStayDays} nights</span>
                    </div>
                  )}

                  {rules.maximumStayDays && (
                    <div className="flex justify-between py-1.5 border-b border-slate-50 dark:border-slate-900">
                      <span className="text-slate-500">Maximum stay length</span>
                      <span className="font-extrabold text-slate-900 dark:text-white">{rules.maximumStayDays} nights</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
}
