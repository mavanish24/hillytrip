export type SearchEntityType =
  | 'destination'
  | 'attraction'
  | 'homestay'
  | 'taxi_operator'
  | 'taxi_stand'
  | 'route'
  | 'business'
  | 'offer'
  | 'moment'
  | 'blog';

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface SearchIndexItem {
  id: string;
  entityId: string;
  entityType: SearchEntityType;
  title: string;
  subtitle?: string;
  description: string;
  slug: string;
  canonicalUrl: string;
  location?: {
    district?: string;
    state?: string;
    coordinates?: GeoLocation;
    address?: string;
  };
  tags: string[];
  keywords: string[]; // local names, alternative spellings, synonyms
  category?: string;
  price?: number;
  priceUnit?: string;
  rating?: number;
  reviewCount?: number;
  popularityScore: number;
  isVerified: boolean;
  isFeatured: boolean;
  isAvailableToday?: boolean;
  
  // Specific attributes for matching
  attributes: {
    // Taxi attributes
    workingArea?: string[];
    routeFrom?: string;
    routeTo?: string;
    vehicleCategory?: string;
    isSharedTaxi?: boolean;
    isPrivateTaxi?: boolean;

    // Homestay attributes
    capacity?: number;
    amenities?: string[];
    isFamilyFriendly?: boolean;
    isPetFriendly?: boolean;
    hasWifi?: boolean;
    hasParking?: boolean;
    hasBreakfast?: boolean;

    // Attraction attributes
    distanceFromTown?: number;
    suitableFor?: string[];

    // Offer attributes
    discountPercentage?: number;
    validUntil?: string;
    businessType?: string;
  };

  imageUrl?: string;
  status: 'active' | 'suspended' | 'hidden';
  createdAt: string;
  updatedAt: string;
}

export interface SearchFilterState {
  entityTypes?: SearchEntityType[];
  district?: string;
  state?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  maxDistanceKm?: number;
  centerLocation?: GeoLocation;
  isVerifiedOnly?: boolean;
  isAvailableTodayOnly?: boolean;
  includeUnclaimed?: boolean;
  isSharedTaxi?: boolean;
  isPrivateTaxi?: boolean;
  isFamilyFriendly?: boolean;
  isPetFriendly?: boolean;
  hasParking?: boolean;
  hasBreakfast?: boolean;
  hasWifi?: boolean;
  sortBy?: 'relevance' | 'rating' | 'popularity' | 'price_low' | 'price_high' | 'distance';
}

export interface SearchQueryParams {
  query: string;
  filters?: SearchFilterState;
  page?: number;
  limit?: number;
  userId?: string;
  userLocation?: GeoLocation;
  includeUnclaimed?: boolean;
}

export interface ScoredSearchResult {
  item: SearchIndexItem;
  score: number;
  matchType: 'exact' | 'prefix' | 'keyword' | 'synonym' | 'fuzzy' | 'geo';
  distanceKm?: number;
  highlights: {
    titleMatch?: boolean;
    tagMatch?: string;
  };
}

export interface StructuredSearchIntent {
  intent:
    | 'browse'
    | 'count'
    | 'discover'
    | 'find'
    | 'compare'
    | 'nearby'
    | 'stay'
    | 'journey'
    | 'attraction'
    | 'destination'
    | 'route'
    | 'taxi'
    | 'experience'
    | 'location_breakdown'
    | 'village_breakdown'
    | 'browse_accommodation'
    | 'general'
    | 'blog'
    | 'offer';
  entityType?: SearchEntityType | 'village' | 'community' | 'all';
  location?: string;
  village?: string;
  district?: string;
  category?: string;
  experience?: string;
  travelerType?: 'family' | 'couple' | 'solo' | 'friends' | 'adventure';
  budget?: 'cheap' | 'budget' | 'luxury';
  pricePreference?: 'cheap' | 'budget' | 'luxury';
  proximity?: boolean;
  radius?: number;
  duration?: string;
  sort?: 'relevance' | 'price_low' | 'price_high' | 'rating' | 'popularity';
  sortPreference?: 'relevance' | 'price_low' | 'price_high' | 'rating' | 'popularity';
  language?: 'en' | 'hi' | 'hinglish' | 'mixed';
  origin?: string;
  destination?: string;
  preferenceKeywords: string[];
  rawQuery: string;
  normalizedQuery: string;
  isIndirectQuery?: boolean;
  detectedEntities?: {
    locations: string[];
    attractions: string[];
    hubs: string[];
  };
}

export interface UniversalSearchFactResponse {
  responseType:
    | 'TEXT_ONLY'
    | 'COUNT_RESULT'
    | 'VILLAGE_BREAKDOWN'
    | 'ENTITY_RESULTS'
    | 'ENTITY_GROUPED_RESULTS'
    | 'ROUTE_RESULTS'
    | 'STAY_RESULTS'
    | 'ATTRACTION_RESULTS'
    | 'DESTINATION_RESULTS';
  aiResponse: string;
  facts: {
    totalCount: number;
    villageCount?: number;
    entityType?: string;
    location?: string;
    district?: string;
    villages?: Array<{
      villageName: string;
      count: number;
      district?: string;
      itemIds?: string[];
    }>;
    attractionsCount?: number;
    routesCount?: number;
    destinationsCount?: number;
  };
}

export interface GroupedSearchResults {
  all: ScoredSearchResult[];
  byEntity: Record<SearchEntityType, ScoredSearchResult[]>;
  totalCount: number;
  entityCounts: Record<SearchEntityType, number>;
  page: number;
  totalPages: number;
  parsedIntent?: StructuredSearchIntent;
  factResponse?: UniversalSearchFactResponse;
  fallbackSuggestions?: any[];
  redirectUrl?: string;
}

export interface AutocompleteSuggestion {
  id: string;
  title: string;
  subtitle?: string;
  entityType: SearchEntityType;
  slug: string;
  canonicalUrl: string;
  imageUrl?: string;
  matchKeyword?: string;
  iconType: string;
}

export interface SearchHistoryItem {
  id: string;
  userId: string;
  query: string;
  timestamp: string;
}

export interface PopularSearch {
  query: string;
  searchCount: number;
  trendingScore: number;
  category?: string;
}

export interface SearchSynonym {
  id: string;
  term: string;
  synonyms: string[];
}

export interface SearchRedirect {
  id: string;
  triggerQuery: string;
  targetUrl: string;
  isActive: boolean;
}

export interface SearchAnalytics {
  topQueries: { query: string; count: number }[];
  zeroResultQueries: { query: string; count: number; lastSearched: string }[];
  trendingQueries: { query: string; growth: number }[];
  totalSearches: number;
  averageResponseTimeMs: number;
}

export interface MatchingCriteria {
  entityType: SearchEntityType;
  destination?: string;
  district?: string;
  dates?: { start: string; end: string };
  capacityNeeded?: number;
  vehicleCategory?: string;
  routeFrom?: string;
  routeTo?: string;
  amenitiesRequired?: string[];
  maxPrice?: number;
  userLocation?: GeoLocation;
  maxDistanceKm?: number;
}
