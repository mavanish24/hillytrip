export type BusinessCategoryType = 
  | 'Homestay' 
  | 'Hotel' 
  | 'Taxi Operator' 
  | 'Tour Operator' 
  | 'Restaurant' 
  | 'Activity' 
  | 'Local Experience' 
  | string;

export type OfferBadgeType = 
  | '20% OFF' 
  | '15% OFF'
  | 'Flat ₹500 OFF' 
  | 'Flat ₹1000 OFF'
  | 'Free Breakfast' 
  | 'Kids Stay Free' 
  | 'Early Bird' 
  | 'Weekend Special' 
  | 'Limited Time' 
  | 'Seasonal Offer'
  | string;

export type OfferStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'expired';

export interface OfferAnalytics {
  views: number;
  clicks: number;
  shares: number;
  saves: number;
  claims: number;
  conversions: number;
}

export interface Offer {
  id: string;
  title: string;
  badge: OfferBadgeType;
  badgeColor?: 'emerald' | 'amber' | 'rose' | 'sky' | 'purple' | 'indigo' | 'orange';
  category: BusinessCategoryType;
  businessId: string;
  businessName: string;
  businessVerified: boolean;
  businessRating?: number;
  businessPhone?: string;
  businessWhatsApp?: string;
  businessAddress?: string;
  destinationId: string;
  destinationName: string; // e.g. "Darjeeling", "Gangtok", "Kalimpong", "Pelling"
  coverImage?: string | null;
  ctaText?: string;
  gallery?: string[];
  shortDescription?: string;
  fullDescription: string;
  couponCode?: string;
  validFrom: string; // ISO format YYYY-MM-DD
  validTill: string; // ISO format YYYY-MM-DD
  status: OfferStatus;
  isActive: boolean;
  isFeatured?: boolean;
  discountPercentage?: number;
  flatDiscountAmount?: number;
  termsAndConditions?: string[];
  locationMapUrl?: string;
  latitude?: number;
  longitude?: number;
  businessLogo?: string;
  reviewCount?: number;
  included?: string[];
  excluded?: string[];
  redemptionProcess?: string[];
  createdAt: string;
  updatedAt: string;
  analytics: OfferAnalytics;
  ownerUserId?: string;
}

export interface OfferFilterOptions {
  category?: string;
  destinationName?: string;
  businessId?: string;
  searchQuery?: string;
  onlyFeatured?: boolean;
  status?: OfferStatus;
  onlyActiveValid?: boolean;
}
