import { dbStore, getDistanceInKm } from '../db';
import { getLiveSupabaseVillages, getLiveSupabaseAttractions } from './location/GeoProximityService';

export interface DynamicThemeInfo {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  seasonName: string;
}

export interface CuratedSectionsResponse {
  trending: any[];
  loved: any[];
  captured: any[];
  adventure: any[];
  underrated: any[];
  dynamic: any[];
  dynamicTheme: DynamicThemeInfo;
}

// In-memory cache for curated sections
let cachedSections: {
  timestamp: number;
  data: CuratedSectionsResponse;
} | null = null;

const CACHE_TTL_MS = 60 * 1000; // 60 seconds

// Dynamic seasonal themes based on current month (0: Jan ... 11: Dec)
export function getSeasonalTheme(monthIndex: number = new Date().getMonth()): DynamicThemeInfo {
  // June (5), July (6), August (7), September (8) -> Monsoon / Waterfalls
  if (monthIndex >= 5 && monthIndex <= 8) {
    return {
      id: 'monsoon',
      title: '💧 Chasing Waterfalls',
      subtitle: 'Lush green valleys coming alive with majestic cascading waterfalls.',
      icon: '💧',
      seasonName: 'Monsoon'
    };
  }
  // October (9), November (10) -> Autumn / Clear Vistas
  if (monthIndex === 9 || monthIndex === 10) {
    return {
      id: 'autumn',
      title: '🏔 Crystal Clear Himalayas',
      subtitle: 'Unobstructed autumn views of the magnificent snow-clad peaks.',
      icon: '🏔',
      seasonName: 'Autumn'
    };
  }
  // December (11), January (0), February (1) -> Winter / Snow Escapes
  if (monthIndex === 11 || monthIndex === 0 || monthIndex === 1) {
    return {
      id: 'winter',
      title: '❄️ Snow Escapes',
      subtitle: 'Cozy fireplaces and frost-kissed slopes in high-altitude winters.',
      icon: '❄️',
      seasonName: 'Winter'
    };
  }
  // March (2), April (3), May (4) -> Spring / Rhododendron Trails
  return {
    id: 'spring',
    title: '🌸 Rhododendron Trails',
    subtitle: 'Breathtaking trails blanketed with vibrant spring rhododendrons and alpine flora.',
    icon: '🌸',
    seasonName: 'Spring'
  };
}

/**
 * Normalizes destination card to match frontend Destination type
 */
function projectDestinationCard(row: any) {
  const id = row.village_code || row.destination_id || row.id || '';
  const name = row.village_name || row.name || '';
  const tourismType = row.known_for || row.tourismType || 'Scenic Himalayan Village';
  const district = row.district_name || row.district || (row.district_code ? String(row.district_code) : '');
  const state = row.state_name || row.state || (String(id).startsWith('SK') ? 'Sikkim' : 'West Bengal');
  const img = row.image_url || row.image || row.coverImage || row.cover_image || '/images/hillytrip/himalayan-landscape.svg';
  const coverImg = row.coverImage || row.cover_image || img;

  return {
    id,
    village_code: row.village_code || id,
    name,
    tourismType,
    district,
    state,
    latitude: row.latitude !== undefined && row.latitude !== null ? Number(row.latitude) : null,
    longitude: row.longitude !== undefined && row.longitude !== null ? Number(row.longitude) : null,
    slug: row.slug || String(name).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    image: img,
    image_url: img,
    coverImage: coverImg,
    isHiddenGem: row.isHiddenGem ?? row.is_hidden_gem ?? false,
    isFeaturedThisWeek: row.isFeaturedThisWeek ?? row.is_featured_this_week ?? false,
    bestTimeToVisit: row.bestTimeToVisit || row.best_time_to_visit || 'September to June',
    elevation: row.elevation || row.altitude || null
  };
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  return getDistanceInKm(lat1, lon1, lat2, lon2);
}

/**
 * Resolves which village owns / is associated with a given attraction.
 * Checks direct destination_id / village_code, village_name, cleaned suffix matching,
 * or close geographic proximity (< 3.5km).
 */
function findVillageForAttraction(attraction: any, allVillages: any[]): any | null {
  const rawDestId = String(attraction.destination_id || attraction.destinationId || attraction.village_code || '').trim();
  const lowerDestId = rawDestId.toLowerCase();

  // 1. Direct code/id exact match
  if (lowerDestId) {
    let v = allVillages.find(village => {
      const code = String(village.village_code || village.id || '').trim().toLowerCase();
      const name = String(village.village_name || village.name || '').trim().toLowerCase();
      return code === lowerDestId || name === lowerDestId;
    });
    if (v) return v;

    // 2. Suffix-stripped name matching (e.g., "Kolakham", "Gorubathan Khasmahal" -> "Gorubathan")
    const cleanTarget = lowerDestId.replace(/\s*(khasmahal|forest|bazar|block|tea garden|\/.*)\s*/gi, '').trim();
    if (cleanTarget.length >= 3) {
      v = allVillages.find(village => {
        const vName = String(village.village_name || village.name || '').toLowerCase();
        const vClean = vName.replace(/\s*(khasmahal|forest|bazar|block|tea garden|\/.*)\s*/gi, '').trim();
        return vClean === cleanTarget || vName.includes(cleanTarget) || cleanTarget.includes(vClean);
      });
      if (v) return v;
    }
  }

  // 3. Geographic proximity matching (if attraction and village have coordinates, max 3.5 km)
  if (attraction.latitude && attraction.longitude) {
    const aLat = Number(attraction.latitude);
    const aLng = Number(attraction.longitude);
    if (!isNaN(aLat) && !isNaN(aLng)) {
      let closestVillage: any = null;
      let minDistance = 3.5; // Max 3.5 km radius
      for (const village of allVillages) {
        if (village.latitude && village.longitude) {
          const vLat = Number(village.latitude);
          const vLng = Number(village.longitude);
          if (!isNaN(vLat) && !isNaN(vLng)) {
            const dist = haversineKm(aLat, aLng, vLat, vLng);
            if (dist < minDistance) {
              minDistance = dist;
              closestVillage = village;
            }
          }
        }
      }
      if (closestVillage) return closestVillage;
    }
  }

  return null;
}

/**
 * Computes the 5 curated destination sections based on the FULL database.
 */
export async function getCuratedDestinationSections(options?: {
  month?: number;
  forceRefresh?: boolean;
}): Promise<CuratedSectionsResponse> {
  const now = Date.now();

  // Return cached result if valid
  if (!options?.forceRefresh && cachedSections && (now - cachedSections.timestamp < CACHE_TTL_MS)) {
    return cachedSections.data;
  }

  // 1. Load full destination and attraction populations
  const liveVillages = await getLiveSupabaseVillages();
  const dbDests = dbStore.getDestinations() || [];
  
  // Combine all distinct destinations
  const villageMap = new Map<string, any>();
  liveVillages.forEach(v => {
    const key = String(v.village_code || v.id || v.village_name || '').toLowerCase().trim();
    if (key && !villageMap.has(key)) {
      villageMap.set(key, v);
    }
  });
  dbDests.forEach(d => {
    const key = String(d.id || d.name || '').toLowerCase().trim();
    if (key && !villageMap.has(key)) {
      villageMap.set(key, {
        village_code: d.id,
        village_name: d.name,
        district: d.district,
        state: d.state,
        latitude: d.latitude,
        longitude: d.longitude,
        tourismType: d.tourismType,
        image: d.image,
        coverImage: d.coverImage,
        description: d.description,
        isHiddenGem: d.isHiddenGem
      });
    }
  });

  const allVillages = Array.from(villageMap.values());

  // Load all attractions
  const liveAttractions = await getLiveSupabaseAttractions();
  const dbAttractions = dbStore.getAttractions() || [];
  const attractionMap = new Map<string, any>();
  liveAttractions.forEach(a => {
    const key = String(a.attraction_id || a.id || a.attraction_name || '').toLowerCase().trim();
    if (key && !attractionMap.has(key)) {
      attractionMap.set(key, a);
    }
  });
  dbAttractions.forEach(a => {
    const key = String(a.id || a.name || '').toLowerCase().trim();
    if (key && !attractionMap.has(key)) {
      attractionMap.set(key, a);
    }
  });
  const allAttractions = Array.from(attractionMap.values());

  // Load homestays for homestay review resolution
  const dbHomestays = dbStore.getHomestays() || [];
  const homestayVillageMap = new Map<string, string>();
  dbHomestays.forEach((h: any) => {
    const hId = String(h.id || h.homestay_id || '').toLowerCase().trim();
    const vCode = String(h.village_code || h.villageCode || h.destination_id || h.destinationId || '').toLowerCase().trim();
    if (hId && vCode) {
      homestayVillageMap.set(hId, vCode);
    }
  });

  // Load engagements and media
  const photoContributions = (dbStore.getPhotoContributions() || []).filter((p: any) => p.status === 'Approved');
  const mediaImages = (dbStore.getImages() || []).filter((img: any) => img.status === 'Approved');
  const allApprovedPhotos = [...photoContributions, ...mediaImages];

  const homestayReviews = dbStore.getHomestayReviews() || [];
  const bookingReviews = dbStore.getBookingReviews() || [];
  const genericReviews = (dbStore as any).data?.reviews || [];
  const allReviews = [...homestayReviews, ...bookingReviews, ...genericReviews];

  const likes = (dbStore as any).data?.likes || [];
  const tripLeads = dbStore.getTripLeads() || [];
  const bookingLeads = dbStore.getBookingLeads() || [];
  const inquiries = dbStore.getInquiries() || [];
  const carLeads = dbStore.getCarLeads() || [];
  const interactions = (dbStore as any).data?.interactions || [];

  // Active season
  const monthIdx = options?.month !== undefined ? options.month : new Date().getMonth();
  const dynamicTheme = getSeasonalTheme(monthIdx);

  // Time window: 14 days for recent trending signals
  const FOURTEEN_DAYS_MS = 14 * 24 * 60 * 60 * 1000;
  const recentCutoff = now - FOURTEEN_DAYS_MS;

  // -------------------------------------------------------------
  // SECTION 1: TRENDING DESTINATIONS
  // Rule: Recent 14-day popularity/travel activity (views, searches, inquiries, likes).
  // -------------------------------------------------------------
  const trendingCandidates: Array<{ village: any; score: number; latestActivity: number }> = [];

  allVillages.forEach(village => {
    const vId = String(village.village_code || village.id || '').toLowerCase().trim();
    const vName = String(village.village_name || village.name || '').toLowerCase().trim();

    let recentViews = 0;
    let recentSearches = 0;
    let recentInquiries = 0;
    let recentLikes = 0;
    let latestActivity = 0;

    // Check interactions within 14 days
    interactions.forEach((item: any) => {
      const ts = item.timestamp ? new Date(item.timestamp).getTime() : 0;
      if (ts >= recentCutoff) {
        const entity = String(item.entityId || '').toLowerCase();
        if (entity.includes(vId) || entity.includes(vName)) {
          if (item.type?.includes('view')) recentViews++;
          else if (item.type?.includes('search')) recentSearches++;
          else if (item.type?.includes('like')) recentLikes++;
          if (ts > latestActivity) latestActivity = ts;
        }
      }
    });

    // Check leads/inquiries within 14 days
    [...tripLeads, ...bookingLeads, ...inquiries, ...carLeads].forEach((lead: any) => {
      const ts = lead.createdAt ? new Date(lead.createdAt).getTime() : 0;
      if (ts >= recentCutoff) {
        const dMatch = String(lead.destination || lead.destinationId || lead.village || '').toLowerCase();
        if (dMatch.includes(vId) || dMatch.includes(vName) || (vName && dMatch && vName.includes(dMatch))) {
          recentInquiries++;
          if (ts > latestActivity) latestActivity = ts;
        }
      }
    });

    // Check recent likes within 14 days
    likes.forEach((like: any) => {
      const ts = like.createdAt || like.timestamp ? new Date(like.createdAt || like.timestamp).getTime() : 0;
      if (ts >= recentCutoff) {
        const cId = String(like.contentId || like.destinationId || '').toLowerCase();
        if (cId === vId || cId === vName) {
          recentLikes++;
          if (ts > latestActivity) latestActivity = ts;
        }
      }
    });

    const recentScore = (recentViews * 1) + (recentSearches * 2) + (recentInquiries * 5) + (recentLikes * 3);

    // Only qualify if there is recent activity or valid interaction
    if (recentScore > 0 || latestActivity > 0) {
      trendingCandidates.push({ village, score: recentScore, latestActivity });
    }
  });

  // Sort by recent activity score, tie-break by latestActivity timestamp
  trendingCandidates.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return b.latestActivity - a.latestActivity;
  });

  // -------------------------------------------------------------
  // SECTION 2: MOST LOVED
  // Rule: Verified traveler review ratings, positive recommendations, and genuine likes.
  // Unreviewed / zero-liked destinations do NOT qualify.
  // -------------------------------------------------------------
  const lovedCandidates: Array<{ village: any; score: number }> = [];

  allVillages.forEach(village => {
    const vId = String(village.village_code || village.id || '').toLowerCase().trim();
    const vName = String(village.village_name || village.name || '').toLowerCase().trim();

    // Matching reviews (direct village or via homestay in village)
    const matchedReviews = allReviews.filter((r: any) => {
      const dId = String(r.destinationId || r.destination_id || r.village_code || r.village || '').toLowerCase().trim();
      const hId = String(r.homestayId || r.homestay_id || '').toLowerCase().trim();
      const hVillage = hId ? homestayVillageMap.get(hId) : '';
      return (
        dId === vId ||
        dId === vName ||
        (vName && dId && vName.includes(dId)) ||
        (hVillage && (hVillage === vId || hVillage === vName))
      );
    });

    // Matching likes
    const matchedLikes = likes.filter((l: any) => {
      const cId = String(l.contentId || l.destinationId || '').toLowerCase().trim();
      return cId === vId || cId === vName;
    });

    const numReviews = matchedReviews.length;
    const numLikes = matchedLikes.length;

    // Must have at least 1 verified review OR at least 1 like to qualify
    if (numReviews > 0 || numLikes > 0) {
      const avgRating = numReviews > 0
        ? matchedReviews.reduce((sum: number, r: any) => sum + (Number(r.rating) || 0), 0) / numReviews
        : 0;
      
      const positiveReviews = matchedReviews.filter((r: any) => (Number(r.rating) >= 4) || r.recommends === true).length;
      
      // Score calculation
      const score = (avgRating >= 4.0 ? avgRating * 10 : 0) + (positiveReviews * 15) + (numLikes * 3);
      if (score > 0) {
        lovedCandidates.push({ village, score });
      }
    }
  });

  lovedCandidates.sort((a, b) => b.score - a.score);

  // -------------------------------------------------------------
  // SECTION 3: RECENTLY CAPTURED
  // Rule: Recent approved traveler/community photo activity (upload/capture timestamp).
  // Destinations without approved photos do NOT qualify.
  // -------------------------------------------------------------
  const capturedCandidates: Array<{ village: any; latestTimestamp: number; photoCount: number }> = [];

  allVillages.forEach(village => {
    const vId = String(village.village_code || village.id || '').toLowerCase().trim();
    const vName = String(village.village_name || village.name || '').toLowerCase().trim();

    const destPhotos = allApprovedPhotos.filter((p: any) => {
      const dId = String(p.destinationId || p.destination_id || p.village_code || p.village || '').toLowerCase().trim();
      return dId === vId || dId === vName || (vName && dId && vName.includes(dId));
    });

    if (destPhotos.length > 0) {
      let latest = 0;
      destPhotos.forEach((p: any) => {
        const dStr = p.uploadDate || p.createdAt || p.approvedAt || p.timestamp;
        if (dStr) {
          const t = new Date(dStr).getTime();
          if (!isNaN(t) && t > latest) latest = t;
        }
      });

      if (latest > 0) {
        capturedCandidates.push({ village, latestTimestamp: latest, photoCount: destPhotos.length });
      }
    }
  });

  capturedCandidates.sort((a, b) => {
    if (b.latestTimestamp !== a.latestTimestamp) return b.latestTimestamp - a.latestTimestamp;
    return b.photoCount - a.photoCount;
  });

  // -------------------------------------------------------------
  // SECTION 4: ADVENTURE PICK
  // Rule: Destinations associated with verified adventure attractions (Trek, Camping, Pass, Caves, Off-road, etc).
  // -------------------------------------------------------------
  const adventureKeywords = ['trek', 'hiking', 'camping', 'adventure', 'pass', 'caves', 'off-road', 'rafting', 'climbing', 'safari', 'wildlife'];
  const adventureVillageScoreMap = new Map<string, { village: any; score: number; attractionNames: string[] }>();

  allAttractions.forEach(attraction => {
    const cat = String(attraction.category || '').toLowerCase();
    const name = String(attraction.attraction_name || attraction.name || '').toLowerCase();
    const isAdv = adventureKeywords.some(k => cat.includes(k) || name.includes(k));

    if (isAdv) {
      const village = findVillageForAttraction(attraction, allVillages);
      if (village) {
        const vKey = String(village.village_code || village.id || village.village_name).toLowerCase().trim();
        const existing = adventureVillageScoreMap.get(vKey) || {
          village,
          score: 0,
          attractionNames: []
        };

        let pts = 15;
        if (cat.includes('trek') || name.includes('trek')) pts = 25;
        else if (cat.includes('pass') || name.includes('pass')) pts = 20;
        else if (cat.includes('camping') || name.includes('camping')) pts = 22;

        existing.score += pts;
        existing.attractionNames.push(attraction.attraction_name || attraction.name);
        adventureVillageScoreMap.set(vKey, existing);
      }
    }
  });

  // Also check if destination profile itself is tagged as adventure
  allVillages.forEach(village => {
    const tourismType = String(village.known_for || village.tourismType || '').toLowerCase();
    const desc = String(village.description || village.overview || '').toLowerCase();
    const isAdvProfile = adventureKeywords.some(k => tourismType.includes(k));
    if (isAdvProfile) {
      const vKey = String(village.village_code || village.id || village.village_name).toLowerCase().trim();
      const existing = adventureVillageScoreMap.get(vKey) || {
        village,
        score: 0,
        attractionNames: []
      };
      existing.score += 20;
      adventureVillageScoreMap.set(vKey, existing);
    }
  });

  const adventureCandidates = Array.from(adventureVillageScoreMap.values()).sort((a, b) => b.score - a.score);

  // -------------------------------------------------------------
  // SECTION 5: SEASONAL DYNAMIC THEME (e.g. Monsoon -> "Chasing Waterfalls")
  // Rule: Destination qualifies ONLY if an actual verified waterfall attraction belongs to that village.
  // -------------------------------------------------------------
  const dynamicVillageScoreMap = new Map<string, { village: any; score: number; attractionNames: string[] }>();

  if (dynamicTheme.id === 'monsoon') {
    // Monsoon -> "Chasing Waterfalls"
    const waterfallAttractions = allAttractions.filter(a => {
      const cat = String(a.category || '').toLowerCase();
      const name = String(a.attraction_name || a.name || '').toLowerCase();
      return cat.includes('waterfall') || cat.includes('falls') || name.includes('waterfall') || name.includes('falls');
    });

    waterfallAttractions.forEach(attraction => {
      const village = findVillageForAttraction(attraction, allVillages);
      if (village) {
        const vKey = String(village.village_code || village.id || village.village_name).toLowerCase().trim();
        const existing = dynamicVillageScoreMap.get(vKey) || {
          village,
          score: 0,
          attractionNames: []
        };
        existing.score += 30;
        existing.attractionNames.push(attraction.attraction_name || attraction.name);
        dynamicVillageScoreMap.set(vKey, existing);
      }
    });
  } else if (dynamicTheme.id === 'winter') {
    // Winter -> Snow / High Altitude
    allAttractions.forEach(attraction => {
      const cat = String(attraction.category || '').toLowerCase();
      const name = String(attraction.attraction_name || attraction.name || '').toLowerCase();
      if (cat.includes('pass') || cat.includes('snow') || name.includes('pass') || name.includes('peak')) {
        const village = findVillageForAttraction(attraction, allVillages);
        if (village) {
          const vKey = String(village.village_code || village.id || village.village_name).toLowerCase().trim();
          const existing = dynamicVillageScoreMap.get(vKey) || { village, score: 0, attractionNames: [] };
          existing.score += 25;
          existing.attractionNames.push(attraction.attraction_name || attraction.name);
          dynamicVillageScoreMap.set(vKey, existing);
        }
      }
    });
  } else if (dynamicTheme.id === 'autumn') {
    // Autumn -> Crystal Clear Kanchenjunga Vistas
    allAttractions.forEach(attraction => {
      const cat = String(attraction.category || '').toLowerCase();
      const name = String(attraction.attraction_name || attraction.name || '').toLowerCase();
      if (cat.includes('viewpoint') || cat.includes('sunrise') || name.includes('view') || name.includes('point')) {
        const village = findVillageForAttraction(attraction, allVillages);
        if (village) {
          const vKey = String(village.village_code || village.id || village.village_name).toLowerCase().trim();
          const existing = dynamicVillageScoreMap.get(vKey) || { village, score: 0, attractionNames: [] };
          existing.score += 25;
          existing.attractionNames.push(attraction.attraction_name || attraction.name);
          dynamicVillageScoreMap.set(vKey, existing);
        }
      }
    });
  } else {
    // Spring -> Rhododendron Trails & Nature
    allAttractions.forEach(attraction => {
      const cat = String(attraction.category || '').toLowerCase();
      const name = String(attraction.attraction_name || attraction.name || '').toLowerCase();
      if (cat.includes('sanctuary') || cat.includes('nature') || cat.includes('flora') || name.includes('rhododendron') || name.includes('bloom')) {
        const village = findVillageForAttraction(attraction, allVillages);
        if (village) {
          const vKey = String(village.village_code || village.id || village.village_name).toLowerCase().trim();
          const existing = dynamicVillageScoreMap.get(vKey) || { village, score: 0, attractionNames: [] };
          existing.score += 25;
          existing.attractionNames.push(attraction.attraction_name || attraction.name);
          dynamicVillageScoreMap.set(vKey, existing);
        }
      }
    });
  }

  const dynamicCandidates = Array.from(dynamicVillageScoreMap.values()).sort((a, b) => b.score - a.score);

  // -------------------------------------------------------------
  // SECTION 6: UNDERRATED ESCAPES
  // Hidden gems and authentic remote hamlets with high tranquility.
  // -------------------------------------------------------------
  const underratedCandidates = allVillages
    .filter(v => v.isHiddenGem || v.is_hidden_gem)
    .map(village => ({ village, score: 50 }));

  // -------------------------------------------------------------
  // CROSS-SECTION SELECTION & DEDUPLICATION (No artificial backfill)
  // -------------------------------------------------------------
  const usedIds = new Set<string>();

  function selectUnique(
    candidates: Array<{ village: any }>,
    maxCount = 10
  ): any[] {
    const selected: any[] = [];
    for (const c of candidates) {
      const id = String(c.village.village_code || c.village.id || c.village.village_name || '').toLowerCase().trim();
      if (!usedIds.has(id)) {
        selected.push(projectDestinationCard(c.village));
        usedIds.add(id);
        if (selected.length >= maxCount) break;
      }
    }
    // If fewer unique exist, do NOT duplicate or backfill with unrelated items.
    return selected;
  }

  // 1. Trending
  const trendingList = selectUnique(trendingCandidates, 10);

  // If trending has fewer items due to zero recent logs on a fresh session,
  // gracefully take top scenic villages that have not been selected
  if (trendingList.length < 4) {
    const fallbackScenic = allVillages
      .filter(v => v.image || v.image_url)
      .map(v => ({ village: v }));
    for (const c of fallbackScenic) {
      const id = String(c.village.village_code || c.village.id || c.village.village_name || '').toLowerCase().trim();
      if (!usedIds.has(id)) {
        trendingList.push(projectDestinationCard(c.village));
        usedIds.add(id);
        if (trendingList.length >= 8) break;
      }
    }
  }

  // 2. Most Loved
  const lovedList = selectUnique(lovedCandidates, 10);

  // 3. Recently Captured
  const capturedList = selectUnique(capturedCandidates, 10);

  // 4. Adventure Pick
  const adventureList = selectUnique(adventureCandidates, 10);

  // 5. Underrated Escapes
  const underratedList = selectUnique(underratedCandidates, 10);

  // 6. Dynamic Seasonal Collection
  const dynamicList = selectUnique(dynamicCandidates, 10);

  const response: CuratedSectionsResponse = {
    trending: trendingList,
    loved: lovedList,
    captured: capturedList,
    adventure: adventureList,
    underrated: underratedList,
    dynamic: dynamicList,
    dynamicTheme
  };

  // Cache response in memory
  cachedSections = {
    timestamp: now,
    data: response
  };

  return response;
}
