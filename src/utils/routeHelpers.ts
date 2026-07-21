// src/utils/routeHelpers.ts
import { Route, Hub, Attraction } from '../types';

export interface RouteAltInfo {
  elevation: number;
  region: string;
  description: string;
}

const REGIONAL_ALTITUDES: Record<string, RouteAltInfo> = {
  lachen: { elevation: 2750, region: "North Sikkim", description: "High-altitude alpine valley & gateway to Gurudongmar Lake" },
  lachung: { elevation: 2900, region: "North Sikkim", description: "Breathtaking valley of flowers & snowy peaks" },
  chungthang: { elevation: 1790, region: "North Sikkim", description: "Sacred confluence of Lachen & Lachung river valleys" },
  gangtok: { elevation: 1650, region: "East Sikkim", description: "Vibrant capital facing the pristine Kanchenjunga chain" },
  mangan: { elevation: 950, region: "North Sikkim", description: "Scenic cardamom hub & central gateway to the valleys" },
  njp: { elevation: 114, region: "Siliguri Plains", description: "Primary broad-gauge railway junction of North Bengal" },
  siliguri: { elevation: 120, region: "North Bengal", description: "Major commercial gateway to the Sikkim hills" },
  darjeeling: { elevation: 2045, region: "Darjeeling Hills", description: "Queen of the Hills, renowned for heritage tea estates" },
  kalimpong: { elevation: 1250, region: "Kalimpong Hills", description: "Horticultural paradise facing sweeping mountain streams" },
  pelling: { elevation: 2150, region: "West Sikkim", description: "Cultural capital offering panoramic close-ups of Kanchenjunga" },
  ravangla: { elevation: 2133, region: "South Sikkim", description: "Serene mist-covered ridge home to the giant Buddha Park" },
  namchi: { elevation: 1315, region: "South Sikkim", description: "Sikkim's spiritual capital featuring majestic shrines" },
  yuksom: { elevation: 1780, region: "West Sikkim", description: "First capital of Sikkim & sacred mountaineering base" },
  zuluk: { elevation: 2865, region: "East Sikkim", description: "Ancient Silk Route loops with breathtaking panoramas" }
};

export const getAltInfo = (name: string): RouteAltInfo => {
  const norm = name.toLowerCase().trim();
  for (const [key, value] of Object.entries(REGIONAL_ALTITUDES)) {
    if (norm.includes(key) || key.includes(norm)) {
      return value;
    }
  }
  // Deterministic fallback hash
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const randomAlt = 600 + (Math.abs(hash) % 2100);
  const regions = ["North Sikkim", "West Sikkim", "East Sikkim", "South Sikkim", "Darjeeling Hills", "Kalimpong Hills"];
  const randomRegion = regions[Math.abs(hash) % regions.length];
  return {
    elevation: randomAlt,
    region: randomRegion,
    description: "Quiet, unspoiled Himalayan sanctuary with dramatic scenery."
  };
};

export interface TimelineNode {
  name: string;
  category: string;
  desc: string;
  icon: string;
  elevation: number;
  latOffset: number; // For interactive map nodes
  lngOffset: number; // For interactive map nodes
  distanceElapsed: number;
  timeElapsed: number;
  details?: {
    photo: string;
    tips: string;
    duration: string;
  };
}

export function generateTimelineStops(
  route: Route,
  fromName: string,
  toName: string
): TimelineNode[] {
  const distanceKm = route.distance || 72;
  const timeMin = route.timeMin || 180;
  const pathNodes = route.path || [];

  // Intermediate scenic categories
  const sceneryData = [
    { name: "Forest Gate Checkpost", category: "Security Check", desc: "Permit logging point and dynamic safety weather check.", icon: "👮", tips: "Keep state entry permits and voter IDs handy for quick clearance.", photo: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=400&auto=format&fit=crop" },
    { name: "Teesta Riverside Rest", category: "Tea Garden Cafe", desc: "Halt at organic cardamom tea cabins overlooking rushing rivers.", icon: "☕", tips: "Try fresh local dumplings with handcrafted green-chilli paste.", photo: "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?q=80&w=400&auto=format&fit=crop" },
    { name: "Wooden Suspension Bridge", category: "Heritage Landmark", desc: "Cross an iconic steel-cable suspension bridge adorned with fluttering Buddhist prayers.", icon: "🌉", tips: "Perfect place to stop the cab for a quick riverside walk.", photo: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=400&auto=format&fit=crop" },
    { name: "Amitabh Bachchan Waterfall", category: "Scenic Cascade", desc: "A roaring natural mountain stream falling over 100 feet down green cliff faces.", icon: "💧", tips: "Slippery rocks ahead. Put on grip shoes for the spray zone.", photo: "https://images.unsplash.com/photo-1482862549707-f63cb32c5fd9?q=80&w=400&auto=format&fit=crop" },
    { name: "Himalayan Ridge Viewpoint", category: "Photography Spot", desc: "Sweeping 180-degree vista spot of pristine pine woods and towering snowy spurs.", icon: "📸", tips: "Fabulous golden light occurs right around 4:15 PM.", photo: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=400&auto=format&fit=crop" }
  ];

  if (pathNodes.length >= 4) {
    // Map standard database path nodes
    return pathNodes.map((node, idx) => {
      const fraction = idx / (pathNodes.length - 1);
      const isStart = idx === 0;
      const isEnd = idx === pathNodes.length - 1;
      const dist = Math.round(distanceKm * fraction);
      const mins = Math.round(timeMin * fraction);
      
      const scenery = sceneryData[idx % sceneryData.length];
      const name = isStart ? fromName : isEnd ? toName : node;
      const altInfo = getAltInfo(name);

      return {
        name,
        category: isStart ? "Taxi Base" : isEnd ? "Destination Base" : scenery.category,
        desc: isStart ? `Depart from ${fromName} terminal.` : isEnd ? `Arrive at ${toName} high valley.` : scenery.desc,
        icon: isStart ? "🚖" : isEnd ? "🏔" : scenery.icon,
        elevation: altInfo.elevation,
        latOffset: -0.15 + fraction * 0.45 + (idx % 2 === 0 ? 0.05 : -0.05),
        lngOffset: -0.1 + fraction * 0.35 + (idx % 2 === 0 ? -0.03 : 0.03),
        distanceElapsed: dist,
        timeElapsed: mins,
        details: {
          photo: scenery.photo,
          tips: scenery.tips,
          duration: "10-15 min stop"
        }
      };
    });
  }

  // Generate robust full timeline if database path is short
  const result: TimelineNode[] = [];
  
  // Start Stop
  result.push({
    name: fromName,
    category: "Taxi Base",
    desc: `Initiate transit from ${fromName} syndicate line. Verify local cab allocations.`,
    icon: "🚖",
    elevation: getAltInfo(fromName).elevation,
    latOffset: -0.15,
    lngOffset: -0.1,
    distanceElapsed: 0,
    timeElapsed: 0,
    details: {
      photo: "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=400&auto=format&fit=crop",
      tips: "Shared cabs leave mostly during the early morning slots.",
      duration: "Departs hourly"
    }
  });

  // Intermediates
  sceneryData.forEach((item, idx) => {
    const fraction = (idx + 1) / (sceneryData.length + 1);
    const dist = Math.round(distanceKm * fraction);
    const mins = Math.round(timeMin * fraction);
    const startAlt = getAltInfo(fromName).elevation;
    const endAlt = getAltInfo(toName).elevation;
    const alt = Math.round(startAlt + (endAlt - startAlt) * fraction + (idx % 2 === 0 ? 80 : -50));

    result.push({
      name: item.name,
      category: item.category,
      desc: item.desc,
      icon: item.icon,
      elevation: alt,
      latOffset: -0.15 + fraction * 0.45 + (idx % 2 === 0 ? 0.04 : -0.04),
      lngOffset: -0.1 + fraction * 0.35 + (idx % 2 === 0 ? -0.02 : 0.02),
      distanceElapsed: dist,
      timeElapsed: mins,
      details: {
        photo: item.photo,
        tips: item.tips,
        duration: "10-20 min halt"
      }
    });
  });

  // End Stop
  result.push({
    name: toName,
    category: "Destination Base",
    desc: `Arrive safely at ${toName} high-altitude taxi terminal. Local homestay hosts offer direct pickups.`,
    icon: "🏔",
    elevation: getAltInfo(toName).elevation,
    latOffset: 0.3,
    lngOffset: 0.25,
    distanceElapsed: distanceKm,
    timeElapsed: timeMin,
    details: {
      photo: "https://images.unsplash.com/photo-1486873249359-2731bd6dafc7?q=80&w=400&auto=format&fit=crop",
      tips: "Have homestay host pre-arrange your local sightseeing permits.",
      duration: "Journey end"
    }
  });

  return result;
}

export interface RoadIntel {
  surface: string;
  width: string;
  turns: number;
  climb: string;
  riverCrossings: number;
  bridges: number;
  landslideRisk: 'Low' | 'Moderate' | 'High';
  nightDriving: string;
  bestTime: string;
}

export function calculateRoadIntel(routeId: string, distance: number): RoadIntel {
  let hash = 0;
  for (let i = 0; i < routeId.length; i++) {
    hash = routeId.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  const surfaces = ["Smooth Asphalt (90%) + Gravel Gaps", "Premium Double-lane Blacktop", "Paved concrete with occasional minor rockfalls", "Offbeat dirt-trail mixed with loose gravel"];
  const widths = ["Standard Double-lane with safety side rails", "Narrow single-lane with frequent bypass pockets", "Double-lane highway corridor", "Steep winding single mountain lane"];
  const risks: Array<'Low' | 'Moderate' | 'High'> = ["Low", "Moderate", "Low", "Moderate"];

  return {
    surface: surfaces[hash % surfaces.length],
    width: widths[(hash + 1) % widths.length],
    turns: 15 + (hash % 25),
    climb: `Max gradient of ${8 + (hash % 8)}%`,
    riverCrossings: hash % 3,
    bridges: 2 + (hash % 5),
    landslideRisk: risks[hash % risks.length],
    nightDriving: hash % 2 === 0 ? "Suitable under dry conditions" : "Not recommended during heavy fog",
    bestTime: "7:00 AM - 3:30 PM (optimal light)"
  };
}

export interface LiveConditions {
  roadOpen: boolean;
  traffic: 'Clear' | 'Moderate' | 'Congested';
  weather: string;
  visibility: string;
  rain: string;
  snow: string;
  fog: string;
  alert: string | null;
}

export function calculateConditions(routeId: string): LiveConditions {
  let hash = 0;
  for (let i = 0; i < routeId.length; i++) {
    hash = routeId.charCodeAt(i) + ((hash << 5) - hash);
  }
  hash = Math.abs(hash);

  const statuses = [true, true, true, false]; // mostly open
  const traffics: Array<'Clear' | 'Moderate' | 'Congested'> = ["Clear", "Moderate", "Clear", "Moderate"];
  const weatherOptions = ["Partly Cloudy (16°C)", "Crisp & Sunny (14°C)", "Mist Rolling (12°C)", "Clear blue skies (18°C)"];
  const alerts = [
    null, 
    null, 
    "Mild cascading water spray near Km 12 waterfall bypass", 
    null
  ];

  return {
    roadOpen: statuses[hash % statuses.length],
    traffic: traffics[hash % traffics.length],
    weather: weatherOptions[hash % weatherOptions.length],
    visibility: (hash % 2 === 0) ? "Excellent (Above 8 km)" : "Moderate Mist (Under 2 km)",
    rain: (hash % 3 === 0) ? "Light Drizzle (10%)" : "Nil (0%)",
    snow: (hash % 5 === 0 && hash % 2 === 0) ? "Slight flurries on pass peaks" : "Nil (0%)",
    fog: (hash % 4 === 0) ? "Dense evening cloud cover" : "Light morning mist",
    alert: alerts[hash % alerts.length]
  };
}
