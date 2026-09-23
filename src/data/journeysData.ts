import { DESTINATION_STORAGE_ASSETS, ATTRACTION_STORAGE_ASSETS, HOMESTAY_STORAGE_ASSETS, TAXI_STAND_STORAGE_ASSETS, COMMON_STORAGE_ASSETS, getDestinationImage, getAttractionImage } from '../utils/imagePool';
// src/data/journeysData.ts
import { 
  Star, Flame, Mountain, Navigation, Calendar, Leaf, Droplets, 
  Snowflake, Compass, Heart, Users, Camera, Shield, Train, DollarSign, Sunrise, Sparkles, MapPin, Eye
} from 'lucide-react';

export interface CuratedJourney {
  id: string;
  name: string;
  region: string; // 'North Bengal' | 'Sikkim' | 'Both'
  duration: string; // '1 Day', '2 Days', '3 Days', '4+ Days', 'Half Day'
  durationCategory: 'Half Day' | '1 Day' | '2 Days' | '3 Days' | '4+ Days';
  distance: string;
  estimatedTime: string;
  scenicRating: number;
  attractionCount: number;
  homestayCount: number;
  journeyStops?: string[];
  tags: string[];
  journeyScore: number;
  image: string;
  description: string;
  categories: string[];
  bestSeason: 'Spring' | 'Summer' | 'Monsoon' | 'Autumn' | 'Winter';
  travelStyle: 'Scenic' | 'Adventure' | 'Family' | 'Photography' | 'Road Trip' | 'Romantic';
  fromHubId: string;
  fromName?: string;
  toName?: string;
  toHubId: string;
  slug: string;
  isCircuit?: boolean;
}

export interface LocationOption {
  id: string;
  name: string;
  sub?: string;
  type?: string;
}

export interface HubCardData {
  id: string;
  name: string;
  code?: string;
  region: string;
  type: string;
  journeyCount: number;
  image: string;
  popularDestination: string;
}

// Exactly 6 Premium Circuits for Preview Section
export const FEATURED_CIRCUITS: CuratedJourney[] = [
  {
    id: 'north-sikkim-circuit',
    name: 'North Sikkim Circuit',
    region: 'Sikkim',
    duration: '4 Days',
    durationCategory: '4+ Days',
    distance: '525 km',
    estimatedTime: '12-14 hrs total drive',
    scenicRating: 5.0,
    attractionCount: 18,
    homestayCount: 34,
    journeyStops: ['Gangtok', 'Mangan', 'Lachen', 'Gurudongmar Lake', 'Lachung', 'Yumthang Valley'],
    tags: ['High Altitude Glaciers', 'Sacred Lakes', 'Rhododendron Valley'],
    journeyScore: 9.9,
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Pine%20Forest%20Village.png',
    description: 'The ultimate Himalayan road expedition climbing from temperate forests to the 17,800 ft glacial waters of Gurudongmar Lake and Zero Point.',
    categories: ['featured', 'circuits', 'snow', 'adventure', 'photography', 'scenic'],
    bestSeason: 'Spring',
    travelStyle: 'Adventure',
    fromHubId: 'gangtok',
    toHubId: 'lachen',
    slug: 'north-sikkim-circuit',
    isCircuit: true
  },
  {
    id: 'silk-route-circuit',
    name: 'Silk Route Circuit',
    region: 'Sikkim',
    duration: '3 Days',
    durationCategory: '3 Days',
    distance: '185 km',
    estimatedTime: '6-8 hrs drive',
    scenicRating: 4.9,
    attractionCount: 14,
    homestayCount: 26,
    journeyStops: ['Siliguri', 'Rongli', 'Zuluk Hairpins', 'Gnathang Valley', 'Kupup Lake', 'Gangtok'],
    tags: ['32 Hairpin Bends', 'Old Silk Route', 'Kanchenjunga Sunrise'],
    journeyScore: 9.8,
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/View%20Point%20(1).png',
    description: 'Navigate the legendary zigzag curves of the ancient trade corridor with panoramic views over Thambi viewpoint and Elephant Lake.',
    categories: ['featured', 'circuits', 'scenic', 'weekend', 'roadtrip', 'photography'],
    bestSeason: 'Autumn',
    travelStyle: 'Scenic',
    fromHubId: 'siliguri',
    toHubId: 'zuluk',
    slug: 'silk-route-circuit',
    isCircuit: true
  },
  {
    id: 'sandakphu-circuit',
    name: 'Sandakphu Circuit',
    region: 'North Bengal',
    duration: '4 Days',
    durationCategory: '4+ Days',
    distance: '110 km',
    estimatedTime: 'Vintage Land Rover Drive',
    scenicRating: 5.0,
    attractionCount: 12,
    homestayCount: 15,
    journeyStops: ['Manebhanjan', 'Tonglu', 'Gairibas', 'Kalipokhri', 'Sandakphu Ridge', 'Phalut'],
    tags: ['Four 8000m Peaks', 'Singalila Sanctuary', 'Everest Panorama'],
    journeyScore: 9.9,
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/High-Altitude%20Village.png',
    description: 'Traverse West Bengal highest mountain ridge witnessing Everest, Kanchenjunga, Lhotse, and Makalu simultaneously.',
    categories: ['featured', 'circuits', 'adventure', 'photography', 'snow'],
    bestSeason: 'Autumn',
    travelStyle: 'Adventure',
    fromHubId: 'manebhanjan',
    toHubId: 'sandakphu',
    slug: 'sandakphu-circuit',
    isCircuit: true
  },
  {
    id: 'tea-garden-circuit',
    name: 'Tea Garden Circuit',
    region: 'North Bengal',
    duration: '2 Days',
    durationCategory: '2 Days',
    distance: '95 km',
    estimatedTime: '3-4 hrs drive',
    scenicRating: 4.8,
    attractionCount: 16,
    homestayCount: 42,
    journeyStops: ['Siliguri', 'Kurseong Makaibari', 'Ghoom', 'Darjeeling Heritage Slopes', 'Lamahatta Pines'],
    tags: ['Makaibari Estate', 'Colonial Tea Bungalows', 'Emerald Valleys'],
    journeyScore: 9.6,
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Tea%20Garden%20Village.png',
    description: 'Immerse in heritage British tea estates, rolling emerald tea slopes, and colonial planter homestays across Darjeeling & Kurseong.',
    categories: ['featured', 'circuits', 'teagarden', 'family', 'weekend', 'romantic'],
    bestSeason: 'Spring',
    travelStyle: 'Family',
    fromHubId: 'siliguri',
    toHubId: 'darjeeling',
    slug: 'tea-garden-circuit',
    isCircuit: true
  },
  {
    id: 'waterfall-circuit',
    name: 'Waterfall Circuit',
    region: 'North Bengal & Sikkim',
    duration: '2 Days',
    durationCategory: '2 Days',
    distance: '135 km',
    estimatedTime: '4-5 hrs drive',
    scenicRating: 4.7,
    attractionCount: 11,
    homestayCount: 24,
    journeyStops: ['Kalimpong', 'Changey Waterfalls', 'Rishop Mist', 'Rimbi Falls Pelling', 'Kanchenjunga Falls'],
    tags: ['Cascading Waterfalls', 'Mist Valleys', 'Pine Canopy Streams'],
    journeyScore: 9.5,
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/Waterfall%20(1).png',
    description: 'Discover roaring mountain cascades, hidden forest streams, and mist-wrapped suspension bridges across Kalimpong & Pelling.',
    categories: ['featured', 'circuits', 'waterfall', 'scenic', 'romantic'],
    bestSeason: 'Monsoon',
    travelStyle: 'Scenic',
    fromHubId: 'kalimpong',
    toHubId: 'pelling',
    slug: 'waterfall-circuit',
    isCircuit: true
  },
  {
    id: 'toy-train-circuit',
    name: 'Toy Train Circuit',
    region: 'North Bengal',
    duration: '1 Day',
    durationCategory: '1 Day',
    distance: '88 km',
    estimatedTime: 'Heritage Steam Ride & Drive',
    scenicRating: 4.9,
    attractionCount: 10,
    homestayCount: 30,
    journeyStops: ['Siliguri Junction', 'Kurseong Station', 'Batasia Loop', 'Ghoom High Altitude Station', 'Darjeeling Town'],
    tags: ['UNESCO World Heritage', 'Batasia Loop Spiral', 'Ghoom Steam Railway'],
    journeyScore: 9.7,
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Tea%20Garden%20Village.png',
    description: 'Follow the historic 1881 Darjeeling Himalayan Railway corridor along mountain roads, steam loops, and high ridge stations.',
    categories: ['featured', 'circuits', 'family', 'photography'],
    bestSeason: 'Winter',
    travelStyle: 'Family',
    fromHubId: 'siliguri',
    toHubId: 'darjeeling',
    slug: 'toy-train-circuit',
    isCircuit: true
  }
];

// Individual Point A -> Point B Popular Journeys
export const POPULAR_POINT_TO_POINT_JOURNEYS: CuratedJourney[] = [
  {
    id: 'njp-to-gangtok',
    name: 'NJP Railway Station → Gangtok',
    fromName: 'NJP Railway Station',
    toName: 'Gangtok',
    region: 'Sikkim',
    duration: '1 Day',
    durationCategory: '1 Day',
    distance: '120 km',
    estimatedTime: '4 hrs drive',
    scenicRating: 4.8,
    attractionCount: 9,
    homestayCount: 45,
    tags: ['Teesta River Gorge', 'Coronation Bridge', 'Capital Highway'],
    journeyScore: 9.7,
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Typical%20Himalayan%20Village.png',
    description: 'Primary Himalayan gateway route following the emerald Teesta River up into Sikkim capital city of Gangtok.',
    categories: ['trending', 'scenic', 'roadtrip'],
    bestSeason: 'Autumn',
    travelStyle: 'Road Trip',
    fromHubId: 'njp',
    toHubId: 'gangtok',
    slug: 'njp-to-gangtok'
  },
  {
    id: 'siliguri-to-darjeeling',
    name: 'Siliguri → Darjeeling',
    fromName: 'Siliguri',
    toName: 'Darjeeling',
    region: 'North Bengal',
    duration: '1 Day',
    durationCategory: '1 Day',
    distance: '68 km',
    estimatedTime: '2.5 hrs drive',
    scenicRating: 4.9,
    attractionCount: 12,
    homestayCount: 52,
    tags: ['Makaibari Tea Estate', 'Rohini Zigzags', 'Kurseong Pine View'],
    journeyScore: 9.8,
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Tea%20Garden%20Village.png',
    description: 'Iconic hill climb through Rohini tea slopes and Kurseong pine ridge highways straight to the Queen of Hills.',
    categories: ['trending', 'teagarden', 'family', 'scenic'],
    bestSeason: 'Spring',
    travelStyle: 'Scenic',
    fromHubId: 'siliguri',
    toHubId: 'darjeeling',
    slug: 'siliguri-to-darjeeling'
  },
  {
    id: 'gangtok-to-tsomgo',
    name: 'Gangtok → Tsomgo Lake',
    fromName: 'Gangtok',
    toName: 'Tsomgo Lake',
    region: 'Sikkim',
    duration: 'Half Day',
    durationCategory: 'Half Day',
    distance: '38 km',
    estimatedTime: '1.5 hrs drive',
    scenicRating: 4.9,
    attractionCount: 8,
    homestayCount: 12,
    tags: ['12,400 ft Alpine Waters', 'Yak Rides', 'Baba Harbhajan Shrine'],
    journeyScore: 9.7,
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Pine%20Forest%20Village.png',
    description: 'Ascend to 12,400 ft sacred glacial Tsomgo Lake surrounded by snow peaks and high altitude alpine views.',
    categories: ['trending', 'snow', 'scenic'],
    bestSeason: 'Winter',
    travelStyle: 'Scenic',
    fromHubId: 'gangtok',
    toHubId: 'tsomgo',
    slug: 'gangtok-to-tsomgo-lake'
  },
  {
    id: 'darjeeling-to-lamahatta',
    name: 'Darjeeling → Lamahatta',
    fromName: 'Darjeeling',
    toName: 'Lamahatta',
    region: 'North Bengal',
    duration: 'Half Day',
    durationCategory: 'Half Day',
    distance: '23 km',
    estimatedTime: '1 hr drive',
    scenicRating: 4.8,
    attractionCount: 5,
    homestayCount: 18,
    tags: ['Eco-Park Pines', 'Sacred Hilltop Lake', 'Tea Viewpoints'],
    journeyScore: 9.4,
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Tea%20Garden%20Village.png',
    description: 'Serene pine forest ridge drive leading to tranquil eco-park walking trails and tea estate views.',
    categories: ['trending', 'weekend', 'teagarden', 'romantic'],
    bestSeason: 'Spring',
    travelStyle: 'Romantic',
    fromHubId: 'darjeeling',
    toHubId: 'lamahatta',
    slug: 'darjeeling-to-lamahatta'
  },
  {
    id: 'kalimpong-to-lava',
    name: 'Kalimpong → Lava',
    fromName: 'Kalimpong',
    toName: 'Lava',
    region: 'North Bengal',
    duration: 'Half Day',
    durationCategory: 'Half Day',
    distance: '32 km',
    estimatedTime: '1.2 hrs drive',
    scenicRating: 4.7,
    attractionCount: 6,
    homestayCount: 16,
    tags: ['Misty Pines', 'Neora Valley Gateway', 'Lava Monastery'],
    journeyScore: 9.3,
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Pine%20Forest%20Village.png',
    description: 'Winding forest highway through orchid ridges leading into misty high-altitude pine sanctuary of Lava.',
    categories: ['trending', 'scenic', 'weekend'],
    bestSeason: 'Autumn',
    travelStyle: 'Scenic',
    fromHubId: 'kalimpong',
    toHubId: 'lava',
    slug: 'kalimpong-to-lava'
  },
  {
    id: 'siliguri-to-mirik',
    name: 'Siliguri → Mirik',
    fromName: 'Siliguri',
    toName: 'Mirik',
    region: 'North Bengal',
    duration: '1 Day',
    durationCategory: '1 Day',
    distance: '49 km',
    estimatedTime: '1.8 hrs drive',
    scenicRating: 4.8,
    attractionCount: 7,
    homestayCount: 20,
    tags: ['Sumendu Lake Boating', 'Cardamom Orchards', 'Gopaldhara Tea Estate'],
    journeyScore: 9.3,
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Tea%20Garden%20Village.png',
    description: 'Smooth, picturesque hill drive from Siliguri through famous Gopaldhara tea slopes to Sumendu Lake.',
    categories: ['teagarden', 'family', 'weekend'],
    bestSeason: 'Spring',
    travelStyle: 'Family',
    fromHubId: 'siliguri',
    toHubId: 'mirik',
    slug: 'siliguri-to-mirik'
  }
];

export const POPULAR_JOURNEYS = POPULAR_POINT_TO_POINT_JOURNEYS;
export const ALL_CURATED_JOURNEYS = [...FEATURED_CIRCUITS, ...POPULAR_POINT_TO_POINT_JOURNEYS];

// Explore by Journey Type Categories
export const JOURNEY_TYPES_LIST = [
  { id: 'scenic', name: 'Scenic Drives', icon: Mountain, color: 'bg-emerald-500/15 text-emerald-800 border-emerald-300', tag: 'Panorama' },
  { id: 'weekend', name: 'Weekend Escapes', icon: Calendar, color: 'bg-purple-500/15 text-purple-800 border-purple-300', tag: '1-2 Days' },
  { id: 'family', name: 'Family Journeys', icon: Users, color: 'bg-amber-600/15 text-amber-900 border-amber-300', tag: 'Comfort' },
  { id: 'adventure', name: 'Adventure', icon: Compass, color: 'bg-rose-500/15 text-rose-800 border-rose-300', tag: 'Thrilling' },
  { id: 'photography', name: 'Photography', icon: Camera, color: 'bg-indigo-500/15 text-indigo-800 border-indigo-300', tag: 'Vistas' },
  { id: 'romantic', name: 'Romantic', icon: Heart, color: 'bg-pink-500/15 text-pink-800 border-pink-300', tag: 'Couples' },
  { id: 'waterfall', name: 'Waterfall Escapes', icon: Droplets, color: 'bg-cyan-500/15 text-cyan-800 border-cyan-300', tag: 'Cascades' },
  { id: 'teagarden', name: 'Tea Garden Trails', icon: Leaf, color: 'bg-emerald-600/15 text-emerald-900 border-emerald-400', tag: 'Heritage' },
  { id: 'snow', name: 'Snow Journeys', icon: Snowflake, color: 'bg-sky-500/15 text-sky-800 border-sky-300', tag: 'Alpine' },
  { id: 'toytrain', name: 'Toy Train Experiences', icon: Train, color: 'bg-amber-500/15 text-amber-800 border-amber-300', tag: 'UNESCO' }
];

export const CATEGORY_ITEMS = JOURNEY_TYPES_LIST;

// Individual Seasonal Point A -> Point B Journeys
export const SEASONAL_JOURNEYS_MAP = [
  {
    id: 'spring',
    seasonName: 'Spring',
    icon: '🌸',
    title: '🌸 Spring Blossoms (Mar - May)',
    desc: 'Vibrant rhododendron flower blooms, lush green tea garden flushes, and ideal mountain weather.',
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Tea%20Garden%20Village.png',
    journeys: [
      {
        name: 'Gangtok → Yumthang Valley',
        distance: '128 km',
        time: '5 hrs drive',
        badge: 'Rhododendron Bloom',
        slug: 'gangtok-to-yumthang'
      },
      {
        name: 'Siliguri → Makaibari Tea Estate',
        distance: '42 km',
        time: '1.5 hrs drive',
        badge: 'First Flush Tea',
        slug: 'siliguri-to-makaibari'
      },
      {
        name: 'Darjeeling → Mirik Gopaldhara',
        distance: '49 km',
        time: '2 hrs drive',
        badge: 'Spring Orchards',
        slug: 'darjeeling-to-mirik'
      }
    ]
  },
  {
    id: 'summer',
    seasonName: 'Summer',
    icon: '☀️',
    title: '☀️ Summer Escapes (Jun)',
    desc: 'Cool mountain climate escaping the plains heat, shaded pine forest drives, and family retreats.',
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Pine%20Forest%20Village.png',
    journeys: [
      {
        name: 'Darjeeling → Pelling Skywalk',
        distance: '72 km',
        time: '3 hrs drive',
        badge: 'Cool Mountain Air',
        slug: 'darjeeling-to-pelling'
      },
      {
        name: 'Kalimpong → Lolegaon Pine Forest',
        distance: '34 km',
        time: '1.2 hrs drive',
        badge: 'Canopy Walk',
        slug: 'kalimpong-to-lolegaon'
      },
      {
        name: 'Siliguri → Kurseong Dow Hill',
        distance: '38 km',
        time: '1.2 hrs drive',
        badge: 'Pine Canopy Drive',
        slug: 'siliguri-to-kurseong'
      }
    ]
  },
  {
    id: 'monsoon',
    seasonName: 'Monsoon',
    icon: '🌧️',
    title: '🌧️ Monsoon Drives (Jul - Sep)',
    desc: 'Cascading waterfalls in full force, mist-shrouded green valleys, and peaceful off-season tranquility.',
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/Waterfall%20(1).png',
    journeys: [
      {
        name: 'Siliguri → Teesta River Gorge',
        distance: '52 km',
        time: '1.8 hrs drive',
        badge: 'Roaring Cascades',
        slug: 'siliguri-to-teesta'
      },
      {
        name: 'Kalimpong → Changey Waterfalls',
        distance: '38 km',
        time: '1.5 hrs drive',
        badge: 'Full Water Volume',
        slug: 'kalimpong-to-changey'
      },
      {
        name: 'Gangtok → Bakthang Falls Drive',
        distance: '12 km',
        time: '30 mins drive',
        badge: 'Mist Valley Trail',
        slug: 'gangtok-to-bakthang'
      }
    ]
  },
  {
    id: 'autumn',
    seasonName: 'Autumn',
    icon: '🍁',
    title: '🍁 Autumn Colors (Oct - Nov)',
    desc: 'Peak season with crystal clear panoramic views of the entire Kanchenjunga range and vibrant festivals.',
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/View%20Point%20(1).png',
    journeys: [
      {
        name: 'Siliguri → Darjeeling Tiger Hill',
        distance: '68 km',
        time: '2.5 hrs drive',
        badge: '100% Clear Sunrise',
        slug: 'siliguri-to-darjeeling'
      },
      {
        name: 'Gangtok → Tsomgo Lake',
        distance: '38 km',
        time: '1.5 hrs drive',
        badge: 'Crystal Blue Waters',
        slug: 'gangtok-to-tsomgo-lake'
      },
      {
        name: 'Manebhanjan → Sandakphu Summit',
        distance: '32 km',
        time: 'Land Rover Expedition',
        badge: 'Four 8000m Peaks',
        slug: 'sandakphu-adventure'
      }
    ]
  },
  {
    id: 'winter',
    seasonName: 'Winter',
    icon: '❄️',
    title: '❄️ Winter Journeys (Dec - Feb)',
    desc: 'Clear blue skies, crisp mountain air, frozen high-altitude lakes, and snowy high passes.',
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/Lake.png',
    journeys: [
      {
        name: 'Gangtok → Nathula Pass Snow Border',
        distance: '54 km',
        time: '2.5 hrs drive',
        badge: 'Snow Pass Drive',
        slug: 'gangtok-to-nathula'
      },
      {
        name: 'Lachen → Gurudongmar Frozen Lake',
        distance: '66 km',
        time: '3 hrs drive',
        badge: '17,800 ft Glacial Ice',
        slug: 'lachen-to-gurudongmar'
      },
      {
        name: 'Siliguri → Zuluk Snow Hairpins',
        distance: '95 km',
        time: '4 hrs drive',
        badge: 'Silk Route Snow Loops',
        slug: 'siliguri-to-zuluk'
      }
    ]
  }
];

export const SEASONAL_ITEMS = SEASONAL_JOURNEYS_MAP;

// Major Travel Hubs (Start From)
export const MAJOR_TRAVEL_HUBS: HubCardData[] = [
  {
    id: 'njp',
    name: 'NJP Railway Station',
    code: 'NJP',
    region: 'Siliguri Junction',
    type: 'Railway Terminal',
    journeyCount: 42,
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
    popularDestination: 'Gateway to Gangtok, Darjeeling & Dooars'
  },
  {
    id: 'bagdogra',
    name: 'Bagdogra Airport',
    code: 'IXB',
    region: 'Airport Terminal',
    type: 'Flight Terminal',
    journeyCount: 36,
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
    popularDestination: 'Direct Airport Taxis to All Hill Stations'
  },
  {
    id: 'siliguri',
    name: 'Siliguri City',
    code: 'SGL',
    region: 'Transit Capital',
    type: 'Commercial Hub',
    journeyCount: 48,
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
    popularDestination: 'Central Point for North Bengal & Sikkim'
  },
  {
    id: 'darjeeling',
    name: 'Darjeeling Town',
    code: 'DJ',
    region: 'North Bengal',
    type: 'Hill Station',
    journeyCount: 28,
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
    popularDestination: 'Journeys to Lamahatta, Mirik & Kalimpong'
  },
  {
    id: 'gangtok',
    name: 'Gangtok Capital',
    code: 'GTK',
    region: 'East Sikkim',
    type: 'State Capital',
    journeyCount: 32,
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
    popularDestination: 'Journeys to Tsomgo, Nathula & North Sikkim'
  },
  {
    id: 'kalimpong',
    name: 'Kalimpong Ridge',
    code: 'KPG',
    region: 'North Bengal',
    type: 'Colonial Hill Hub',
    journeyCount: 22,
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Typical%20Himalayan%20Village.png',
    popularDestination: 'Journeys to Lava, Rishop & Pedong'
  }
];

// Journey Collections (Point A -> Point B Collections)
export const POINT_TO_POINT_COLLECTIONS = [
  {
    id: 'hidden-gems',
    title: 'Hidden Gems',
    subtitle: 'Offbeat secret villages, sacred groves & quiet riverbanks',
    count: '15 Journeys',
    badge: 'Offbeat',
    icon: Shield,
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Typical%20Himalayan%20Village.png',
    sampleJourneys: ['Kalimpong → Pedong Silk Ridge', 'Darjeeling → Chota Mangwa', 'Siliguri → Sitong Orange Village']
  },
  {
    id: 'family-friendly',
    title: 'Family Friendly',
    subtitle: 'Smooth roads, comfortable homestays & kid-friendly attractions',
    count: '20 Journeys',
    badge: 'Comfort',
    icon: Users,
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Typical%20Himalayan%20Village.png',
    sampleJourneys: ['Siliguri → Mirik Lake Drive', 'Siliguri → Darjeeling Tea Tour', 'Gangtok → Rumtek Monastery']
  },
  {
    id: 'budget-friendly',
    title: 'Budget Friendly',
    subtitle: 'Economical shared & private routes with scenic homestay options',
    count: '24 Journeys',
    badge: 'Value',
    icon: DollarSign,
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Typical%20Himalayan%20Village.png',
    sampleJourneys: ['NJP → Kurseong Ridge', 'Siliguri → Lataguri Dooars', 'Kalimpong → Teesta Bazaar']
  },
  {
    id: 'luxury-escapes',
    title: 'Luxury Escapes',
    subtitle: 'Premium SUV drives to heritage colonial estates & luxury resorts',
    count: '12 Journeys',
    badge: 'Premium',
    icon: Star,
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Pine%20Forest%20Village.png',
    sampleJourneys: ['Bagdogra → Glenburn Tea Estate', 'Gangtok → Mayfair Resort Drive', 'Darjeeling → Windamere Ridge']
  },
  {
    id: 'wildlife-safaris',
    title: 'Wildlife Safaris',
    subtitle: 'Rainforest corridors, rhino sanctuaries & elephant watchtowers',
    count: '14 Journeys',
    badge: 'Nature',
    icon: Compass,
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Pine%20Forest%20Village.png',
    sampleJourneys: ['Siliguri → Gorumara National Park', 'Bagdogra → Jaldapara Rhino Sanctuary', 'Kalimpong → Neora Valley Forest']
  },
  {
    id: 'sunrise-viewpoints',
    title: 'Sunrise Viewpoints',
    subtitle: 'Early morning drives to panoramic Kanchenjunga view ridges',
    count: '10 Journeys',
    badge: 'Golden Hour',
    icon: Sunrise,
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/High-Altitude%20Village.png',
    sampleJourneys: ['Darjeeling → Tiger Hill Sunrise', 'Zuluk → Thambi Viewpoint', 'Pelling → Sangacholing Skywalk']
  },
  {
    id: 'scenic-road-trips',
    title: 'Scenic Road Trips',
    subtitle: 'Sweeping hairpins, river gorges & high altitude highways',
    count: '29 Journeys',
    badge: 'Road Trip',
    icon: Mountain,
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Pine%20Forest%20Village.png',
    sampleJourneys: ['Siliguri → Kalimpong Teesta Gorge', 'Gangtok → Tsomgo Alpine Pass', 'Darjeeling → Pashupati Nepal Border']
  }
];

export const JOURNEY_COLLECTIONS = POINT_TO_POINT_COLLECTIONS;

export const POPULAR_DESTINATIONS = [
  {
    name: 'Gangtok',
    region: 'East Sikkim',
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Pine%20Forest%20Village.png',
    tag: 'Monasteries & Alpine Lakes',
    slug: 'gangtok'
  },
  {
    name: 'Darjeeling',
    region: 'North Bengal',
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Pine%20Forest%20Village.png',
    tag: 'Tea Estates & Toy Train',
    slug: 'darjeeling'
  },
  {
    name: 'Kalimpong',
    region: 'North Bengal',
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Pine%20Forest%20Village.png',
    tag: 'Orchid Nurseries & Pines',
    slug: 'kalimpong'
  },
  {
    name: 'Lava',
    region: 'North Bengal',
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/High-Altitude%20Village.png',
    tag: 'Misty Neora Pines',
    slug: 'lava'
  },
  {
    name: 'Lachen',
    region: 'North Sikkim',
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/High-Altitude%20Village.png',
    tag: 'Gurudongmar Gateway',
    slug: 'lachen'
  },
  {
    name: 'Lachung',
    region: 'North Sikkim',
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/High-Altitude%20Village.png',
    tag: 'Yumthang Valley of Flowers',
    slug: 'lachung'
  },
  {
    name: 'Mirik',
    region: 'North Bengal',
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Pine%20Forest%20Village.png',
    tag: 'Sumendu Lake & Orchards',
    slug: 'mirik'
  },
  {
    name: 'Dooars',
    region: 'North Bengal',
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Pine%20Forest%20Village.png',
    tag: 'Rainforest & Rhino Safaris',
    slug: 'dooars'
  }
];

export const DEFAULT_LOCATIONS: LocationOption[] = [
  { id: 'siliguri', name: 'Siliguri', sub: 'Hub City & Junction', type: 'Hub' },
  { id: 'bagdogra', name: 'Bagdogra Airport (IXB)', sub: 'Primary Flight Terminal', type: 'Airport' },
  { id: 'njp', name: 'NJP Railway Station', sub: 'Major Rail Terminal', type: 'Railway' },
  { id: 'gangtok', name: 'Gangtok', sub: 'Capital of Sikkim', type: 'Destination' },
  { id: 'darjeeling', name: 'Darjeeling', sub: 'Queen of Hills & Tea Heritage', type: 'Destination' },
  { id: 'kalimpong', name: 'Kalimpong', sub: 'Orchid Valleys & Colonial Ridge', type: 'Destination' },
  { id: 'pelling', name: 'Pelling', sub: 'Kanchenjunga Views & Skywalk', type: 'Destination' },
  { id: 'lachen', name: 'Lachen', sub: 'Gurudongmar Lake Gateway', type: 'North Sikkim' },
  { id: 'lachung', name: 'Lachung', sub: 'Yumthang Valley of Flowers', type: 'North Sikkim' },
  { id: 'mirik', name: 'Mirik', sub: 'Sumendu Lake & Gopaldhara', type: 'Destination' },
  { id: 'zuluk', name: 'Zuluk', sub: 'Ancient Silk Route Hairpins', type: 'East Sikkim' }
];

// ==========================================
// 4. LOOP JOURNEYS (Circular Trips)
// ==========================================
export interface LoopJourney {
  id: string;
  title: string;
  startHub: string;
  region: string;
  totalDistance: string;
  totalDuration: string;
  recommendedTime: string;
  stops: string[];
  image: string;
  description: string;
  highlights: string[];
  slug: string;
}

export const LOOP_JOURNEYS: LoopJourney[] = [
  {
    id: 'gangtok-south-sikkim-loop',
    title: 'Gangtok South Sikkim Circuit Loop',
    startHub: 'Gangtok',
    region: 'Sikkim',
    totalDistance: '185 km',
    totalDuration: '1-2 Days',
    recommendedTime: 'Full Day or 2 Days',
    stops: ['Gangtok', 'Rumtek Monastery', 'Temi Tea Garden', 'Namchi Char Dham', 'Ravangla Buddha Park', 'Gangtok'],
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Tea%20Garden%20Village.png',
    description: 'A complete circular voyage through South Sikkim starting in Gangtok, descending through Temi organic tea slopes to Namchi Char Dham, and returning via Ravangla Buddha Park.',
    highlights: ['Organic Tea Estate Drive', '108 ft Solophok Statue', 'Golden Buddha Park', 'Zero Backtracking'],
    slug: 'gangtok-rumtek-temi-namchi-gangtok-loop'
  },
  {
    id: 'darjeeling-tea-pine-loop',
    title: 'Darjeeling Offbeat Ridge Loop',
    startHub: 'Darjeeling',
    region: 'North Bengal',
    totalDistance: '78 km',
    totalDuration: '1 Day',
    recommendedTime: '6-7 Hours Drive',
    stops: ['Darjeeling', 'Takdah Heritage', 'Tinchuley Viewpoint', 'Lamahatta Sacred Pines', 'Darjeeling'],
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Tea%20Garden%20Village.png',
    description: 'Escape the town traffic on a seamless circular mountain loop visiting British colonial cantonments, orange orchards, and high-altitude pine parks before returning to Darjeeling.',
    highlights: ['British Bungalows', '360° Kanchenjunga Vistas', 'Sacred Forest Lake', 'Lush Pine Canopy'],
    slug: 'darjeeling-takdah-tinchuley-lamahatta-darjeeling-loop'
  },
  {
    id: 'siliguri-mirik-kurseong-loop',
    title: 'Siliguri Foothills & Tea Loop',
    startHub: 'Siliguri',
    region: 'North Bengal',
    totalDistance: '124 km',
    totalDuration: '1 Day',
    recommendedTime: 'Full Day Excursion',
    stops: ['Siliguri', 'Mirik Lake', 'Pashupati Nepal Border', 'Kurseong Makaibari', 'Siliguri'],
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Tea%20Garden%20Village.png',
    description: 'Climb via Mirik Sumendu Lake and Gopaldhara tea hills, skirt along the Nepal border market at Pashupati, descend through historic Kurseong Makaibari tea gardens back to Siliguri.',
    highlights: ['Sumendu Lake Boating', 'Nepal Border Market', 'Makaibari Heritage Tea', 'Rohini Zigzag Highway'],
    slug: 'siliguri-mirik-pashupati-kurseong-siliguri-loop'
  },
  {
    id: 'kalimpong-misty-pine-loop',
    title: 'Kalimpong Misty Neora Loop',
    startHub: 'Kalimpong',
    region: 'North Bengal',
    totalDistance: '92 km',
    totalDuration: '1 Day',
    recommendedTime: '5-6 Hours Drive',
    stops: ['Kalimpong', 'Lava Monastery', 'Rishop Pine Ridge', 'Pedong Silk Route', 'Kalimpong'],
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Pine%20Forest%20Village.png',
    description: 'Loop through the ancient Trade Silk Route foothills of Eastern Kalimpong, penetrating deep into misty Neora pine sanctuaries and hilltop monasteries.',
    highlights: ['Neora Valley Sanctuary Edge', 'Rishop Panoramic Ridge', 'Pedong Fort Ruins', 'Orchid Nurseries'],
    slug: 'kalimpong-lava-rishop-pedong-kalimpong-loop'
  }
];

// ==========================================
// 5. JOURNEY WEB (Local Journey Network)
// ==========================================
export interface JourneySpoke {
  name: string;
  toSlug: string;
  distance: string;
  duration: string;
  roadQuality: 'Excellent' | 'Good' | 'Fair' | 'Winding High Altitude';
  highlights: string[];
  taxiFareEstimate: string;
}

export interface JourneyWebHub {
  hubId: string;
  hubName: string;
  tagline: string;
  image: string;
  totalRoutes: number;
  spokes: JourneySpoke[];
}

export const JOURNEY_WEB_DATA: JourneyWebHub[] = [
  {
    hubId: 'gangtok',
    hubName: 'Gangtok',
    tagline: 'Capital Hub for Alpine Lakes, High Passes & Monasteries',
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/Lake.png',
    totalRoutes: 284,
    spokes: [
      {
        name: 'Tsomgo Lake & Nathula',
        toSlug: 'gangtok-to-tsomgo-lake',
        distance: '38 km',
        duration: '1.5 hrs',
        roadQuality: 'Winding High Altitude',
        highlights: ['12,400 ft Alpine Lake', 'Border Pass', 'Yak Rides'],
        taxiFareEstimate: '₹2,800 - ₹3,500'
      },
      {
        name: 'Rumtek Monastery',
        toSlug: 'gangtok-to-rumtek',
        distance: '24 km',
        duration: '1 hr',
        roadQuality: 'Good',
        highlights: ['Golden Stupa', 'Dharma Chakra Centre', 'Valley Views'],
        taxiFareEstimate: '₹1,200 - ₹1,600'
      },
      {
        name: 'Namchi Char Dham',
        toSlug: 'gangtok-to-namchi',
        distance: '78 km',
        duration: '2.5 hrs',
        roadQuality: 'Good',
        highlights: ['Solophok Statue', 'Samdruptse Hill', 'Temi Tea Views'],
        taxiFareEstimate: '₹3,200 - ₹4,000'
      },
      {
        name: 'Ravangla Buddha Park',
        toSlug: 'gangtok-to-ravangla',
        distance: '65 km',
        duration: '2.2 hrs',
        roadQuality: 'Good',
        highlights: ['130ft Buddha Statue', 'Maenam Wildlife', 'Peace Gardens'],
        taxiFareEstimate: '₹2,800 - ₹3,500'
      },
      {
        name: 'Mangan & North Sikkim',
        toSlug: 'gangtok-to-mangan',
        distance: '68 km',
        duration: '2.5 hrs',
        roadQuality: 'Fair',
        highlights: ['Seven Sisters Waterfall', 'Cardamom Hills', 'Permit Checkpost'],
        taxiFareEstimate: '₹3,500 - ₹4,200'
      }
    ]
  },
  {
    hubId: 'darjeeling',
    hubName: 'Darjeeling',
    tagline: 'Queen of Hills, Heritage Railways & Tea Estate Slopes',
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/Waterfall%20(1).png',
    totalRoutes: 196,
    spokes: [
      {
        name: 'Mirik Sumendu Lake',
        toSlug: 'darjeeling-to-mirik',
        distance: '49 km',
        duration: '1.8 hrs',
        roadQuality: 'Excellent',
        highlights: ['Gopaldhara Tea Estate', 'Pine Forest Lake', 'Orange Orchards'],
        taxiFareEstimate: '₹2,200 - ₹2,800'
      },
      {
        name: 'Lamahatta Pines',
        toSlug: 'darjeeling-to-lamahatta',
        distance: '23 km',
        duration: '1 hr',
        roadQuality: 'Good',
        highlights: ['Eco-Park Walking Trails', 'Hilltop Sacred Pond', 'Tea Slope Vistas'],
        taxiFareEstimate: '₹1,500 - ₹2,000'
      },
      {
        name: 'Takdah & Tinchuley',
        toSlug: 'darjeeling-to-takdah',
        distance: '28 km',
        duration: '1.2 hrs',
        roadQuality: 'Good',
        highlights: ['British Colonial Bungalows', 'Orchid Centre', 'Gumbabadara Rock'],
        taxiFareEstimate: '₹1,800 - ₹2,200'
      },
      {
        name: 'Tiger Hill Sunrise',
        toSlug: 'darjeeling-to-tiger-hill',
        distance: '11 km',
        duration: '35 mins',
        roadQuality: 'Good',
        highlights: ['Golden Kanchenjunga', 'Batasia Loop Spiral', 'Early Morning Drive'],
        taxiFareEstimate: '₹1,200 - ₹1,500'
      },
      {
        name: 'Pashupati Market (Nepal)',
        toSlug: 'darjeeling-to-pashupati',
        distance: '32 km',
        duration: '1.2 hrs',
        roadQuality: 'Good',
        highlights: ['Nepal International Border', 'Tax-Free Shopping', 'Pine Ridge Drive'],
        taxiFareEstimate: '₹1,800 - ₹2,200'
      }
    ]
  },
  {
    hubId: 'kalimpong',
    hubName: 'Kalimpong',
    tagline: 'Orchid Ridge, Colonial Mansions & Neora Valley Corridor',
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/taxi-stands/Mountain%20Road.png',
    totalRoutes: 142,
    spokes: [
      {
        name: 'Lava Pine Forest',
        toSlug: 'kalimpong-to-lava',
        distance: '32 km',
        duration: '1.2 hrs',
        roadQuality: 'Good',
        highlights: ['Misty Neora Pines', 'Lava Monastery', 'Canopy Walkway'],
        taxiFareEstimate: '₹1,800 - ₹2,200'
      },
      {
        name: 'Rishop Mountain View',
        toSlug: 'kalimpong-to-rishop',
        distance: '38 km',
        duration: '1.5 hrs',
        roadQuality: 'Fair',
        highlights: ['Unobstructed Kanchenjunga', 'Quiet Offbeat Village', 'Pine Trails'],
        taxiFareEstimate: '₹2,000 - ₹2,500'
      },
      {
        name: 'Pedong Silk Ridge',
        toSlug: 'kalimpong-to-pedong',
        distance: '20 km',
        duration: '45 mins',
        roadQuality: 'Good',
        highlights: ['Damsang Fort Ruins', 'Reshi River Gateway', 'Ancient Silk Trade Route'],
        taxiFareEstimate: '₹1,200 - ₹1,600'
      },
      {
        name: 'Teesta Bazaar & Rafting',
        toSlug: 'kalimpong-to-teesta',
        distance: '16 km',
        duration: '35 mins',
        roadQuality: 'Excellent',
        highlights: ['Emerald River Gorge', 'White Water Rafting', 'Chitrey Bridge'],
        taxiFareEstimate: '₹1,000 - ₹1,400'
      }
    ]
  },
  {
    hubId: 'siliguri',
    hubName: 'Siliguri / NJP',
    tagline: 'Primary Himalayan Transit Gateway connecting Plains to Hills',
    image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/taxi-stands/Mountain%20Road.png',
    totalRoutes: 390,
    spokes: [
      {
        name: 'Gangtok Capital Highway',
        toSlug: 'siliguri-to-gangtok',
        distance: '115 km',
        duration: '3.8 hrs',
        roadQuality: 'Excellent',
        highlights: ['Teesta River Gorge Drive', 'Coronation Bridge', 'Rangpo Border Checkpost'],
        taxiFareEstimate: '₹3,500 - ₹4,500'
      },
      {
        name: 'Darjeeling Hill Highway',
        toSlug: 'siliguri-to-darjeeling',
        distance: '68 km',
        duration: '2.5 hrs',
        roadQuality: 'Excellent',
        highlights: ['Rohini Tea Zigzags', 'Kurseong Pine View', 'Batasia Loop Approach'],
        taxiFareEstimate: '₹2,800 - ₹3,500'
      },
      {
        name: 'Kalimpong Teesta Gorge',
        toSlug: 'siliguri-to-kalimpong',
        distance: '67 km',
        duration: '2.2 hrs',
        roadQuality: 'Excellent',
        highlights: ['Coronation Bridge', 'Teesta River Parkway', 'Durpin Dara Ascent'],
        taxiFareEstimate: '₹2,500 - ₹3,200'
      },
      {
        name: 'Gorumara Dooars Rainforest',
        toSlug: 'siliguri-to-gorumara',
        distance: '72 km',
        duration: '2 hrs',
        roadQuality: 'Excellent',
        highlights: ['Jalpaiguri Green Corridor', 'Rhino Elephant Watchtowers', 'Gajoldoba Barrage'],
        taxiFareEstimate: '₹2,500 - ₹3,000'
      }
    ]
  }
];

// ==========================================
// 6. JOURNEY TREE (Global Hierarchy)
// ==========================================
export interface TreeNode {
  id: string;
  name: string;
  type: 'hub' | 'subhub' | 'destination';
  distanceFromParent?: string;
  timeFromParent?: string;
  slug?: string;
  children?: TreeNode[];
}

export const GLOBAL_JOURNEY_TREE: TreeNode = {
  id: 'root-siliguri',
  name: 'NJP / Bagdogra / Siliguri (Main Gateway)',
  type: 'hub',
  children: [
    {
      id: 'tree-gangtok',
      name: 'Gangtok (East Sikkim Capital)',
      type: 'subhub',
      distanceFromParent: '115 km',
      timeFromParent: '3.8 hrs',
      slug: 'siliguri-to-gangtok',
      children: [
        {
          id: 'tree-tsomgo',
          name: 'Tsomgo Lake & Nathula Pass',
          type: 'destination',
          distanceFromParent: '38 km',
          timeFromParent: '1.5 hrs',
          slug: 'gangtok-to-tsomgo-lake'
        },
        {
          id: 'tree-rumtek',
          name: 'Rumtek Monastery',
          type: 'destination',
          distanceFromParent: '24 km',
          timeFromParent: '1 hr',
          slug: 'gangtok-to-rumtek'
        },
        {
          id: 'tree-namchi',
          name: 'Namchi (Solophok Char Dham)',
          type: 'destination',
          distanceFromParent: '78 km',
          timeFromParent: '2.5 hrs',
          slug: 'gangtok-to-namchi'
        },
        {
          id: 'tree-ravangla',
          name: 'Ravangla (Buddha Park)',
          type: 'destination',
          distanceFromParent: '65 km',
          timeFromParent: '2.2 hrs',
          slug: 'gangtok-to-ravangla'
        },
        {
          id: 'tree-mangan',
          name: 'Mangan (North Sikkim Gateway)',
          type: 'subhub',
          distanceFromParent: '68 km',
          timeFromParent: '2.5 hrs',
          slug: 'gangtok-to-mangan',
          children: [
            {
              id: 'tree-lachen',
              name: 'Lachen (Gurudongmar Lake 17,800ft)',
              type: 'destination',
              distanceFromParent: '29 km',
              timeFromParent: '1.5 hrs',
              slug: 'mangan-to-lachen'
            },
            {
              id: 'tree-lachung',
              name: 'Lachung (Yumthang Valley of Flowers)',
              type: 'destination',
              distanceFromParent: '48 km',
              timeFromParent: '2 hrs',
              slug: 'mangan-to-lachung'
            }
          ]
        }
      ]
    },
    {
      id: 'tree-darjeeling',
      name: 'Darjeeling (Queen of Hills)',
      type: 'subhub',
      distanceFromParent: '68 km',
      timeFromParent: '2.5 hrs',
      slug: 'siliguri-to-darjeeling',
      children: [
        {
          id: 'tree-mirik',
          name: 'Mirik (Sumendu Lake & Gopaldhara)',
          type: 'destination',
          distanceFromParent: '49 km',
          timeFromParent: '1.8 hrs',
          slug: 'darjeeling-to-mirik'
        },
        {
          id: 'tree-lamahatta',
          name: 'Lamahatta (Sacred Pine Park)',
          type: 'destination',
          distanceFromParent: '23 km',
          timeFromParent: '1 hr',
          slug: 'darjeeling-to-lamahatta'
        },
        {
          id: 'tree-takdah',
          name: 'Takdah & Tinchuley',
          type: 'destination',
          distanceFromParent: '28 km',
          timeFromParent: '1.2 hrs',
          slug: 'darjeeling-to-takdah'
        },
        {
          id: 'tree-manebhanjan',
          name: 'Manebhanjan (Sandakphu Ridge)',
          type: 'subhub',
          distanceFromParent: '26 km',
          timeFromParent: '1 hr',
          slug: 'darjeeling-to-manebhanjan',
          children: [
            {
              id: 'tree-sandakphu',
              name: 'Sandakphu Summit (Four 8000m Peaks)',
              type: 'destination',
              distanceFromParent: '32 km',
              timeFromParent: '3.5 hrs (Land Rover)',
              slug: 'manebhanjan-to-sandakphu'
            }
          ]
        }
      ]
    },
    {
      id: 'tree-kalimpong',
      name: 'Kalimpong (Orchid & Pine Ridge)',
      type: 'subhub',
      distanceFromParent: '67 km',
      timeFromParent: '2.2 hrs',
      slug: 'siliguri-to-kalimpong',
      children: [
        {
          id: 'tree-lava',
          name: 'Lava (Neora Valley Gateway)',
          type: 'destination',
          distanceFromParent: '32 km',
          timeFromParent: '1.2 hrs',
          slug: 'kalimpong-to-lava'
        },
        {
          id: 'tree-rishop',
          name: 'Rishop (Panoramas & Pines)',
          type: 'destination',
          distanceFromParent: '38 km',
          timeFromParent: '1.5 hrs',
          slug: 'kalimpong-to-rishop'
        },
        {
          id: 'tree-pedong',
          name: 'Pedong (Silk Route Fort)',
          type: 'destination',
          distanceFromParent: '20 km',
          timeFromParent: '45 mins',
          slug: 'kalimpong-to-pedong'
        }
      ]
    },
    {
      id: 'tree-dooars',
      name: 'Dooars Rainforest Corridor',
      type: 'subhub',
      distanceFromParent: '72 km',
      timeFromParent: '2 hrs',
      slug: 'siliguri-to-gorumara',
      children: [
        {
          id: 'tree-gorumara',
          name: 'Gorumara National Park (Rhino Sanctuary)',
          type: 'destination',
          distanceFromParent: '15 km',
          timeFromParent: '30 mins',
          slug: 'lataguri-to-gorumara'
        },
        {
          id: 'tree-jaldapara',
          name: 'Jaldapara Elephant Safari',
          type: 'destination',
          distanceFromParent: '50 km',
          timeFromParent: '1.2 hrs',
          slug: 'gorumara-to-jaldapara'
        }
      ]
    }
  ]
};

// ==========================================
// 7. WHERE CAN I GO? (Time Radius Reachability)
// ==========================================
export interface ReachableDestination {
  name: string;
  timeBracket: 'within30Min' | 'within1Hour' | 'withinHalfDay' | 'within1Day';
  timeLabel: string;
  distance: string;
  driveTime: string;
  image: string;
  highlights: string[];
  slug: string;
}

export interface HubReachability {
  originId: string;
  originName: string;
  destinations: ReachableDestination[];
}

export const WHERE_CAN_I_GO_DATA: HubReachability[] = [
  {
    originId: 'gangtok',
    originName: 'Gangtok',
    destinations: [
      {
        name: 'Ganesh Tok & Hanuman Tok',
        timeBracket: 'within30Min',
        timeLabel: 'Within 30 Minutes',
        distance: '6 km',
        driveTime: '20 mins',
        image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
        highlights: ['Panoramic Gangtok View', 'Sacred Ridge Temple', 'Kanchenjunga Telescope'],
        slug: 'gangtok-to-hanuman-tok'
      },
      {
        name: 'Rumtek Monastery',
        timeBracket: 'within1Hour',
        timeLabel: 'Within 1 Hour',
        distance: '24 km',
        driveTime: '50 mins',
        image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
        highlights: ['Golden Stupa', 'Kagyupa Seat', 'Pine Ridge Valley'],
        slug: 'gangtok-to-rumtek'
      },
      {
        name: 'Tsomgo Glacial Lake',
        timeBracket: 'withinHalfDay',
        timeLabel: 'Within Half Day',
        distance: '38 km',
        driveTime: '1.5 hrs',
        image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/Lake.png',
        highlights: ['12,400 ft Alpine Lake', 'Yak Rides', 'Snow Peaks'],
        slug: 'gangtok-to-tsomgo-lake'
      },
      {
        name: 'Ravangla Buddha Park',
        timeBracket: 'withinHalfDay',
        timeLabel: 'Within Half Day',
        distance: '65 km',
        driveTime: '2.2 hrs',
        image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/attractions/Lake.png',
        highlights: ['130ft Golden Buddha', 'Maenam Ridge', 'Temi Tea Views'],
        slug: 'gangtok-to-ravangla'
      },
      {
        name: 'Namchi Solophok Char Dham',
        timeBracket: 'within1Day',
        timeLabel: 'Within 1 Day',
        distance: '78 km',
        driveTime: '2.5 hrs',
        image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
        highlights: ['108ft Shiva Statue', 'Replicated Dham Temples', 'Rose Gardens'],
        slug: 'gangtok-to-namchi'
      },
      {
        name: 'Pelling Glass Skywalk',
        timeBracket: 'within1Day',
        timeLabel: 'Within 1 Day',
        distance: '115 km',
        driveTime: '3.8 hrs',
        image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
        highlights: ['Chenrezig Statue', 'First Himalayan Skywalk', 'Rabdentse Palace Ruins'],
        slug: 'gangtok-to-pelling'
      }
    ]
  },
  {
    originId: 'darjeeling',
    originName: 'Darjeeling',
    destinations: [
      {
        name: 'Batasia Loop & Ghoom',
        timeBracket: 'within30Min',
        timeLabel: 'Within 30 Minutes',
        distance: '7 km',
        driveTime: '20 mins',
        image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
        highlights: ['Spiral Toy Train Track', 'Ghoom Monastery', 'War Memorial'],
        slug: 'darjeeling-to-batasia'
      },
      {
        name: 'Tiger Hill Sunrise Point',
        timeBracket: 'within1Hour',
        timeLabel: 'Within 1 Hour',
        distance: '11 km',
        driveTime: '35 mins',
        image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
        highlights: ['Panoramic Sunrise', 'Kanchenjunga Gold Glow', 'Everest Peak Distance'],
        slug: 'darjeeling-to-tiger-hill'
      },
      {
        name: 'Lamahatta Eco Pine Park',
        timeBracket: 'within1Hour',
        timeLabel: 'Within 1 Hour',
        distance: '23 km',
        driveTime: '50 mins',
        image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Pine%20Forest%20Village.png',
        highlights: ['Pine Tree Trails', 'Sacred Hill Pond', 'Prayer Flags'],
        slug: 'darjeeling-to-lamahatta'
      },
      {
        name: 'Mirik Lake & Gopaldhara',
        timeBracket: 'withinHalfDay',
        timeLabel: 'Within Half Day',
        distance: '49 km',
        driveTime: '1.8 hrs',
        image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Pine%20Forest%20Village.png',
        highlights: ['Lake Horse Riding', 'Cardamom Groves', 'Gopaldhara Tea Tasting'],
        slug: 'darjeeling-to-mirik'
      },
      {
        name: 'Kalimpong Durpin Dara',
        timeBracket: 'within1Day',
        timeLabel: 'Within 1 Day',
        distance: '50 km',
        driveTime: '2 hrs',
        image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
        highlights: ['Durpin Monastery', 'Pine Ridge Drive', 'Golf Course'],
        slug: 'darjeeling-to-kalimpong'
      }
    ]
  },
  {
    originId: 'siliguri',
    originName: 'Siliguri / NJP',
    destinations: [
      {
        name: 'Sukna Pine Forest',
        timeBracket: 'within30Min',
        timeLabel: 'Within 30 Minutes',
        distance: '12 km',
        driveTime: '25 mins',
        image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
        highlights: ['Mahananda Sanctuary Gateway', 'Toy Train Track', 'Teak & Pine Forests'],
        slug: 'siliguri-to-sukna'
      },
      {
        name: 'Kurseong Makaibari',
        timeBracket: 'within1Hour',
        timeLabel: 'Within 1 Hour',
        distance: '38 km',
        driveTime: '1.2 hrs',
        image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
        highlights: ['Makaibari Estate Tour', 'Eagle’s Crag Viewpoint', 'Rohini Zigzag Roads'],
        slug: 'siliguri-to-kurseong'
      },
      {
        name: 'Kalimpong Teesta Gorge',
        timeBracket: 'withinHalfDay',
        timeLabel: 'Within Half Day',
        distance: '67 km',
        driveTime: '2.2 hrs',
        image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
        highlights: ['Coronation Bridge', 'Teesta Rafting Point', 'Durpin Ridge'],
        slug: 'siliguri-to-kalimpong'
      },
      {
        name: 'Darjeeling Town',
        timeBracket: 'within1Day',
        timeLabel: 'Within 1 Day',
        distance: '68 km',
        driveTime: '2.5 hrs',
        image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
        highlights: ['Mall Road Promenade', 'Peace Pagoda', 'Chowrasta Hill'],
        slug: 'siliguri-to-darjeeling'
      },
      {
        name: 'Gangtok Capital',
        timeBracket: 'within1Day',
        timeLabel: 'Within 1 Day',
        distance: '115 km',
        driveTime: '3.8 hrs',
        image: 'https://ijyzcvzaosfimvrzgopb.supabase.co/storage/v1/object/public/destinations/Grand%20Himalayan%20Landscape.png',
        highlights: ['MG Marg Promenade', 'Cable Car Ropeway', 'Enchey Monastery'],
        slug: 'siliguri-to-gangtok'
      }
    ]
  }
];

