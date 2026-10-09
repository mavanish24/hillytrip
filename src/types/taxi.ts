// ====================================================================
// HILLYTRIP TAXI & VEHICLE MARKETPLACE ARCHITECTURE - TYPE DEFINITIONS
// ====================================================================

export type ServiceType = 'transfer' | 'sightseeing' | 'tour' | 'custom';

export type TripType = 'shared' | 'reserved' | 'both';

export type OwnerType = 'taxi_operator' | 'homestay_owner' | 'travel_agency';

export type District = 
  | 'Darjeeling' 
  | 'Kalimpong' 
  | 'East Sikkim' 
  | 'North Sikkim' 
  | 'South Sikkim' 
  | 'West Sikkim';

export type VehicleCategoryName = 
  | 'Bolero' 
  | 'Ertiga' 
  | 'Innova' 
  | 'Traveller' 
  | 'Scorpio' 
  | 'Alto / Hatchback';

export interface Vehicle {
  id: string;
  owner_type: OwnerType;
  owner_id: string;
  operator_name: string;
  model_name: VehicleCategoryName;
  registration_number?: string;
  seats: number;
  luggage_bags: number;
  is_ac: boolean;
  category: 'Standard SUV' | 'MUV / Comfort' | 'Premium SUV' | 'Minibus / Van' | 'Hatchback';
  route_starting_price: number;
  image_url: string;
  description?: string;
  is_available: boolean;
}

export interface OperatorServiceArea {
  id: string;
  operator_id: string;
  pickup_areas: string[];
  drop_areas: string[];
  working_districts: District[];
}

export interface TaxiOperatorProfile {
  id: string;
  user_id: string;
  owner_type: OwnerType;
  business_name: string;
  owner_name: string;
  phone: string;
  whatsapp: string;
  base_taxi_stand: string;
  pickup_areas: string[];
  drop_areas: string[];
  working_areas: District[];
  booking_preference: 'instant' | 'quote_only' | 'both';
  is_online: boolean;
  booking_enabled: boolean;
  verification_status: 'pending' | 'approved' | 'rejected';
  is_verified: boolean;
  rating: number;
  reviews_count?: number;
  logo_url?: string;
  fleet?: OperatorVehicleCategory[];
  fixedRoutes?: OperatorFixedRoute[];
  created_at?: string;
  updated_at?: string;
}

export interface OperatorVehicleCategory {
  id: string;
  operator_id: string;
  category_name: VehicleCategoryName;
  vehicle_count: number;
}

export interface FareHistoryEntry {
  id: string;
  route_id?: string;
  operator_id?: string;
  previous_fare: number;
  new_fare: number;
  journey_type: string;
  vehicle_category?: string;
  updated_at: string;
  updated_by?: string;
  reason?: string;
}

export interface OperatorFixedRoute {
  id: string;
  operator_id: string;
  from_location: string;
  to_location: string;
  private_taxi_available: boolean;
  private_starting_price: number;
  shared_taxi_available: boolean;
  shared_fare: number;
  is_active?: boolean;
  fare_history?: FareHistoryEntry[];
  created_at?: string;
  updated_at?: string;
}

export interface OperatorReview {
  id: string;
  operator_id: string;
  user_name: string;
  rating: number;
  date: string;
  comment: string;
  trip_route?: string;
}

export interface TaxiQuoteRequest {
  id: string;
  traveller_id: string;
  traveller_name: string;
  traveller_phone: string;
  service_type: ServiceType;
  
  // Transfer
  pickup_location?: string;
  drop_location?: string;
  trip_type?: 'one_way' | 'round_trip' | TripType;
  
  // Sightseeing / Tour
  destination?: string;
  sightseeing_package?: string;
  tour_package?: string;
  number_of_days?: number;
  
  // Custom
  multiple_stops?: string[];
  trip_description?: string;
  
  // Common
  journey_date: string;
  journey_time?: string;
  travellers_count: number;
  vehicle_preference?: string;
  notes?: string;
  working_area?: District;
  request_status: 'pending' | 'responded' | 'completed' | 'cancelled';
  created_at?: string;
}

export interface TaxiQuoteResponse {
  id: string;
  request_id: string;
  operator_id: string;
  operator_name: string;
  operator_phone: string;
  operator_whatsapp: string;
  fare: number;
  operator_message?: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at?: string;
}

export interface TaxiSearchResult {
  operator: TaxiOperatorProfile;
  fixedRoute?: OperatorFixedRoute;
  isFixedRouteMatch: boolean;
  fleetVehicles?: Vehicle[];
}
