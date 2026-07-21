// Universal Availability & Inventory Engine
// Production-Ready Service Layer & Metadata Configs for HillyTrip

import { 
  InventoryItem, 
  InventoryRuleSet, 
  ReservedSlot, 
  InventoryCheckResult, 
  SeasonalRateModifier, 
  BlackoutDateRange 
} from '../types/inventory';

// Default dynamic rules for each inventory category
export const CATEGORY_DEFAULT_RULES: Record<string, InventoryRuleSet> = {
  'Room': {
    minimumStayDays: 1,
    maximumStayDays: 14,
    advanceBookingWindowDays: 180,
    sameDayBookingAllowed: true,
    cutOffTime: '17:00',
    leadTimeHours: 2,
    bufferTimeMinutes: 120, // 2-hour room cleaning / inspection turnaround
  },
  'Vehicle': {
    minimumStayDays: 1,
    maximumStayDays: 7,
    advanceBookingWindowDays: 90,
    sameDayBookingAllowed: true,
    cutOffTime: '20:00',
    leadTimeHours: 3,
    bufferTimeMinutes: 60, // 1-hour wash and refuel buffer
  },
  'Seat': {
    advanceBookingWindowDays: 30,
    sameDayBookingAllowed: true,
    cutOffTime: '16:00',
    leadTimeHours: 1,
    bufferTimeMinutes: 15,
  },
  'Package': {
    minimumStayDays: 2,
    maximumStayDays: 21,
    advanceBookingWindowDays: 120,
    sameDayBookingAllowed: false,
    leadTimeHours: 24,
    bufferTimeMinutes: 1440, // 1 day planning buffer
  },
  'Guided Tour': {
    advanceBookingWindowDays: 60,
    sameDayBookingAllowed: true,
    cutOffTime: '12:00',
    leadTimeHours: 4,
    bufferTimeMinutes: 30, // 30 min breathing space for guides
  },
  'Camping Slot': {
    minimumStayDays: 1,
    maximumStayDays: 7,
    advanceBookingWindowDays: 90,
    sameDayBookingAllowed: true,
    cutOffTime: '15:00',
    leadTimeHours: 4,
    bufferTimeMinutes: 90, // pitch cleaning
  },
  'Restaurant Table': {
    advanceBookingWindowDays: 14,
    sameDayBookingAllowed: true,
    cutOffTime: '22:00',
    leadTimeHours: 1,
    bufferTimeMinutes: 15, // table wiping turnaround
  },
  'Rental Equipment': {
    minimumStayDays: 1,
    maximumStayDays: 30,
    advanceBookingWindowDays: 60,
    sameDayBookingAllowed: true,
    cutOffTime: '18:00',
    leadTimeHours: 2,
    bufferTimeMinutes: 30, // sanitize gears
  },
  'Experience': {
    advanceBookingWindowDays: 90,
    sameDayBookingAllowed: true,
    cutOffTime: '13:00',
    leadTimeHours: 3,
    bufferTimeMinutes: 45, // briefing/gear prep
  }
};

// Internal LocalStorage keys for persistence of inventory changes
const STORAGE_INVENTORIES_KEY = 'hillytrip_master_inventories_v1';
const STORAGE_RESERVATIONS_KEY = 'hillytrip_master_reservations_v1';

// Seed Initial Mock Datasets representing hundreds of high-quality inventory items matching existing businesses
export const INITIAL_INVENTORY_SEED: InventoryItem[] = [
  // 1. Homestay Rooms
  {
    id: 'inv-room-101-sherpa',
    businessId: 'sherpa-lodge-lava', // References Lava Homestay
    businessName: 'Sherpa Vista Homestay',
    businessCategory: 'homestay',
    name: 'Standard Twin Pine View Room',
    type: 'Room',
    capacity: { maxGuests: 2, minBookingSize: 1, shared: false, totalQuantity: 3 },
    pricing: {
      baseRate: 1800,
      unitType: 'night',
      currency: 'INR',
      seasonalRates: [
        { name: 'Puja Holidays Peak', startDate: '2026-10-10', endDate: '2026-10-25', rateMultiplier: 1.4 },
        { name: 'Monsoon Discount', startDate: '2026-07-01', endDate: '2026-08-31', rateMultiplier: 0.8 }
      ]
    },
    status: 'Active',
    images: ['https://images.unsplash.com/photo-1598928506311-c55ded91a20c?q=80&w=600&auto=format&fit=crop'],
    description: 'Cozy pinewood panelled room with dual twin beds and full wide windows facing East Lava pine ranges.',
    amenities: ['Pine Valley View', 'Hot Water Kettle', 'Attached Modern Bath', 'Extra Woolen Blankets'],
    dynamicAttributes: { bedConfiguration: 'Twin Beds', floor: '1st Floor', heatingType: 'Electric Heater' },
    blackoutDates: []
  },
  {
    id: 'inv-room-102-sherpa',
    businessId: 'sherpa-lodge-lava',
    businessName: 'Sherpa Vista Homestay',
    businessCategory: 'homestay',
    name: 'Luxury Family Attic Room',
    type: 'Room',
    capacity: { maxGuests: 4, minBookingSize: 1, shared: false, totalQuantity: 1 },
    pricing: {
      baseRate: 3500,
      unitType: 'night',
      currency: 'INR',
      seasonalRates: [
        { name: 'Puja Holidays Peak', startDate: '2026-10-10', endDate: '2026-10-25', rateMultiplier: 1.5 },
        { name: 'Winter Snow Peak', startDate: '2026-12-20', endDate: '2027-01-05', rateMultiplier: 1.6 }
      ]
    },
    status: 'Active',
    images: ['https://images.unsplash.com/photo-1508253730651-e5ace80a7025?q=80&w=600&auto=format&fit=crop'],
    description: 'Charming spacious attic experience with glass ceilings for sky watching, queen size double bed and separate kids bed space.',
    amenities: ['Sky Roof Glass', 'Heated Carpeting', 'Flat TV Screen', 'Organic Tea Basket'],
    dynamicAttributes: { bedConfiguration: '1 Queen + 1 Single', floor: 'Attic Level', heatingType: 'Traditional Bukhari Fireplace' },
    blackoutDates: [
      { startDate: '2026-09-01', endDate: '2026-09-05', reason: 'Maintenance', notes: 'Attic glass ceiling sealing and polish' }
    ]
  },
  {
    id: 'inv-room-kanchenjunga-rishop',
    businessId: 'rishop-clouds',
    businessName: 'Rishop Clouds Homestay',
    businessCategory: 'homestay',
    name: 'Kanchenjunga Panoramic Balcony Suite',
    type: 'Room',
    capacity: { maxGuests: 3, minBookingSize: 1, shared: false, totalQuantity: 2 },
    pricing: {
      baseRate: 2800,
      unitType: 'night',
      currency: 'INR',
      seasonalRates: [
        { name: 'Puja Holidays Peak', startDate: '2026-10-10', endDate: '2026-10-25', rateMultiplier: 1.4 },
        { name: 'Winter Sunrise Peak', startDate: '2026-11-15', endDate: '2026-12-30', rateMultiplier: 1.3 }
      ]
    },
    status: 'Active',
    images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=600&auto=format&fit=crop'],
    description: 'Private wood-clad veranda opening directly to the colossal Kanchenjunga mountain ridge view.',
    amenities: ['Kanchenjunga Vista Balcony', 'Hot Geyser Shower', 'Farm Milk Tea Kettle', 'Room service'],
    dynamicAttributes: { bedConfiguration: '1 King + 1 Rollaway', floor: 'Top Level', heatingType: 'Heated Bed Blanket' },
    blackoutDates: []
  },

  // 2. Vehicles
  {
    id: 'inv-veh-bolero-anup',
    businessId: 'driver-anup-tamang', // Ref driver
    businessName: 'Anup Tamang (Himalayan Driver)',
    businessCategory: 'taxi_operator',
    name: 'Mahindra Bolero 4WD (SUV)',
    type: 'Vehicle',
    capacity: { maxGuests: 7, minBookingSize: 1, shared: false, totalQuantity: 1 },
    pricing: {
      baseRate: 3500,
      unitType: 'day',
      currency: 'INR',
      seasonalRates: []
    },
    status: 'Active',
    images: ['https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=600&auto=format&fit=crop'],
    description: 'Sturdy high-clearance 4x4 Bolero, ideal for rugged offroad gravel routes to Sandakphu, Phalut or Neora valleys.',
    amenities: ['Luggage Carrier', 'All-weather Tires', 'Offroad Gears', 'Local Audio System'],
    dynamicAttributes: { vehicleMake: 'Mahindra', vehicleModel: 'Bolero SUV 4WD', fuelType: 'Diesel', drivetrain: '4-Wheel Drive' },
    blackoutDates: []
  },
  {
    id: 'inv-veh-innova-pemba',
    businessId: 'driver-pemba-sherpa',
    businessName: 'Pemba Luxury Cabs',
    businessCategory: 'taxi_operator',
    name: 'Toyota Innova Crysta (Luxury Cruiser)',
    type: 'Vehicle',
    capacity: { maxGuests: 6, minBookingSize: 1, shared: false, totalQuantity: 1 },
    pricing: {
      baseRate: 4800,
      unitType: 'day',
      currency: 'INR',
      seasonalRates: []
    },
    status: 'Active',
    images: ['https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600&auto=format&fit=crop'],
    description: 'Superb leather seating, dual air-conditioned premium MPV for comfortable inter-city family tours.',
    amenities: ['Dual Climate Control AC', 'Bluetooth Audio Screen', 'Captains Seats', 'Mineral Water Bottles'],
    dynamicAttributes: { vehicleMake: 'Toyota', vehicleModel: 'Innova Crysta C2', fuelType: 'Diesel', drivetrain: 'Rear-Wheel Drive' },
    blackoutDates: []
  },

  // 3. Camping Slots
  {
    id: 'inv-camp-dome-teesta',
    businessId: 'river-camp-teesta',
    businessName: 'Teesta Riverside Glamping Grounds',
    businessCategory: 'camping',
    name: 'Luxury Geo-Dome Tent (Waterfront)',
    type: 'Camping Slot',
    capacity: { maxGuests: 2, minBookingSize: 1, shared: false, totalQuantity: 4 },
    pricing: {
      baseRate: 3200,
      unitType: 'night',
      currency: 'INR',
      seasonalRates: [
        { name: 'Monsoon Hazard Block', startDate: '2026-07-15', endDate: '2026-08-31', rateMultiplier: 0.0 } // 0 is blocked
      ]
    },
    status: 'Active',
    images: ['https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=600&auto=format&fit=crop'],
    description: 'Insulated modern geodetic dome on raised deck with transparency facing the pristine gushing rapids of River Teesta.',
    amenities: ['Attached Solar Toilet', 'Campfire Logs Included', 'Waterfront Deck Lounge', 'Double Plush Mattress'],
    dynamicAttributes: { canvasMaterial: 'Heavy PVC Dome', toiletAccess: 'Private Solar Attached', groundSetup: 'Raised Wooden Platform' },
    blackoutDates: [
      { startDate: '2026-07-15', endDate: '2026-08-31', reason: 'Seasonal Closure', notes: 'Monsoon high water level swelling block' }
    ]
  },

  // 4. Guided Tours & Activities
  {
    id: 'inv-guide-monastery-tour',
    businessId: 'tsering-guide',
    businessName: 'Tsering Sherpa (Alpine Specialist)',
    businessCategory: 'local_guide',
    name: 'Lava-Algarah Ancient Buddhist Monastery Walking Tour',
    type: 'Guided Tour',
    capacity: { maxGuests: 15, minBookingSize: 1, shared: true, totalQuantity: 1 },
    pricing: {
      baseRate: 600,
      unitType: 'session',
      currency: 'INR',
      seasonalRates: []
    },
    status: 'Active',
    images: ['https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=600&auto=format&fit=crop'],
    description: 'Half day spiritual walkthrough uncovering Buddhist scripts, historical murals, thangka scrolls, and organic butter tea tasting with Monks.',
    amenities: ['Monastic Entry Ticket Included', 'Organic Butter Tea Tasting', 'Sanskrit-Tibetan Translation'],
    dynamicAttributes: { walkingDistanceKm: 3.5, durationHours: 4, difficultyLevel: 'Easy' },
    blackoutDates: [],
    hourlySlots: [
      { id: 'mon-slot-morning', startTime: '08:00', endTime: '12:00', label: 'Spiritual Morning Batch', capacity: 15 },
      { id: 'mon-slot-afternoon', startTime: '13:30', endTime: '17:30', label: 'Twilight Batch', capacity: 15 }
    ]
  },

  // 5. Restaurant Tables
  {
    id: 'inv-table-glenarys-outdoor',
    businessId: 'glinarys-darjeeling',
    businessName: "Glenary's Bakery, Restaurant & Pub",
    businessCategory: 'restaurant',
    name: 'Sunset Balcony Vista Table (4-Seater)',
    type: 'Restaurant Table',
    capacity: { maxGuests: 4, minBookingSize: 2, shared: false, totalQuantity: 5 },
    pricing: {
      baseRate: 500, // Deposit fee which gets adjusted in main diner food bill
      unitType: 'table',
      currency: 'INR',
      seasonalRates: []
    },
    status: 'Active',
    images: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=600&auto=format&fit=crop'],
    description: 'Highly-coveted outdoor terrace table offering pristine sunset views of Mount Kanchenjunga during meal cycles.',
    amenities: ['Overhead Heater Lamp', 'Candlelit Setup Option', 'Direct Kanchenjunga Line of Sight'],
    dynamicAttributes: { diningZone: 'Outdoor Balcony Terrace', smokeZone: 'Non-Smoking', tableShape: 'Round Wooden Table' },
    blackoutDates: [],
    hourlySlots: [
      { id: 'tbl-slot-lunch', startTime: '12:00', endTime: '14:30', label: 'Kanchenjunga Lunch Hour', capacity: 5 },
      { id: 'tbl-slot-sunset', startTime: '16:00', endTime: '18:30', label: 'Sunset High Tea & Sizzler Hour', capacity: 5 },
      { id: 'tbl-slot-dinner', startTime: '19:30', endTime: '22:00', label: 'Candlelit Dinner Hour', capacity: 5 }
    ]
  },

  // 6. Experiences
  {
    id: 'inv-exp-paragliding-deolo',
    businessId: 'paragliding-kalimpong',
    businessName: 'Tandem Paragliding Flight',
    businessCategory: 'experience',
    name: 'Himalayan High Flying Adventure (Tandem Flight)',
    type: 'Experience',
    capacity: { maxGuests: 1, minBookingSize: 1, shared: false, totalQuantity: 8 }, // 8 gliders operating concurrently
    pricing: {
      baseRate: 3200,
      unitType: 'session',
      currency: 'INR',
      seasonalRates: [
        { name: 'Monsoon Suspension Block', startDate: '2026-07-01', endDate: '2026-08-31', rateMultiplier: 0.0 }
      ]
    },
    status: 'Active',
    images: ['https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?q=80&w=600&auto=format&fit=crop'],
    description: 'Breathtaking 15-minute tandem flight from Deolo ridge with GoPro camera captures. Land safely at local valleys.',
    amenities: ['GoPro Flight Clip', 'Safety Helmet & Harness', 'Glider Transport Shuttle Back'],
    dynamicAttributes: { altitudeFeet: 5500, averageFlightDurationMins: 15, licenseAuthority: 'Fédération Aéronautique Internationale (FAI)' },
    blackoutDates: [
      { startDate: '2026-07-01', endDate: '2026-08-31', reason: 'Weather Hazard', notes: 'Monsoon dense clouds and gusty winds halt flights' }
    ],
    hourlySlots: [
      { id: 'pg-slot-1', startTime: '09:00', endTime: '10:15', label: 'Morning Thermal Ascent', capacity: 8 },
      { id: 'pg-slot-2', startTime: '10:30', endTime: '11:45', label: 'Mid-morning Glide', capacity: 8 },
      { id: 'pg-slot-3', startTime: '12:00', endTime: '13:15', label: 'Noon Scenic Flight', capacity: 8 },
      { id: 'pg-slot-4', startTime: '14:00', endTime: '15:15', label: 'Afternoon Sunset Thermal', capacity: 8 }
    ]
  }
];

// Seed initial reservation slots to showcase filled schedules in the calendar
export const INITIAL_RESERVATION_SEED: ReservedSlot[] = [
  {
    id: 'res-room-1',
    inventoryItemId: 'inv-room-101-sherpa',
    startDate: '2026-07-22',
    endDate: '2026-07-25',
    quantityBooked: 2, // 2 rooms out of 3 booked
    status: 'Confirmed'
  },
  {
    id: 'res-room-2',
    inventoryItemId: 'inv-room-102-sherpa',
    startDate: '2026-07-23',
    endDate: '2026-07-24',
    quantityBooked: 1, // Attic attic is exclusive (1 out of 1 booked)
    status: 'Confirmed'
  },
  {
    id: 'res-room-3',
    inventoryItemId: 'inv-room-kanchenjunga-rishop',
    startDate: '2026-07-21',
    endDate: '2026-07-23',
    quantityBooked: 1, // 1 room out of 2 booked
    status: 'Confirmed'
  },
  {
    id: 'res-veh-1',
    inventoryItemId: 'inv-veh-bolero-anup',
    startDate: '2026-07-24',
    endDate: '2026-07-26',
    quantityBooked: 1, // Sturdy 4WD booked
    status: 'Confirmed'
  },
  {
    id: 'res-guide-1',
    inventoryItemId: 'inv-guide-monastery-tour',
    startDate: '2026-07-22',
    endDate: '2026-07-22', // Daily sessions can use hourly
    quantityBooked: 6, // 6 hikers booked out of 15 max cap in first hourly slots
    status: 'Confirmed'
  }
];

export class UniversalInventoryEngine {
  private static instance: UniversalInventoryEngine;
  private items: InventoryItem[] = [];
  private reservations: ReservedSlot[] = [];

  private constructor() {
    this.loadData();
  }

  public static getInstance(): UniversalInventoryEngine {
    if (!UniversalInventoryEngine.instance) {
      UniversalInventoryEngine.instance = new UniversalInventoryEngine();
    }
    return UniversalInventoryEngine.instance;
  }

  private loadData() {
    if (typeof window !== 'undefined') {
      try {
        const savedItems = localStorage.getItem(STORAGE_INVENTORIES_KEY);
        const savedRes = localStorage.getItem(STORAGE_RESERVATIONS_KEY);
        
        if (savedItems) {
          this.items = JSON.parse(savedItems);
        } else {
          this.items = [...INITIAL_INVENTORY_SEED];
          this.saveItems();
        }

        if (savedRes) {
          this.reservations = JSON.parse(savedRes);
        } else {
          this.reservations = [...INITIAL_RESERVATION_SEED];
          this.saveReservations();
        }
      } catch (e) {
        console.error('Failed to parse persistent inventory storage:', e);
        this.items = [...INITIAL_INVENTORY_SEED];
        this.reservations = [...INITIAL_RESERVATION_SEED];
      }
    } else {
      this.items = [...INITIAL_INVENTORY_SEED];
      this.reservations = [...INITIAL_RESERVATION_SEED];
    }
  }

  private saveItems() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_INVENTORIES_KEY, JSON.stringify(this.items));
      } catch (e) {
        console.error('Storage quota exceeded during inventory save:', e);
      }
    }
  }

  private saveReservations() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_RESERVATIONS_KEY, JSON.stringify(this.reservations));
      } catch (e) {
        console.error('Storage quota exceeded during reservations save:', e);
      }
    }
  }

  // --- BUSINESS OWNER OPERATIONS ---

  public getInventory(): InventoryItem[] {
    return this.items;
  }

  public getReservations(): ReservedSlot[] {
    return this.reservations;
  }

  public addInventoryItem(item: Omit<InventoryItem, 'id'>): InventoryItem {
    const newItem: InventoryItem = {
      ...item,
      id: `inv-${Math.random().toString(36).substr(2, 9)}`
    };
    this.items.push(newItem);
    this.saveItems();
    return newItem;
  }

  public updateInventoryItem(updated: InventoryItem): boolean {
    const idx = this.items.findIndex(i => i.id === updated.id);
    if (idx !== -1) {
      this.items[idx] = updated;
      this.saveItems();
      return true;
    }
    return false;
  }

  public deleteInventoryItem(id: string): boolean {
    const idx = this.items.findIndex(i => i.id === id);
    if (idx !== -1) {
      this.items.splice(idx, 1);
      // Remove associated bookings
      this.reservations = this.reservations.filter(r => r.inventoryItemId !== id);
      this.saveItems();
      this.saveReservations();
      return true;
    }
    return false;
  }

  public addReservation(res: Omit<ReservedSlot, 'id'>): ReservedSlot {
    const newRes: ReservedSlot = {
      ...res,
      id: `res-${Math.random().toString(36).substr(2, 9)}`
    };
    this.reservations.push(newRes);
    this.saveReservations();
    return newRes;
  }

  public cancelReservation(id: string): boolean {
    const initialLen = this.reservations.length;
    this.reservations = this.reservations.filter(r => r.id !== id);
    if (this.reservations.length < initialLen) {
      this.saveReservations();
      return true;
    }
    return false;
  }

  // Bulk update prices/capacity
  public bulkUpdatePrice(itemIds: string[], multiplier: number): void {
    this.items = this.items.map(item => {
      if (itemIds.includes(item.id)) {
        return {
          ...item,
          pricing: {
            ...item.pricing,
            baseRate: Math.round(item.pricing.baseRate * multiplier)
          }
        };
      }
      return item;
    });
    this.saveItems();
  }

  // --- AVAILABILITY CORE MATCHING RULE ENGINE ---

  public checkAvailability(
    itemId: string,
    reqStartDate: string, // "YYYY-MM-DD"
    reqEndDate: string,   // "YYYY-MM-DD"
    requestedQty = 1
  ): InventoryCheckResult {
    const item = this.items.find(i => i.id === itemId);
    if (!item) {
      return { isAvailable: false, remainingCapacity: 0, originalRate: 0, applicableRate: 0, reason: 'Inventory item not registered', breakdown: ['Diagnostic Error: Unknown Item'] };
    }

    const breakdown: string[] = [];
    const basePrice = item.pricing.baseRate;
    breakdown.push(`Baseline Pricing Reference: ₹${basePrice} per ${item.pricing.unitType}`);

    // Rule 1: Check status
    if (item.status === 'Maintenance') {
      return { isAvailable: false, remainingCapacity: 0, originalRate: basePrice, applicableRate: basePrice, reason: 'Item placed in maintenance/service pipeline', breakdown: ['Rejected: Status == Maintenance'] };
    }
    if (item.status === 'Temporarily Closed') {
      return { isAvailable: false, remainingCapacity: 0, originalRate: basePrice, applicableRate: basePrice, reason: 'Business or item temporarily suspended', breakdown: ['Rejected: Status == Temporarily Closed'] };
    }

    // Parse Dates safely
    const start = new Date(reqStartDate);
    const end = new Date(reqEndDate);
    const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));

    // Rule 2: Dynamic Ruleset check matching category
    const rules = CATEGORY_DEFAULT_RULES[item.type] || { advanceBookingWindowDays: 90, sameDayBookingAllowed: true, leadTimeHours: 0, bufferTimeMinutes: 0 };
    
    // Check min/max stay limits for daily models
    if (item.pricing.unitType === 'night' || item.pricing.unitType === 'day') {
      if (rules.minimumStayDays && totalDays < rules.minimumStayDays) {
        return { isAvailable: false, remainingCapacity: item.capacity.totalQuantity, originalRate: basePrice, applicableRate: basePrice, reason: `Booking length (${totalDays} stays) below minimum constraint of ${rules.minimumStayDays} nights`, breakdown: [`Stay duration length error`] };
      }
      if (rules.maximumStayDays && totalDays > rules.maximumStayDays) {
        return { isAvailable: false, remainingCapacity: item.capacity.totalQuantity, originalRate: basePrice, applicableRate: basePrice, reason: `Booking length (${totalDays} stays) exceeds maximum allowed sequence of ${rules.maximumStayDays} nights`, breakdown: [`Stay duration maximum error`] };
      }
    }

    // Rule 3: Advance booking window limits
    const today = new Date();
    today.setHours(0,0,0,0);
    const daysFromNow = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysFromNow > rules.advanceBookingWindowDays) {
      return { 
        isAvailable: false, 
        remainingCapacity: item.capacity.totalQuantity, 
        originalRate: basePrice, 
        applicableRate: basePrice, 
        reason: `Exceeds advanced booking limit: You can only book up to ${rules.advanceBookingWindowDays} days in advance (attempted ${daysFromNow} days ahead)`,
        breakdown: ['Advance Booking Window Breach'] 
      };
    }

    // Rule 4: Same day bookings cut-off
    const startStr = reqStartDate;
    const todayStr = today.toISOString().split('T')[0];
    if (startStr === todayStr) {
      if (!rules.sameDayBookingAllowed) {
        return { isAvailable: false, remainingCapacity: 0, originalRate: basePrice, applicableRate: basePrice, reason: 'Same-day instant booking is disabled for this category', breakdown: ['Same day reservation blocked'] };
      }
      if (rules.cutOffTime) {
        const now = new Date();
        const currentHourMin = now.toTimeString().split(' ')[0].substring(0, 5); // "14:30"
        if (currentHourMin > rules.cutOffTime) {
          return { isAvailable: false, remainingCapacity: 0, originalRate: basePrice, applicableRate: basePrice, reason: `Same-day booking cut-off time (${rules.cutOffTime}) expired (current hour is ${currentHourMin})`, breakdown: [`Cut-off time breach`] };
        }
      }
    }

    // Rule 5: Blackout dates
    for (const b of item.blackoutDates) {
      const bStart = new Date(b.startDate);
      const bEnd = new Date(b.endDate);
      // Overlap calculation
      if (start <= bEnd && end >= bStart) {
        return { 
          isAvailable: false, 
          remainingCapacity: 0, 
          originalRate: basePrice, 
          applicableRate: basePrice, 
          reason: `Item blackout on this range: [Reason: ${b.reason}] ${b.notes || ''}`, 
          breakdown: [`Date overlapped blackout: ${b.startDate} to ${b.endDate}`] 
        };
      }
    }

    // Rule 6: Existing reservations quantity checking
    let totalOverlapQuantity = 0;
    const itemReservations = this.reservations.filter(r => r.inventoryItemId === item.id && r.status !== 'Hold');

    for (const res of itemReservations) {
      const resStart = new Date(res.startDate);
      const resEnd = new Date(res.endDate);
      // Overlap checking
      if (start < resEnd && end > resStart) {
        totalOverlapQuantity += res.quantityBooked;
      }
    }

    const maxStock = item.capacity.totalQuantity;
    const remainingStock = Math.max(0, maxStock - totalOverlapQuantity);
    breakdown.push(`Inventory Capacity Check: Cap = ${maxStock}, Reserved = ${totalOverlapQuantity}, Left = ${remainingStock}`);

    if (remainingStock < requestedQty) {
      return {
        isAvailable: false,
        remainingCapacity: remainingStock,
        originalRate: basePrice,
        applicableRate: basePrice,
        reason: `Fully occupied. Only ${remainingStock} unit(s) remaining for selected dates`,
        breakdown: [...breakdown, 'Capacity verification failed']
      };
    }

    // Rule 7: Dynamic Seasonal Rate multipliers
    let rateMultiplier = 1.0;
    let rateExplanation = 'Regular rate applied';
    
    for (const s of item.pricing.seasonalRates) {
      const sStart = new Date(s.startDate);
      const sEnd = new Date(s.endDate);
      // If start date or overlapping stays intersect seasonal dates
      if (start <= sEnd && end >= sStart) {
        if (s.rateMultiplier === 0) {
          return {
            isAvailable: false,
            remainingCapacity: 0,
            originalRate: basePrice,
            applicableRate: 0,
            reason: `Suspended for season: ${s.name}`,
            breakdown: [`Overlapped Seasonal Hazard Block: ${s.name}`]
          };
        }
        rateMultiplier = s.rateMultiplier;
        rateExplanation = `Season rate: ${s.name} (Multiplier x${s.rateMultiplier})`;
        breakdown.push(`Applied Modifier: ${rateExplanation}`);
        break; // Match first active modifier
      }
    }

    const calculatedRate = Math.round(basePrice * rateMultiplier);

    return {
      isAvailable: true,
      remainingCapacity: remainingStock,
      originalRate: basePrice,
      applicableRate: calculatedRate,
      breakdown: [...breakdown, 'All rulesets passed successfully']
    };
  }

  // --- CONCURRENT FAST SEARCH & EXTRACTIONS ---

  // Check thousands of items sequentially and quickly (cached lookups simulator)
  public batchCheckAvailability(
    itemsList: InventoryItem[],
    startDate: string,
    endDate: string,
    qty = 1
  ): Record<string, InventoryCheckResult> {
    const results: Record<string, InventoryCheckResult> = {};
    itemsList.forEach(item => {
      results[item.id] = this.checkAvailability(item.id, startDate, endDate, qty);
    });
    return results;
  }

  // Filter Universal Search Source items by availability metrics
  public filterSearchSourcesByAvailability(
    masterItems: any[], // UniversalSearchItem
    startDate: string,
    endDate: string
  ): any[] {
    if (!startDate || !endDate) return masterItems;

    return masterItems.map(searchItem => {
      // Find matching inventory models for this business ID
      const itemsForBiz = this.items.filter(i => i.businessId === searchItem.id);
      if (itemsForBiz.length === 0) {
        // Business does not have active managed inventory models yet, keep standard ranking
        return { ...searchItem, isAvailableNow: true, remainingCapacity: 1 };
      }

      // Check if ANY inventory item of this business is available on this date
      const checks = itemsForBiz.map(invItem => this.checkAvailability(invItem.id, startDate, endDate, 1));
      const availableItems = checks.filter(c => c.isAvailable);

      return {
        ...searchItem,
        isAvailableNow: availableItems.length > 0,
        remainingCapacity: availableItems.reduce((acc, c) => acc + c.remainingCapacity, 0),
        // Adjust dynamic price search reference to calculated available rate
        price: availableItems.length > 0 ? availableItems[0].applicableRate : searchItem.price,
        // Drop search score/ranking weight if item is totally sold out or unavailable
        searchRelevanceAdjustmentMultiplier: availableItems.length > 0 ? 1.0 : 0.4
      };
    });
  }

  // --- AI FORECASTING AND DYNAMIC PRICE ENGINE HOOKS ---

  public predictFutureOccupancy(itemId: string, targetMonth: number): { forecastedOccupancyPct: number; confidenceScore: number; suggestion: string } {
    // Simulated smart forecasting based on current reservation density
    const item = this.items.find(i => i.id === itemId);
    if (!item) return { forecastedOccupancyPct: 0, confidenceScore: 0, suggestion: 'Item not found' };

    const matchingRes = this.reservations.filter(r => r.inventoryItemId === itemId);
    // Base occupancy forecast by season month
    let basePct = 40; // baseline
    if ([5, 6, 10, 11].includes(targetMonth)) {
      basePct = 85; // Peak Himalayan Months (Spring & Puja season)
    } else if ([7, 8].includes(targetMonth)) {
      basePct = 15; // Rainy Monsoons
    }

    // Boost by existing bookings density
    const occupancyCount = matchingRes.length;
    const finalPct = Math.min(100, Math.round(basePct + (occupancyCount * 12)));

    let suggestion = 'Maintain stable standard pricing structure';
    if (finalPct > 75) {
      suggestion = `High demand forecasted (+${finalPct}%). Suggest raising base price by 15-20% for peak optimization.`;
    } else if (finalPct < 30) {
      suggestion = `Low footprint season predicted. Suggest launching a 10% flash discount banner to drive conversions.`;
    }

    return {
      forecastedOccupancyPct: finalPct,
      confidenceScore: 0.88,
      suggestion
    };
  }
}
