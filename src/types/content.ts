export type ContentType =
  | 'destination'
  | 'village'
  | 'attraction'
  | 'homestay'
  | 'taxi_stand'
  | 'taxi_route'
  | 'business'
  | 'offer'
  | 'travel_guide'
  | 'blog'
  | 'faq'
  | 'policy'
  | 'landing_page'
  | 'event';

export type ContentStatus = 'draft' | 'review' | 'scheduled' | 'published' | 'archived' | 'hidden';

export interface SEOMetadata {
  title?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  keywords?: string[];
  noIndex?: boolean;
  schemaType?: 'TouristAttraction' | 'Hotel' | 'LocalBusiness' | 'Article' | 'FAQPage';
  jsonLd?: Record<string, any>;
  score?: number; // Calculated SEO health score (0 - 100)
}

export interface MediaItem {
  id: string;
  title: string;
  url: string;
  fileType: 'image' | 'video' | 'document' | 'icon';
  folder?: string;
  altText?: string;
  caption?: string;
  copyright?: string;
  sizeBytes?: number;
  width?: number;
  height?: number;
  tags?: string[];
  createdAt: string;
}

export interface ContentItem {
  id: string;
  entityId?: string; // Links to existing module entity ID (e.g., dst_darjeeling)
  contentType: ContentType;
  title: string;
  slug: string;
  shortDescription: string;
  longDescription?: string;
  richContent?: string;
  featuredImage?: string;
  gallery?: string[];
  videos?: string[];
  tags: string[];
  categories: string[];
  status: ContentStatus;
  visibility: 'public' | 'private' | 'members_only';
  priority: number;
  isFeatured: boolean;
  
  // Location Binding for Auto-Relationships
  lat?: number;
  lng?: number;
  district?: string;
  state?: string;
  country?: string;
  
  seo: SEOMetadata;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  
  version: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface ContentRelationshipRule {
  id: string;
  sourceType: ContentType;
  targetType: ContentType;
  ruleType: 'location_proximity' | 'same_district' | 'matching_tags' | 'manual_override';
  maxDistanceKm?: number;
  limit?: number;
}

export interface AssembledSmartPage {
  mainContent: ContentItem;
  derivedLocation?: {
    lat: number;
    lng: number;
    district: string;
    state: string;
    elevation?: number;
  };
  relationships: {
    nearbyAttractions: ContentItem[];
    nearbyHomestays: ContentItem[];
    nearbyTaxiStands: ContentItem[];
    nearbyBusinesses: ContentItem[];
    nearbyOffers: ContentItem[];
    relatedBlogs: ContentItem[];
    faqs: { question: string; answer: string }[];
    relatedRoutes?: any[];
  };
  seoSchemaJsonLd: Record<string, any>;
  assembledAt: string;
}

export interface RedirectRule {
  id: string;
  sourceSlug: string;
  targetSlug: string;
  redirectType: 301 | 302;
  isActive: boolean;
  hitsCount: number;
  createdAt: string;
}

export interface ContentAnalytics {
  totalItems: number;
  publishedCount: number;
  draftCount: number;
  byContentType: Record<ContentType, number>;
  averageSeoScore: number;
  mediaTotalSizeBytes: number;
  activeRedirectsCount: number;
}
