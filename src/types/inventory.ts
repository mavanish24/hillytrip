// Universal Availability & Inventory Engine Typings for HillyTrip

export type InventoryType =
  | 'Room'
  | 'Vehicle'
  | 'Seat'
  | 'Package'
  | 'Guided Tour'
  | 'Camping Slot'
  | 'Restaurant Table'
  | 'Rental Equipment'
  | 'Experience';

export interface TimeSlot {
  id: string;
  startTime: string; // "HH:MM" 24h format
  endTime: string;   // "HH:MM" 24h format
  label: string;     // e.g. "Morning Flight", "Lunch Slot"
  capacity: number;  // Max slots in this specific time slot
}

export interface SeasonalRateModifier {
  name: string;      // e.g., "Monsoon Discount", "Peak Puja Holidays"
  startDate: string; // "YYYY-MM-DD"
  endDate: string;   // "YYYY-MM-DD"
  rateMultiplier: number; // e.g. 1.5 for peak, 0.8 for low season
}

export interface BlackoutDateRange {
  startDate: string; // "YYYY-MM-DD"
  endDate: string;   // "YYYY-MM-DD"
  reason: 'Maintenance' | 'Seasonal Closure' | 'Private Event' | 'Weather Hazard' | 'Other';
  notes?: string;
}

export interface InventoryItem {
  id: string;
  businessId: string;       // References Destination, Homestay, Driver (Taxi Operator), Restaurant etc.
  businessName: string;
  businessCategory: string; // e.g., 'homestay', 'taxi_operator', 'restaurant', 'local_guide', 'camping', etc.
  name: string;             // e.g. "Deluxe Kanchenjunga Room", "Premium Bolero 4WD", "Outdoor Patio Table"
  type: InventoryType;
  capacity: {
    maxGuests: number;      // Maximum capacity (e.g. 3 guests, 7 passengers, 4 diners)
    minBookingSize: number; // Minimum booking requirement (default 1)
    shared: boolean;        // Whether inventory can be booked simultaneously by multiple parties (e.g. seats, shared tours)
    totalQuantity: number;  // Total physical items in stock (e.g. 5 deluxe rooms, 10 rental sleeping bags)
  };
  pricing: {
    baseRate: number;       // Base price per unit
    unitType: 'night' | 'day' | 'trip' | 'hour' | 'person' | 'table' | 'session';
    currency: string;       // e.g. "INR"
    seasonalRates: SeasonalRateModifier[];
  };
  status: 'Active' | 'Maintenance' | 'Temporarily Closed' | 'Archived';
  images: string[];
  description: string;
  amenities: string[];
  dynamicAttributes: Record<string, any>; // Dynamic, type-specific properties e.g., fuelType, tableZone, gearSpeed, guideLanguage
  blackoutDates: BlackoutDateRange[];
  hourlySlots?: TimeSlot[]; // For hourly/time-slot based inventory like Tables, Paragliding, Guides
}

export interface InventoryRuleSet {
  minimumStayDays?: number;        // For Rooms/Camping
  maximumStayDays?: number;
  advanceBookingWindowDays: number; // Max days in advance to book
  sameDayBookingAllowed: boolean;
  cutOffTime?: string;              // "HH:MM" (e.g. same day booking cut-off time, say "14:00")
  leadTimeHours: number;            // Minimum hours before trip starts to book
  bufferTimeMinutes: number;        // Clean-up/Turnaround buffer between consecutive bookings (e.g. 120 mins for rooms, 30 mins for cars)
}

// Actual reservation slot entry representing existing commitments (used to check overlap)
export interface ReservedSlot {
  id: string;
  inventoryItemId: string;
  startDate: string; // "YYYY-MM-DD" or "YYYY-MM-DD HH:MM"
  endDate: string;   // "YYYY-MM-DD" or "YYYY-MM-DD HH:MM"
  quantityBooked: number; // For non-exclusive, shared inventory or quantity decrementing
  status: 'Confirmed' | 'Pending' | 'Hold';
}

export interface InventoryCheckResult {
  isAvailable: boolean;
  remainingCapacity: number;
  reason?: string;
  applicableRate: number; // Calculated dynamic seasonal rate
  originalRate: number;
  breakdown: string[];
}
