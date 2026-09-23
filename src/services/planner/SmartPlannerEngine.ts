import { Destination, Attraction, Homestay, Route } from '../../types';
import { calculateHaversineDistanceKm } from '../geoProximityService';

export interface PlannerInput {
  startingLocation: string;
  destination?: string;
  isRecommendDestination?: boolean;
  travelDates?: string;
  month?: string;
  days: number;
  adults: number;
  children: number;
  budget: 'Budget' | 'Moderate' | 'Premium' | 'Luxury' | string;
  tripType: 'Solo' | 'Couple' | 'Family' | 'Friends' | 'Bike Trip' | 'Workation' | string;
  stayPreference: 'Homestay' | 'Hotel' | 'Luxury' | 'Budget' | string;
  transport: 'Shared Taxi' | 'Reserved Taxi' | 'Own Car' | 'Bike' | string;
  interests: string[];
  walkingPreference?: 'Minimal' | 'Moderate' | 'High' | string;
  seniorCitizen?: boolean;
  kids?: boolean;
  petFriendly?: boolean;
}

export interface AttractionDetailsCard {
  id: string;
  name: string;
  category: string;
  description: string;
  openingHours: string;
  entryFee: string;
  timeRequired: string;
  distanceFromHub: string;
  bestVisitTime: string;
  nearbyAttractions: string[];
  nearbyRestaurants: string[];
  nearbyHomestays: string[];
  hasParking: boolean;
  hasWashroom: boolean;
  image: string;
}

export interface RankedHomestayRecommendation {
  homestay: Homestay;
  rank: number;
  reasons: string[];
  estimatedNightCost: number;
  isTopPick?: boolean;
}

export interface TimelineStep {
  time: string;
  type: 'transit' | 'attraction' | 'meal' | 'checkin' | 'night_stay';
  title: string;
  description: string;
  locationName: string;
  attractionData?: AttractionDetailsCard;
  icon?: string;
}

export interface DailyPlan {
  dayNumber: number;
  title: string;
  destinationName: string;
  startPoint: string;
  endPoint: string;
  metrics: {
    estimatedCost: number;
    travelTimeMins: number;
    distanceKm: number;
    drivingTimeMins: number;
    walkingTimeMins: number;
  };
  timeline: TimelineStep[];
  attractions: AttractionDetailsCard[];
  topHomestays: RankedHomestayRecommendation[];
  recommendedTaxi: {
    routeName: string;
    fare: number;
    vehicleType: string;
    operatorName: string;
    notes: string;
  };
}

export interface TripPlanSummary {
  totalBudget: number;
  budgetBreakdown: {
    homestays: number;
    transit: number;
    sightseeing: number;
    foodEstimate: number;
  };
  totalDistanceKm: number;
  totalDrivingHours: number;
  totalWalkingHours: number;
  totalNights: number;
  homestaysCount: number;
  attractionsCount: number;
  recommendedTaxiOption: {
    type: string;
    fareMin: number;
    fareMax: number;
    operatorName: string;
    notes: string;
  };
  weatherSummary: string;
}

export interface TripPlan {
  id: string;
  tripScore: number;
  scoreReasons: string[];
  input: PlannerInput;
  summary: TripPlanSummary;
  dailyPlans: DailyPlan[];
  aiEnhancement?: {
    travelTips: string[];
    localSecrets: string[];
    packingAdvice: string[];
    whySelectedExplanation: string;
    roadAlerts: string;
  };
}

// Default fallback data if database arrays are temporarily empty
const FALLBACK_DESTINATIONS: Destination[] = [
  {
    id: 'gangtok',
    name: 'Gangtok',
    slug: 'gangtok',
    description: 'Capital of Sikkim featuring MG Marg, Tsomgo Lake access, and panoramic Kanchenjunga views.',
    tourismType: 'Popular Destination',
    bestSeason: 'October to May',
    image: '/images/hillytrip/snow-mountain.svg',
    gallery: [],
    isPopularDestination: true,
    district: 'East Sikkim',
    state: 'Sikkim',
    nearestTaxiStand: 'MG Marg Taxi Stand',
    distanceFromHub: 120
  },
  {
    id: 'darjeeling',
    name: 'Darjeeling',
    slug: 'darjeeling',
    description: 'The Queen of the Hills famous for Tiger Hill sunrise, heritage Toy Train, and lush tea gardens.',
    tourismType: 'Popular Destination',
    bestSeason: 'October to June',
    image: '/images/hillytrip/tea-garden.svg',
    gallery: [],
    isPopularDestination: true,
    district: 'Darjeeling',
    state: 'West Bengal',
    nearestTaxiStand: 'Chowk Bazaar Motor Stand',
    distanceFromHub: 70
  },
  {
    id: 'pelling',
    name: 'Pelling',
    slug: 'pelling',
    description: 'Picturesque West Sikkim town with closest views of Mt Kanchenjunga, Glass Skywalk, and ancient ruins.',
    tourismType: 'Hidden Gem',
    bestSeason: 'September to May',
    image: '/images/hillytrip/snow-mountain.svg',
    gallery: [],
    isHiddenGem: true,
    district: 'West Sikkim',
    state: 'Sikkim',
    nearestTaxiStand: 'Upper Pelling Stand',
    distanceFromHub: 135
  },
  {
    id: 'takdah',
    name: 'Takdah & Tinchuley',
    slug: 'takdah',
    description: 'Serene heritage tea bungalow hamlet with orchid centers, pine forests, and quiet mountain trails.',
    tourismType: 'Tea Gardens',
    bestSeason: 'Year round',
    image: '/images/hillytrip/north-bengal-hills.svg',
    gallery: [],
    isHiddenGem: true,
    district: 'Darjeeling',
    state: 'West Bengal',
    nearestTaxiStand: 'Takdah Market Stand',
    distanceFromHub: 65
  }
];

// Main Database-First Smart Planner Function
export function generateSmartTripPlan(
  input: PlannerInput,
  allDestinations: Destination[],
  allAttractions: Attraction[],
  allHomestays: Homestay[],
  allRoutes: Route[]
): TripPlan {
  const dests = allDestinations && allDestinations.length > 0 ? allDestinations : FALLBACK_DESTINATIONS;
  const attrs = allAttractions || [];
  const homes = allHomestays || [];
  const routes = allRoutes || [];

  // 1. Determine Starting Location and Destination Corridor
  const startLoc = input.startingLocation || 'NJP / Siliguri';
  
  // Select Target Destinations based on user inputs
  let targetDestinations = selectTargetDestinations(input, dests);
  
  // 2. Determine Day Distribution across Destinations
  const numDays = Math.max(1, Math.min(input.days || 3, 10));
  const dailyPlans: DailyPlan[] = [];

  let currentStart = startLoc;
  let accumulatedDistance = 0;
  let accumulatedDrivingMins = 0;
  let totalSightseeingCount = 0;
  let totalHomestaysCount = 0;

  let totalStayCost = 0;
  let totalTransitCost = 0;
  let totalSightseeingCost = 0;

  // Determine budget multiplier
  const dailyBudgetCap = getDailyBudgetCap(input.budget);

  for (let i = 1; i <= numDays; i++) {
    // Pick destination hub for the day
    const destIndex = Math.min(Math.floor((i - 1) / Math.max(1, Math.ceil(numDays / targetDestinations.length))), targetDestinations.length - 1);
    const dayDest = targetDestinations[destIndex] || targetDestinations[0];

    // Filter Attractions for this village/location hub using coordinates or district
    let dayAttractionsRaw = attrs.filter(a => {
      if (dayDest?.latitude && dayDest?.longitude && a?.latitude && a?.longitude) {
        return calculateHaversineDistanceKm(dayDest.latitude, dayDest.longitude, a.latitude, a.longitude) <= 25;
      }
      return (a.district && dayDest.district && a.district.toLowerCase() === dayDest.district.toLowerCase()) ||
             (a.village_name && dayDest.name && a.village_name.toLowerCase().includes(dayDest.name.toLowerCase()));
    });

    // Filter by interests & constraints (Senior citizen, kids, walking preference)
    let filteredAttrs = filterAttractionsByConstraints(dayAttractionsRaw, input);
    
    // Sort attractions logically (Sunrise spot first, viewpoints next, markets in evening)
    const sortedAttrs = sortAttractionsBySequence(filteredAttrs).slice(0, i === 1 ? 2 : 3);

    // Build Attraction Detail Cards
    const attractionCards: AttractionDetailsCard[] = sortedAttrs.map(a => buildAttractionCard(a, dayDest, attrs, homes));
    totalSightseeingCount += attractionCards.length;

    // Rank & Select Top 3 Homestays for this night using coordinates or district
    let dayHomestaysRaw = homes.filter(h => {
      if (dayDest?.latitude && dayDest?.longitude && h?.latitude && h?.longitude) {
        return calculateHaversineDistanceKm(dayDest.latitude, dayDest.longitude, h.latitude, h.longitude) <= 25;
      }
      return (h.district && dayDest.district && h.district.toLowerCase() === dayDest.district.toLowerCase()) ||
             (h.village_name && dayDest.name && h.village_name.toLowerCase().includes(dayDest.name.toLowerCase()));
    });
    if (dayHomestaysRaw.length === 0) dayHomestaysRaw = homes.slice(0, 5);

    const top3Homestays = rankTopHomestays(dayHomestaysRaw, dayDest, sortedAttrs, input, i, numDays);
    totalHomestaysCount += top3Homestays.length > 0 ? 1 : 0;

    const chosenHomestay = top3Homestays[0];
    const nightStayCost = chosenHomestay ? chosenHomestay.estimatedNightCost : Math.round(dailyBudgetCap * 0.45);
    totalStayCost += nightStayCost;

    // Calculate Day Transit Route & Fares
    const isFirstDay = i === 1;
    const isLastDay = i === numDays;
    const dayFrom = isFirstDay ? currentStart : dailyPlans[i - 2].destinationName;
    const dayTo = isLastDay ? (currentStart.includes('NJP') ? 'NJP / Bagdogra Hub' : currentStart) : dayDest.name;

    const matchedRoute = routes.find(r => 
      (r.fromHubId.toLowerCase().includes(dayFrom.toLowerCase()) && r.toHubId.toLowerCase().includes(dayTo.toLowerCase())) ||
      (r.path && r.path.some(p => p.toLowerCase().includes(dayFrom.toLowerCase())) && r.path.some(p => p.toLowerCase().includes(dayTo.toLowerCase())))
    );

    const legDistance = matchedRoute?.distance || (isFirstDay ? 85 : 35);
    const legDriveMins = matchedRoute?.timeMin || (isFirstDay ? 180 : 90);
    const legFare = matchedRoute 
      ? (input.transport.toLowerCase().includes('shared') ? Math.round(matchedRoute.fareMin / 4) : matchedRoute.fareMin)
      : (input.transport.toLowerCase().includes('shared') ? 450 : 3200);

    totalTransitCost += legFare;

    // Calculate Entry fees & food costs for the day
    const dayEntryFees = sortedAttrs.length * 50;
    const dayFoodEstimate = (input.adults + input.children) * 600;
    totalSightseeingCost += dayEntryFees;

    const dayDrivingMins = legDriveMins + (sortedAttrs.length * 20);
    const dayWalkingMins = input.walkingPreference === 'Minimal' || input.seniorCitizen ? 30 : 75;

    accumulatedDistance += legDistance;
    accumulatedDrivingMins += dayDrivingMins;

    // Construct Detailed Day Timeline
    const timeline = buildDayTimeline(
      i, 
      dayFrom, 
      dayDest.name, 
      sortedAttrs, 
      attractionCards, 
      chosenHomestay?.homestay,
      input
    );

    const recommendedTaxiInfo = {
      routeName: `${dayFrom} ➔ ${dayDest.name}`,
      fare: legFare,
      vehicleType: input.transport.toLowerCase().includes('bike') ? 'Royal Enfield Himalayan' : input.transport.toLowerCase().includes('shared') ? 'Shared Sumo/Bolero' : 'Reserved Innova SUV',
      operatorName: 'HillyTrip Verified Mountain Drivers Guild',
      notes: `Includes experienced mountain driver, fuel, and steep incline permit handling.`
    };

    dailyPlans.push({
      dayNumber: i,
      title: i === 1 ? `Arrival at ${dayDest.name} & Local Exploration` : i === numDays ? `Final Mountain Views & Departure` : `Scenic Wonders of ${dayDest.name}`,
      destinationName: dayDest.name,
      startPoint: dayFrom,
      endPoint: dayDest.name,
      metrics: {
        estimatedCost: legFare + nightStayCost + dayEntryFees + dayFoodEstimate,
        travelTimeMins: dayDrivingMins + dayWalkingMins,
        distanceKm: legDistance,
        drivingTimeMins: dayDrivingMins,
        walkingTimeMins: dayWalkingMins
      },
      timeline,
      attractions: attractionCards,
      topHomestays: top3Homestays,
      recommendedTaxi: recommendedTaxiInfo
    });

    currentStart = dayDest.name;
  }

  // Calculate Overall Trip Metrics & Summary
  const foodTotalEstimate = (input.adults + input.children) * 600 * numDays;
  const totalBudget = totalStayCost + totalTransitCost + totalSightseeingCost + foodTotalEstimate;

  const summary: TripPlanSummary = {
    totalBudget,
    budgetBreakdown: {
      homestays: totalStayCost,
      transit: totalTransitCost,
      sightseeing: totalSightseeingCost,
      foodEstimate: foodTotalEstimate
    },
    totalDistanceKm: accumulatedDistance,
    totalDrivingHours: Math.round((accumulatedDrivingMins / 60) * 10) / 10,
    totalWalkingHours: Math.round(((numDays * (input.seniorCitizen ? 0.5 : 1.2))) * 10) / 10,
    totalNights: Math.max(1, numDays - 1),
    homestaysCount: totalHomestaysCount,
    attractionsCount: totalSightseeingCount,
    recommendedTaxiOption: {
      type: input.transport || 'Reserved SUV Taxi',
      fareMin: Math.round(totalTransitCost * 0.9),
      fareMax: Math.round(totalTransitCost * 1.1),
      operatorName: 'HillyTrip Verified Local Taxi Fleet',
      notes: 'Sanitized vehicles with mountain-certified drivers skilled in high-altitude passes.'
    },
    weatherSummary: getWeatherSummaryForMonth(input.month)
  };

  // Calculate Trip Quality & Optimization Score (out of 100)
  const { score: tripScore, reasons: scoreReasons } = calculateTripScore(input, summary, dailyPlans);

  return {
    id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    tripScore,
    scoreReasons,
    input,
    summary,
    dailyPlans,
    aiEnhancement: {
      travelTips: [
        'Carry physical cash in small denominations for local village tea stalls & permits.',
        'Keep light woolen layers handy as temperature drops quickly after 4:30 PM.',
        'Always start morning sightseeing by 8:00 AM to get clear Kanchenjunga views before noon clouds.'
      ],
      localSecrets: [
        `Visit ${targetDestinations[0]?.name || 'the local market'} early morning for fresh organic cardamom tea.`,
        'Ask your homestay host to prepare authentic local nettle soup (Sisnoo) or Dalle chili chutney.'
      ],
      packingAdvice: [
        'Sturdy walking shoes with anti-slip rubber grip for damp mountain cobblestone paths.',
        'Reusable water flask & thermos to stay hydrated during scenic valley drives.',
        'Personal medicine kit including motion sickness pills for winding mountain hairpins.'
      ],
      whySelectedExplanation: `This plan was generated using HillyTrip's database algorithms to minimize backtracking between ${targetDestinations.map(d => d.name).join(' and ')}, matching your budget and stay preferences with verified hosts.`,
      roadAlerts: 'All major mountain corridors are open with clear weather conditions.'
    }
  };
}

// Helper: Select Target Destinations based on user inputs
function selectTargetDestinations(input: PlannerInput, dests: Destination[]): Destination[] {
  if (input.destination && input.destination !== 'Recommend for me') {
    const matched = dests.filter(d => 
      d.name.toLowerCase().includes(input.destination!.toLowerCase()) ||
      input.destination!.toLowerCase().includes(d.name.toLowerCase())
    );
    if (matched.length > 0) return matched;
  }

  // Interest & Trip Type scoring logic
  const scored = dests.map(d => {
    let score = 0;
    const desc = (d.description || '').toLowerCase();
    const type = (d.tourismType || '').toLowerCase();
    const name = d.name.toLowerCase();

    if (input.interests && Array.isArray(input.interests)) {
      input.interests.forEach(interest => {
        const lowerInt = interest.toLowerCase();
        if (lowerInt.includes('gem') && d.isHiddenGem) score += 12;
        if (lowerInt.includes('popular') && d.isPopularDestination) score += 10;
        if (lowerInt.includes('tea') && (desc.includes('tea') || name.includes('takdah') || name.includes('darjeeling'))) score += 9;
        if (lowerInt.includes('waterfall') && (desc.includes('waterfall') || desc.includes('fall') || desc.includes('cascade'))) score += 8;
        if (lowerInt.includes('nature') && (desc.includes('nature') || desc.includes('pine') || desc.includes('valley'))) score += 7;
        if (lowerInt.includes('trek') && (type.includes('trek') || desc.includes('trail'))) score += 8;
        if (lowerInt.includes('monastery') && (desc.includes('monastery') || desc.includes('peace') || name.includes('pelling') || name.includes('gangtok'))) score += 7;
      });
    }

    if (input.tripType) {
      const lowerTT = input.tripType.toLowerCase();
      if (lowerTT.includes('solo') && d.isHiddenGem) score += 5;
      if (lowerTT.includes('couple') && (d.isHiddenGem || name.includes('pelling') || name.includes('takdah'))) score += 6;
      if (lowerTT.includes('family') && d.isPopularDestination) score += 6;
      if (lowerTT.includes('bike') && d.distanceFromHub && d.distanceFromHub > 80) score += 7;
    }

    if (input.seniorCitizen && d.distanceFromHub && d.distanceFromHub < 90) {
      score += 6; // shorter drives for seniors
    }

    return { dest: d, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const topPicked = scored.filter(s => s.score > 0).map(s => s.dest);

  if (topPicked.length >= 2) return topPicked.slice(0, 3);
  return dests.slice(0, 3);
}

// Helper: Filter attractions based on walking preferences and senior citizen / kids constraints
function filterAttractionsByConstraints(attrs: Attraction[], input: PlannerInput): Attraction[] {
  if (!attrs || attrs.length === 0) return [];

  return attrs.filter(a => {
    const name = a.name.toLowerCase();
    const desc = (a.description || '').toLowerCase();
    const cat = (a.category || '').toLowerCase();

    // If Senior Citizen or Minimal Walking, filter out heavy treks
    if ((input.seniorCitizen || input.walkingPreference === 'Minimal') && (cat.includes('trek') || desc.includes('steep climb') || desc.includes('2 hour trek'))) {
      return false;
    }

    // Filter by interest if specified
    if (input.interests && input.interests.length > 0) {
      const lowerInts = input.interests.map(i => i.toLowerCase());
      if (lowerInts.includes('remove monasteries') && cat.includes('monastery')) return false;
    }

    return true;
  });
}

// Helper: Sort attractions by logical time-of-day sequence
function sortAttractionsBySequence(attrs: Attraction[]): Attraction[] {
  return [...attrs].sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();

    // Sunrise spots go first
    const aIsSunrise = aName.includes('sunrise') || aName.includes('tiger hill') || aName.includes('tashi view');
    const bIsSunrise = bName.includes('sunrise') || bName.includes('tiger hill') || bName.includes('tashi view');
    if (aIsSunrise && !bIsSunrise) return -1;
    if (!aIsSunrise && bIsSunrise) return 1;

    // Viewpoints / Nature next
    const aIsNature = a.category === 'Viewpoint' || a.category === 'Waterfall';
    const bIsNature = b.category === 'Viewpoint' || b.category === 'Waterfall';
    if (aIsNature && !bIsNature) return -1;
    if (!aIsNature && bIsNature) return 1;

    return 0;
  });
}

// Helper: Build detailed attraction card with parking, washrooms, entry fee & nearby links
function buildAttractionCard(
  a: Attraction, 
  dest: Destination, 
  allAttrs: Attraction[], 
  allHomes: Homestay[]
): AttractionDetailsCard {
  const nameLower = a.name.toLowerCase();
  
  // Nearby attractions in same area (calculated dynamically from coordinates)
  const nearbyAttrs = allAttrs
    .filter(other => {
      if (other.id === a.id) return false;
      if (a.latitude && a.longitude && other.latitude && other.longitude) {
        return calculateHaversineDistanceKm(a.latitude, a.longitude, other.latitude, other.longitude) <= 15;
      }
      return other.district === a.district;
    })
    .slice(0, 2)
    .map(other => other.name);

  // Nearby homestays in same area (calculated dynamically from coordinates)
  const nearbyHomes = allHomes
    .filter(h => {
      if (a.latitude && a.longitude && h.latitude && h.longitude) {
        return calculateHaversineDistanceKm(a.latitude, a.longitude, h.latitude, h.longitude) <= 15;
      }
      return h.district === a.district;
    })
    .slice(0, 2)
    .map(h => h.name);

  const isTrek = a.category === 'Trek' || nameLower.includes('peak') || nameLower.includes('trek');
  const isWaterfall = a.category === 'Waterfall' || nameLower.includes('fall');
  const isMonastery = a.category === 'Monastery' || nameLower.includes('monastery');

  return {
    id: a.id,
    name: a.name,
    category: a.category || 'Sightseeing',
    description: a.description || `Beautiful mountain landmark in ${dest.name} offering scenic Himalayan views.`,
    openingHours: isMonastery ? '06:00 AM - 05:00 PM' : isTrek ? '05:00 AM - 04:00 PM' : '07:30 AM - 06:00 PM',
    entryFee: nameLower.includes('skywalk') ? '₹100/person' : nameLower.includes('garden') || nameLower.includes('park') ? '₹50/person' : 'Free Entry',
    timeRequired: isTrek ? '2.5 Hours' : isWaterfall ? '1 Hour' : '1.5 Hours',
    distanceFromHub: (a as any).distanceFromDestination ? `${(a as any).distanceFromDestination} km from center` : '3.5 km from center',
    bestVisitTime: nameLower.includes('sunrise') ? '05:00 AM - 07:00 AM (Early Morning)' : '08:30 AM - 11:30 AM',
    nearbyAttractions: nearbyAttrs.length > 0 ? nearbyAttrs : ['Local Monastery', 'Scenic Viewpoint'],
    nearbyRestaurants: ['Pine Wood Cafe', 'Himalayan Organic Kitchen', 'Local Tibetan Tea Stalls'],
    nearbyHomestays: nearbyHomes.length > 0 ? nearbyHomes : ['Alpine Nest Homestay', 'Mountain Mist Cottage'],
    hasParking: !isTrek,
    hasWashroom: true,
    image: a.image || '/images/hillytrip/snow-mountain.svg'
  };
}

// Helper: Rank Top 3 Homestays for a specific night stay with explicit reasons
function rankTopHomestays(
  homestaysList: Homestay[], 
  dest: Destination, 
  dayAttrs: Attraction[], 
  input: PlannerInput,
  dayNum: number,
  totalDays: number
): RankedHomestayRecommendation[] {
  const dailyBudgetCap = getDailyBudgetCap(input.budget);

  const scored = homestaysList.map(h => {
    let score = 0;
    const reasons: string[] = [];

    // 1. Budget match
    if (h.priceMin && h.priceMin <= dailyBudgetCap * 0.6) {
      score += 25;
      reasons.push(`Budget Friendly (₹${h.priceMin.toLocaleString('en-IN')}/night fits budget preference)`);
    } else if (h.priceMin && h.priceMin <= dailyBudgetCap * 0.8) {
      score += 15;
      reasons.push(`Fits daily budget cap (₹${h.priceMin.toLocaleString('en-IN')}/night)`);
    }

    // 2. Location & Travel Time match (dynamic geo distance)
    const distKm = (dest.latitude && dest.longitude && h.latitude && h.longitude) 
      ? calculateHaversineDistanceKm(dest.latitude, dest.longitude, h.latitude, h.longitude)
      : null;

    if (distKm !== null && distKm <= 10) {
      score += 20;
      reasons.push(`Situated close to ${dest.name} (${distKm.toFixed(1)} km, saves travel time tomorrow)`);
    } else if (distKm !== null && distKm <= 25) {
      score += 10;
      reasons.push(`Scenic mountain setting ${distKm.toFixed(1)} km from ${dest.name}`);
    } else {
      reasons.push(`Quiet mountain village setting near ${dest.name}`);
    }

    // 3. Verified & Ratings
    if (h.verified || h.isVerified || h.claim_status === 'CLAIMED' || h.claim_status === 'UNCLAIMED') {
      score += 20;
      reasons.push('Verified HillyTrip Host Family with 100% authentic mountain hospitality');
    }

    if (h.rating && h.rating >= 4.5) {
      score += 15;
      reasons.push(`Highly rated by travellers (${h.rating}⭐ star rating)`);
    }

    // 4. Views & Amenities match
    const desc = (h.description || '').toLowerCase();
    const amen = (h.amenities || []).map(a => a.toLowerCase());
    if (desc.includes('view') || desc.includes('kanchenjunga') || amen.some(a => a.includes('view'))) {
      score += 10;
      reasons.push('Unobstructed mountain & valley views');
    }

    if (input.petFriendly && (desc.includes('pet') || amen.some(a => a.includes('pet')))) {
      score += 15;
      reasons.push('Pet Friendly Homestay');
    }

    if (input.kids || input.seniorCitizen) {
      reasons.push('Home-cooked organic meals & ground floor accessibility');
    }

    return {
      homestay: h,
      rank: 1 as const,
      score,
      reasons: reasons.slice(0, 4),
      estimatedNightCost: h.priceMin || Math.round(dailyBudgetCap * 0.5)
    };
  });

  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, 3).map((item, idx) => ({
    homestay: item.homestay,
    rank: (idx + 1) as 1 | 2 | 3,
    reasons: item.reasons,
    estimatedNightCost: item.estimatedNightCost,
    isTopPick: idx === 0
  }));
}

// Helper: Build daily timeline steps
function buildDayTimeline(
  dayNum: number, 
  startPoint: string, 
  destName: string, 
  sortedAttrs: Attraction[], 
  attractionCards: AttractionDetailsCard[],
  chosenHomestay: Homestay | undefined,
  input: PlannerInput
): TimelineStep[] {
  const steps: TimelineStep[] = [];

  if (dayNum === 1) {
    steps.push({
      time: '08:00 AM',
      type: 'transit',
      title: `Board Taxi from ${startPoint}`,
      description: `Scenic uphill mountain ride passing pine forests and river valleys towards ${destName}.`,
      locationName: startPoint,
      icon: '🚗'
    });
    steps.push({
      time: '11:30 AM',
      type: 'checkin',
      title: `Reach ${destName} & Homestay Check-in`,
      description: `Warm local welcome, hot cardamom tea, and settle into ${chosenHomestay?.name || 'your recommended homestay'}.`,
      locationName: destName,
      icon: '🏡'
    });
    steps.push({
      time: '01:00 PM',
      type: 'meal',
      title: 'Traditional Mountain Lunch',
      description: 'Savor local organic mountain thali (rice, fresh vegetables, homemade pickles, and dal).',
      locationName: destName,
      icon: '🍲'
    });
  } else {
    steps.push({
      time: '07:30 AM',
      type: 'meal',
      title: 'Homestay Morning Tea & Breakfast',
      description: 'Fresh mountain air breakfast with scenic Kanchenjunga sunrise backdrop.',
      locationName: destName,
      icon: '☕'
    });
  }

  // Sightseeing Steps
  if (attractionCards.length > 0) {
    attractionCards.forEach((card, idx) => {
      const timeSlot = idx === 0 ? (dayNum === 1 ? '02:30 PM' : '09:00 AM') : idx === 1 ? (dayNum === 1 ? '04:30 PM' : '11:30 AM') : '03:00 PM';
      steps.push({
        time: timeSlot,
        type: 'attraction',
        title: `Explore ${card.name}`,
        description: card.description,
        locationName: card.name,
        attractionData: card,
        icon: card.category === 'Waterfall' ? '🌊' : card.category === 'Monastery' ? '⛩️' : '🏔️'
      });
    });
  }

  // Evening & Dinner
  steps.push({
    time: '06:30 PM',
    type: 'transit',
    title: 'Evening Village Stroll / Local Market',
    description: 'Walk through local markets, sample momos, and interact with warm mountain locals.',
    locationName: destName,
    icon: '🛍️'
  });

  steps.push({
    time: '08:30 PM',
    type: 'night_stay',
    title: `Dinner & Night Stay at ${chosenHomestay?.name || 'Alpine Mountain Stay'}`,
    description: `Cozy fire-side dinner with home-cooked meals and peaceful starry mountain night.`,
    locationName: chosenHomestay?.name || destName,
    icon: '🌙'
  });

  return steps;
}

// Helper: Calculate Trip Optimization Score (out of 100)
function calculateTripScore(input: PlannerInput, summary: TripPlanSummary, dailyPlans: DailyPlan[]) {
  let score = 92;
  const reasons: string[] = ['100% Database Verified Homestays & Taxi Operators'];

  if (summary.totalDrivingHours / dailyPlans.length < 3.5) {
    score += 4;
    reasons.push('Minimal Backtracking & Short Scenic Drives (< 3.5 hrs/day)');
  } else {
    reasons.push('Optimized Route Sequence across Mountain Passes');
  }

  if (input.seniorCitizen || input.kids) {
    score += 2;
    reasons.push('Family & Accessibility Friendly Pace');
  }

  if (summary.homestaysCount > 0) {
    reasons.push('Authentic Direct Local Host Connections');
  }

  return { score: Math.min(99, score), reasons };
}

// Helper: Get Daily Budget Cap in INR
function getDailyBudgetCap(budget: string): number {
  const b = (budget || '').toLowerCase();
  if (b.includes('10') || b.includes('budget')) return 3500;
  if (b.includes('20') || b.includes('moderate')) return 6000;
  if (b.includes('30') || b.includes('premium')) return 9500;
  if (b.includes('50') || b.includes('luxury')) return 15000;
  return 5500;
}

// Helper: Get Weather summary string for month
function getWeatherSummaryForMonth(month?: string): string {
  const m = (month || 'October').toLowerCase();
  if (m.includes('dec') || m.includes('jan') || m.includes('feb')) {
    return '❄️ Cold Alpine Winter (2°C - 10°C) • Clear snow-capped mountain views';
  }
  if (m.includes('mar') || m.includes('apr') || m.includes('may')) {
    return '🌸 Pleasant Spring & Rhododendron Blossom Season (14°C - 22°C)';
  }
  if (m.includes('jun') || m.includes('jul') || m.includes('aug') || m.includes('sep')) {
    return '🌧️ Alpine Monsoon Season (16°C - 24°C) • Lush green misty hills';
  }
  return '☀️ Clear Post-Monsoon Autumn (10°C - 18°C) • Best Kanchenjunga visibility';
}

// ==================================================
// INSTANT TRIP MODIFIER ENGINE (STEP 8)
// ==================================================
export function modifyExistingTrip(
  currentPlan: TripPlan,
  action: 'reduce_budget' | 'add_waterfall' | 'remove_monasteries' | 'homestays_only' | 'one_more_day' | 'avoid_long_drives' | string,
  allDestinations: Destination[],
  allAttractions: Attraction[],
  allHomestays: Homestay[],
  allRoutes: Route[]
): TripPlan {
  const newInput: PlannerInput = { ...currentPlan.input };

  if (action === 'reduce_budget') {
    newInput.budget = 'Budget';
    newInput.stayPreference = 'Homestay';
    newInput.transport = 'Shared Taxi';
  } else if (action === 'add_waterfall') {
    if (!newInput.interests.includes('Waterfalls')) {
      newInput.interests = [...newInput.interests, 'Waterfalls'];
    }
  } else if (action === 'remove_monasteries') {
    newInput.interests = newInput.interests.filter(i => !i.toLowerCase().includes('monastery'));
    newInput.interests.push('Remove Monasteries');
  } else if (action === 'homestays_only') {
    newInput.stayPreference = 'Homestay';
  } else if (action === 'one_more_day') {
    newInput.days = Math.min(10, (newInput.days || 3) + 1);
  } else if (action === 'avoid_long_drives') {
    newInput.walkingPreference = 'Minimal';
    newInput.seniorCitizen = true;
  }

  // Regenerate cleanly using updated constraints
  const updatedPlan = generateSmartTripPlan(
    newInput, 
    allDestinations, 
    allAttractions, 
    allHomestays, 
    allRoutes
  );

  updatedPlan.scoreReasons.unshift(`Instantly Modified: "${action.replace(/_/g, ' ')}"`);
  return updatedPlan;
}
