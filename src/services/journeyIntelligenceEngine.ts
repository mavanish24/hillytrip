import { DESTINATION_STORAGE_ASSETS, ATTRACTION_STORAGE_ASSETS, HOMESTAY_STORAGE_ASSETS, TAXI_STAND_STORAGE_ASSETS, COMMON_STORAGE_ASSETS, getDestinationImage, getAttractionImage, getHomestayImage, getTaxiStandImage } from '../utils/imagePool';
// src/services/journeyIntelligenceEngine.ts
import { Route, Hub, Destination, Attraction, Homestay } from '../types';
import { toSlug } from '../utils/slug';

// ----------------------------------------------------
// Core Types & Interfaces for Journey Intelligence Engine
// ----------------------------------------------------

export interface LatLng {
  lat: number;
  lng: number;
}

export type POICategory =
  | 'MandatoryStop'
  | 'Viewpoint'
  | 'Waterfall'
  | 'Monastery'
  | 'Lake'
  | 'TeaGarden'
  | 'Heritage'
  | 'Village'
  | 'Restaurant'
  | 'Cafe'
  | 'TeaStall'
  | 'Fuel'
  | 'EVCharger'
  | 'Hospital'
  | 'ATM'
  | 'Parking'
  | 'Checkpost'
  | 'Homestay'
  | 'Destination';

export interface JourneyPOI {
  id: string;
  name: string;
  slug?: string;
  category: POICategory;
  categoryLabel: string;
  coords: LatLng;
  description: string;
  image?: string;
  elevationMeters?: number;
  rating?: number;
  isMandatory?: boolean;
  isAdminBoosted?: boolean;
  isHidden?: boolean;
  tips?: string;
  recommendedDurationMin?: number;
  nearestSegmentIndex?: number;
  chainageKm: number; // Distance along route polyline from origin in km
  perpendicularDistanceKm: number; // Off-route distance in km
  arrivalOrder: number;
  journeyScore: number;
  sourceType: 'attraction' | 'destination' | 'homestay' | 'hub' | 'master_dataset';
  rawRef?: any;
}

export interface TimelineStopNode {
  id: string;
  name: string;
  type: 'Origin' | 'MandatoryStop' | 'ScenicStop' | 'ImportantAttraction' | 'FoodBreak' | 'MajorVillage' | 'Destination';
  category: string;
  chainageKm: number;
  travelTimeMin: number;
  description: string;
  elevationMeters: number;
  coords: LatLng;
  image: string;
  tips: string;
  durationStopText: string;
  isMandatory: boolean;
  journeyScore: number;
  poiRef?: JourneyPOI;
}

export interface RouteNavigationInfo {
  originName: string;
  originCoords: LatLng;
  destinationName: string;
  destinationCoords: LatLng;
  polyline: LatLng[];
  distanceKm: number;
  durationMin: number;
  etaFormatted: string;
  isFromGoogleApi: boolean;
  cachedAt: string;
}

export interface GroupedCategoryAttractions {
  categoryKey: string;
  categoryTitle: string;
  iconName: string;
  count: number;
  items: JourneyPOI[];
}

export interface WhatsNextRecommendation {
  id: string;
  title: string;
  type: 'Continue' | 'Circuit' | 'Nearby' | 'Detour' | 'SharedJeep';
  typeLabel: string;
  description: string;
  distance: string;
  timeEstimate: string;
  targetSlug: string;
  badgeText?: string;
  image: string;
}

export interface JourneyIntelligenceSummary {
  highestElevationMeters: number;
  totalCorridorPois: number;
  overallJourneyScore: number;
}

export interface JourneyIntelligenceResult {
  routeKey: string;
  routeNavigation: RouteNavigationInfo;
  corridorWidthKm: number;
  allCorridorPois: JourneyPOI[];
  timelineStops: TimelineStopNode[];
  attractionsAlongRoute: GroupedCategoryAttractions[];
  scenicStops: JourneyPOI[];
  foodStops: JourneyPOI[];
  essentialServices: JourneyPOI[];
  whatsNextRecommendations: WhatsNextRecommendation[];
  summary: JourneyIntelligenceSummary;
  generatedAt: string;
}

export interface EngineOptions {
  corridorWidthKm?: number;
  adminPinStops?: string[]; // IDs or names of mandatory stops
  hiddenPoiIds?: string[];
  boostedPoiIds?: string[];
  forceRefresh?: boolean;
}

// ----------------------------------------------------
// Spatial Mathematics & Polyline Helpers
// ----------------------------------------------------

export function haversineDistanceKm(p1: LatLng, p2: LatLng): number {
  if (!p1 || !p2) return 0;
  const R = 6371; // Earth radius in km
  const dLat = ((p2.lat - p1.lat) * Math.PI) / 180;
  const dLng = ((p2.lng - p1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((p1.lat * Math.PI) / 180) *
      Math.cos((p2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

export function projectPointOnSegment(
  p: LatLng,
  a: LatLng,
  b: LatLng
): { projection: LatLng; t: number; distanceKm: number } {
  const dx = b.lng - a.lng;
  const dy = b.lat - a.lat;
  const lenSq = dx * dx + dy * dy;

  if (lenSq === 0) {
    const d = haversineDistanceKm(p, a);
    return { projection: a, t: 0, distanceKm: d };
  }

  let t = ((p.lng - a.lng) * dx + (p.lat - a.lat) * dy) / lenSq;
  t = Math.max(0, Math.min(1, t));

  const proj: LatLng = {
    lat: a.lat + t * dy,
    lng: a.lng + t * dx,
  };

  const dist = haversineDistanceKm(p, proj);
  return { projection: proj, t, distanceKm: dist };
}

export function calculateChainageAndDistance(
  p: LatLng,
  polyline: LatLng[]
): {
  nearestSegmentIndex: number;
  projection: LatLng;
  chainageKm: number;
  perpendicularDistanceKm: number;
} {
  if (!polyline || polyline.length === 0) {
    return { nearestSegmentIndex: 0, projection: p, chainageKm: 0, perpendicularDistanceKm: 0 };
  }

  if (polyline.length === 1) {
    return {
      nearestSegmentIndex: 0,
      projection: polyline[0],
      chainageKm: 0,
      perpendicularDistanceKm: haversineDistanceKm(p, polyline[0]),
    };
  }

  let minDistance = Infinity;
  let bestSegIdx = 0;
  let bestProj = polyline[0];
  let bestT = 0;

  // Precompute segment lengths
  const cumLengths: number[] = [0];
  for (let i = 0; i < polyline.length - 1; i++) {
    const segLen = haversineDistanceKm(polyline[i], polyline[i + 1]);
    cumLengths.push(cumLengths[i] + segLen);
  }

  for (let i = 0; i < polyline.length - 1; i++) {
    const segStart = polyline[i];
    const segEnd = polyline[i + 1];
    const { projection, t, distanceKm } = projectPointOnSegment(p, segStart, segEnd);

    if (distanceKm < minDistance) {
      minDistance = distanceKm;
      bestSegIdx = i;
      bestProj = projection;
      bestT = t;
    }
  }

  const segStartLen = cumLengths[bestSegIdx];
  const segTotalLen = cumLengths[bestSegIdx + 1] - segStartLen;
  const chainageKm = Math.round((segStartLen + segTotalLen * bestT) * 10) / 10;

  return {
    nearestSegmentIndex: bestSegIdx,
    projection: bestProj,
    chainageKm,
    perpendicularDistanceKm: Math.round(minDistance * 100) / 100,
  };
}

// Interpolate polyline between coordinate points
export function generateInterpolatedPolyline(start: LatLng, end: LatLng, waypoints: LatLng[] = [], totalPoints = 30): LatLng[] {
  const points: LatLng[] = [start, ...waypoints, end];
  if (points.length >= totalPoints) return points;

  const result: LatLng[] = [];
  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const segPoints = Math.max(3, Math.floor(totalPoints / (points.length - 1)));

    for (let j = 0; j < segPoints; j++) {
      const frac = j / segPoints;
      // Add subtle curve offset for mountain roads realism
      const curveFactor = Math.sin(frac * Math.PI) * 0.008 * (i % 2 === 0 ? 1 : -1);
      result.push({
        lat: p1.lat + (p2.lat - p1.lat) * frac + curveFactor,
        lng: p1.lng + (p2.lng - p1.lng) * frac + curveFactor * 0.5,
      });
    }
  }
  result.push(end);
  return result;
}

// ----------------------------------------------------
// Master Coordinates & Regional Datasets Dictionary
// ----------------------------------------------------

export const REGIONAL_COORDINATES: Record<string, { lat: number; lng: number; alt: number; region: string }> = {
  njp: { lat: 26.7271, lng: 88.4173, alt: 114, region: 'Siliguri Plains' },
  siliguri: { lat: 26.7271, lng: 88.4173, alt: 120, region: 'Siliguri Plains' },
  bagdogra: { lat: 26.6812, lng: 88.3286, alt: 126, region: 'Siliguri Plains' },
  sevoke: { lat: 26.8883, lng: 88.4735, alt: 180, region: 'Teesta Gorge' },
  coronation_bridge: { lat: 26.8883, lng: 88.4735, alt: 180, region: 'Teesta Gorge' },
  kalijhora: { lat: 26.9241, lng: 88.4682, alt: 220, region: 'Teesta Valley' },
  melli: { lat: 27.0911, lng: 88.459, alt: 310, region: 'Teesta Valley' },
  rangpo: { lat: 27.1764, lng: 88.5328, alt: 350, region: 'East Sikkim Border' },
  singtham: { lat: 27.2348, lng: 88.4988, alt: 420, region: 'East Sikkim' },
  ranipool: { lat: 27.2882, lng: 88.5912, alt: 860, region: 'East Sikkim' },
  gangtok: { lat: 27.3389, lng: 88.6138, alt: 1650, region: 'East Sikkim' },
  tsomgo: { lat: 27.3828, lng: 88.7618, alt: 3753, region: 'High Altitude East Sikkim' },
  baba_mandir: { lat: 27.3871, lng: 88.8231, alt: 4000, region: 'High Altitude East Sikkim' },
  nathula: { lat: 27.3865, lng: 88.831, alt: 4310, region: 'Indo-China Border' },
  kurseong: { lat: 26.88, lng: 88.28, alt: 1458, region: 'Darjeeling Hills' },
  ghoom: { lat: 27.0102, lng: 88.2562, alt: 2258, region: 'Darjeeling Hills' },
  darjeeling: { lat: 27.041, lng: 88.2663, alt: 2045, region: 'Darjeeling Hills' },
  kalimpong: { lat: 27.06, lng: 88.47, alt: 1250, region: 'Kalimpong Hills' },
  lava: { lat: 27.086, lng: 88.659, alt: 2138, region: 'Kalimpong Hills' },
  rishop: { lat: 27.108, lng: 88.651, alt: 2591, region: 'Kalimpong Hills' },
  pelling: { lat: 27.3167, lng: 88.2333, alt: 2150, region: 'West Sikkim' },
  ravangla: { lat: 27.306, lng: 88.363, alt: 2133, region: 'South Sikkim' },
  namchi: { lat: 27.1667, lng: 88.35, alt: 1315, region: 'South Sikkim' },
  mangan: { lat: 27.5, lng: 88.5333, alt: 950, region: 'North Sikkim' },
  chungthang: { lat: 27.6, lng: 88.65, alt: 1790, region: 'North Sikkim' },
  lachen: { lat: 27.7167, lng: 88.55, alt: 2750, region: 'North Sikkim' },
  lachung: { lat: 27.6833, lng: 88.75, alt: 2900, region: 'North Sikkim' },
  yumthang: { lat: 27.8167, lng: 88.7, alt: 3700, region: 'North Sikkim' },
  gurudongmar: { lat: 28.0258, lng: 88.7097, alt: 5430, region: 'North Sikkim' },
  mirik: { lat: 26.8889, lng: 88.1817, alt: 1495, region: 'Darjeeling Hills' },
  zuluk: { lat: 27.2514, lng: 88.7842, alt: 2865, region: 'Silk Route East Sikkim' },
};

// Rich Master Dataset of POIs along North Bengal & Sikkim Travel Corridors
export const MASTER_CORRIDOR_POIS: Omit<JourneyPOI, 'chainageKm' | 'perpendicularDistanceKm' | 'arrivalOrder' | 'journeyScore'>[] = [
  // --- NH 10 CORRIDOR (Siliguri -> Sevoke -> Melli -> Rangpo -> Singtham -> Gangtok) ---
  {
    id: 'poi-coronation-bridge',
    name: 'Coronation Bridge (Sevoke)',
    slug: 'coronation-bridge-sevoke',
    category: 'MandatoryStop',
    categoryLabel: 'Heritage Landmark',
    coords: { lat: 26.8883, lng: 88.4735 },
    description: 'Iconic 1937 British arch bridge over the emerald Teesta river gorge. Gateway to Sikkim and Dooars.',
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/Bridge.png',
    elevationMeters: 180,
    rating: 4.8,
    isMandatory: true,
    tips: 'Ideal spot for a 10-minute photo stop. Park safely before entering the arch.',
    recommendedDurationMin: 15,
    sourceType: 'master_dataset',
  },
  {
    id: 'poi-sevoke-kali-mandir',
    name: 'Sevoke Kali Mandir',
    slug: 'sevoke-kali-mandir',
    category: 'Monastery',
    categoryLabel: 'Sacred Temple',
    coords: { lat: 26.892, lng: 88.472 },
    description: 'Sacred hillside temple overlooking the Teesta river. Drivers stop here for blessings before hill ascents.',
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/Temple.png',
    elevationMeters: 200,
    rating: 4.7,
    isMandatory: false,
    tips: 'Mind the steps. Traditional blessing point for drivers.',
    recommendedDurationMin: 15,
    sourceType: 'master_dataset',
  },
  {
    id: 'poi-teesta-riverside-momo',
    name: 'Teesta Viewpoint & Sherpa Momo Shack',
    slug: 'teesta-viewpoint-momo',
    category: 'Restaurant',
    categoryLabel: 'Local Food & Viewpoint',
    coords: { lat: 26.945, lng: 88.462 },
    description: 'Hot steamed momos and fresh ginger cardamom tea served right beside rushing turquoise Teesta waters.',
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/homestays/Local%20Food%20%20Dining.png',
    elevationMeters: 240,
    rating: 4.9,
    isMandatory: false,
    tips: 'Order the chicken momo broth and red chili paste.',
    recommendedDurationMin: 20,
    sourceType: 'master_dataset',
  },
  {
    id: 'poi-melli-junction-rafting',
    name: 'Melli Rafting Junction & River Point',
    slug: 'melli-rafting-junction',
    category: 'Waterfall',
    categoryLabel: 'River Confluence & Rafting',
    coords: { lat: 27.0911, lng: 88.459 },
    description: 'Confluence of Teesta and Rangeet rivers. Premier white-water river rafting hub on the Sikkim border.',
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/River%20(1).png',
    elevationMeters: 310,
    rating: 4.8,
    isMandatory: true,
    tips: 'Clear passport/permit verification point at Sikkim checkpost.',
    recommendedDurationMin: 30,
    sourceType: 'master_dataset',
  },
  {
    id: 'poi-rangpo-checkpost',
    name: 'Rangpo Sikkim Tourist Permit Center',
    slug: 'rangpo-tourist-permit-center',
    category: 'Checkpost',
    categoryLabel: 'Sikkim Entry Checkpost',
    coords: { lat: 27.1764, lng: 88.5328 },
    description: 'Official entry gateway to Sikkim. Inner Line Permit (ILP) verification, tourist guidance, & EV charger.',
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/taxi-stands/Himalayan%20Taxi%20Stand.png',
    elevationMeters: 350,
    rating: 4.6,
    isMandatory: true,
    tips: 'Keep physical copies of Voter ID/Passport & 2 passport photos ready.',
    recommendedDurationMin: 15,
    sourceType: 'master_dataset',
  },
  {
    id: 'poi-rangpo-ev-charger',
    name: 'IOC Rangpo Highway Fuel Station & EV Charger',
    slug: 'rangpo-fuel-ev-charger',
    category: 'EVCharger',
    categoryLabel: 'Fuel & 60kW EV Fast Charger',
    coords: { lat: 27.18, lng: 88.53 },
    description: '24/7 petrol station with 60kW DC dual-gun EV fast charger, clean toilets, & snack market.',
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/Bridge.png',
    elevationMeters: 360,
    rating: 4.7,
    isMandatory: false,
    tips: 'Fastest EV charging station before ascending to Gangtok.',
    recommendedDurationMin: 20,
    sourceType: 'master_dataset',
  },
  {
    id: 'poi-singtham-bridge-market',
    name: 'Singtham Bazaar & River Bridge',
    slug: 'singtham-bazaar-river-bridge',
    category: 'Village',
    categoryLabel: 'Major Transit Hub',
    coords: { lat: 27.2348, lng: 88.4988 },
    description: 'Central commercial valley town linking Gangtok, West Sikkim (Pelling), and South Sikkim (Namchi).',
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/Bridge.png',
    elevationMeters: 420,
    rating: 4.5,
    isMandatory: false,
    tips: 'Great place to buy fresh organic fruits, cardamom, and local snacks.',
    recommendedDurationMin: 15,
    sourceType: 'master_dataset',
  },

  // --- GANGTOK TO TSOMGO / NATHULA CORRIDOR ---
  {
    id: 'poi-bakthang-waterfall',
    name: 'Bakthang Waterfalls',
    slug: 'bakthang-waterfalls',
    category: 'Waterfall',
    categoryLabel: 'Roadside Waterfall',
    coords: { lat: 27.355, lng: 88.625 },
    description: 'Pristine mountain cascade along North Sikkim Highway. Rope sliding and Traditional dress photos available.',
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/View%20Point%20(1).png',
    elevationMeters: 1850,
    rating: 4.7,
    isMandatory: false,
    tips: 'Dress up in traditional Sikkimese Bakhu for a memorable photo.',
    recommendedDurationMin: 20,
    sourceType: 'master_dataset',
  },
  {
    id: 'poi-tashi-viewpoint',
    name: 'Tashi Viewpoint',
    slug: 'tashi-viewpoint-gangtok',
    category: 'Viewpoint',
    categoryLabel: 'Scenic Vista',
    coords: { lat: 27.362, lng: 88.63 },
    description: 'World-famous sunrise viewpoint with unobstructed vistas of Mt. Kanchenjunga peak.',
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/View%20Point%20(1).png',
    elevationMeters: 1900,
    rating: 4.9,
    isMandatory: true,
    tips: 'Best reached between 5:30 AM and 7:00 AM for golden mountain peak light.',
    recommendedDurationMin: 30,
    sourceType: 'master_dataset',
  },
  {
    id: 'poi-tsomgo-lake',
    name: 'Tsomgo (Changu) Lake (12,310 ft)',
    slug: 'tsomgo-changu-lake',
    category: 'Lake',
    categoryLabel: 'Sacred High Alpine Lake',
    coords: { lat: 27.3828, lng: 88.7618 },
    description: 'Glacial lake sacred to local inhabitants. Decorated Yaks, snow slopes, & cable car ride.',
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/Lake.png',
    elevationMeters: 3753,
    rating: 4.9,
    isMandatory: true,
    tips: 'Protected permit area. Walk slowly to acclimatize to high altitude air.',
    recommendedDurationMin: 60,
    sourceType: 'master_dataset',
  },
  {
    id: 'poi-baba-harbhajan-mandir',
    name: 'Baba Harbhajan Singh Memorial Mandir',
    slug: 'baba-harbhajan-singh-mandir',
    category: 'Heritage',
    categoryLabel: 'Sacred Shrine & Legend',
    coords: { lat: 27.3871, lng: 88.8231 },
    description: 'Revered shrine built in memory of Indian Army hero Sepoy Harbhajan Singh near Indo-China border.',
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/Temple.png',
    elevationMeters: 4000,
    rating: 4.8,
    isMandatory: true,
    tips: 'Hot tea and warm soup available at the Indian Army canteen.',
    recommendedDurationMin: 35,
    sourceType: 'master_dataset',
  },

  // --- SILIGURI TO DARJEELING CORRIDOR ---
  {
    id: 'poi-kurseong-eagle-crag',
    name: 'Kurseong & Eagle\'s Crag Viewpoint',
    slug: 'kurseong-eagles-crag',
    category: 'Viewpoint',
    categoryLabel: 'Panoramic Ridge',
    coords: { lat: 26.88, lng: 88.28 },
    description: 'Charming hill town of orchids and tea estates overlooking the broad plains of Bengal.',
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Tea%20Garden%20Village.png',
    elevationMeters: 1458,
    rating: 4.7,
    isMandatory: false,
    tips: 'Visit Margaret\'s Deck nearby for estate tea tasting.',
    recommendedDurationMin: 25,
    sourceType: 'master_dataset',
  },
  {
    id: 'poi-margarets-deck-tea',
    name: 'Margaret\'s Deck Tea Lounge (Goodricke)',
    slug: 'margarets-deck-tea-lounge',
    category: 'Cafe',
    categoryLabel: 'Heritage Tea Estate Cafe',
    coords: { lat: 26.89, lng: 88.275 },
    description: 'Glass-encased cliffside tea lounge over Margaret\'s Hope tea garden serving first-flush Darjeeling teas.',
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Tea%20Garden%20Village.png',
    elevationMeters: 1520,
    rating: 4.9,
    isMandatory: true,
    tips: 'Try the Muscatel First Flush Tea and warm scones with homemade jam.',
    recommendedDurationMin: 30,
    sourceType: 'master_dataset',
  },
  {
    id: 'poi-ghoom-monastery',
    name: 'Ghoom Yiga Choeling Monastery',
    slug: 'ghoom-yiga-choeling-monastery',
    category: 'Monastery',
    categoryLabel: 'Historic Buddhist Monastery',
    coords: { lat: 27.01, lng: 88.256 },
    description: 'Built in 1850, home to a majestic 15-foot high statue of Maitreya (Future) Buddha.',
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/Monastery.png',
    elevationMeters: 2258,
    rating: 4.8,
    isMandatory: true,
    tips: 'One of the highest railway stations & oldest monasteries in India.',
    recommendedDurationMin: 25,
    sourceType: 'master_dataset',
  },
  {
    id: 'poi-batasia-loop',
    name: 'Batasia Loop & Gorkha War Memorial',
    slug: 'batasia-loop-memorial',
    category: 'Heritage',
    categoryLabel: 'Iconic Toy Train Loop',
    coords: { lat: 27.0102, lng: 88.2562 },
    description: 'Engineering marvel where the Darjeeling Himalayan Toy Train loops around landscaped gardens facing Kanchenjunga.',
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Tea%20Garden%20Village.png',
    elevationMeters: 2200,
    rating: 4.9,
    isMandatory: true,
    tips: '360-degree Kanchenjunga backdrop on clear mornings.',
    recommendedDurationMin: 40,
    sourceType: 'master_dataset',
  },

  // --- DARJEELING TO MIRIK CORRIDOR ---
  {
    id: 'poi-pashupati-market',
    name: 'Pashupati Market (Indo-Nepal Border)',
    slug: 'pashupati-market-indo-nepal-border',
    category: 'Heritage',
    categoryLabel: 'Border Trading Market',
    coords: { lat: 26.9, lng: 88.22 },
    description: 'Bustling border bazaar between India and Nepal famous for imported jackets, handicrafts, and teas.',
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Tea%20Garden%20Village.png',
    elevationMeters: 1400,
    rating: 4.6,
    isMandatory: false,
    tips: 'Indians require valid photo ID for crossing border market gate.',
    recommendedDurationMin: 45,
    sourceType: 'master_dataset',
  },
  {
    id: 'poi-gopaldhara-tea-estate',
    name: 'Gopaldhara Tea Estate & Viewpoint',
    slug: 'gopaldhara-tea-estate-viewpoint',
    category: 'TeaGarden',
    categoryLabel: 'Highest Elevation Tea Garden',
    coords: { lat: 26.895, lng: 88.2 },
    description: 'Spectacular terraced slopes rising up to 7,000 feet producing world-famous high-grown organic teas.',
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/Lake.png',
    elevationMeters: 1600,
    rating: 4.8,
    isMandatory: true,
    tips: 'Walk among tea bushes and try fresh white tea at the estate cafe.',
    recommendedDurationMin: 30,
    sourceType: 'master_dataset',
  },
  {
    id: 'poi-mirik-lake',
    name: 'Mirik Sumendu Lake & Arch Bridge',
    slug: 'mirik-sumendu-lake',
    category: 'Lake',
    categoryLabel: 'Alpine Boating Lake',
    coords: { lat: 26.8889, lng: 88.1817 },
    description: 'Serene mountain lake encircled by pine forests and cardamom groves with horse riding & boating.',
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/Bridge.png',
    elevationMeters: 1495,
    rating: 4.8,
    isMandatory: true,
    tips: 'Walk across the Indreni wooden bridge to the pine woods.',
    recommendedDurationMin: 60,
    sourceType: 'master_dataset',
  },

  // --- KALIMPONG TO LAVA / RISHOP CORRIDOR ---
  {
    id: 'poi-delo-hill-viewpoint',
    name: 'Delo Hill Park & Paragliding Point',
    slug: 'delo-hill-park-kalimpong',
    category: 'Viewpoint',
    categoryLabel: 'Highest Ridge Viewpoint',
    coords: { lat: 27.08, lng: 88.48 },
    description: 'Highest point in Kalimpong offering panoramic views of the Teesta valley and snow-clad Himalayan peaks.',
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/Monastery.png',
    elevationMeters: 1704,
    rating: 4.9,
    isMandatory: true,
    tips: 'Popular tandem paragliding takeoff spot.',
    recommendedDurationMin: 45,
    sourceType: 'master_dataset',
  },
  {
    id: 'poi-lava-monastery',
    name: 'Lava Jamgon Kongtrul Monastery',
    slug: 'lava-monastery',
    category: 'Monastery',
    categoryLabel: 'Pine Forest Monastery',
    coords: { lat: 27.086, lng: 88.659 },
    description: 'Quiet Buddhist monastery enveloped in pine mist at the edge of Neora Valley National Park.',
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/Monastery.png',
    elevationMeters: 2138,
    rating: 4.8,
    isMandatory: true,
    tips: 'Listen to evening prayer chanting around 4:00 PM.',
    recommendedDurationMin: 30,
    sourceType: 'master_dataset',
  },

  // --- ESSENTIAL SERVICES MASTER DATA ---
  {
    id: 'poi-service-siliguri-medical',
    name: 'Siliguri North Bengal Medical College & Hospital',
    slug: 'siliguri-medical-hospital',
    category: 'Hospital',
    categoryLabel: 'Super Specialty Hospital',
    coords: { lat: 26.71, lng: 88.38 },
    description: 'Primary emergency tertiary referral hospital equipped with ICU & trauma center.',
    elevationMeters: 120,
    rating: 4.6,
    isMandatory: false,
    sourceType: 'master_dataset',
  },
  {
    id: 'poi-service-gangtok-stnm',
    name: 'STNM Super Specialty Hospital Gangtok',
    slug: 'stnm-hospital-gangtok',
    category: 'Hospital',
    categoryLabel: '24/7 Apex Hospital',
    coords: { lat: 27.32, lng: 88.6 },
    description: 'Sikkim\'s premier state hospital with high-altitude emergency trauma and oxygen support.',
    elevationMeters: 1550,
    rating: 4.8,
    isMandatory: false,
    sourceType: 'master_dataset',
  },
  {
    id: 'poi-service-sbi-rangpo-atm',
    name: 'SBI 24/7 ATM Rangpo Gateway',
    slug: 'sbi-atm-rangpo',
    category: 'ATM',
    categoryLabel: 'Multi-Bank ATM',
    coords: { lat: 27.176, lng: 88.533 },
    description: 'Reliable SBI and HDFC ATMs right near the Rangpo checkpost.',
    elevationMeters: 350,
    rating: 4.7,
    isMandatory: false,
    sourceType: 'master_dataset',
  },
  {
    id: 'poi-service-darjeeling-district-hospital',
    name: 'Darjeeling District Hospital & Red Cross',
    slug: 'darjeeling-hospital',
    category: 'Hospital',
    categoryLabel: 'District General Hospital',
    coords: { lat: 27.04, lng: 88.26 },
    description: '24/7 emergency medical center on Darjeeling hill ridge.',
    elevationMeters: 2045,
    rating: 4.5,
    isMandatory: false,
    sourceType: 'master_dataset',
  }
];

// ----------------------------------------------------
// JOURNEY INTELLIGENCE ENGINE CLASS & SINGLETON
// ----------------------------------------------------

export class JourneyIntelligenceEngine {
  private static cacheMap: Map<string, JourneyIntelligenceResult> = new Map();

  /**
   * Main Engine Entry Point: Generate Complete Journey Intelligence
   */
  public static async generate(
    fromHubId: string,
    toHubId: string,
    activeRoute?: Route | null,
    hubs: Hub[] = [],
    destinations: Destination[] = [],
    attractions: Attraction[] = [],
    homestays: Homestay[] = [],
    options: EngineOptions = {}
  ): Promise<JourneyIntelligenceResult> {
    const routeKey = `${(fromHubId || 'origin').toLowerCase().trim()}-to-${(toHubId || 'destination').toLowerCase().trim()}_v2`;
    const corridorWidthKm = Math.min(Math.max(options.corridorWidthKm || 5.0, 1.0), 10.0);

    // Check Memory / Storage Cache unless forceRefresh is true
    if (!options.forceRefresh) {
      if (this.cacheMap.has(routeKey)) {
        return this.cacheMap.get(routeKey)!;
      }
      try {
        const stored = localStorage.getItem(`hillytrip_jie_cache_${routeKey}`);
        if (stored) {
          const parsed: JourneyIntelligenceResult = JSON.parse(stored);
          const cacheAgeMs = Date.now() - new Date(parsed.generatedAt).getTime();
          // Cache valid for 24 hours
          if (cacheAgeMs < 24 * 60 * 60 * 1000) {
            this.cacheMap.set(routeKey, parsed);
            return parsed;
          }
        }
      } catch (e) {
        // LocalStorage fallback
      }
    }

    // Step 1: Resolve Navigation & Route Polyline (Google or Smart Fallback)
    const routeNav = await this.resolveRouteNavigation(fromHubId, toHubId, activeRoute, hubs, destinations);

    // Step 2: Build Unified POI Candidates from HillyTrip Database & Master Sets
    const candidatePois = this.aggregateAllPoiCandidates(
      fromHubId,
      toHubId,
      hubs,
      destinations,
      attractions,
      homestays,
      options
    );

    // Step 3: Compute Corridor Position, Chainage, and Journey Score for Every POI (with strict spatial validation)
    const processedPois: JourneyPOI[] = [];

    candidatePois.forEach((poi) => {
      if (options.hiddenPoiIds && options.hiddenPoiIds.includes(poi.id)) {
        return; // Skip hidden POI
      }

      // Perform strict route corridor validation (perpendicular distance <= corridorWidthKm, chainage within bounds)
      const { isValid, spatial } = this.validatePoiForRoute(poi, routeNav, corridorWidthKm);

      if (isValid) {
        // Calculate Smart Journey Score
        const journeyScore = this.calculateJourneyScore(
          poi,
          spatial.perpendicularDistanceKm,
          spatial.chainageKm,
          routeNav.distanceKm,
          options
        );

        processedPois.push({
          ...poi,
          chainageKm: spatial.chainageKm,
          perpendicularDistanceKm: spatial.perpendicularDistanceKm,
          nearestSegmentIndex: spatial.nearestSegmentIndex,
          arrivalOrder: 0, // Will set after sorting
          journeyScore,
        });
      }
    });

    // Sort strictly by travel direction (chainageKm along polyline)
    processedPois.sort((a, b) => a.chainageKm - b.chainageKm);
    processedPois.forEach((poi, index) => {
      poi.arrivalOrder = index + 1;
    });

    // Step 4: Generate Clean Journey Timeline
    const timelineStops = this.generateTimelineStops(routeNav, processedPois, activeRoute, hubs, destinations, options);

    // Step 5: Group Attractions Along Route
    const attractionsAlongRoute = this.generateAttractionsAlongRoute(processedPois);

    // Step 6: Filter Scenic Stops
    const scenicStops = processedPois.filter((p) =>
      ['Viewpoint', 'Waterfall', 'Lake', 'TeaGarden'].includes(p.category)
    );

    // Step 7: Filter Food & Refreshment Stops
    const foodStops = processedPois.filter((p) =>
      ['Restaurant', 'Cafe', 'TeaStall'].includes(p.category)
    );

    // Step 8: Filter Essential Services
    const essentialServices = processedPois.filter((p) =>
      ['Fuel', 'EVCharger', 'Hospital', 'ATM', 'Parking', 'Checkpost'].includes(p.category)
    );

    // Step 9: Dynamic "What's Next?" Recommendations
    const whatsNextRecommendations = this.generateWhatsNextRecommendations(
      fromHubId,
      toHubId,
      routeNav,
      hubs,
      destinations
    );

    const highestElevation = processedPois.reduce((max, p) => Math.max(max, p.elevationMeters || 0), 0) || 1850;

    const result: JourneyIntelligenceResult = {
      routeKey,
      routeNavigation: routeNav,
      corridorWidthKm,
      allCorridorPois: processedPois,
      timelineStops,
      attractionsAlongRoute,
      scenicStops,
      foodStops,
      essentialServices,
      whatsNextRecommendations,
      summary: {
        highestElevationMeters: highestElevation,
        totalCorridorPois: processedPois.length,
        overallJourneyScore: 9.4
      },
      generatedAt: new Date().toISOString(),
    };

    // Cache Result
    this.cacheMap.set(routeKey, result);
    try {
      localStorage.setItem(`hillytrip_jie_cache_${routeKey}`, JSON.stringify(result));
    } catch (e) {}

    return result;
  }

  /**
   * Resolve Route Navigation (Origin, Destination, Polyline, Distance, Duration)
   */
  private static async resolveRouteNavigation(
    fromHubId: string,
    toHubId: string,
    activeRoute: Route | null | undefined,
    hubs: Hub[],
    destinations: Destination[]
  ): Promise<RouteNavigationInfo> {
    const resolveCoords = (id: string, isEnd = false): { name: string; coords: LatLng } => {
      const clean = (id || '').toLowerCase().trim();
      const normSlug = toSlug(clean);

      const h = hubs.find(
        (hub) =>
          (hub.id || '').toLowerCase() === clean ||
          toSlug(hub.name) === normSlug ||
          (hub.slug && toSlug(hub.slug) === normSlug)
      );
      if (h) {
        const key = h.id.toLowerCase();
        const reg = REGIONAL_COORDINATES[key] || REGIONAL_COORDINATES[toSlug(h.name)];
        const coords =
          h.latitude && h.longitude
            ? { lat: Number(h.latitude), lng: Number(h.longitude) }
            : reg
            ? { lat: reg.lat, lng: reg.lng }
            : { lat: 27.0, lng: 88.4 };
        return { name: h.name, coords };
      }

      const d = destinations.find(
        (dest) =>
          (dest.id || '').toLowerCase() === clean ||
          toSlug(dest.name) === normSlug ||
          (dest.slug && toSlug(dest.slug) === normSlug)
      );
      if (d) {
        const key = d.id.toLowerCase();
        const reg = REGIONAL_COORDINATES[key] || REGIONAL_COORDINATES[toSlug(d.name)];
        const coords =
          d.latitude && d.longitude
            ? { lat: Number(d.latitude), lng: Number(d.longitude) }
            : reg
            ? { lat: reg.lat, lng: reg.lng }
            : { lat: 27.2, lng: 88.5 };
        return { name: d.name, coords };
      }

      const regKey = Object.keys(REGIONAL_COORDINATES).find(
        (k) => clean.includes(k) || k.includes(clean) || normSlug.includes(k)
      );
      if (regKey) {
        const reg = REGIONAL_COORDINATES[regKey];
        return {
          name: clean.charAt(0).toUpperCase() + clean.slice(1),
          coords: { lat: reg.lat, lng: reg.lng },
        };
      }

      return {
        name: isEnd ? 'Destination' : 'Origin',
        coords: isEnd ? { lat: 27.3389, lng: 88.6138 } : { lat: 26.7271, lng: 88.4173 },
      };
    };

    const origin = resolveCoords(fromHubId, false);
    const dest = resolveCoords(toHubId, true);

    // Resolve intermediate waypoints from activeRoute.path
    const waypoints: LatLng[] = [];
    if (activeRoute && activeRoute.path && activeRoute.path.length > 2) {
      activeRoute.path.slice(1, -1).forEach((step) => {
        const stepCoords = resolveCoords(step, false);
        waypoints.push(stepCoords.coords);
      });
    }

    // Attempt Google Routes API (computeRoutes) if Google Maps JS script is loaded
    let isFromGoogleApi = false;
    let polyline: LatLng[] = [];
    let distanceKm = activeRoute?.distance || haversineDistanceKm(origin.coords, dest.coords) * 1.35;
    let durationMin = activeRoute?.timeMin || Math.round((distanceKm / 30) * 60);

    if (typeof window !== 'undefined' && (window as any).google && (window as any).google.maps) {
      try {
        let routesLib: any = null;
        if (typeof (window as any).google.maps.importLibrary === 'function') {
          routesLib = await (window as any).google.maps.importLibrary('routes');
        } else if ((window as any).google.maps.routes) {
          routesLib = (window as any).google.maps.routes;
        }

        if (routesLib && routesLib.Route && typeof routesLib.Route.computeRoutes === 'function') {
          const res = await routesLib.Route.computeRoutes({
            origin: { lat: origin.coords.lat, lng: origin.coords.lng },
            destination: { lat: dest.coords.lat, lng: dest.coords.lng },
            travelMode: 'DRIVING',
            fields: ['path', 'distanceMeters', 'durationMillis'],
          });

          if (res && res.routes && res.routes[0]) {
            const r = res.routes[0];
            if (r.path && Array.isArray(r.path) && r.path.length > 0) {
              polyline = r.path.map((pt: any) => ({
                lat: typeof pt.lat === 'function' ? pt.lat() : Number(pt.lat),
                lng: typeof pt.lng === 'function' ? pt.lng() : Number(pt.lng),
              }));
              isFromGoogleApi = true;
            }
            if (r.distanceMeters) {
              distanceKm = Math.round((r.distanceMeters / 1000) * 10) / 10;
            }
            if (r.durationMillis) {
              durationMin = Math.round(r.durationMillis / 60000);
            }
          }
        }
      } catch (err) {
        // Fallback gracefully to high-precision geometric polyline
      }
    }

    // Fallback Interpolated Polyline
    if (polyline.length === 0) {
      polyline = generateInterpolatedPolyline(origin.coords, dest.coords, waypoints, 35);
    }

    const hours = Math.floor(durationMin / 60);
    const mins = durationMin % 60;
    const etaFormatted = hours > 0 ? `${hours} hrs ${mins} mins` : `${mins} mins`;

    return {
      originName: origin.name,
      originCoords: origin.coords,
      destinationName: dest.name,
      destinationCoords: dest.coords,
      polyline,
      distanceKm: Math.round(distanceKm * 10) / 10,
      durationMin,
      etaFormatted,
      isFromGoogleApi,
      cachedAt: new Date().toISOString(),
    };
  }

  /**
   * Aggregate POIs from Databases and Master Corridors
   */
  private static aggregateAllPoiCandidates(
    fromHubId: string,
    toHubId: string,
    hubs: Hub[],
    destinations: Destination[],
    attractions: Attraction[],
    homestays: Homestay[],
    options: EngineOptions
  ): JourneyPOI[] {
    const list: JourneyPOI[] = [];
    const seenIds = new Set<string>();

    const addPoi = (poi: JourneyPOI) => {
      if (!poi.id || seenIds.has(poi.id)) return;
      seenIds.add(poi.id);
      list.push(poi);
    };

    // 1. Master Set POIs
    MASTER_CORRIDOR_POIS.forEach((mPoi) => {
      const isPinned = options.adminPinStops && options.adminPinStops.includes(mPoi.id);
      addPoi({
        ...mPoi,
        isMandatory: mPoi.isMandatory || isPinned,
        chainageKm: 0,
        perpendicularDistanceKm: 0,
        arrivalOrder: 0,
        journeyScore: 0,
      });
    });

    // 2. Attractions from App State
    attractions.forEach((a) => {
      if (!a.id) return;
      const key = (a.id || '').toLowerCase();
      const reg = REGIONAL_COORDINATES[key] || REGIONAL_COORDINATES[toSlug(a.name)];
      const coords =
        a.latitude && a.longitude
          ? { lat: Number(a.latitude), lng: Number(a.longitude) }
          : reg
          ? { lat: reg.lat, lng: reg.lng }
          : null;

      if (!coords) return;

      let cat: POICategory = 'Viewpoint';
      if (a.category === 'Monastery') cat = 'Monastery';
      else if (a.category === 'Waterfall') cat = 'Waterfall';
      else if (a.category === 'Lake') cat = 'Lake';
      else if (a.category === 'Village') cat = 'Village';

      addPoi({
        id: `attr-${a.id}`,
        name: a.name,
        slug: a.slug || toSlug(a.name),
        category: cat,
        categoryLabel: a.category || 'Attraction',
        coords,
        description: a.description || 'Scenic point along the mountain pass.',
        image: a.image,
        elevationMeters: reg ? reg.alt : 1800,
        rating: 4.8,
        isMandatory: false,
        chainageKm: 0,
        perpendicularDistanceKm: 0,
        arrivalOrder: 0,
        journeyScore: 0,
        sourceType: 'attraction',
        rawRef: a,
      });
    });

    // 3. Destinations from App State
    destinations.forEach((d) => {
      if (!d.id) return;
      const key = (d.id || '').toLowerCase();
      const reg = REGIONAL_COORDINATES[key] || REGIONAL_COORDINATES[toSlug(d.name)];
      const coords =
        d.latitude && d.longitude
          ? { lat: Number(d.latitude), lng: Number(d.longitude) }
          : reg
          ? { lat: reg.lat, lng: reg.lng }
          : null;

      if (!coords) return;

      addPoi({
        id: `dest-${d.id}`,
        name: d.name,
        slug: d.slug || toSlug(d.name),
        category: 'Destination',
        categoryLabel: 'Mountain Destination',
        coords,
        description: d.description || 'Charming mountain settlement along the route.',
        image: d.image,
        elevationMeters: reg ? reg.alt : 1500,
        rating: 4.7,
        isMandatory: false,
        chainageKm: 0,
        perpendicularDistanceKm: 0,
        arrivalOrder: 0,
        journeyScore: 0,
        sourceType: 'destination',
        rawRef: d,
      });
    });

    // 4. Homestays from App State
    homestays.forEach((h) => {
      if (!h.id) return;
      const key = (h.id || '').toLowerCase();
      const reg = REGIONAL_COORDINATES[key] || REGIONAL_COORDINATES[toSlug(h.name)];
      const coords =
        (h as any).latitude && (h as any).longitude
          ? { lat: Number((h as any).latitude), lng: Number((h as any).longitude) }
          : reg
          ? { lat: reg.lat, lng: reg.lng }
          : null;

      if (!coords) return;

      addPoi({
        id: `home-${h.id}`,
        name: h.name,
        slug: (h as any).slug || toSlug(h.name),
        category: 'Homestay',
        categoryLabel: 'Himalayan Homestay',
        coords,
        description: (h as any).description || 'Warm local homestay experience.',
        image: (h as any).image,
        elevationMeters: reg ? reg.alt : 1600,
        rating: 4.9,
        isMandatory: false,
        chainageKm: 0,
        perpendicularDistanceKm: 0,
        arrivalOrder: 0,
        journeyScore: 0,
        sourceType: 'homestay',
        rawRef: h,
      });
    });

    return list;
  }

  /**
   * Validation Layer: Ensure POI strictly belongs to current route corridor
   */
  public static validatePoiForRoute(
    poi: Omit<JourneyPOI, 'chainageKm' | 'perpendicularDistanceKm' | 'arrivalOrder' | 'journeyScore'>,
    routeNav: RouteNavigationInfo,
    maxRadiusKm: number
  ): { isValid: boolean; spatial: { nearestSegmentIndex: number; projection: LatLng; chainageKm: number; perpendicularDistanceKm: number } } {
    if (!poi || !poi.coords || typeof poi.coords.lat !== 'number' || typeof poi.coords.lng !== 'number') {
      return {
        isValid: false,
        spatial: { nearestSegmentIndex: 0, projection: { lat: 0, lng: 0 }, chainageKm: 0, perpendicularDistanceKm: 999 },
      };
    }

    const spatial = calculateChainageAndDistance(poi.coords, routeNav.polyline);

    // 1. Strict Distance Filter: Must be within configured max radius (default 5km, max 10km)
    if (spatial.perpendicularDistanceKm > maxRadiusKm) {
      return { isValid: false, spatial };
    }

    // 2. Trajectory Bounds Filter: Must lie along route trajectory (between origin and destination + minor buffer)
    if (spatial.chainageKm < -0.5 || spatial.chainageKm > routeNav.distanceKm + 2.5) {
      return { isValid: false, spatial };
    }

    return { isValid: true, spatial };
  }

  /**
   * Compute Smart Ranking Score for a POI
   */
  private static calculateJourneyScore(
    poi: Omit<JourneyPOI, 'chainageKm' | 'perpendicularDistanceKm' | 'arrivalOrder' | 'journeyScore'>,
    offRouteKm: number,
    chainageKm: number,
    totalRouteDistanceKm: number,
    options: EngineOptions
  ): number {
    let score = 100;

    // 1. Admin Mandatory / Pinned Boost (+1000)
    if (poi.isMandatory || (options.adminPinStops && options.adminPinStops.includes(poi.id))) {
      score += 1000;
    }

    // 2. Admin Boosted (+300)
    if (options.boostedPoiIds && options.boostedPoiIds.includes(poi.id)) {
      score += 300;
    }

    // 3. Proximity to Highway Penalty
    score -= offRouteKm * 20;

    // 4. Category Weights
    const categoryWeights: Record<string, number> = {
      MandatoryStop: 500,
      Viewpoint: 80,
      Waterfall: 75,
      Monastery: 70,
      Lake: 90,
      Heritage: 65,
      TeaGarden: 60,
      Cafe: 55,
      Restaurant: 50,
      Checkpost: 85,
      EVCharger: 40,
      Fuel: 35,
      Hospital: 30,
    };

    score += categoryWeights[poi.category] || 20;

    // 5. Rating Weight
    if (poi.rating) {
      score += poi.rating * 10;
    }

    // 6. Mid-journey Distribution Bonus (POIs located 20% - 80% along route)
    const pct = totalRouteDistanceKm > 0 ? chainageKm / totalRouteDistanceKm : 0.5;
    if (pct >= 0.2 && pct <= 0.8) {
      score += 25;
    }

    return Math.round(score);
  }

  /**
   * Generate Clean Timeline Stops (Start -> Mandatory -> High Ranked POIs -> Destination)
   */
  private static generateTimelineStops(
    nav: RouteNavigationInfo,
    sortedCorridorPois: JourneyPOI[],
    activeRoute?: Route | null,
    hubs: Hub[] = [],
    destinations: Destination[] = [],
    options: EngineOptions = {}
  ): TimelineStopNode[] {
    const stops: TimelineStopNode[] = [];
    const isVerifiedRoute = Boolean(activeRoute?.verified) && Array.isArray(activeRoute?.path) && activeRoute!.path!.length > 0;

    // 1. Origin Node
    stops.push({
      id: 'timeline-origin',
      name: nav.originName,
      type: 'Origin',
      category: 'Taxi Base & Origin',
      chainageKm: 0,
      travelTimeMin: 0,
      description: `Initiate journey from ${nav.originName}. Check vehicle, fuel, and permit documents.`,
      elevationMeters: REGIONAL_COORDINATES[toSlug(nav.originName)]?.alt || 120,
      coords: nav.originCoords,
      image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/River%20(1).png',
      tips: activeRoute?.description ? `Route Note: ${activeRoute.description}` : 'Confirm taxi syndicate rate and driver contact before start.',
      durationStopText: 'Departs',
      isMandatory: true,
      journeyScore: 2000,
    });

    if (isVerifiedRoute && activeRoute?.path) {
      // Use verified route path nodes ONLY
      const maxRadiusKm = Math.min(Math.max(options.corridorWidthKm || 5.0, 1.0), 10.0);
      const intermediatePathSteps = activeRoute.path.slice(1, -1);
      const pathPois: JourneyPOI[] = [];

      intermediatePathSteps.forEach((stepName) => {
        const stepSlug = toSlug(stepName);
        const regKey = Object.keys(REGIONAL_COORDINATES).find(
          (k) => stepSlug.includes(k) || k.includes(stepSlug)
        );
        const reg = regKey ? REGIONAL_COORDINATES[regKey] : null;

        const matchingHub = hubs.find((h) => toSlug(h.name) === stepSlug || h.id.toLowerCase() === stepSlug);
        const matchingDest = destinations.find((d) => toSlug(d.name) === stepSlug || d.id.toLowerCase() === stepSlug);

        const coords = matchingHub?.latitude && matchingHub?.longitude
          ? { lat: Number(matchingHub.latitude), lng: Number(matchingHub.longitude) }
          : matchingDest?.latitude && matchingDest?.longitude
          ? { lat: Number(matchingDest.latitude), lng: Number(matchingDest.longitude) }
          : reg
          ? { lat: reg.lat, lng: reg.lng }
          : null;

        if (coords) {
          const spatial = calculateChainageAndDistance(coords, nav.polyline);
          if (
            spatial.perpendicularDistanceKm <= maxRadiusKm &&
            spatial.chainageKm > 0.5 &&
            spatial.chainageKm < nav.distanceKm - 0.5
          ) {
            pathPois.push({
              id: `path-step-${stepSlug}`,
              name: matchingHub?.name || matchingDest?.name || (stepName.charAt(0).toUpperCase() + stepName.slice(1)),
              slug: stepSlug,
              category: 'MandatoryStop',
              categoryLabel: 'Key Route Node',
              coords,
              description: `Verified transit node along the ${nav.originName} to ${nav.destinationName} highway corridor.`,
              image: matchingDest?.image || 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/taxi-stands/Himalayan%20Taxi%20Stand.png',
              elevationMeters: reg ? reg.alt : 1200,
              rating: 4.8,
              isMandatory: true,
              chainageKm: spatial.chainageKm,
              perpendicularDistanceKm: spatial.perpendicularDistanceKm,
              nearestSegmentIndex: spatial.nearestSegmentIndex,
              arrivalOrder: 0,
              journeyScore: 1000,
              sourceType: 'master_dataset',
              tips: 'Verified route corridor node.',
            });
          }
        }
      });

      pathPois.sort((a, b) => a.chainageKm - b.chainageKm);

      pathPois.forEach((poi) => {
        const travelTimeMin = nav.distanceKm > 0 ? Math.round((poi.chainageKm / nav.distanceKm) * nav.durationMin) : 0;
        stops.push({
          id: poi.id,
          name: poi.name,
          type: 'MandatoryStop',
          category: poi.categoryLabel,
          chainageKm: poi.chainageKm,
          travelTimeMin,
          description: poi.description,
          elevationMeters: poi.elevationMeters || 1500,
          coords: poi.coords,
          image: poi.image,
          tips: poi.tips,
          durationStopText: '10 mins stop',
          isMandatory: true,
          journeyScore: poi.journeyScore,
          poiRef: poi,
        });
      });
    } else {
      // Unverified route geometry: add status marker
      stops.push({
        id: 'timeline-unverified-status',
        name: 'Verified journey timeline unavailable',
        type: 'ScenicStop',
        category: 'Unverified Route Geometry',
        chainageKm: Math.round(nav.distanceKm * 0.5),
        travelTimeMin: Math.round(nav.durationMin * 0.5),
        description: 'Intermediate stops and geometry for this route have not yet been officially verified by the transport syndicate.',
        elevationMeters: 1000,
        coords: { lat: (nav.originCoords.lat + nav.destinationCoords.lat) / 2, lng: (nav.originCoords.lng + nav.destinationCoords.lng) / 2 },
        image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
        tips: 'Official syndicate timeline will be displayed once route path is verified.',
        durationStopText: 'Unverified',
        isMandatory: false,
        journeyScore: 0,
      });
    }

    // 4. Destination Node
    stops.push({
      id: 'timeline-destination',
      name: nav.destinationName,
      type: 'Destination',
      category: 'Destination Base',
      chainageKm: nav.distanceKm,
      travelTimeMin: nav.durationMin,
      description: `Arrive safely at ${nav.destinationName}. Check-in to homestays or explore local sightseeing.`,
      elevationMeters: REGIONAL_COORDINATES[toSlug(nav.destinationName)]?.alt || 1650,
      coords: nav.destinationCoords,
      image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/taxi-stands/Himalayan%20Taxi%20Stand.png',
      tips: 'Local taxis and walking promenades nearby.',
      durationStopText: 'Arrival',
      isMandatory: true,
      journeyScore: 2000,
    });

    return stops;
  }

  /**
   * Group Attractions Along Route by Category
   */
  private static generateAttractionsAlongRoute(corridorPois: JourneyPOI[]): GroupedCategoryAttractions[] {
    const categoriesMap: Record<string, { title: string; icon: string; items: JourneyPOI[] }> = {
      viewpoints: { title: 'Panoramic Viewpoints & Ridges', icon: 'Eye', items: [] },
      monasteries: { title: 'Sacred Monasteries & Shrines', icon: 'Building2', items: [] },
      waterfalls: { title: 'Waterfalls & River Confluences', icon: 'Droplets', items: [] },
      lakes: { title: 'High Alpine Lakes & Valleys', icon: 'Mountain', items: [] },
      tea_gardens: { title: 'Tea Gardens & Estates', icon: 'Leaf', items: [] },
      heritage: { title: 'Heritage Landmarks & Culture', icon: 'Shield', items: [] },
    };

    corridorPois.forEach((poi) => {
      if (poi.category === 'Viewpoint') categoriesMap.viewpoints.items.push(poi);
      else if (poi.category === 'Monastery') categoriesMap.monasteries.items.push(poi);
      else if (poi.category === 'Waterfall') categoriesMap.waterfalls.items.push(poi);
      else if (poi.category === 'Lake') categoriesMap.lakes.items.push(poi);
      else if (poi.category === 'TeaGarden') categoriesMap.tea_gardens.items.push(poi);
      else if (poi.category === 'Heritage' || poi.category === 'MandatoryStop') categoriesMap.heritage.items.push(poi);
    });

    return Object.entries(categoriesMap)
      .filter(([_, cat]) => cat.items.length > 0)
      .map(([key, cat]) => ({
        categoryKey: key,
        categoryTitle: cat.title,
        iconName: cat.icon,
        count: cat.items.length,
        items: cat.items.sort((a, b) => a.chainageKm - b.chainageKm),
      }));
  }

  /**
   * Dynamic "What's Next?" Recommendations from Journey Graph
   */
  private static generateWhatsNextRecommendations(
    fromHubId: string,
    toHubId: string,
    nav: RouteNavigationInfo,
    hubs: Hub[],
    destinations: Destination[]
  ): WhatsNextRecommendation[] {
    const list: WhatsNextRecommendation[] = [];
    const destSlug = toSlug(nav.destinationName);

    // 1. Continue Journey Recommendation
    if (destSlug.includes('gangtok')) {
      list.push({
        id: 'wn-continue-1',
        title: 'Gangtok → Tsomgo Lake & Nathu La Pass',
        type: 'Continue',
        typeLabel: 'Continue High Altitude Expedition',
        description: 'Ascend to 14,140 ft along the Indo-China Silk Route pass and glacial Tsomgo lake.',
        distance: '54 km',
        timeEstimate: '2.5 hrs',
        targetSlug: 'gangtok-to-tsomgo',
        badgeText: 'Permit Required',
        image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/Lake.png',
      });
      list.push({
        id: 'wn-circuit-1',
        title: 'Gangtok → Lachen & Gurudongmar Lake',
        type: 'Circuit',
        typeLabel: 'Multi-Day Expedition',
        description: '3-Day expedition into North Sikkim sacred glacial valleys and snowy rhododendron reserves.',
        distance: '180 km',
        timeEstimate: '3 Days',
        targetSlug: 'gangtok-to-lachen',
        badgeText: '3-Day Circuit',
        image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/High-Altitude%20Village.png',
      });
    } else if (destSlug.includes('darjeeling')) {
      list.push({
        id: 'wn-continue-2',
        title: 'Darjeeling → Mirik Lake via Tea Gardens',
        type: 'Continue',
        typeLabel: 'Scenic Day Circuit',
        description: 'Drive along Gopaldhara tea slopes, Pashupati Nepal border market, and Sumendu alpine lake.',
        distance: '49 km',
        timeEstimate: '2 hrs',
        targetSlug: 'darjeeling-to-mirik',
        badgeText: 'Tea Garden Drive',
        image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/Lake.png',
      });
    } else {
      list.push({
        id: 'wn-continue-default',
        title: `${nav.destinationName} → Gangtok Regional Hub`,
        type: 'Continue',
        typeLabel: 'Central Highway Link',
        description: `Direct highway transit connecting ${nav.destinationName} to East Sikkim regional capital.`,
        distance: '75 km',
        timeEstimate: '3 hrs',
        targetSlug: `${toSlug(nav.destinationName)}-to-gangtok`,
        badgeText: 'Popular Route',
        image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/taxi-stands/Himalayan%20Taxi%20Stand.png',
      });
    }

    // 2. Shared Jeep Option
    list.push({
      id: 'wn-shared-jeep',
      title: `${nav.originName} ↔ ${nav.destinationName} Shared Syndicate Jeep`,
      type: 'SharedJeep',
      typeLabel: 'Budget Shared Transit',
      description: 'Daily counter booking seats on Bolero / Sumo shared cabs departing hourly from main taxi stand.',
      distance: `${nav.distanceKm} km`,
      timeEstimate: nav.etaFormatted,
      targetSlug: `${toSlug(nav.originName)}-to-${toSlug(nav.destinationName)}`,
      badgeText: '₹250 - ₹450 / Seat',
      image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/taxi-stands/Himalayan%20Taxi%20Stand.png',
    });

    return list;
  }
}

// Export default helper function for fast component consumption
export async function getJourneyIntelligence(
  fromHubId: string,
  toHubId: string,
  activeRoute?: Route | null,
  hubs: Hub[] = [],
  destinations: Destination[] = [],
  attractions: Attraction[] = [],
  homestays: Homestay[] = [],
  options: EngineOptions = {}
): Promise<JourneyIntelligenceResult> {
  return JourneyIntelligenceEngine.generate(
    fromHubId,
    toHubId,
    activeRoute,
    hubs,
    destinations,
    attractions,
    homestays,
    options
  );
}
