// ====================================================================
// HILLYTRIP RESERVED TAXI MARKETPLACE - TYPES DEFINITIONS
// ====================================================================
// This file declares modern TypeScript definitions and domain models
// for the Taxi Marketplace foundation in HillyTrip.
// ====================================================================

/**
 * Verification Status for Operators and Businesses
 */
export type VerificationStatus = 'pending' | 'verified' | 'rejected';

/**
 * Booking Status lifecycle state machine
 */
export type TaxiBookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

/**
 * Quotation status submitted by operators
 */
export type QuoteStatus = 'pending' | 'sent' | 'accepted' | 'declined' | 'expired' | 'not_selected';

/**
 * Real-time active trip status
 */
export type TripStatus = 'driver_assigned' | 'driver_enroute' | 'trip_started' | 'trip_completed';

/**
 * Physical vehicle active status
 */
export type VehicleStatus = 'available' | 'busy' | 'inactive';

/**
 * Service Area categories
 */
export type ServiceAreaType = 'Pickup' | 'Destination';

/**
 * Taxi Operator profile details
 */
export interface TaxiOperator {
  id: string; // UUID
  user_id: string; // TEXT references users.id
  business_name: string;
  owner_name: string;
  phone?: string;
  email?: string;
  address?: string;
  verification_status: VerificationStatus | 'suspended' | string;
  is_active: boolean;
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
  taxiOperatorDetails?: any;
  taxiOperatorStats?: any;
  name?: string;
  businessName?: string;
  taxiOperatorStatus?: string;
  mobile?: string;
}

/**
 * Enhanced Taxi Driver Profile (sub-table of Drivers)
 */
export interface TaxiDriver {
  id: string; // references drivers.id (TEXT)
  operator_id?: string | null; // UUID references taxi_operators.id
  driver_name: string;
  phone: string;
  driving_license: string;
  profile_photo?: string | null;
  status: string; // 'available' | 'busy' | 'inactive'
  created_at: string; // TIMESTAMPTZ
}

/**
 * Vehicle registration details and specifications
 */
export interface Vehicle {
  id: string; // UUID
  operator_id: string; // UUID references taxi_operators.id
  driver_id?: string | null; // TEXT references drivers.id
  registration_number: string;
  vehicle_type: string; // Sedan, SUV, Hatchback, Luxury Traveller, etc.
  seating_capacity: number;
  luggage_capacity: number;
  permit_number?: string | null;
  insurance_expiry?: string | null; // DATE
  vehicle_images: string[];
  availability_status: VehicleStatus;
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
}

/**
 * Operator Service Area assignments
 */
export interface OperatorServiceArea {
  id: string; // UUID
  operator_id: string; // UUID references taxi_operators.id
  taxi_stand_id?: string | null; // TEXT
  destination_id?: string | null; // TEXT references destinations.id
  area_type: ServiceAreaType;
  created_at: string; // TIMESTAMPTZ
}

/**
 * Direct route pricing configuration by operator
 */
export interface OperatorRoutePricing {
  id: string; // UUID
  operator_id: string; // UUID references taxi_operators.id
  route_id: string; // TEXT references routes.id
  vehicle_type: string;
  base_price: number;
  last_updated: string; // TIMESTAMPTZ
}

/**
 * Inquiry/Request created by traveller
 */
export interface QuoteRequest {
  id: string; // UUID
  traveller_id: string; // TEXT references users.id
  route_id?: string | null; // TEXT references routes.id
  pickup_location: string;
  drop_location: string;
  travel_date: string; // DATE
  pickup_time: string; // TIME
  passenger_count: number;
  luggage: number | string;
  vehicle_preference?: string | null;
  notes?: string | null;
  request_status: 'pending' | 'completed' | 'cancelled';
  expires_at: string; // TIMESTAMPTZ
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
  travellerName?: string;
  travellerPhone?: string;
  quotesCount?: number;
  quotesList?: any[];
}

/**
 * Request recipient table mapping delivery to operator
 */
export interface QuoteRequestRecipient {
  id: string; // UUID
  request_id: string; // UUID references quote_requests.id
  operator_id: string; // UUID references taxi_operators.id
  status: 'Pending' | 'Viewed' | 'Quoted' | 'Declined' | 'Expired' | 'Not Selected';
  decline_reason?: string | null;
  decline_details?: string | null;
  created_at: string; // TIMESTAMPTZ
}

/**
 * Quotation details submitted by a specific Operator
 */
export interface Quote {
  id: string; // UUID
  request_id: string; // UUID references quote_requests.id
  operator_id: string; // UUID references taxi_operators.id
  vehicle_id?: string | null; // UUID references vehicles.id
  fare: number;
  operator_message?: string | null;
  estimated_pickup_time?: string | null; // TIMESTAMPTZ
  expiry_time?: string | null; // TIMESTAMPTZ
  quote_status: QuoteStatus;
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
}

/**
 * Confirmed Ride Bookings
 */
export interface TaxiBooking {
  id: string; // UUID
  quote_id: string; // UUID references quotes.id
  traveller_id: string; // TEXT references users.id
  operator_id: string; // UUID references taxi_operators.id
  vehicle_id: string; // UUID references vehicles.id
  driver_id: string; // TEXT references drivers.id
  booking_status: TaxiBookingStatus;
  trip_status?: TripStatus | null;
  payment_status: 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded' | string;
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
}

/**
 * Detailed booking status transitions history
 */
export interface TaxiBookingStatusHistory {
  id: string; // UUID
  booking_id: string; // UUID references bookings.id
  old_status: string;
  new_status: string;
  changed_by: string; // Name or ID string
  created_at: string; // TIMESTAMPTZ
}

/**
 * Multi-module Generic Review structure
 */
export interface Review {
  id: string; // UUID
  traveller_id: string; // TEXT references users.id
  operator_id?: string | null; // UUID references taxi_operators.id
  driver_id?: string | null; // TEXT references drivers.id
  rating: number; // 1 to 5 stars
  review_text: string;
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
}
