import { Destination, Homestay } from '../types';

export interface SuggestedPlace {
  id: string;
  name: string;
  district: string;
  state: 'West Bengal' | 'Sikkim';
  type: 'village' | 'town' | 'destination' | 'district' | 'hub';
  aliases?: string[];
  homestayCount?: number;
  score?: number;
  icon?: string;
  categoryBadge?: string;
}

export const HIMALAYAN_PLACES: SuggestedPlace[] = [
  // Major Transport Gateways & Hubs
  { id: 'hub-njp', name: 'NJP Railway Station', district: 'Jalpaiguri', state: 'West Bengal', type: 'hub', aliases: ['NJP', 'New Jalpaiguri', 'Siliguri / NJP', 'New Jalpaiguri Railway Station', 'NJP Station'] },
  { id: 'hub-bagdogra', name: 'Bagdogra Airport', district: 'Darjeeling', state: 'West Bengal', type: 'hub', aliases: ['Bagdogra', 'IXB', 'Bagdogra Airport (IXB)', 'Dakshin Bagdogra', 'Uttar Bagdogra'] },
  { id: 'hub-siliguri', name: 'Siliguri', district: 'Darjeeling', state: 'West Bengal', type: 'town', aliases: ['Siliguri Town', 'Siliguri Junction', 'Pani Tanki'] },

  // Kalimpong District
  { id: 'place-kalimpong', name: 'Kalimpong', district: 'Kalimpong', state: 'West Bengal', type: 'town', aliases: ['Kalimpong Town'] },
  { id: 'place-lava', name: 'Lava', district: 'Kalimpong', state: 'West Bengal', type: 'village', aliases: ['Lava Bazaar', 'Lava Pine Forest'] },
  { id: 'place-rishop', name: 'Rishop', district: 'Kalimpong', state: 'West Bengal', type: 'village', aliases: ['Rishyap', 'Rishap'] },
  { id: 'place-lolegaon', name: 'Lolegaon', district: 'Kalimpong', state: 'West Bengal', type: 'village', aliases: ['Loleygaon', 'Kaffer'] },
  { id: 'place-pedong', name: 'Pedong', district: 'Kalimpong', state: 'West Bengal', type: 'village', aliases: ['Pedong Town'] },
  { id: 'place-sillery-gaon', name: 'Sillery Gaon', district: 'Kalimpong', state: 'West Bengal', type: 'village', aliases: ['Sillery', 'Sillerygaon'] },
  { id: 'place-icche-gaon', name: 'Icche Gaon', district: 'Kalimpong', state: 'West Bengal', type: 'village', aliases: ['Ichegaon', 'Echhey Gaon'] },
  { id: 'place-kolakham', name: 'Kolakham', district: 'Kalimpong', state: 'West Bengal', type: 'village', aliases: ['Neora Valley Kolakham'] },
  { id: 'place-git-kolbong', name: 'Git Kolbong', district: 'Kalimpong', state: 'West Bengal', type: 'village', aliases: ['Gitkolbong'] },
  { id: 'place-chhibbo', name: 'Chhibbo', district: 'Kalimpong', state: 'West Bengal', type: 'village', aliases: ['Chhibo'] },
  { id: 'place-kaage', name: 'Kaage', district: 'Kalimpong', state: 'West Bengal', type: 'village', aliases: ['Kagey'] },
  { id: 'place-yelbong', name: 'Yelbong', district: 'Kalimpong', state: 'West Bengal', type: 'village', aliases: ['Yelbong Canyon'] },
  { id: 'place-bara-mangwa', name: 'Bara Mangwa', district: 'Kalimpong', state: 'West Bengal', type: 'village', aliases: ['Baramangwa'] },
  { id: 'place-chota-mangwa', name: 'Chota Mangwa', district: 'Kalimpong', state: 'West Bengal', type: 'village', aliases: ['Chotamangwa'] },
  { id: 'place-algara', name: 'Algara', district: 'Kalimpong', state: 'West Bengal', type: 'village', aliases: ['Algarah'] },
  { id: 'place-charkhole', name: 'Charkhole', district: 'Kalimpong', state: 'West Bengal', type: 'village', aliases: ['Charkhol'] },
  { id: 'place-reshi-khola', name: 'Reshi Khola', district: 'Kalimpong', state: 'West Bengal', type: 'village', aliases: ['Rishi Khola', 'Reshikhola'] },

  // Darjeeling District
  { id: 'place-darjeeling', name: 'Darjeeling', district: 'Darjeeling', state: 'West Bengal', type: 'town', aliases: ['Darjeeling Town', 'Queen of Hills'] },
  { id: 'place-kurseong', name: 'Kurseong', district: 'Darjeeling', state: 'West Bengal', type: 'town', aliases: ['Kurseong Town', 'Land of White Orchids'] },
  { id: 'place-mirik', name: 'Mirik', district: 'Darjeeling', state: 'West Bengal', type: 'town', aliases: ['Mirik Lake', 'Mirik Bazaar'] },
  { id: 'place-takdah', name: 'Takdah', district: 'Darjeeling', state: 'West Bengal', type: 'village', aliases: ['Takdah Cantonment', 'Takdah Heritage'] },
  { id: 'place-tinchuley', name: 'Tinchuley', district: 'Darjeeling', state: 'West Bengal', type: 'village', aliases: ['Tinchule'] },
  { id: 'place-lamahatta', name: 'Lamahatta', district: 'Darjeeling', state: 'West Bengal', type: 'village', aliases: ['Lamahatta Eco Park'] },
  { id: 'place-lepchajagat', name: 'Lepchajagat', district: 'Darjeeling', state: 'West Bengal', type: 'village', aliases: ['Lepcha Jagat'] },
  { id: 'place-sittong', name: 'Sittong', district: 'Darjeeling', state: 'West Bengal', type: 'village', aliases: ['Sitong', 'Orange Village'] },
  { id: 'place-chatakpur', name: 'Chatakpur', district: 'Darjeeling', state: 'West Bengal', type: 'village', aliases: ['Chatakpur Eco Village'] },
  { id: 'place-sonada', name: 'Sonada', district: 'Darjeeling', state: 'West Bengal', type: 'village', aliases: ['Sonada Town'] },
  { id: 'place-ghoom', name: 'Ghoom', district: 'Darjeeling', state: 'West Bengal', type: 'village', aliases: ['Ghum'] },
  { id: 'place-sukhia-pokhari', name: 'Sukhia Pokhari', district: 'Darjeeling', state: 'West Bengal', type: 'village', aliases: ['Sukhiapokhri'] },
  { id: 'place-bijanbari', name: 'Bijanbari', district: 'Darjeeling', state: 'West Bengal', type: 'village', aliases: ['Bijanbari Valley'] },
  { id: 'place-rimbik', name: 'Rimbik', district: 'Darjeeling', state: 'West Bengal', type: 'village', aliases: ['Rimbick'] },
  { id: 'place-manebhanjan', name: 'Manebhanjan', district: 'Darjeeling', state: 'West Bengal', type: 'village', aliases: ['Maneybhanjan', 'Maneybhanjan / Manebhanjan', 'Manebhanjyang'] },
  { id: 'place-dawaipani', name: 'Dawaipani', district: 'Darjeeling', state: 'West Bengal', type: 'village', aliases: ['Dawai Pani'] },
  { id: 'place-latpanchar', name: 'Latpanchar', district: 'Darjeeling', state: 'West Bengal', type: 'village', aliases: ['Latpanchor', 'Ahaldhara'] },
  { id: 'place-sandakphu', name: 'Sandakphu', district: 'Darjeeling', state: 'West Bengal', type: 'destination', aliases: ['Sandakphu Peak', 'Sandakfu', 'Singalila Summit'] },
  { id: 'place-phalut', name: 'Phalut', district: 'Darjeeling', state: 'West Bengal', type: 'destination', aliases: ['Phalut Peak', 'Phalut Ridge'] },
  { id: 'place-bunkulung', name: 'Bunkulung', district: 'Darjeeling', state: 'West Bengal', type: 'village', aliases: ['Bunkulang'] },
  { id: 'place-mungpoo', name: 'Mungpoo', district: 'Darjeeling', state: 'West Bengal', type: 'village', aliases: ['Mongpu', 'Rabindranath Tagore Mungpoo'] },

  // Sikkim - Gangtok District
  { id: 'place-gangtok', name: 'Gangtok', district: 'Gangtok', state: 'Sikkim', type: 'town', aliases: ['Gangtok City', 'East Sikkim'] },
  { id: 'place-rumtek', name: 'Rumtek', district: 'Gangtok', state: 'Sikkim', type: 'village', aliases: ['Rumtek Dharma Chakra'] },
  { id: 'place-ranka', name: 'Ranka', district: 'Gangtok', state: 'Sikkim', type: 'village', aliases: ['Lingdum Monastery', 'Ranka Monastery'] },

  // Sikkim - Namchi District
  { id: 'place-namchi', name: 'Namchi', district: 'Namchi', state: 'Sikkim', type: 'town', aliases: ['South Sikkim', 'Char Dham Namchi'] },
  { id: 'place-ravangla', name: 'Ravangla', district: 'Namchi', state: 'Sikkim', type: 'town', aliases: ['Rabongla', 'Buddha Park Ravangla'] },
  { id: 'place-borong', name: 'Borong', district: 'Namchi', state: 'Sikkim', type: 'village', aliases: ['Borong Hot Spring'] },
  { id: 'place-temi', name: 'Temi Tea Estate', district: 'Namchi', state: 'Sikkim', type: 'village', aliases: ['Temi', 'Temi Tarku'] },
  { id: 'place-tarey-bhir', name: 'Tarey Bhir', district: 'Namchi', state: 'Sikkim', type: 'village', aliases: ['Sadatar'] },

  // Sikkim - Gyalshing District
  { id: 'place-gyalshing', name: 'Gyalshing', district: 'Gyalshing', state: 'Sikkim', type: 'town', aliases: ['Geyzing', 'West Sikkim'] },
  { id: 'place-pelling', name: 'Pelling', district: 'Gyalshing', state: 'Sikkim', type: 'town', aliases: ['Upper Pelling', 'Lower Pelling'] },
  { id: 'place-yuksom', name: 'Yuksom', district: 'Gyalshing', state: 'Sikkim', type: 'village', aliases: ['Yuksam', 'First Capital of Sikkim'] },
  { id: 'place-tashiding', name: 'Tashiding', district: 'Gyalshing', state: 'Sikkim', type: 'village', aliases: ['Tashiding Monastery'] },
  { id: 'place-rinchenpong', name: 'Rinchenpong', district: 'Gyalshing', state: 'Sikkim', type: 'village', aliases: ['Rinchenpong Kaluk'] },
  { id: 'place-kaluk', name: 'Kaluk', district: 'Gyalshing', state: 'Sikkim', type: 'village', aliases: ['Kaluk Rinchenpong'] },
  { id: 'place-hee-bermiok', name: 'Hee Bermiok', district: 'Gyalshing', state: 'Sikkim', type: 'village', aliases: ['Hee Gaon', 'Bermiok'] },
  { id: 'place-uttarey', name: 'Uttarey', district: 'Gyalshing', state: 'Sikkim', type: 'village', aliases: ['Uttarey Valley'] },

  // Sikkim - Soreng District
  { id: 'place-soreng', name: 'Soreng', district: 'Soreng', state: 'Sikkim', type: 'town', aliases: ['Soreng Town'] },
  { id: 'place-okhrey', name: 'Okhrey', district: 'Soreng', state: 'Sikkim', type: 'village', aliases: ['Okhrey Rhododendron'] },
  { id: 'place-barsey', name: 'Barsey', district: 'Soreng', state: 'Sikkim', type: 'destination', aliases: ['Varsey Rhododendron Sanctuary'] },

  // Sikkim - Pakyong District
  { id: 'place-pakyong', name: 'Pakyong', district: 'Pakyong', state: 'Sikkim', type: 'town', aliases: ['Pakyong Airport'] },
  { id: 'place-aritar', name: 'Aritar', district: 'Pakyong', state: 'Sikkim', type: 'village', aliases: ['Lampokhari Lake Aritar'] },
  { id: 'place-zuluk', name: 'Zuluk', district: 'Pakyong', state: 'Sikkim', type: 'village', aliases: ['Dzuluk', 'Old Silk Route'] },
  { id: 'place-gnathang', name: 'Gnathang Valley', district: 'Pakyong', state: 'Sikkim', type: 'village', aliases: ['Nathang Valley', 'Nathang'] },
  { id: 'place-rongli', name: 'Rongli', district: 'Pakyong', state: 'Sikkim', type: 'town', aliases: ['Rongli Bazaar'] },
  { id: 'place-rolep', name: 'Rolep', district: 'Pakyong', state: 'Sikkim', type: 'village', aliases: ['Rolep River'] },

  // Sikkim - Mangan District
  { id: 'place-mangan', name: 'Mangan', district: 'Mangan', state: 'Sikkim', type: 'town', aliases: ['North Sikkim Mangan'] },
  { id: 'place-lachen', name: 'Lachen', district: 'Mangan', state: 'Sikkim', type: 'village', aliases: ['Gurudongmar Base Lachen'] },
  { id: 'place-lachung', name: 'Lachung', district: 'Mangan', state: 'Sikkim', type: 'village', aliases: ['Yumthang Base Lachung'] },
  { id: 'place-yumthang', name: 'Yumthang Valley', district: 'Mangan', state: 'Sikkim', type: 'destination', aliases: ['Yumthang', 'Yumthang Valley of Flowers', 'Valley of Flowers Sikkim'] },
  { id: 'place-dzongu', name: 'Dzongu', district: 'Mangan', state: 'Sikkim', type: 'village', aliases: ['Passingdang', 'Lepcha Reserve'] },

  // Jalpaiguri & Alipurduar (Dooars)
  { id: 'place-lataguri', name: 'Lataguri', district: 'Jalpaiguri', state: 'West Bengal', type: 'village', aliases: ['Gorumara Lataguri'] },
  { id: 'place-murti', name: 'Murti', district: 'Jalpaiguri', state: 'West Bengal', type: 'village', aliases: ['Murti River'] },
  { id: 'place-jhalong', name: 'Jhalong', district: 'Jalpaiguri', state: 'West Bengal', type: 'village', aliases: ['Jhalong Camp'] },
  { id: 'place-bindu', name: 'Bindu', district: 'Jalpaiguri', state: 'West Bengal', type: 'village', aliases: ['Bindu Dam'] },
  { id: 'place-samsing', name: 'Samsing', district: 'Jalpaiguri', state: 'West Bengal', type: 'village', aliases: ['Samsing Tea Garden'] },
  { id: 'place-suntalekhola', name: 'Suntalekhola', district: 'Jalpaiguri', state: 'West Bengal', type: 'village', aliases: ['Suntaleykhola'] },
  { id: 'place-madarihat', name: 'Madarihat', district: 'Alipurduar', state: 'West Bengal', type: 'village', aliases: ['Jaldapara Madarihat'] },
  { id: 'place-jayanti', name: 'Jayanti', district: 'Alipurduar', state: 'West Bengal', type: 'village', aliases: ['Buxa Jayanti'] },

  // Official Districts
  { id: 'dist-darjeeling', name: 'Darjeeling District', district: 'Darjeeling', state: 'West Bengal', type: 'district', aliases: ['Darjeeling'] },
  { id: 'dist-kalimpong', name: 'Kalimpong District', district: 'Kalimpong', state: 'West Bengal', type: 'district', aliases: ['Kalimpong'] },
  { id: 'dist-jalpaiguri', name: 'Jalpaiguri District', district: 'Jalpaiguri', state: 'West Bengal', type: 'district', aliases: ['Jalpaiguri', 'Dooars'] },
  { id: 'dist-alipurduar', name: 'Alipurduar District', district: 'Alipurduar', state: 'West Bengal', type: 'district', aliases: ['Alipurduar'] },
  { id: 'dist-gangtok', name: 'Gangtok District', district: 'Gangtok', state: 'Sikkim', type: 'district', aliases: ['East Sikkim'] },
  { id: 'dist-namchi', name: 'Namchi District', district: 'Namchi', state: 'Sikkim', type: 'district', aliases: ['South Sikkim'] },
  { id: 'dist-gyalshing', name: 'Gyalshing District', district: 'Gyalshing', state: 'Sikkim', type: 'district', aliases: ['West Sikkim', 'Geyzing'] },
  { id: 'dist-mangan', name: 'Mangan District', district: 'Mangan', state: 'Sikkim', type: 'district', aliases: ['North Sikkim'] },
  { id: 'dist-soreng', name: 'Soreng District', district: 'Soreng', state: 'Sikkim', type: 'district', aliases: ['Soreng'] },
  { id: 'dist-pakyong', name: 'Pakyong District', district: 'Pakyong', state: 'Sikkim', type: 'district', aliases: ['Pakyong'] }
];

// Popular fallback places when query is empty or focused
export const POPULAR_PLACES: string[] = [
  'NJP Railway Station',
  'Bagdogra Airport',
  'Siliguri',
  'Darjeeling',
  'Kalimpong',
  'Gangtok',
  'Pelling',
  'Kurseong',
  'Mirik',
  'Lava',
  'Rishop',
  'Sittong',
  'Manebhanjan',
  'Sandakphu',
  'Lachen',
  'Lachung',
  'Yumthang Valley',
  'Ravangla',
  'Namchi'
];

// Popular starting points (Gateways & transit nodes)
export const POPULAR_FROM_PLACES: string[] = [
  'NJP Railway Station',
  'Bagdogra Airport',
  'Siliguri',
  'Darjeeling',
  'Gangtok',
  'Kalimpong',
  'Manebhanjan',
  'Kurseong',
  'Pelling'
];

// Popular destinations
export const POPULAR_TO_PLACES: string[] = [
  'Darjeeling',
  'Gangtok',
  'Pelling',
  'Sandakphu',
  'Kalimpong',
  'Ravangla',
  'Lava',
  'Sittong',
  'Lachen',
  'Lachung',
  'Mirik'
];

function normalize(str: string): string {
  if (!str) return '';
  return str.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Strips search intent noise like "homestay in lava", "stays in kurseong", "hotels in ravangla"
 */
export function cleanSearchQuery(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/^(\s*homestays?|\s*stays?|\s*hotels?|\s*rooms?|\s*resorts?)\s+(in|at|near|around)?\s*/gi, '')
    .replace(/\s+(homestays?|stays?|hotels?|rooms?|resorts?)\s*$/gi, '')
    .trim();
}

/**
 * Counts homestays situated in or mapped to a specific place
 */
export function countHomestaysForPlace(place: SuggestedPlace, homestays: Homestay[]): number {
  if (!homestays || homestays.length === 0) return 0;

  const pName = normalize(place.name.replace(/\s+District$/i, ''));
  const pDistrict = normalize(place.district);
  const isDistrictType = place.type === 'district';

  let count = 0;
  for (const h of homestays) {
    const hVillage = normalize((h as any).village || (h as any).village_name || '');
    const hDest = normalize(h.destinationId || '');
    const hAddr = normalize(h.address || '');
    const hDist = normalize(h.district || '');
    const hName = normalize(h.name || '');

    if (isDistrictType) {
      if (hDist.includes(pDistrict) || hAddr.includes(pDistrict)) {
        count++;
      }
    } else {
      if (
        (hVillage && (hVillage === pName || hVillage.includes(pName))) ||
        (hDest && (hDest === pName || hDest.includes(pName))) ||
        (hAddr && hAddr.includes(pName)) ||
        (hName && hName.includes(pName))
      ) {
        count++;
      }
    }
  }

  return count;
}

export interface SuggestPlacesOptions {
  mode?: 'FROM' | 'TO' | 'from' | 'to';
  excludePlace?: string;
}

/**
 * Returns suggested place names matching user query as they type.
 * Enforces strict place/alias matching with ZERO unrelated district pollution.
 */
export function suggestPlaces(
  query: string,
  homestays: Homestay[] = [],
  destinations: Destination[] = [],
  limit: number = 8,
  options?: SuggestPlacesOptions
): SuggestedPlace[] {
  const cleaned = cleanSearchQuery(query);
  const q = normalize(cleaned);
  const normExclude = options?.excludePlace ? normalize(options.excludePlace) : '';

  // Build merged places catalog (Predefined + any dynamic destinations)
  const placesMap = new Map<string, SuggestedPlace>();

  // Add all static Himalayan places
  for (const p of HIMALAYAN_PLACES) {
    placesMap.set(normalize(p.name), { ...p });
  }

  // Add any extra destinations found in live data
  for (const d of destinations) {
    const norm = normalize(d.name);
    if (!placesMap.has(norm)) {
      placesMap.set(norm, {
        id: `dest-${d.id}`,
        name: d.name,
        district: d.district || 'Darjeeling',
        state: (d.state as any) || 'West Bengal',
        type: (d as any).category === 'Offbeat Village' ? 'village' : 'destination',
        aliases: []
      });
    }
  }

  const allPlaces = Array.from(placesMap.values());

  // Attach dynamic homestay count & category badges
  allPlaces.forEach(p => {
    p.homestayCount = countHomestaysForPlace(p, homestays);
    if (!p.categoryBadge) {
      const lower = p.name.toLowerCase();
      if (lower.includes('airport') || lower.includes('ixb')) {
        p.categoryBadge = '✈️ Airport Hub';
      } else if (lower.includes('railway') || lower.includes('station') || lower.includes('njp')) {
        p.categoryBadge = '🚉 Railway Hub';
      } else if (p.type === 'hub' || lower.includes('stand') || lower.includes('junction')) {
        p.categoryBadge = '🚖 Transport Hub';
      } else if (p.type === 'town') {
        p.categoryBadge = '🏔️ Mountain Town';
      } else if (p.type === 'destination' || lower.includes('peak') || lower.includes('valley') || lower.includes('lake') || lower.includes('ridge')) {
        p.categoryBadge = '🏞️ Scenic Viewpoint';
      } else {
        p.categoryBadge = '🏡 Village';
      }
    }
  });

  const isExcluded = (place: SuggestedPlace) => {
    if (!normExclude) return false;
    const nameNorm = normalize(place.name);
    if (nameNorm === normExclude) return true;
    if ((place.aliases || []).some(a => normalize(a) === normExclude)) return true;
    return false;
  };

  // If query is empty, return curated popular places for FROM or TO
  if (!q) {
    const modeUpper = (options?.mode || '').toUpperCase();
    const sourceList = modeUpper === 'FROM' 
      ? POPULAR_FROM_PLACES 
      : modeUpper === 'TO' 
        ? POPULAR_TO_PLACES 
        : POPULAR_PLACES;

    const popularSet = new Set(sourceList.map(normalize));
    const curated = allPlaces.filter(p => popularSet.has(normalize(p.name)) && !isExcluded(p));
    
    // Sort by order in sourceList
    const popularOrder = new Map(sourceList.map((name, idx) => [normalize(name), idx]));
    curated.sort((a, b) => {
      const idxA = popularOrder.get(normalize(a.name)) ?? 999;
      const idxB = popularOrder.get(normalize(b.name)) ?? 999;
      return idxA - idxB;
    });

    // Deduplicate by normalized name
    const seen = new Set<string>();
    const deduplicated: SuggestedPlace[] = [];
    for (const place of curated) {
      const n = normalize(place.name);
      if (!seen.has(n)) {
        seen.add(n);
        deduplicated.push(place);
      }
    }
    return deduplicated.slice(0, limit);
  }

  // Score each place against query
  const scored: SuggestedPlace[] = [];

  for (const place of allPlaces) {
    // For travel/transit autocomplete, skip raw administrative district polygons
    if (place.type === 'district') continue;
    if (isExcluded(place)) continue;

    const name = normalize(place.name);
    const aliases = (place.aliases || []).map(normalize);

    let score = 0;

    // 1. Exact Name Match
    if (name === q) {
      score = 1000;
    } 
    // 2. Exact Alias Match (e.g. 'njp' -> 'NJP Railway Station', 'bagdogra' -> 'Bagdogra Airport', 'ixb')
    else if (aliases.some(a => a === q)) {
      score = 980;
    }
    // 3. Name starts with query (e.g. 'darj' -> 'Darjeeling', 'mane' -> 'Manebhanjan')
    else if (name.startsWith(q)) {
      score = 850 - (name.length - q.length) * 5;
    }
    // 4. Alias starts with query (e.g. 'new jal' -> 'NJP Railway Station')
    else if (aliases.some(a => a.startsWith(q))) {
      score = 800;
    }
    // 5. Word inside name starts with query (e.g. 'station' -> 'NJP Railway Station')
    else {
      const words = name.split(/[\s\/-]+/);
      for (const w of words) {
        if (w.startsWith(q)) {
          score = 750 - (w.length - q.length) * 5;
          break;
        }
      }
    }

    // 6. Word inside alias starts with query
    if (!score) {
      for (const alias of aliases) {
        const words = alias.split(/[\s\/-]+/);
        for (const w of words) {
          if (w.startsWith(q)) {
            score = 700 - (w.length - q.length) * 5;
            break;
          }
        }
        if (score) break;
      }
    }

    // 7. Name contains query
    if (!score && name.includes(q)) {
      score = 600 - name.indexOf(q) * 10;
    }

    // 8. Alias contains query
    if (!score) {
      for (const alias of aliases) {
        if (alias.includes(q)) {
          score = 550;
          break;
        }
      }
    }

    // STRICT RULE: No district matching here to prevent unrelated village pollution!

    if (score > 0) {
      // Small bonus for primary hubs & towns
      if (place.type === 'hub') score += 30;
      if (place.type === 'town') score += 20;
      if (place.type === 'village' || place.type === 'destination') score += 10;

      scored.push({
        ...place,
        score
      });
    }
  }

  // Sort by score descending
  scored.sort((a, b) => (b.score || 0) - (a.score || 0));

  // Deduplicate results by normalized name
  const seenNames = new Set<string>();
  const finalResults: SuggestedPlace[] = [];
  for (const item of scored) {
    const key = normalize(item.name);
    if (!seenNames.has(key)) {
      seenNames.add(key);
      finalResults.push(item);
    }
  }

  return finalResults.slice(0, limit);
}
