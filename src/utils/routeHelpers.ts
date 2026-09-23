// src/utils/routeHelpers.ts
import { Route, Hub, Attraction } from '../types';
import { TAXI_STAND_STORAGE_ASSETS, DESTINATION_STORAGE_ASSETS } from './imagePool';

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
  const distanceKm = route.distance || 0;
  const timeMin = route.timeMin || 0;
  const pathNodes = route.path || [];
  const isVerified = Boolean(route.verified) && pathNodes.length > 0;

  if (isVerified && pathNodes.length > 0) {
    // Map verified database path nodes
    return pathNodes.map((node, idx) => {
      const fraction = pathNodes.length > 1 ? idx / (pathNodes.length - 1) : 0;
      const isStart = idx === 0;
      const isEnd = idx === pathNodes.length - 1;
      const dist = Math.round(distanceKm * fraction);
      const mins = Math.round(timeMin * fraction);
      const name = isStart ? fromName : isEnd ? toName : node;
      const altInfo = getAltInfo(name);

      return {
        name,
        category: isStart ? "Taxi Base" : isEnd ? "Destination Base" : "Key Junction",
        desc: isStart ? `Depart from ${fromName} terminal.` : isEnd ? `Arrive at ${toName}.` : `Verified corridor node along highway.`,
        icon: isStart ? "🚖" : isEnd ? "🏔" : "📍",
        elevation: altInfo.elevation,
        latOffset: -0.15 + fraction * 0.45,
        lngOffset: -0.1 + fraction * 0.35,
        distanceElapsed: dist,
        timeElapsed: mins,
        details: {
          photo: TAXI_STAND_STORAGE_ASSETS.mountainRoad,
          tips: "Verified route node.",
          duration: "10-15 min stop"
        }
      };
    });
  }

  // Unverified or missing route geometry: return origin, unverified notice, and destination
  return [
    {
      name: fromName,
      category: "Taxi Base",
      desc: `Initiate transit from ${fromName} syndicate line.`,
      icon: "🚖",
      elevation: getAltInfo(fromName).elevation,
      latOffset: -0.15,
      lngOffset: -0.1,
      distanceElapsed: 0,
      timeElapsed: 0,
      details: {
        photo: TAXI_STAND_STORAGE_ASSETS.majorHillTownTaxiStand,
        tips: "Verify route availability with local syndicate.",
        duration: "Departs"
      }
    },
    {
      name: "Verified journey timeline unavailable",
      category: "Unverified Geometry",
      desc: "Intermediate stops and geometry for this route have not yet been officially verified.",
      icon: "⚠️",
      elevation: 1000,
      latOffset: 0,
      lngOffset: 0,
      distanceElapsed: Math.round(distanceKm * 0.5),
      timeElapsed: Math.round(timeMin * 0.5),
      details: {
        photo: TAXI_STAND_STORAGE_ASSETS.genericFallback,
        tips: "Official timeline will be displayed once route path is verified.",
        duration: "Unverified"
      }
    },
    {
      name: toName,
      category: "Destination Base",
      desc: `Arrive at ${toName}.`,
      icon: "🏔",
      elevation: getAltInfo(toName).elevation,
      latOffset: 0.3,
      lngOffset: 0.25,
      distanceElapsed: distanceKm,
      timeElapsed: timeMin,
      details: {
        photo: DESTINATION_STORAGE_ASSETS.grandHimalayanLandscape,
        tips: "Arrival point.",
        duration: "Arrival"
      }
    }
  ];
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
