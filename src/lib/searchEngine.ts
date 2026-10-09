// HillyTrip Intelligent Natural Language Search Engine & Unified Index

import { Destination, Attraction, Homestay, Route, Hub, Driver, Blog } from '../types';
import { getItemSlug } from '../utils/slug';
import { getOffers } from '../services/offers/OfferEngine';
import { calculateWeightedSearchScore } from '../utils/searchRankingEngine';
import { resolveVillageImage } from '../utils/imagePool';

export type SearchScope = 
  | 'all' 
  | 'destinations' 
  | 'attractions' 
  | 'homestays' 
  | 'restaurants' 
  | 'taxi' 
  | 'guides' 
  | 'experiences' 
  | 'blogs' 
  | 'offers'
  | 'treks';

export interface UnifiedSearchItem {
  id: string;
  name: string;
  category: 
    | 'Destination' 
    | 'Attraction' 
    | 'Homestay' 
    | 'Restaurant' 
    | 'Taxi' 
    | 'Guide' 
    | 'Experience' 
    | 'Blog' 
    | 'Trek';
  scopeKey: SearchScope;
  location: string;
  image: string;
  rating: number;
  reviewsCount?: number;
  price?: number;
  priceType?: string;
  verified: boolean;
  featured: boolean;
  tags: string[];
  features: {
    petFriendly?: boolean;
    familyFriendly?: boolean;
    luxury?: boolean;
    budget?: boolean;
    coupleFriendly?: boolean;
    hiddenGem?: boolean;
    mountainView?: boolean;
    openNow?: boolean;
    breakfastIncluded?: boolean;
  };
  detailsUrl: string;
  description: string;
  rawItem?: any;
}

export interface SearchGroup {
  id: SearchScope;
  title: string;
  icon: string; // Emoji
  totalCount: number;
  previewItems: UnifiedSearchItem[]; // Max 3 items
  allItems: UnifiedSearchItem[];
  viewAllUrl: string;
}

export interface PriceRangeGroup {
  label: string;
  minPrice: number;
  maxPrice?: number;
  totalCount: number;
  previewItems: UnifiedSearchItem[];
  allItems: UnifiedSearchItem[];
  viewAllUrl: string;
}

export interface NaturalLanguageParse {
  categoryHint?: SearchScope;
  locationHint?: string;
  fromLocation?: string;
  toLocation?: string;
  minPrice?: number;
  maxPrice?: number;
  features: {
    petFriendly?: boolean;
    familyFriendly?: boolean;
    luxury?: boolean;
    budget?: boolean;
    coupleFriendly?: boolean;
    hiddenGem?: boolean;
    featured?: boolean;
    mountainView?: boolean;
    breakfastIncluded?: boolean;
  };
  keywords: string[];
  cleanQuery: string;
}

/**
 * Parses human language query into structured search intent
 */
export function parseNaturalLanguageQuery(query: string): NaturalLanguageParse {
  const raw = query.trim().toLowerCase();
  
  const parseResult: NaturalLanguageParse = {
    features: {},
    keywords: [],
    cleanQuery: raw
  };

  if (!raw) return parseResult;

  // 1. Detect Category Hints
  if (/\b(destination|destinations|village|villages|town|towns|valley|valleys)\b/i.test(raw)) {
    parseResult.categoryHint = 'destinations';
  } else if (/\b(attraction|attractions|waterfall|waterfalls|viewpoint|monastery|monasteries|lake|lakes|temple|sight|sights)\b/i.test(raw)) {
    parseResult.categoryHint = 'attractions';
  } else if (/\b(homestay|homestays|stay|stays|resort|resorts|lodge|lodges|room|rooms)\b/i.test(raw)) {
    parseResult.categoryHint = 'homestays';
  } else if (/\b(restaurant|restaurants|cafe|cafes|food|dining|eatery|bakery|pub)\b/i.test(raw)) {
    parseResult.categoryHint = 'restaurants';
  } else if (/\b(taxi|taxis|cab|cabs|route|routes|stand|stands|ride|driver|drivers)\b/i.test(raw)) {
    parseResult.categoryHint = 'taxi';
  } else if (/\b(guide|guides|sherpa|sherpas)\b/i.test(raw)) {
    parseResult.categoryHint = 'guides';
  } else if (/\b(experience|experiences|activity|activities|rafting|paragliding|tea tasting)\b/i.test(raw)) {
    parseResult.categoryHint = 'experiences';
  } else if (/\b(blog|blogs|article|articles|story|stories|travel guide|travel guides)\b/i.test(raw)) {
    parseResult.categoryHint = 'blogs';
  } else if (/\b(offer|offers|deal|deals|discount|discounts|coupon|coupons|voucher|vouchers|sale)\b/i.test(raw)) {
    parseResult.categoryHint = 'offers';
  } else if (/\b(trek|treks|hiking|hike|trail|trails)\b/i.test(raw)) {
    parseResult.categoryHint = 'treks';
  }

  // 2. Budget / Price Range Detection
  // e.g. "under ₹1000", "under 1000", "below 1500", "less than 2000"
  const underPriceMatch = raw.match(/(?:under|below|less than|<|up to|maximum|max)\s*₹?\s*(\d+)/i);
  if (underPriceMatch) {
    parseResult.maxPrice = parseInt(underPriceMatch[1], 10);
  }

  // e.g. "between ₹800 and ₹1000", "800 to 1000", "800-1000"
  const rangePriceMatch = raw.match(/(?:between|from)?\s*₹?\s*(\d+)\s*(?:and|to|-)\s*₹?\s*(\d+)/i);
  if (rangePriceMatch) {
    parseResult.minPrice = parseInt(rangePriceMatch[1], 10);
    parseResult.maxPrice = parseInt(rangePriceMatch[2], 10);
  }

  // e.g. "above ₹2000", "over 3000", "more than 1500"
  const overPriceMatch = raw.match(/(?:above|over|more than|>|min|minimum)\s*₹?\s*(\d+)/i);
  if (overPriceMatch) {
    parseResult.minPrice = parseInt(overPriceMatch[1], 10);
  }

  // 3. Feature / Amenity Attributes Parsing
  if (/\b(pet|pets|dog|dogs|pet friendly)\b/i.test(raw)) parseResult.features.petFriendly = true;
  if (/\b(family|kids|children)\b/i.test(raw)) parseResult.features.familyFriendly = true;
  if (/\b(luxury|deluxe|5 star|premium|boutique)\b/i.test(raw)) parseResult.features.luxury = true;
  if (/\b(budget|cheap|affordable)\b/i.test(raw)) parseResult.features.budget = true;
  if (/\b(couple|honeymoon|romantic)\b/i.test(raw)) parseResult.features.coupleFriendly = true;
  if (/\b(hidden|unexplored|offbeat|secluded|secret)\b/i.test(raw)) parseResult.features.hiddenGem = true;
  if (/\b(featured|top rated|best|popular|famous)\b/i.test(raw)) parseResult.features.featured = true;
  if (/\b(mountain view|valley view|scenic view)\b/i.test(raw)) parseResult.features.mountainView = true;
  if (/\b(breakfast|breakfast included|free breakfast)\b/i.test(raw)) parseResult.features.breakfastIncluded = true;

  // 4. Location and Origin/Destination Parsing
  const taxiRouteMatch = raw.match(/(?:taxi|cab|route|from)\s+([a-z0-9\s]+?)\s+to\s+([a-z0-9\s]+)/i);
  if (taxiRouteMatch) {
    parseResult.fromLocation = taxiRouteMatch[1].trim();
    parseResult.toLocation = taxiRouteMatch[2].trim();
    parseResult.categoryHint = 'taxi';
  }

  const nearMatch = raw.match(/(?:near|around|in|at|within|close to|nearby)\s+([a-z0-9\s]+)/i);
  if (nearMatch && !taxiRouteMatch) {
    let loc = nearMatch[1].trim();
    loc = loc.replace(/\b(homestays?|attractions?|restaurants?|taxis?|destinations?|guides?|treks?|experiences?|under|below|above|between|price)\b/gi, '').trim();
    // Strip trailing numbers from location match
    loc = loc.replace(/\d+/g, '').trim();
    if (loc) {
      parseResult.locationHint = loc;
    }
  }

  const noiseWords = [
    'near', 'around', 'in', 'at', 'within', 'nearby', 'close', 'to', 'from',
    'pet', 'friendly', 'family', 'luxury', 'budget', 'couple', 'hidden', 'featured',
    'best', 'top', 'popular', 'homestay', 'homestays', 'attraction', 'attractions',
    'destination', 'destinations', 'restaurant', 'restaurants', 'taxi', 'taxis',
    'route', 'routes', 'guide', 'guides', 'blog', 'blogs', 'trek', 'treks', 'experience', 'experiences',
    'under', 'below', 'above', 'between', 'and', 'to', 'rupees', 'rs', 'inr'
  ];

  const words = raw.split(/\s+/).filter(w => w.length > 1 && !noiseWords.includes(w) && !/^\d+$/.test(w));
  parseResult.keywords = words;

  return parseResult;
}

/**
 * Builds standard Unified Search Dataset from app state
 */
export function buildUnifiedDataset(datasets: {
  destinations?: Destination[];
  attractions?: Attraction[];
  homestays?: Homestay[];
  routes?: Route[];
  hubs?: Hub[];
  drivers?: Driver[];
  blogs?: Blog[];
}): UnifiedSearchItem[] {
  const items: UnifiedSearchItem[] = [];

  // 1. Villages (Primary Location Entity)
  (datasets.destinations || []).forEach(d => {
    if (!d || !d.name) return;
    const isFeat = !!(d.isPopularDestination || d.isFeaturedThisWeek);
    items.push({
      id: `vil-${d.id}`,
      name: d.name,
      category: 'Destination',
      scopeKey: 'destinations',
      location: d.district ? `${d.district}, ${d.state || 'Himalayas'}` : (d.state || 'India'),
      image: resolveVillageImage(d),
      rating: 4.8,
      reviewsCount: 120,
      verified: true,
      featured: isFeat,
      tags: [d.district || '', d.state || '', d.tourismType || '', 'Village'].filter(Boolean),
      features: {
        hiddenGem: d.isHiddenGem || false,
        mountainView: true,
      },
      detailsUrl: `#/village/${getItemSlug(d)}`,
      description: d.description || 'Pristine mountain village.',
      rawItem: d
    });
  });

  // 2. Attractions
  (datasets.attractions || []).forEach(a => {
    if (!a || !a.name) return;
    const locName = a.village_name || a.district || 'Himalayas';
    const categoryLower = (a.category || '').toLowerCase();
    const isTrek = categoryLower.includes('trek');
    const isExperience = categoryLower.includes('experience') || categoryLower.includes('activity');
    const isFeat = !!(a.isFeaturedAttraction || a.isFeaturedThisWeek || a.isHiddenGem);

    items.push({
      id: `attr-${a.id}`,
      name: a.name,
      category: isTrek ? 'Trek' : isExperience ? 'Experience' : 'Attraction',
      scopeKey: isTrek ? 'treks' : isExperience ? 'experiences' : 'attractions',
      location: locName,
      image: a.image || a.coverImage || '/images/hillytrip/snow-mountain.svg',
      rating: 4.7,
      reviewsCount: 85,
      verified: true,
      featured: isFeat,
      tags: [a.category || 'Sightseeing', locName, a.district || ''].filter(Boolean),
      features: {
        hiddenGem: a.isHiddenGem || false,
        mountainView: true,
      },
      detailsUrl: `/attraction/${getItemSlug(a)}`,
      description: a.description || 'Scenic mountain attraction with stunning viewpoints.',
      rawItem: a
    });
  });

  // 3. Homestays & Restaurants
  (datasets.homestays || []).forEach(h => {
    if (!h || !h.name) return;
    const locName = h.village_name || h.district || h.address || 'Himalayas';
    const nameLower = (h.name || '').toLowerCase();
    const isRestaurant = nameLower.includes('cafe') || nameLower.includes('restaurant') || nameLower.includes('bakery') || nameLower.includes('eatery');
    const firstImg = h.images && h.images.length > 0 ? h.images[0] : '/images/hillytrip/homestay.svg';
    const minPrice = h.priceMin || 1200;

    items.push({
      id: `home-${h.id}`,
      name: h.name,
      category: isRestaurant ? 'Restaurant' : 'Homestay',
      scopeKey: isRestaurant ? 'restaurants' : 'homestays',
      location: locName,
      image: firstImg,
      rating: 4.9,
      reviewsCount: 42,
      price: minPrice,
      priceType: isRestaurant ? 'avg dish' : 'night',
      verified: h.status === 'active' || h.status === 'Approved',
      featured: true,
      tags: [locName, 'Homestay', ...(h.amenities || [])],
      features: {
        petFriendly: (h.amenities || []).some(a => /pet/i.test(a)),
        familyFriendly: true,
        luxury: minPrice >= 3000,
        budget: minPrice <= 1200,
        mountainView: (h.amenities || []).some(a => /view/i.test(a)),
        breakfastIncluded: (h.amenities || []).some(a => /breakfast|food|meal/i.test(a))
      },
      detailsUrl: `#/homestay/${getItemSlug(h)}`,
      description: h.description || `Pristine ${isRestaurant ? 'dining experience' : 'homestay stay'} in ${locName}.`,
      rawItem: h
    });
  });

  // 4. Taxi Stands & Routes
  (datasets.routes || []).forEach(r => {
    if (!r) return;
    const fromHub = (datasets.hubs || []).find(h => h.id === r.fromHubId);
    const toHub = (datasets.hubs || []).find(h => h.id === r.toHubId);
    const pathStr = (r.path || []).join(' → ');
    const title = fromHub && toHub ? `${fromHub.name} → ${toHub.name}` : (pathStr || 'Shared Taxi Route');

    items.push({
      id: `route-${r.id}`,
      name: title,
      category: 'Taxi',
      scopeKey: 'taxi',
      location: fromHub ? fromHub.name : 'Mountain Taxi Stand',
      image: '/images/hillytrip/taxi-transit.svg',
      rating: 4.8,
      reviewsCount: 64,
      price: r.fareMin || null,
      priceType: 'seat',
      verified: r.verified ?? true,
      featured: true,
      tags: [fromHub?.name || '', toHub?.name || '', 'Shared Taxi', 'Reserved Cab'].filter(Boolean),
      features: {
        budget: true,
        openNow: true,
      },
      detailsUrl: `#/taxi?from=${encodeURIComponent(fromHub?.name || r.fromHubId)}&to=${encodeURIComponent(toHub?.name || r.toHubId)}`,
      description: `Reliable hill taxi stand connection: ${title}.`,
      rawItem: r
    });
  });

  // 5. Hubs (Taxi Stands)
  (datasets.hubs || []).forEach(h => {
    if (!h || !h.name) return;
    items.push({
      id: `hub-${h.id}`,
      name: `${h.name} Taxi Stand`,
      category: 'Taxi',
      scopeKey: 'taxi',
      location: h.district ? `${h.district}, ${h.state || 'Himalayas'}` : 'Himalayas',
      image: '/images/hillytrip/taxi-transit.svg',
      rating: 4.7,
      reviewsCount: 95,
      verified: true,
      featured: true,
      tags: ['Taxi Stand', 'Hub', h.district || ''],
      features: {
        openNow: true
      },
      detailsUrl: `#/taxi?from=${encodeURIComponent(h.name)}`,
      description: `Official shared and reserved taxi stand in ${h.name}.`,
      rawItem: h
    });
  });

  // 6. Drivers / Guides
  (datasets.drivers || []).forEach(d => {
    if (!d || !d.name) return;
    const isGuide = (d.vehicleType || '').toLowerCase().includes('guide');

    items.push({
      id: `driver-${d.id}`,
      name: d.name,
      category: isGuide ? 'Guide' : 'Taxi',
      scopeKey: isGuide ? 'guides' : 'taxi',
      location: d.serviceAreas || 'North Bengal & Sikkim',
      image: '/images/hillytrip/himalayan-landscape.svg',
      rating: 4.9,
      reviewsCount: 35,
      price: d.pricingPerDay || 2500,
      priceType: 'day',
      verified: d.status === 'Approved',
      featured: true,
      tags: [d.vehicleType || 'Local Expert', 'Verified Operator'],
      features: {
        familyFriendly: true,
        coupleFriendly: true,
      },
      detailsUrl: isGuide ? `#/travel-guides` : `#/taxi`,
      description: `Certified local ${isGuide ? 'mountain guide' : 'hill driver'} with extensive local experience.`,
      rawItem: d
    });
  });

  // 7. Blogs & Travel Guides
  (datasets.blogs || []).forEach(b => {
    if (!b || !b.title) return;
    items.push({
      id: `blog-${b.id}`,
      name: b.title,
      category: 'Blog',
      scopeKey: 'blogs',
      location: 'HillyTrip Library',
      image: b.featuredImage || '/images/hillytrip/north-bengal-hills.svg',
      rating: 4.9,
      reviewsCount: 240,
      verified: true,
      featured: true,
      tags: ['Travel Guide', 'Itinerary', ...(b.tags || [])],
      features: {},
      detailsUrl: `#/travel-guides/${b.slug || b.id}`,
      description: b.content ? b.content.slice(0, 120).replace(/[#*`]/g, '') : 'Expert travel guide and local itinerary insights.',
      rawItem: b
    });
  });

  // 8. Verified Special Offers & Deals
  try {
    const activeOffers = getOffers({ onlyActiveValid: true });
    activeOffers.forEach(o => {
      if (!o || !o.title) return;
      items.push({
        id: `offer-${o.id}`,
        name: `${o.badge}: ${o.title}`,
        category: 'Experience',
        scopeKey: 'offers',
        location: `${o.businessName}, ${o.destinationName}`,
        image: o.coverImage,
        rating: o.businessRating || 4.9,
        reviewsCount: 50,
        verified: o.businessVerified,
        featured: o.isFeatured,
        tags: [o.badge, o.category, o.destinationName, o.businessName, 'Special Offer', 'Discount'],
        features: {
          budget: true,
          openNow: true
        },
        detailsUrl: `#/offers?id=${o.id}`,
        description: o.fullDescription || `${o.badge} deal from ${o.businessName} in ${o.destinationName}.`,
        rawItem: o
      });
    });
  } catch (e) {
    console.error('Error indexing offers for search:', e);
  }

  const seenIds = new Set<string>();
  return items.filter(item => {
    if (!item.id || seenIds.has(item.id)) return false;
    seenIds.add(item.id);
    return true;
  });
}

/**
 * Perform intelligent natural language search & return grouped results
 */
export function searchHillyTrip(
  query: string,
  scope: SearchScope,
  allItems: UnifiedSearchItem[]
): SearchGroup[] {
  const cleanQuery = query.trim().toLowerCase();
  
  if (!cleanQuery) {
    return [];
  }

  const parsed = parseNaturalLanguageQuery(cleanQuery);

  // 1. Filter items based on active SearchScope
  let candidates = allItems;
  if (scope !== 'all') {
    candidates = allItems.filter(item => item.scopeKey === scope);
  }

  // 2. Score and rank candidates
  const scoredItems: { item: UnifiedSearchItem; score: number }[] = [];

  candidates.forEach(item => {
    let score = 0;
    const nameLower = item.name.toLowerCase();
    const locLower = item.location.toLowerCase();
    const descLower = item.description.toLowerCase();
    const tagsLower = item.tags.map(t => t.toLowerCase()).join(' ');

    // Relevance scoring MUST come from explicit text or attribute matches using weighted search algorithm
    const rankResult = calculateWeightedSearchScore(cleanQuery, {
      name: item.name,
      type: item.category.toLowerCase(),
      district: item.location,
      description: item.description,
      tags: item.tags
    });

    let queryRelevanceScore = rankResult.score;

    // Location match
    if (parsed.locationHint && locLower.includes(parsed.locationHint.toLowerCase())) {
      queryRelevanceScore += 100;
    } else if (locLower.includes(cleanQuery)) {
      queryRelevanceScore += 60;
    }

    // Taxi Route From/To match
    if (parsed.fromLocation && parsed.toLocation && item.category === 'Taxi') {
      if (nameLower.includes(parsed.fromLocation) && nameLower.includes(parsed.toLocation)) {
        queryRelevanceScore += 150;
      }
    }

    // Category match
    if (parsed.categoryHint && item.scopeKey === parsed.categoryHint) {
      queryRelevanceScore += 40;
    }

    // Feature matches & penalties
    if (parsed.features.petFriendly) {
      if (item.features.petFriendly) queryRelevanceScore += 70;
      else queryRelevanceScore -= 100;
    }
    if (parsed.features.familyFriendly) {
      if (item.features.familyFriendly) queryRelevanceScore += 50;
      else queryRelevanceScore -= 80;
    }
    if (parsed.features.luxury) {
      if (item.features.luxury) queryRelevanceScore += 60;
      else queryRelevanceScore -= 80;
    }
    if (parsed.features.budget) {
      if (item.features.budget) queryRelevanceScore += 50;
      else queryRelevanceScore -= 80;
    }
    if (parsed.features.coupleFriendly) {
      if (item.features.coupleFriendly) queryRelevanceScore += 50;
      else queryRelevanceScore -= 80;
    }
    if (parsed.features.hiddenGem) {
      if (item.features.hiddenGem) queryRelevanceScore += 80;
      else queryRelevanceScore -= 80;
    }
    if (parsed.features.mountainView) {
      if (item.features.mountainView) queryRelevanceScore += 40;
      else queryRelevanceScore -= 60;
    }
    if (parsed.features.breakfastIncluded) {
      if (item.features.breakfastIncluded) queryRelevanceScore += 60;
      else queryRelevanceScore -= 100;
    }

    // Price fit & penalties
    if (item.price !== undefined) {
      if (parsed.maxPrice !== undefined) {
        if (item.price <= parsed.maxPrice) queryRelevanceScore += 50;
        else queryRelevanceScore -= 150; // Strictly exclude out-of-budget items
      }

      if (parsed.minPrice !== undefined) {
        if (item.price >= parsed.minPrice) queryRelevanceScore += 50;
        else queryRelevanceScore -= 150;
      }
    }

    // Individual keyword matches
    parsed.keywords.forEach(kw => {
      if (nameLower.includes(kw)) queryRelevanceScore += 35;
      if (locLower.includes(kw)) queryRelevanceScore += 25;
      if (tagsLower.includes(kw)) queryRelevanceScore += 20;
      if (descLower.includes(kw)) queryRelevanceScore += 10;
    });

    // Only include item if it actually matches the search query relevance criteria
    if (queryRelevanceScore > 0) {
      let finalScore = queryRelevanceScore;
      if (item.featured) finalScore += 15;
      if (item.verified) finalScore += 10;
      scoredItems.push({ item, score: finalScore });
    }
  });

  // Sort by score descending
  scoredItems.sort((a, b) => b.score - a.score);

  const matchedItems = scoredItems.map(s => s.item);

  // 3. Group by Module
  const groupConfig: { id: SearchScope; title: string; icon: string; viewAllUrl: string }[] = [
    { id: 'destinations', title: 'Destinations', icon: '🏔', viewAllUrl: '#/destinations' },
    { id: 'attractions', title: 'Attractions', icon: '📍', viewAllUrl: '#/attractions' },
    { id: 'homestays', title: 'Homestays', icon: '🏡', viewAllUrl: '#/homestays' },
    { id: 'restaurants', title: 'Restaurants', icon: '🍴', viewAllUrl: '#/restaurants' },
    { id: 'offers', title: 'Special Offers & Deals', icon: '🎁', viewAllUrl: '#/offers' },
    { id: 'taxi', title: 'Taxi Stands & Transfers', icon: '🚖', viewAllUrl: '#/taxi' },
    { id: 'guides', title: 'Guides', icon: '👤', viewAllUrl: '#/travel-guides' },
    { id: 'experiences', title: 'Experiences', icon: '🎒', viewAllUrl: '#/experiences' },
    { id: 'blogs', title: 'Blogs & Guides', icon: '📰', viewAllUrl: '#/travel-guides' },
    { id: 'treks', title: 'Treks', icon: '🧗', viewAllUrl: '#/treks' }
  ];

  const resultGroups: SearchGroup[] = [];

  groupConfig.forEach(cfg => {
    if (scope !== 'all' && scope !== cfg.id) {
      return;
    }

    const itemsInGroup = matchedItems.filter(item => item.scopeKey === cfg.id);
    if (itemsInGroup.length > 0) {
      // Build dynamic view all URL with preserved search & location parameters
      let viewAllParams = `search=${encodeURIComponent(query)}`;
      if (parsed.locationHint) viewAllParams += `&location=${encodeURIComponent(parsed.locationHint)}`;
      if (parsed.maxPrice) viewAllParams += `&maxPrice=${parsed.maxPrice}`;
      if (parsed.minPrice) viewAllParams += `&minPrice=${parsed.minPrice}`;

      resultGroups.push({
        id: cfg.id,
        title: cfg.title,
        icon: cfg.icon,
        totalCount: itemsInGroup.length,
        previewItems: itemsInGroup.slice(0, 3), // Max 3 preview cards per group
        allItems: itemsInGroup,
        viewAllUrl: `${cfg.viewAllUrl}?${viewAllParams}`
      });
    }
  });

  return resultGroups;
}

/**
 * Organizes Homestay Search Results into Smart Price Groups when user searches broadly
 */
export function getSmartHomestayPriceGroups(
  matchedItems: UnifiedSearchItem[],
  query: string,
  parsed: NaturalLanguageParse
): PriceRangeGroup[] {
  const homestayItems = matchedItems.filter(i => i.scopeKey === 'homestays');
  if (homestayItems.length === 0) return [];

  const ranges = [
    { label: '₹800–₹1000', minPrice: 0, maxPrice: 1000, match: (p: number) => p <= 1000 },
    { label: '₹1000–₹1500', minPrice: 1000, maxPrice: 1500, match: (p: number) => p > 1000 && p <= 1500 },
    { label: '₹1500–₹3000', minPrice: 1500, maxPrice: 3000, match: (p: number) => p > 1500 && p <= 3000 },
    { label: '₹3000+', minPrice: 3000, maxPrice: Infinity, match: (p: number) => p > 3000 }
  ];

  const groups: PriceRangeGroup[] = [];

  ranges.forEach(r => {
    const inRange = homestayItems.filter(i => {
      const p = i.price !== undefined ? i.price : 1200;
      return r.match(p);
    });

    if (inRange.length > 0) {
      let params = `search=${encodeURIComponent(query)}&minPrice=${r.minPrice}`;
      if (r.maxPrice !== Infinity) params += `&maxPrice=${r.maxPrice}`;
      if (parsed.locationHint) params += `&location=${encodeURIComponent(parsed.locationHint)}`;

      groups.push({
        label: r.label,
        minPrice: r.minPrice,
        maxPrice: r.maxPrice === Infinity ? undefined : r.maxPrice,
        totalCount: inRange.length,
        previewItems: inRange.slice(0, 3),
        allItems: inRange,
        viewAllUrl: `#/homestays?${params}`
      });
    }
  });

  return groups;
}
