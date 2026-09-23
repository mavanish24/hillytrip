import { Destination, Homestay } from '../types';

export interface SuggestedPlace {
  id: string;
  name: string;
  district: string;
  state: 'West Bengal' | 'Sikkim';
  type: 'village' | 'town' | 'destination' | 'district';
  aliases?: string[];
  homestayCount?: number;
  score?: number;
  icon?: string;
}

export const HIMALAYAN_PLACES: SuggestedPlace[] = [
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
  { id: 'place-manebhanjan', name: 'Manebhanjan', district: 'Darjeeling', state: 'West Bengal', type: 'village', aliases: ['Manebhanjyang'] },
  { id: 'place-dawaipani', name: 'Dawaipani', district: 'Darjeeling', state: 'West Bengal', type: 'village', aliases: ['Dawai Pani'] },
  { id: 'place-latpanchar', name: 'Latpanchar', district: 'Darjeeling', state: 'West Bengal', type: 'village', aliases: ['Latpanchor', 'Ahaldhara'] },
  { id: 'place-sandakphu', name: 'Sandakphu', district: 'Darjeeling', state: 'West Bengal', type: 'destination', aliases: ['Sandakphu Peak'] },
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
  { id: 'place-yumthang', name: 'Yumthang Valley', district: 'Mangan', state: 'Sikkim', type: 'destination', aliases: ['Valley of Flowers Sikkim'] },
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
  'Darjeeling',
  'Kalimpong',
  'Gangtok',
  'Lava',
  'Kurseong',
  'Ravangla',
  'Pelling',
  'Rishop',
  'Tinchuley',
  'Sittong',
  'Takdah',
  'Lepchajagat',
  'Lolegaon',
  'Sillery Gaon',
  'Mirik',
  'Namchi',
  'Yuksom',
  'Zuluk',
  'Lachen',
  'Lachung'
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

/**
 * Returns suggested place names matching user query as they type.
 */
export function suggestPlaces(
  query: string,
  homestays: Homestay[] = [],
  destinations: Destination[] = [],
  limit: number = 8
): SuggestedPlace[] {
  const cleaned = cleanSearchQuery(query);
  const q = normalize(cleaned);

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

  // Attach dynamic homestay count
  allPlaces.forEach(p => {
    p.homestayCount = countHomestaysForPlace(p, homestays);
  });

  // If query is empty, return popular places
  if (!q) {
    const popularSet = new Set(POPULAR_PLACES.map(normalize));
    const curated = allPlaces.filter(p => popularSet.has(normalize(p.name)));
    
    // Sort by homestay count desc
    curated.sort((a, b) => (b.homestayCount || 0) - (a.homestayCount || 0));
    return curated.slice(0, limit);
  }

  // Score each place against query
  const scored: SuggestedPlace[] = [];

  for (const place of allPlaces) {
    const name = normalize(place.name);
    const district = normalize(place.district);
    const aliases = (place.aliases || []).map(normalize);

    let score = 0;

    // 1. Exact Name Match
    if (name === q) {
      score = 1000;
    } 
    // 2. Name starts with query
    else if (name.startsWith(q)) {
      score = 800 - (name.length - q.length) * 5;
    } 
    // 3. Word inside name starts with query
    else {
      const words = name.split(/\s+/);
      for (const w of words) {
        if (w.startsWith(q)) {
          score = 700 - (w.length - q.length) * 5;
          break;
        }
      }
    }

    // 4. Aliases matching
    if (!score) {
      for (const alias of aliases) {
        if (alias === q) {
          score = 650;
          break;
        } else if (alias.startsWith(q)) {
          score = 600;
          break;
        } else if (alias.includes(q)) {
          score = 450;
          break;
        }
      }
    }

    // 5. Name contains query
    if (!score && name.includes(q)) {
      score = 500 - name.indexOf(q) * 10;
    }

    // 6. District match
    if (!score && district.startsWith(q)) {
      score = 350;
    } else if (!score && district.includes(q)) {
      score = 250;
    }

    // 7. Typo tolerance / subsequence match for queries >= 3 chars
    if (!score && q.length >= 3) {
      let qIdx = 0;
      for (let i = 0; i < name.length && qIdx < q.length; i++) {
        if (name[i] === q[qIdx]) qIdx++;
      }
      if (qIdx === q.length) {
        score = 200;
      }
    }

    if (score > 0) {
      // Small bonus for places with actual homestays
      if ((place.homestayCount || 0) > 0) {
        score += Math.min(place.homestayCount! * 3, 60);
      }
      // Villages and destinations get slight priority over raw districts
      if (place.type === 'village' || place.type === 'town') {
        score += 15;
      }

      scored.push({
        ...place,
        score
      });
    }
  }

  // Sort by score descending
  scored.sort((a, b) => (b.score || 0) - (a.score || 0));

  return scored.slice(0, limit);
}
