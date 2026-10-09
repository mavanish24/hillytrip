import { Offer, OfferFilterOptions, OfferStatus } from '../../types/offer';
import { INITIAL_OFFERS } from '../../data/initialOffers';

const LOCAL_STORAGE_KEY = 'hillytrip_offers_dataset';
const SAVED_OFFERS_KEY = 'hillytrip_saved_offers_list';

type OfferListener = () => void;
const listeners: Set<OfferListener> = new Set();

const notifyListeners = () => {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch (e) {
      console.error('Error in offer listener:', e);
    }
  });
};

export const subscribeOffers = (listener: OfferListener): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

const dedupeOffers = (offers: Offer[]): Offer[] => {
  const seen = new Set<string>();
  return offers.filter((o) => {
    if (!o || !o.id || seen.has(o.id)) return false;
    seen.add(o.id);
    return true;
  });
};

const getStoredOffers = (): Offer[] => {
  if (typeof window === 'undefined') return INITIAL_OFFERS;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Exclude legacy mock offer IDs
        const filtered = parsed.filter((o: Offer) => 
          o && o.id && 
          !o.id.startsWith('offer-daj-') && 
          !o.id.startsWith('offer-gtk-') && 
          !o.id.startsWith('offer-klp-') && 
          !o.id.startsWith('offer-plg-')
        );
        if (filtered.length > 0) {
          return dedupeOffers(filtered);
        }
      }
    }
  } catch (e) {
    console.error('Failed to load offers from local storage:', e);
  }
  return INITIAL_OFFERS;
};

const saveOffersToStorage = (offers: Offer[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(offers));
    notifyListeners();
  } catch (e) {
    console.error('Failed to save offers to local storage:', e);
  }
};

/**
 * Checks if offer date validity bounds are met
 */
export const isOfferValidDate = (validFrom: string, validTill: string): boolean => {
  const todayStr = new Date().toISOString().split('T')[0];
  const from = validFrom ? validFrom.split('T')[0] : '2020-01-01';
  const till = validTill ? validTill.split('T')[0] : '2099-12-31';
  return todayStr >= from && todayStr <= till;
};

/**
 * Smart Ranking Algorithm:
 * 1. Featured Offers
 * 2. Verified Businesses
 * 3. Highest Discount
 * 4. Expiring Soon
 * 5. Most Viewed
 * 6. Most Saved
 * 7. Most Clicked
 * 8. Recently Added
 * 9. Fair Rotation jitter
 */
export const rankOffers = (offers: Offer[]): Offer[] => {
  const todayTime = new Date().getTime();

  return [...offers].sort((a, b) => {
    // 1. Featured priority
    if (a.isFeatured !== b.isFeatured) {
      return a.isFeatured ? -1 : 1;
    }

    // 2. Verified business priority
    if (a.businessVerified !== b.businessVerified) {
      return a.businessVerified ? -1 : 1;
    }

    // 3. Highest discount calculation
    const getDiscountScore = (o: Offer) => {
      if (o.discountPercentage) return o.discountPercentage * 10;
      if (o.flatDiscountAmount) return o.flatDiscountAmount / 20;
      return 0;
    };
    const discDiff = getDiscountScore(b) - getDiscountScore(a);
    if (Math.abs(discDiff) > 1) return discDiff;

    // 4. Expiring soon priority (nearest validTill)
    const timeTillA = new Date(a.validTill).getTime() - todayTime;
    const timeTillB = new Date(b.validTill).getTime() - todayTime;
    if (timeTillA > 0 && timeTillB > 0 && Math.abs(timeTillA - timeTillB) > 86400000) {
      return timeTillA - timeTillB; // sooner expiry first
    }

    // 5. Most Viewed
    const viewDiff = (b.analytics?.views || 0) - (a.analytics?.views || 0);
    if (viewDiff !== 0) return viewDiff;

    // 6. Most Saved
    const saveDiff = (b.analytics?.saves || 0) - (a.analytics?.saves || 0);
    if (saveDiff !== 0) return saveDiff;

    // 7. Most Clicked
    const clickDiff = (b.analytics?.clicks || 0) - (a.analytics?.clicks || 0);
    if (clickDiff !== 0) return clickDiff;

    // 8. Recently Added
    const createdA = new Date(a.createdAt || 0).getTime();
    const createdB = new Date(b.createdAt || 0).getTime();
    if (createdA !== createdB) return createdB - createdA;

    // 9. Fair rotation jitter
    return (a.id.charCodeAt(0) % 7) - (b.id.charCodeAt(0) % 7);
  });
};

/**
 * Get offers matching criteria
 */
export const getOffers = (options?: OfferFilterOptions): Offer[] => {
  const allOffers = getStoredOffers();

  let filtered = allOffers.filter((o) => {
    // strict requirement: Display ONLY offers that are Approved, Active, Within Validity, Belong to Verified Businesses
    if (options?.onlyActiveValid !== false) {
      if (o.status !== 'approved') return false;
      if (!o.isActive) return false;
      if (!isOfferValidDate(o.validFrom, o.validTill)) return false;
      if (!o.businessVerified) return false;
    }

    if (options?.status && o.status !== options.status) {
      return false;
    }

    if (options?.category && options.category !== 'All') {
      const matchCat = o.category.toLowerCase().includes(options.category.toLowerCase());
      if (!matchCat) return false;
    }

    if (options?.destinationName) {
      const destMatch = o.destinationName.toLowerCase().includes(options.destinationName.toLowerCase()) ||
        o.destinationId.toLowerCase().includes(options.destinationName.toLowerCase());
      if (!destMatch) return false;
    }

    if (options?.businessId) {
      if (o.businessId !== options.businessId) return false;
    }

    if (options?.onlyFeatured) {
      if (!o.isFeatured) return false;
    }

    if (options?.searchQuery) {
      const q = options.searchQuery.toLowerCase().trim();
      const titleMatch = o.title.toLowerCase().includes(q);
      const bizMatch = o.businessName.toLowerCase().includes(q);
      const destMatch = o.destinationName.toLowerCase().includes(q);
      const badgeMatch = o.badge.toLowerCase().includes(q);
      const catMatch = o.category.toLowerCase().includes(q);
      if (!titleMatch && !bizMatch && !destMatch && !badgeMatch && !catMatch) {
        return false;
      }
    }

    return true;
  });

  return rankOffers(filtered);
};

/**
 * Get single offer by ID or slug
 */
export const getOfferById = (offerId: string): Offer | undefined => {
  if (!offerId) return undefined;
  const all = getStoredOffers();
  const cleanId = offerId.trim();
  return all.find((o) => 
    o.id.toLowerCase() === cleanId.toLowerCase() ||
    o.id.replace('offer-', '').toLowerCase() === cleanId.toLowerCase()
  );
};

/**
 * Get all raw offers (for Admin/Business view)
 */
export const getAllOffersRaw = (): Offer[] => {
  return getStoredOffers();
};

/**
 * Wishlist / Saved Offers helpers
 */
export const getSavedOfferIds = (): string[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SAVED_OFFERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const isOfferSaved = (offerId: string): boolean => {
  const ids = getSavedOfferIds();
  return ids.includes(offerId);
};

export const toggleSaveOffer = (offerId: string): boolean => {
  const ids = getSavedOfferIds();
  let nextIds: string[];
  let isSavedNow = false;
  if (ids.includes(offerId)) {
    nextIds = ids.filter((id) => id !== offerId);
    isSavedNow = false;
  } else {
    nextIds = [...ids, offerId];
    isSavedNow = true;
  }
  localStorage.setItem(SAVED_OFFERS_KEY, JSON.stringify(nextIds));
  
  // Track save analytics
  trackOfferAnalytics(offerId, 'saves');
  notifyListeners();
  return isSavedNow;
};

/**
 * Analytics tracking
 */
export const trackOfferAnalytics = (offerId: string, metric: keyof Offer['analytics']) => {
  const offers = getStoredOffers();
  const idx = offers.findIndex((o) => o.id === offerId);
  if (idx !== -1) {
    const offer = offers[idx];
    const analytics = offer.analytics || { views: 0, clicks: 0, shares: 0, saves: 0, claims: 0, conversions: 0 };
    analytics[metric] = (analytics[metric] || 0) + 1;
    offers[idx] = { ...offer, analytics };
    saveOffersToStorage(offers);
  }
};

/**
 * CRUD Operations for Business Owners & Admin
 */
export const createOffer = (newOfferData: Partial<Offer>): Offer => {
  const offers = getStoredOffers();
  const id = `offer-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const now = new Date().toISOString();

  const newOffer: Offer = {
    id,
    title: newOfferData.title || 'Special Promotional Offer',
    badge: newOfferData.badge || '20% OFF',
    badgeColor: newOfferData.badgeColor || 'emerald',
    category: newOfferData.category || 'Homestay',
    businessId: newOfferData.businessId || 'biz-custom',
    businessName: newOfferData.businessName || 'Verified HillyTrip Business',
    businessVerified: newOfferData.businessVerified ?? true,
    businessRating: newOfferData.businessRating || 4.8,
    businessPhone: newOfferData.businessPhone || '',
    businessWhatsApp: newOfferData.businessWhatsApp || '',
    businessAddress: newOfferData.businessAddress || '',
    destinationId: newOfferData.destinationId || 'dest-darjeeling',
    destinationName: newOfferData.destinationName || 'Darjeeling',
    coverImage: newOfferData.coverImage || null,
    ctaText: newOfferData.ctaText || 'View Offer',
    gallery: newOfferData.gallery || [],
    shortDescription: newOfferData.shortDescription || '',
    fullDescription: newOfferData.fullDescription || 'Exclusive promotional deal for travelers exploring North Bengal and Sikkim.',
    couponCode: newOfferData.couponCode || 'HILLYTRIP20',
    validFrom: newOfferData.validFrom || now.split('T')[0],
    validTill: newOfferData.validTill || new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
    status: newOfferData.status || 'approved', // Auto-approved if verified owner
    isActive: newOfferData.isActive ?? true,
    isFeatured: newOfferData.isFeatured ?? false,
    discountPercentage: newOfferData.discountPercentage,
    flatDiscountAmount: newOfferData.flatDiscountAmount,
    termsAndConditions: newOfferData.termsAndConditions || [
      'Valid for direct bookings via HillyTrip.',
      'Cannot be combined with other promotional offers.'
    ],
    locationMapUrl: newOfferData.locationMapUrl || '',
    latitude: newOfferData.latitude,
    longitude: newOfferData.longitude,
    createdAt: now,
    updatedAt: now,
    analytics: {
      views: 0,
      clicks: 0,
      shares: 0,
      saves: 0,
      claims: 0,
      conversions: 0
    },
    ownerUserId: newOfferData.ownerUserId
  };

  offers.unshift(newOffer);
  saveOffersToStorage(offers);
  return newOffer;
};

export const updateOffer = (offerId: string, updates: Partial<Offer>): Offer | null => {
  const offers = getStoredOffers();
  const idx = offers.findIndex((o) => o.id === offerId);
  if (idx === -1) return null;

  const updatedOffer = {
    ...offers[idx],
    ...updates,
    updatedAt: new Date().toISOString()
  };
  offers[idx] = updatedOffer;
  saveOffersToStorage(offers);
  return updatedOffer;
};

export const deleteOffer = (offerId: string): boolean => {
  const offers = getStoredOffers();
  const filtered = offers.filter((o) => o.id !== offerId);
  if (filtered.length !== offers.length) {
    saveOffersToStorage(filtered);
    return true;
  }
  return false;
};

export const approveOffer = (offerId: string): Offer | null => {
  return updateOffer(offerId, { status: 'approved', isActive: true });
};

export const rejectOffer = (offerId: string): Offer | null => {
  return updateOffer(offerId, { status: 'rejected', isActive: false });
};

export const toggleFeatureOffer = (offerId: string): Offer | null => {
  const offers = getStoredOffers();
  const target = offers.find((o) => o.id === offerId);
  if (!target) return null;
  return updateOffer(offerId, { isFeatured: !target.isFeatured });
};

export const toggleActiveOffer = (offerId: string): Offer | null => {
  const offers = getStoredOffers();
  const target = offers.find((o) => o.id === offerId);
  if (!target) return null;
  return updateOffer(offerId, { isActive: !target.isActive });
};
