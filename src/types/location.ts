export type EntityType =
  | 'destination'
  | 'attraction'
  | 'homestay'
  | 'taxi_stand'
  | 'taxi_operator'
  | 'business'
  | 'guide'
  | 'activity'
  | 'route'
  | 'hub'
  | 'hospital'
  | 'restaurant'
  | 'viewpoint';

export type LocationAccuracy = 'exact' | 'approximate' | 'district_center' | 'verified_gps';

export interface LocationItem {
  id: string;
  entityId: string;
  entityType: EntityType;
  name: string;
  slug: string;
  description: string;
  lat: number;
  lng: number;
  elevation?: number; // in meters
  geohash?: string;
  
  // Hierarchy
  country: string;
  state: string;
  district: string;
  subdivision?: string;
  destination?: string;
  village?: string;
  
  accuracy: LocationAccuracy;
  address?: string;
  contactNumber?: string;
  openingHours?: string;
  tags?: string[];
  imageUrl?: string;
  rating?: number;
  reviewCount?: number;
  
  // Additional module metadata
  metadata?: Record<string, any>;
  
  // Visibility
  isHidden: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GeoHierarchyNode {
  id: string;
  name: string;
  type: 'country' | 'state' | 'district' | 'subdivision' | 'destination' | 'village' | 'poi';
  parentId?: string;
  lat?: number;
  lng?: number;
  childrenCount?: number;
}

export interface DistanceCalculationRequest {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  mode?: 'driving' | 'walking' | 'cycling' | 'public_transport';
}

export interface DistanceCalculationResult {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  airDistanceKm: number;
  airDistanceMiles: number;
  roadDistanceKm: number;
  travelTimeMinutes: number;
  formattedDuration: string;
  elevationGainMeters?: number;
  terrainFactor: number; // multiplier for mountain winding roads
}

export interface RouteWaypoint {
  id: string;
  name: string;
  lat: number;
  lng: number;
  stopType?: 'start' | 'waypoint' | 'scenic' | 'dining' | 'stay' | 'destination';
  description?: string;
  recommendedDurationMins?: number;
  entityId?: string;
  entityType?: EntityType;
}

export interface RouteDefinition {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: 'taxi_route' | 'sightseeing' | 'circuit' | 'trekking' | 'scenic_drive';
  waypoints: RouteWaypoint[];
  totalDistanceKm: number;
  estimatedDurationHours: number;
  difficulty?: 'easy' | 'moderate' | 'challenging' | 'expedition';
  bestMonths?: string[];
  elevationProfile?: { distanceKm: number; elevationMeters: number }[];
  tags: string[];
  coverImageUrl?: string;
  isPopularCircuit?: boolean;
  district?: string;
  state?: string;
  createdAt: string;
}

export interface TravelCircuit {
  id: string;
  circuitName: string;
  slug: string;
  region: string;
  description: string;
  recommendedDays: number;
  routeId: string;
  highlights: string[];
  suggestedItinerary: {
    day: number;
    title: string;
    description: string;
    overnightStay?: string;
    distanceKm: number;
  }[];
  featuredHomestaysCount?: number;
  featuredAttractionsCount?: number;
  bannerImage: string;
  isPublished: boolean;
}

export interface NearBySearchParams {
  lat: number;
  lng: number;
  radiusKm: number; // 2, 5, 10, 25, 50, 100
  entityTypes?: EntityType[];
  query?: string;
  district?: string;
  limit?: number;
}

export interface NearBySearchResult {
  location: LocationItem;
  distanceKm: number;
  roadDistanceKm: number;
  travelTimeMinutes: number;
}

export interface LocationAnalytics {
  totalLocations: number;
  totalRoutes: number;
  totalCircuits: number;
  byEntityType: Record<EntityType, number>;
  byDistrict: Record<string, number>;
  mostSearchedGeohashes: { geohash: string; count: number }[];
}
