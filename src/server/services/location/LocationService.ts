import { DESTINATION_STORAGE_ASSETS, ATTRACTION_STORAGE_ASSETS, HOMESTAY_STORAGE_ASSETS, TAXI_STAND_STORAGE_ASSETS, COMMON_STORAGE_ASSETS } from '../../../utils/imagePool';
import {
  LocationItem,
  EntityType,
  NearBySearchParams,
  NearBySearchResult,
  DistanceCalculationRequest,
  DistanceCalculationResult,
  RouteDefinition,
  TravelCircuit,
  GeoHierarchyNode,
  LocationAnalytics
} from '../../../types/location';
import { dbStore, getDistanceInKm } from '../../db';

// Haversine formula to compute spherical distance between two lat/lng coordinates in km - delegates to authoritative server helper
export function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  return getDistanceInKm(lat1, lon1, lat2, lon2);
}

// Simple Geohash encoder helper for spatial indexing
export function encodeGeohash(lat: number, lng: number, precision: number = 6): string {
  const BASE32 = '0123456789bcdefghjkmnpqrstuvwxyz';
  let isEven = true;
  let latMin = -90, latMax = 90;
  let lngMin = -180, lngMax = 180;
  let bit = 0;
  let ch = 0;
  let geohash = '';

  while (geohash.length < precision) {
    if (isEven) {
      const lngMid = (lngMin + lngMax) / 2;
      if (lng >= lngMid) {
        ch |= (1 << (4 - bit));
        lngMin = lngMid;
      } else {
        lngMax = lngMid;
      }
    } else {
      const latMid = (latMin + latMax) / 2;
      if (lat >= latMid) {
        ch |= (1 << (4 - bit));
        latMin = latMid;
      } else {
        latMax = latMid;
      }
    }

    isEven = !isEven;
    if (bit < 4) {
      bit++;
    } else {
      geohash += BASE32[ch];
      bit = 0;
      ch = 0;
    }
  }

  return geohash;
}

// Mountain road winding multiplier (Himalayan terrain factor usually 1.35x - 1.55x)
export function calculateRoadDistance(airDistanceKm: number, elevationDiffMeters: number = 0): number {
  if (airDistanceKm === 0) return 0;
  // Terrain multiplier for steep hills
  let factor = 1.42;
  if (elevationDiffMeters > 1000) factor = 1.55;
  const roadKm = airDistanceKm * factor;
  return Math.round(roadKm * 10) / 10;
}

// Travel time calculation in minutes based on travel mode
export function calculateTravelTimeMinutes(
  roadDistanceKm: number,
  mode: 'driving' | 'walking' | 'cycling' | 'public_transport' = 'driving'
): { minutes: number; formatted: string } {
  let speedKmh = 30; // Mountain driving avg 30 km/h
  if (mode === 'walking') speedKmh = 3.5;
  if (mode === 'cycling') speedKmh = 12;
  if (mode === 'public_transport') speedKmh = 22; // Shared jeeps / buses with stops

  const hours = roadDistanceKm / speedKmh;
  const totalMinutes = Math.round(hours * 60);

  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  let formatted = `${totalMinutes} mins`;
  if (hrs > 0) {
    formatted = `${hrs} hr ${mins} mins`;
  }

  return { minutes: totalMinutes, formatted };
}

// Pre-seeded Himalayan locations across Darjeeling, Kalimpong, Sikkim, Dooars & Nepal
const SEED_LOCATIONS: LocationItem[] = [
  {
    id: 'loc_dj_mall',
    entityId: 'dst_darjeeling',
    entityType: 'destination',
    name: 'Chowrasta Mall, Darjeeling',
    slug: 'chowrasta-darjeeling',
    description: 'The historic pedestrian plaza in the heart of Darjeeling town with majestic views of Kanchenjunga.',
    lat: 27.0428,
    lng: 88.2663,
    elevation: 2045,
    country: 'India',
    state: 'West Bengal',
    district: 'Darjeeling',
    subdivision: 'Darjeeling Sadar',
    destination: 'Darjeeling Town',
    village: 'Chowrasta',
    accuracy: 'exact',
    address: 'Chowrasta Mall Rd, Darjeeling, West Bengal 734101',
    tags: ['viewpoint', 'heritage', 'shopping', 'pedestrian_plaza'],
    imageUrl: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/View%20Point%20(1).png',
    rating: 4.8,
    reviewCount: 1420,
    isHidden: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'loc_tiger_hill',
    entityId: 'att_tiger_hill',
    entityType: 'attraction',
    name: 'Tiger Hill Sunrise Viewpoint',
    slug: 'tiger-hill-viewpoint',
    description: 'World-famous sunrise point offering panoramic views of Mount Everest and Mount Kanchenjunga.',
    lat: 26.9961,
    lng: 88.2863,
    elevation: 2590,
    country: 'India',
    state: 'West Bengal',
    district: 'Darjeeling',
    subdivision: 'Darjeeling Sadar',
    destination: 'Ghum / Senchal',
    accuracy: 'exact',
    address: 'Senchal Wildlife Sanctuary, Darjeeling, West Bengal 734102',
    tags: ['sunrise', 'kanchenjunga', 'nature', 'photography'],
    imageUrl: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
    rating: 4.9,
    reviewCount: 3100,
    isHidden: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'loc_ghum_monastery',
    entityId: 'att_ghum_monastery',
    entityType: 'attraction',
    name: 'Yiga Choeling (Ghum Monastery)',
    slug: 'yiga-choeling-ghum-monastery',
    description: 'Built in 1850, home to a 15-foot high statue of the Maitreya Buddha (Future Buddha).',
    lat: 27.0145,
    lng: 88.2589,
    elevation: 2225,
    country: 'India',
    state: 'West Bengal',
    district: 'Darjeeling',
    subdivision: 'Darjeeling Sadar',
    destination: 'Ghum',
    accuracy: 'exact',
    address: 'Ghum, Darjeeling, West Bengal 734102',
    tags: ['monastery', 'buddhism', 'heritage'],
    imageUrl: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/View%20Point%20(1).png',
    rating: 4.7,
    reviewCount: 890,
    isHidden: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'loc_kurseong_hub',
    entityId: 'dst_kurseong',
    entityType: 'destination',
    name: 'Kurseong Town & Eagle’s Craig',
    slug: 'kurseong-eagles-craig',
    description: 'The "Land of White Orchids", renowned for quiet tea gardens, pine forests, and sunset viewpoints.',
    lat: 26.8812,
    lng: 88.2789,
    elevation: 1458,
    country: 'India',
    state: 'West Bengal',
    district: 'Darjeeling',
    subdivision: 'Kurseong',
    destination: 'Kurseong',
    accuracy: 'exact',
    address: 'Eagle Craig Viewpoint, Kurseong, West Bengal 734203',
    tags: ['tea_gardens', 'quiet', 'sunset', 'orchids'],
    imageUrl: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/View%20Point%20(1).png',
    rating: 4.6,
    reviewCount: 610,
    isHidden: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'loc_mirik_lake',
    entityId: 'dst_mirik',
    entityType: 'destination',
    name: 'Sumendu Lake, Mirik',
    slug: 'sumendu-lake-mirik',
    description: 'A serene alpine lake surrounded by cardamon plantations, pine trees, and floating pontoon bridges.',
    lat: 26.8887,
    lng: 88.1812,
    elevation: 1495,
    country: 'India',
    state: 'West Bengal',
    district: 'Darjeeling',
    subdivision: 'Mirik',
    destination: 'Mirik',
    accuracy: 'exact',
    address: 'Mirik Lake Rd, Mirik, West Bengal 734214',
    tags: ['lake', 'boating', 'pine_trees', 'cardamom'],
    imageUrl: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/View%20Point%20(1).png',
    rating: 4.5,
    reviewCount: 1120,
    isHidden: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'loc_klp_delo',
    entityId: 'att_delo_park',
    entityType: 'attraction',
    name: 'Deolo Hill & Park, Kalimpong',
    slug: 'deolo-hill-kalimpong',
    description: 'The highest point in Kalimpong offering 360-degree views of the Teesta River valley and Kanchenjunga.',
    lat: 27.0854,
    lng: 88.4892,
    elevation: 1704,
    country: 'India',
    state: 'West Bengal',
    district: 'Kalimpong',
    subdivision: 'Kalimpong I',
    destination: 'Kalimpong Town',
    accuracy: 'exact',
    address: 'Deolo Hill, Kalimpong, West Bengal 734301',
    tags: ['paragliding', 'viewpoint', 'gardens', 'teesta_valley'],
    imageUrl: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/View%20Point%20(1).png',
    rating: 4.8,
    reviewCount: 1850,
    isHidden: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'loc_lava_monastery',
    entityId: 'dst_lava',
    entityType: 'destination',
    name: 'Lava Pine Forest & Kagyu Monastery',
    slug: 'lava-pine-forest',
    description: 'Gateway to Neora Valley National Park, famous for mist-clad pine forests and tranquil Tibetan Buddhist heritage.',
    lat: 27.0891,
    lng: 88.6621,
    elevation: 2138,
    country: 'India',
    state: 'West Bengal',
    district: 'Kalimpong',
    subdivision: 'Gorubathan',
    destination: 'Lava',
    accuracy: 'exact',
    address: 'Lava Bazaar, Kalimpong District, West Bengal 734319',
    tags: ['pine_forest', 'monastery', 'neora_valley', 'mist'],
    imageUrl: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/View%20Point%20(1).png',
    rating: 4.7,
    reviewCount: 780,
    isHidden: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'loc_rishyap_village',
    entityId: 'hs_rishyap',
    entityType: 'homestay',
    name: 'Rishyap Eco-Village Homestays',
    slug: 'rishyap-eco-village',
    description: 'A secluded Himalayan village with unobstructed views of the entire Kanchenjunga range.',
    lat: 27.1021,
    lng: 88.6492,
    elevation: 2591,
    country: 'India',
    state: 'West Bengal',
    district: 'Kalimpong',
    subdivision: 'Gorubathan',
    destination: 'Rishyap',
    accuracy: 'exact',
    address: 'Rishyap Village, Kalimpong, West Bengal 734319',
    tags: ['eco_homestay', 'secluded', 'kanchenjunga', 'trekking'],
    imageUrl: 'undefined',
    rating: 4.9,
    reviewCount: 420,
    isHidden: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'loc_zuluk_silkroute',
    entityId: 'dst_zuluk',
    entityType: 'destination',
    name: 'Zuluk & Thambi View Point (Silk Route)',
    slug: 'zuluk-silk-route',
    description: 'The ancient trade route between India and Tibet featuring 32 hair-pin zig-zag road bends.',
    lat: 27.2512,
    lng: 88.7812,
    elevation: 2865,
    country: 'India',
    state: 'Sikkim',
    district: 'Pakyong',
    subdivision: 'Rongli',
    destination: 'Zuluk',
    accuracy: 'exact',
    address: 'Thambi View Point, Zuluk, East Sikkim 737131',
    tags: ['silk_route', 'zigzag_roads', 'snow', 'border_patrol'],
    imageUrl: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/View%20Point%20(1).png',
    rating: 4.9,
    reviewCount: 2100,
    isHidden: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'loc_mg_marg_gangtok',
    entityId: 'dst_gangtok',
    entityType: 'destination',
    name: 'MG Marg, Gangtok',
    slug: 'mg-marg-gangtok',
    description: 'Sikkim’s famous litter-free and spit-free pedestrian shopping street with cafes and mountain views.',
    lat: 27.3297,
    lng: 88.6133,
    elevation: 1650,
    country: 'India',
    state: 'Sikkim',
    district: 'Gangtok',
    subdivision: 'Gangtok Sadar',
    destination: 'Gangtok City',
    accuracy: 'exact',
    address: 'MG Marg, Gangtok, Sikkim 737101',
    tags: ['capital', 'pedestrian', 'cafes', 'shopping'],
    imageUrl: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
    rating: 4.8,
    reviewCount: 4100,
    isHidden: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'loc_tsomgo_lake',
    entityId: 'att_tsomgo_lake',
    entityType: 'attraction',
    name: 'Tsomgo (Changu) Lake & Nathula Pass',
    slug: 'tsomgo-lake-nathula',
    description: 'A glacial lake at 12,400 ft altitude surrounded by rugged mountains and Yak safari rides.',
    lat: 27.3742,
    lng: 88.7621,
    elevation: 3753,
    country: 'India',
    state: 'Sikkim',
    district: 'Gangtok',
    subdivision: 'Gangtok Sadar',
    destination: 'Tsomgo',
    accuracy: 'exact',
    address: 'Jawaharlal Nehru Road, East Sikkim 737101',
    tags: ['glacial_lake', 'snow', 'yak_safari', 'border_pass'],
    imageUrl: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/View%20Point%20(1).png',
    rating: 4.9,
    reviewCount: 3500,
    isHidden: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'loc_gurudongmar_lake',
    entityId: 'att_gurudongmar',
    entityType: 'attraction',
    name: 'Gurudongmar Lake, North Sikkim',
    slug: 'gurudongmar-lake',
    description: 'One of the highest lakes in the world at 17,800 ft altitude, sacred to Buddhists, Sikhs, and Hindus.',
    lat: 28.0258,
    lng: 88.7097,
    elevation: 5430,
    country: 'India',
    state: 'Sikkim',
    district: 'Mangan',
    subdivision: 'Chungthang',
    destination: 'Lachen',
    accuracy: 'exact',
    address: 'High Altitude Plateau, North Sikkim 737120',
    tags: ['high_altitude', 'sacred_lake', 'snow_peaks', 'expedition'],
    imageUrl: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/View%20Point%20(1).png',
    rating: 5.0,
    reviewCount: 1980,
    isHidden: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'loc_yumthang_valley',
    entityId: 'att_yumthang',
    entityType: 'attraction',
    name: 'Yumthang Valley of Flowers',
    slug: 'yumthang-valley-lachung',
    description: 'A river valley surrounded by snow-capped mountains, hot sulfur springs, and blooming rhododendrons.',
    lat: 27.8289,
    lng: 88.6922,
    elevation: 3560,
    country: 'India',
    state: 'Sikkim',
    district: 'Mangan',
    subdivision: 'Chungthang',
    destination: 'Lachung',
    accuracy: 'exact',
    address: 'Yumthang, North Sikkim 737120',
    tags: ['rhododendron', 'hot_springs', 'valley', 'flower_sanctuary'],
    imageUrl: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
    rating: 4.9,
    reviewCount: 2200,
    isHidden: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'loc_pelling_skywalk',
    entityId: 'dst_pelling',
    entityType: 'destination',
    name: 'Pelling Glass Skywalk & Chenrezig Statue',
    slug: 'pelling-skywalk',
    description: 'India’s first glass skywalk overlooking the magnificent 137-foot Chenrezig statue and Kanchenjunga.',
    lat: 27.3189,
    lng: 88.2391,
    elevation: 2150,
    country: 'India',
    state: 'Sikkim',
    district: 'Gyalshing',
    subdivision: 'Pelling',
    destination: 'Pelling',
    accuracy: 'exact',
    address: 'Sangachoeling, Pelling, West Sikkim 737113',
    tags: ['skywalk', 'glass_bridge', 'statue', 'west_sikkim'],
    imageUrl: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
    rating: 4.8,
    reviewCount: 1650,
    isHidden: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'loc_ravangla_buddha_park',
    entityId: 'att_buddha_park',
    entityType: 'attraction',
    name: 'Buddha Park (Tathagata Tsal), Ravangla',
    slug: 'buddha-park-ravangla',
    description: 'Features a colossal 130-foot copper-gilded statue of Shakyamuni Buddha amidst manicured gardens.',
    lat: 27.3121,
    lng: 88.3612,
    elevation: 2130,
    country: 'India',
    state: 'Sikkim',
    district: 'Namchi',
    subdivision: 'Ravangla',
    destination: 'Ravangla',
    accuracy: 'exact',
    address: 'Rabong, South Sikkim 737139',
    tags: ['buddha_statue', 'peaceful', 'south_sikkim', 'gardens'],
    imageUrl: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
    rating: 4.9,
    reviewCount: 2400,
    isHidden: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'loc_gorumara_lataguri',
    entityId: 'dst_dooars',
    entityType: 'destination',
    name: 'Gorumara National Park, Lataguri (Dooars)',
    slug: 'gorumara-national-park',
    description: 'The dense sub-tropical elephant & Indian one-horned rhinoceros sanctuary in the Himalayan foothills.',
    lat: 26.7589,
    lng: 88.7954,
    elevation: 110,
    country: 'India',
    state: 'West Bengal',
    district: 'Jalpaiguri',
    subdivision: 'Malbazar',
    destination: 'Lataguri',
    accuracy: 'exact',
    address: 'Lataguri, Jalpaiguri, West Bengal 735219',
    tags: ['wildlife_safari', 'rhino', 'jungle', 'dooars'],
    imageUrl: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
    rating: 4.7,
    reviewCount: 1540,
    isHidden: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'loc_siliguri_tnj_stand',
    entityId: 'tx_siliguri_junction',
    entityType: 'taxi_stand',
    name: 'Siliguri Junction Main Shared Taxi Stand',
    slug: 'siliguri-junction-taxi-stand',
    description: 'The primary transportation hub for shared and reserve taxis connecting Siliguri to Darjeeling, Sikkim, and Bhutan.',
    lat: 26.7271,
    lng: 88.4312,
    elevation: 122,
    country: 'India',
    state: 'West Bengal',
    district: 'Darjeeling',
    subdivision: 'Siliguri',
    destination: 'Siliguri City',
    accuracy: 'exact',
    address: 'Hill Cart Rd, Siliguri Junction, West Bengal 734001',
    tags: ['taxi_hub', 'transport', 'shared_jeeps', 'junction'],
    imageUrl: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/taxi-stands/Major%20Hill%20Town%20Taxi%20Stand.png',
    rating: 4.4,
    reviewCount: 920,
    isHidden: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Pre-seeded Popular Circuits
const SEED_CIRCUITS: TravelCircuit[] = [
  {
    id: 'crc_north_sikkim',
    circuitName: 'North Sikkim Alpine Expedition',
    slug: 'north-sikkim-expedition',
    region: 'North Sikkim',
    description: 'High altitude glacial circuit covering Chungthang, Lachen, Gurudongmar Lake (17,800 ft), Lachung, and Yumthang Valley.',
    recommendedDays: 4,
    routeId: 'rt_north_sikkim_circuit',
    highlights: ['Gurudongmar Lake (17,800 ft)', 'Yumthang Valley of Flowers', 'Zero Point (Yumesamdong)', 'Shingba Rhododendron Sanctuary'],
    suggestedItinerary: [
      { day: 1, title: 'Gangtok to Lachen', description: 'Drive via Mangan and Seven Sister Waterfalls to Lachen village.', overnightStay: 'Lachen Homestay', distanceKm: 120 },
      { day: 2, title: 'Gurudongmar Lake & Transfer to Lachung', description: 'Early morning 4 AM drive to sacred Gurudongmar Lake; return for lunch and drive to Lachung.', overnightStay: 'Lachung Alpine Retreat', distanceKm: 135 },
      { day: 3, title: 'Yumthang Valley & Zero Point', description: 'Explore Yumthang Valley hot springs and Zero Point snowfields.', overnightStay: 'Lachung Alpine Retreat', distanceKm: 70 },
      { day: 4, title: 'Lachung back to Gangtok', description: 'Scenic return drive visiting Singhik Viewpoint and Bhim Nala Falls.', overnightStay: 'Gangtok', distanceKm: 125 }
    ],
    featuredHomestaysCount: 18,
    featuredAttractionsCount: 8,
    bannerImage: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/View%20Point%20(1).png',
    isPublished: true
  },
  {
    id: 'crc_silk_route',
    circuitName: 'Ancient Silk Route Zig-Zag Circuit',
    slug: 'silk-route-sikkim',
    region: 'East Sikkim',
    description: 'Drive through 32 hairpin loops on the historic trade path connecting Bengal plains to Lhasa.',
    recommendedDays: 3,
    routeId: 'rt_silk_route_circuit',
    highlights: ['Zuluk 32 Hairpin Bends', 'Thambi View Point Sunset', 'Old Baba Mandir', 'Kupup Elephant Lake', 'Aritar Lake'],
    suggestedItinerary: [
      { day: 1, title: 'Siliguri/NJP to Aritar / Mankhim', description: 'Travel through Rangpo border to pristine Aritar Lampokhari Lake.', overnightStay: 'Aritar Lake Resort', distanceKm: 110 },
      { day: 2, title: 'Aritar to Zuluk & Nathang Valley', description: 'Traverse Rongli permit checkpost, Lingtham, and cross 32 hairpin loops at Thambi.', overnightStay: 'Nathang Valley Homestay', distanceKm: 65 },
      { day: 3, title: 'Nathang to Gangtok via Kupup Lake', description: 'Visit Kupup Elephant Lake, Old Baba Mandir, Tukla Valley, and descend to Gangtok.', overnightStay: 'Gangtok', distanceKm: 75 }
    ],
    featuredHomestaysCount: 24,
    featuredAttractionsCount: 10,
    bannerImage: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/View%20Point%20(1).png',
    isPublished: true
  },
  {
    id: 'crc_darjeeling_heritage',
    circuitName: 'Darjeeling Queen of Hills Circuit',
    slug: 'darjeeling-heritage-circuit',
    region: 'Darjeeling & Mirik',
    description: 'Classic Himalayan tea garden tour featuring UNESCO World Heritage Toy Train, Tiger Hill sunrise, and Mirik Lake.',
    recommendedDays: 3,
    routeId: 'rt_darjeeling_circuit',
    highlights: ['Tiger Hill Sunrise', 'Batasia Loop & Toy Train', 'Happy Valley Tea Estate', 'Mirik Sumendu Lake', 'Kurseong Eagle Craig'],
    suggestedItinerary: [
      { day: 1, title: 'Siliguri to Darjeeling via Kurseong', description: 'Scenic drive up Hill Cart Road alongside the DHR narrow gauge tracks.', overnightStay: 'Darjeeling Mall Homestay', distanceKm: 68 },
      { day: 2, title: 'Tiger Hill 4 AM Sunrise & 7 Points Sightseeing', description: 'Watch sunrise over Everest/Kanchenjunga, visit Ghum Monastery, Peace Pagoda, HMI.', overnightStay: 'Darjeeling Mall Homestay', distanceKm: 35 },
      { day: 3, title: 'Darjeeling to Mirik & Return to NJP', description: 'Drive via Simana Viewpoint (Nepal Border) to Mirik Lake for boating before descending to NJP.', overnightStay: 'NJP / Siliguri', distanceKm: 92 }
    ],
    featuredHomestaysCount: 42,
    featuredAttractionsCount: 14,
    bannerImage: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/View%20Point%20(1).png',
    isPublished: true
  }
];

// Pre-seeded Routes
const SEED_ROUTES: RouteDefinition[] = [
  {
    id: 'rt_north_sikkim_circuit',
    title: 'Gangtok - Lachen - Gurudongmar - Lachung - Yumthang Route',
    slug: 'gangtok-lachen-gurudongmar-lachung-yumthang',
    description: 'High-altitude scenic route traversing Chungthang confluence, alpine meadows, and cold desert lakes.',
    category: 'circuit',
    waypoints: [
      { id: 'wp1', name: 'Gangtok MG Marg', lat: 27.3297, lng: 88.6133, stopType: 'start' },
      { id: 'wp2', name: 'Mangan Town', lat: 27.5021, lng: 88.5291, stopType: 'dining' },
      { id: 'wp3', name: 'Chungthang Confluence', lat: 27.6012, lng: 88.6312, stopType: 'scenic' },
      { id: 'wp4', name: 'Lachen Village', lat: 27.7212, lng: 88.5512, stopType: 'stay' },
      { id: 'wp5', name: 'Gurudongmar Lake', lat: 28.0258, lng: 88.7097, stopType: 'scenic' },
      { id: 'wp6', name: 'Lachung Village', lat: 27.6912, lng: 88.7412, stopType: 'stay' },
      { id: 'wp7', name: 'Yumthang Valley', lat: 27.8289, lng: 88.6922, stopType: 'destination' }
    ],
    totalDistanceKm: 350,
    estimatedDurationHours: 14,
    difficulty: 'challenging',
    bestMonths: ['March', 'April', 'May', 'October', 'November'],
    tags: ['high_altitude', 'north_sikkim', 'snow', 'border_patrol'],
    coverImageUrl: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
    isPopularCircuit: true,
    district: 'Mangan',
    state: 'Sikkim',
    createdAt: new Date().toISOString()
  },
  {
    id: 'rt_silk_route_circuit',
    title: 'Siliguri - Aritar - Zuluk - Kupup - Gangtok Route',
    slug: 'siliguri-aritar-zuluk-kupup-gangtok',
    description: 'The ancient trade passage with 32 hairpin turns, high mountain passes, and border military history.',
    category: 'circuit',
    waypoints: [
      { id: 'wp10', name: 'Siliguri Junction', lat: 26.7271, lng: 88.4312, stopType: 'start' },
      { id: 'wp11', name: 'Rangpo Border Checkpost', lat: 27.1712, lng: 88.5312, stopType: 'waypoint' },
      { id: 'wp12', name: 'Aritar Lake', lat: 27.1892, lng: 88.6792, stopType: 'stay' },
      { id: 'wp13', name: 'Zuluk Village', lat: 27.2512, lng: 88.7812, stopType: 'stay' },
      { id: 'wp14', name: 'Thambi View Point', lat: 27.2712, lng: 88.7912, stopType: 'scenic' },
      { id: 'wp15', name: 'Kupup Elephant Lake', lat: 27.3512, lng: 88.8112, stopType: 'scenic' },
      { id: 'wp16', name: 'Gangtok City', lat: 27.3297, lng: 88.6133, stopType: 'destination' }
    ],
    totalDistanceKm: 250,
    estimatedDurationHours: 10,
    difficulty: 'moderate',
    bestMonths: ['March', 'April', 'May', 'September', 'October', 'November', 'December'],
    tags: ['silk_route', 'zigzag', 'east_sikkim', 'trade_path'],
    coverImageUrl: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
    isPopularCircuit: true,
    district: 'Pakyong',
    state: 'Sikkim',
    createdAt: new Date().toISOString()
  }
];

export function seedLocationData(): void {
  const data = (dbStore as any).data;
  if (!data.locations) data.locations = [];
  if (!data.routes) data.routes = [];
  if (!data.travelCircuits) data.travelCircuits = [];
  if (!data.geoIndex) data.geoIndex = {};

  let modified = false;

  if (data.locations.length === 0) {
    // Enrich with geohashes
    data.locations = SEED_LOCATIONS.map(loc => ({
      ...loc,
      geohash: encodeGeohash(loc.lat, loc.lng, 6)
    }));
    modified = true;
  }

  if (data.routes.length === 0) {
    data.routes = SEED_ROUTES;
    modified = true;
  }

  if (data.travelCircuits.length === 0) {
    data.travelCircuits = SEED_CIRCUITS;
    modified = true;
  }

  if (modified) {
    dbStore.save();
  }
}

// Service Engine Class
export class LocationPlatformService {
  
  // 1. Get all location items with filters
  static getLocations(query?: string, entityType?: EntityType, district?: string): LocationItem[] {
    const data = (dbStore as any).data;
    let locations: LocationItem[] = data.locations || [];

    // filter hidden
    locations = locations.filter(l => !l.isHidden);

    if (query) {
      const q = query.toLowerCase().trim();
      locations = locations.filter(
        l =>
          l.name.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.district.toLowerCase().includes(q) ||
          (l.tags && l.tags.some(t => t.toLowerCase().includes(q))) ||
          (l.address && l.address.toLowerCase().includes(q))
      );
    }

    if (entityType) {
      locations = locations.filter(l => l.entityType === entityType);
    }

    if (district) {
      locations = locations.filter(l => l.district.toLowerCase() === district.toLowerCase());
    }

    return locations;
  }

  // 2. Search Nearby POIs (Radius search)
  static searchNearby(params: NearBySearchParams): NearBySearchResult[] {
    const { lat, lng, radiusKm, entityTypes, query, district, limit = 50 } = params;
    const allLocations = this.getLocations(query, undefined, district);

    const results: NearBySearchResult[] = [];

    for (const loc of allLocations) {
      if (entityTypes && entityTypes.length > 0 && !entityTypes.includes(loc.entityType)) {
        continue;
      }

      const airKm = calculateHaversineDistance(lat, lng, loc.lat, loc.lng);
      if (airKm <= radiusKm) {
        const roadKm = calculateRoadDistance(airKm, Math.abs((loc.elevation || 1500) - 1500));
        const { minutes: travelTimeMinutes } = calculateTravelTimeMinutes(roadKm, 'driving');

        results.push({
          location: loc,
          distanceKm: airKm,
          roadDistanceKm: roadKm,
          travelTimeMinutes
        });
      }
    }

    // Sort strictly by distance ascending
    results.sort((a, b) => a.distanceKm - b.distanceKm);

    return results.slice(0, limit);
  }

  // 3. Distance & Travel Time Calculation between 2 points
  static calculateDistanceMatrix(req: DistanceCalculationRequest): DistanceCalculationResult {
    const airKm = calculateHaversineDistance(
      req.origin.lat,
      req.origin.lng,
      req.destination.lat,
      req.destination.lng
    );

    const roadKm = calculateRoadDistance(airKm, 800); // default terrain factor
    const { minutes, formatted } = calculateTravelTimeMinutes(roadKm, req.mode || 'driving');

    return {
      origin: req.origin,
      destination: req.destination,
      airDistanceKm: airKm,
      airDistanceMiles: Math.round(airKm * 0.621371 * 100) / 100,
      roadDistanceKm: roadKm,
      travelTimeMinutes: minutes,
      formattedDuration: formatted,
      terrainFactor: 1.42
    };
  }

  // 4. Create or Update Location Item
  static upsertLocation(itemData: Partial<LocationItem>): LocationItem {
    const data = (dbStore as any).data;
    data.locations = data.locations || [];

    let existingIndex = -1;
    if (itemData.id) {
      existingIndex = data.locations.findIndex((l: LocationItem) => l.id === itemData.id);
    } else if (itemData.slug) {
      existingIndex = data.locations.findIndex((l: LocationItem) => l.slug === itemData.slug);
    }

    const lat = itemData.lat || 27.0428;
    const lng = itemData.lng || 88.2663;

    if (existingIndex >= 0) {
      const updated: LocationItem = {
        ...data.locations[existingIndex],
        ...itemData,
        geohash: encodeGeohash(lat, lng, 6),
        updatedAt: new Date().toISOString()
      };
      data.locations[existingIndex] = updated;
      dbStore.save();
      return updated;
    } else {
      const newItem: LocationItem = {
        id: itemData.id || `loc_${Math.random().toString(36).substring(2, 9)}`,
        entityId: itemData.entityId || `entity_${Math.random().toString(36).substring(2, 9)}`,
        entityType: itemData.entityType || 'destination',
        name: itemData.name || 'New Himalayan Point',
        slug: itemData.slug || `point-${Math.random().toString(36).substring(2, 7)}`,
        description: itemData.description || '',
        lat,
        lng,
        elevation: itemData.elevation || 1500,
        geohash: encodeGeohash(lat, lng, 6),
        country: itemData.country || 'India',
        state: itemData.state || 'West Bengal',
        district: itemData.district || 'Darjeeling',
        subdivision: itemData.subdivision || 'Darjeeling Sadar',
        destination: itemData.destination || 'Darjeeling',
        accuracy: itemData.accuracy || 'verified_gps',
        tags: itemData.tags || [],
        imageUrl: itemData.imageUrl || 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
        rating: itemData.rating || 4.5,
        reviewCount: itemData.reviewCount || 10,
        isHidden: itemData.isHidden || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      data.locations.push(newItem);
      dbStore.save();
      return newItem;
    }
  }

  // 5. Get Routes & Circuits
  static getRoutes(): RouteDefinition[] {
    const data = (dbStore as any).data;
    return data.routes || [];
  }

  static getCircuits(): TravelCircuit[] {
    const data = (dbStore as any).data;
    return data.travelCircuits || [];
  }

  // 6. Get Location Hierarchy Nodes
  static getLocationHierarchy(): GeoHierarchyNode[] {
    const locations = this.getLocations();

    const hierarchyMap = new Map<string, GeoHierarchyNode>();

    // Country Node
    hierarchyMap.set('c_india', { id: 'c_india', name: 'India', type: 'country' });

    locations.forEach(loc => {
      // State
      const stateId = `st_${loc.state.toLowerCase().replace(/\s+/g, '_')}`;
      if (!hierarchyMap.has(stateId)) {
        hierarchyMap.set(stateId, { id: stateId, name: loc.state, type: 'state', parentId: 'c_india' });
      }

      // District
      const distId = `dt_${loc.district.toLowerCase().replace(/\s+/g, '_')}`;
      if (!hierarchyMap.has(distId)) {
        hierarchyMap.set(distId, { id: distId, name: loc.district, type: 'district', parentId: stateId });
      }

      // Subdivision
      if (loc.subdivision) {
        const subId = `sub_${loc.subdivision.toLowerCase().replace(/\s+/g, '_')}`;
        if (!hierarchyMap.has(subId)) {
          hierarchyMap.set(subId, { id: subId, name: loc.subdivision, type: 'subdivision', parentId: distId });
        }
      }
    });

    return Array.from(hierarchyMap.values());
  }

  // 7. Analytics
  static getAnalytics(): LocationAnalytics {
    const locations = this.getLocations();
    const routes = this.getRoutes();
    const circuits = this.getCircuits();

    const byEntityType: Record<EntityType, number> = {
      destination: 0,
      attraction: 0,
      homestay: 0,
      taxi_stand: 0,
      taxi_operator: 0,
      business: 0,
      guide: 0,
      activity: 0,
      route: 0,
      hub: 0,
      hospital: 0,
      restaurant: 0,
      viewpoint: 0
    };

    const byDistrict: Record<string, number> = {};

    locations.forEach(l => {
      if (byEntityType[l.entityType] !== undefined) {
        byEntityType[l.entityType]++;
      } else {
        byEntityType[l.entityType] = 1;
      }

      if (byDistrict[l.district]) {
        byDistrict[l.district]++;
      } else {
        byDistrict[l.district] = 1;
      }
    });

    return {
      totalLocations: locations.length,
      totalRoutes: routes.length,
      totalCircuits: circuits.length,
      byEntityType,
      byDistrict,
      mostSearchedGeohashes: [
        { geohash: 'tu1y', count: 420 }, // Darjeeling
        { geohash: 'tu4e', count: 310 }, // Gangtok
        { geohash: 'tu1w', count: 280 }  // Kalimpong
      ]
    };
  }
}
