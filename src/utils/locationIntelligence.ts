import { Destination, Homestay } from '../types';

export type SearchEntityType = 
  | 'state' 
  | 'district' 
  | 'destination' 
  | 'village' 
  | 'town'
  | 'attraction' 
  | 'homestay' 
  | 'taxi_stand' 
  | 'route' 
  | 'experience' 
  | 'category' 
  | 'taxi_operator';

// Map of known Himalayan destinations/villages to their primary district and state
export const DESTINATION_DISTRICT_MAP: Record<string, { district: string; state: string; isVillage: boolean }> = {
  // Kalimpong District (West Bengal)
  'kalimpong': { district: 'Kalimpong', state: 'West Bengal', isVillage: false },
  'kalimpong town': { district: 'Kalimpong', state: 'West Bengal', isVillage: false },
  'lava': { district: 'Kalimpong', state: 'West Bengal', isVillage: false },
  'pedong': { district: 'Kalimpong', state: 'West Bengal', isVillage: false },
  'rishop': { district: 'Kalimpong', state: 'West Bengal', isVillage: true },
  'loleygaon': { district: 'Kalimpong', state: 'West Bengal', isVillage: true },
  'lolegaon': { district: 'Kalimpong', state: 'West Bengal', isVillage: true },
  'git kolbong': { district: 'Kalimpong', state: 'West Bengal', isVillage: true },
  'icche gaon': { district: 'Kalimpong', state: 'West Bengal', isVillage: true },
  'sillery gaon': { district: 'Kalimpong', state: 'West Bengal', isVillage: true },
  'chhibbo': { district: 'Kalimpong', state: 'West Bengal', isVillage: true },
  'kaage': { district: 'Kalimpong', state: 'West Bengal', isVillage: true },
  'yelbong': { district: 'Kalimpong', state: 'West Bengal', isVillage: true },
  'kolakham': { district: 'Kalimpong', state: 'West Bengal', isVillage: true },
  'bara mangwa': { district: 'Kalimpong', state: 'West Bengal', isVillage: true },
  'chota mangwa': { district: 'Kalimpong', state: 'West Bengal', isVillage: true },
  'algara': { district: 'Kalimpong', state: 'West Bengal', isVillage: true },

  // Darjeeling District (West Bengal)
  'darjeeling': { district: 'Darjeeling', state: 'West Bengal', isVillage: false },
  'darjeeling town': { district: 'Darjeeling', state: 'West Bengal', isVillage: false },
  'takdah': { district: 'Darjeeling', state: 'West Bengal', isVillage: true },
  'lamahatta': { district: 'Darjeeling', state: 'West Bengal', isVillage: true },
  'sittong': { district: 'Darjeeling', state: 'West Bengal', isVillage: true },
  'tinchuley': { district: 'Darjeeling', state: 'West Bengal', isVillage: true },
  'chatakpur': { district: 'Darjeeling', state: 'West Bengal', isVillage: true },
  'mirik': { district: 'Darjeeling', state: 'West Bengal', isVillage: false },
  'kurseong': { district: 'Darjeeling', state: 'West Bengal', isVillage: false },
  'sonada': { district: 'Darjeeling', state: 'West Bengal', isVillage: true },
  'ghoom': { district: 'Darjeeling', state: 'West Bengal', isVillage: true },
  'sukhia pokhari': { district: 'Darjeeling', state: 'West Bengal', isVillage: true },
  'lepchajagat': { district: 'Darjeeling', state: 'West Bengal', isVillage: true },
  'bijanbari': { district: 'Darjeeling', state: 'West Bengal', isVillage: true },
  'rimbik': { district: 'Darjeeling', state: 'West Bengal', isVillage: true },
  'manebhanjan': { district: 'Darjeeling', state: 'West Bengal', isVillage: true },
  'dawaipani': { district: 'Darjeeling', state: 'West Bengal', isVillage: true },
  'latpanchar': { district: 'Darjeeling', state: 'West Bengal', isVillage: true },
  'sourene': { district: 'Darjeeling', state: 'West Bengal', isVillage: true },

  // Sikkim State & Districts
  'gangtok': { district: 'Sikkim', state: 'Sikkim', isVillage: false },
  'pelling': { district: 'Sikkim', state: 'Sikkim', isVillage: false },
  'yuksam': { district: 'Sikkim', state: 'Sikkim', isVillage: true },
  'ravangla': { district: 'Sikkim', state: 'Sikkim', isVillage: false },
  'namchi': { district: 'Sikkim', state: 'Sikkim', isVillage: false },
  'lachen': { district: 'Sikkim', state: 'Sikkim', isVillage: true },
  'lachung': { district: 'Sikkim', state: 'Sikkim', isVillage: true },
  'zuluk': { district: 'Sikkim', state: 'Sikkim', isVillage: true },
  'chemchey': { district: 'Sikkim', state: 'Sikkim', isVillage: true },
  'mangan': { district: 'Sikkim', state: 'Sikkim', isVillage: false },
  'aritar': { district: 'Sikkim', state: 'Sikkim', isVillage: true },
  'borong': { district: 'Sikkim', state: 'Sikkim', isVillage: true },
  'tashiding': { district: 'Sikkim', state: 'Sikkim', isVillage: true },
  'legship': { district: 'Sikkim', state: 'Sikkim', isVillage: true },

  // Dooars / Jalpaiguri (West Bengal)
  'lataguri': { district: 'Jalpaiguri', state: 'West Bengal', isVillage: true },
  'murti': { district: 'Jalpaiguri', state: 'West Bengal', isVillage: true },
  'jhalong': { district: 'Jalpaiguri', state: 'West Bengal', isVillage: true },
  'bindu': { district: 'Jalpaiguri', state: 'West Bengal', isVillage: true },
  'samsing': { district: 'Jalpaiguri', state: 'West Bengal', isVillage: true },
  'suntalekhola': { district: 'Jalpaiguri', state: 'West Bengal', isVillage: true }
};

export function getDestinationDistrict(dest: Destination): string {
  if (dest.district && dest.district.trim() !== '') {
    return dest.district;
  }
  const nameKey = (dest.name || '').toLowerCase().trim();
  if (DESTINATION_DISTRICT_MAP[nameKey]) {
    return DESTINATION_DISTRICT_MAP[nameKey].district;
  }
  for (const [key, meta] of Object.entries(DESTINATION_DISTRICT_MAP)) {
    if (nameKey.includes(key) || key.includes(nameKey)) {
      return meta.district;
    }
  }
  return 'Darjeeling'; // Fallback
}

export function getDestinationState(dest: Destination | string): string {
  const nameKey = typeof dest === 'string' ? dest.toLowerCase().trim() : (dest.name || dest.district || '').toLowerCase().trim();
  if (nameKey.includes('sikkim') || nameKey.includes('gangtok') || nameKey.includes('pelling') || nameKey.includes('lachen') || nameKey.includes('lachung')) {
    return 'Sikkim';
  }
  if (DESTINATION_DISTRICT_MAP[nameKey]) {
    return DESTINATION_DISTRICT_MAP[nameKey].state;
  }
  return 'West Bengal';
}

export interface LocationFilterResult {
  locationTitle: string;
  districtName: string;
  stateName: string;
  entityType: SearchEntityType;
  isDistrictQuery: boolean;
  filteredDestinations: Destination[];
  filteredHomestays: Homestay[];
  popularStayTypes: string[];
  exactHomestayMatch?: Homestay;
}

export function filterByLocationQuery(
  rawQuery: string,
  destinations: Destination[],
  homestays: Homestay[]
): LocationFilterResult {
  const q = (rawQuery || '').trim().toLowerCase();

  // Clean filler words like "homestays in", "stays in", etc.
  const cleanQuery = q
    .replace(/homestays?\s+in\s+/gi, '')
    .replace(/homestays?\s+/gi, '')
    .replace(/stays?\s+in\s+/gi, '')
    .replace(/hotels?\s+in\s+/gi, '')
    .replace(/places?\s+to\s+stay\s+in\s+/gi, '')
    .trim();

  // 1. DEFAULT IF NO QUERY: Return all destinations and homestays across the region
  if (!cleanQuery) {
    return {
      locationTitle: 'Eastern Himalayas',
      districtName: 'North Bengal & Sikkim',
      stateName: 'West Bengal & Sikkim',
      entityType: 'district',
      isDistrictQuery: true,
      filteredDestinations: destinations,
      filteredHomestays: homestays,
      popularStayTypes: ['Tea Garden Stay', 'Mountain View', 'Heritage Stay', 'River View']
    };
  }

  // 2. STATE SEARCH: e.g. "Sikkim" or "West Bengal"
  if (cleanQuery === 'sikkim' || cleanQuery === 'west bengal' || cleanQuery === 'wb' || cleanQuery.includes('sikkim') || cleanQuery.includes('west bengal') || cleanQuery === 'north bengal') {
    const isSikkim = cleanQuery.includes('sikkim');
    const stateName = isSikkim ? 'Sikkim' : 'West Bengal';

    const stateDests = destinations.filter(d => {
      const s = getDestinationState(d).toLowerCase();
      return isSikkim ? s.includes('sikkim') : (s.includes('bengal') || !s.includes('sikkim'));
    });
    const destIds = new Set(stateDests.map(d => d.id.toLowerCase()));

    const stateStays = homestays.filter(h => {
      const hDist = (h.district || '').toLowerCase();
      const hDest = (h.destinationId || '').toLowerCase();
      const hAddr = (h.address || '').toLowerCase();
      const hState = (h.state || '').toLowerCase();
      const hId = (h.id || '').toUpperCase();

      const isStayInSikkim = (
        hState === 'sikkim' ||
        hDist.includes('sikkim') ||
        hDist.includes('gangtok') ||
        hDist.includes('pelling') ||
        hDist.includes('namchi') ||
        hDist.includes('lachen') ||
        hDist.includes('lachung') ||
        hDist.includes('mangan') ||
        hDist.includes('yuksom') ||
        (hId.startsWith('HY') && hId >= 'HY00001' && hId <= 'HY01000') ||
        hId.startsWith('SK') ||
        hAddr.includes('sikkim') ||
        hAddr.includes('north district') ||
        hAddr.includes('south district') ||
        hAddr.includes('east district') ||
        hAddr.includes('west district') ||
        destIds.has(hDest)
      );

      if (isSikkim) {
        return isStayInSikkim;
      } else {
        return !isStayInSikkim;
      }
    });

    return {
      locationTitle: stateName,
      districtName: stateName,
      stateName,
      entityType: 'state',
      isDistrictQuery: true,
      filteredDestinations: stateDests,
      filteredHomestays: stateStays,
      popularStayTypes: isSikkim ? ['Monastery View', 'Alpine Valley Stay', 'Village Homestay', 'Snow Peak View'] : ['Tea Garden Stay', 'Colonial Heritage Stay', 'Pine Forest Stay', 'River View']
    };
  }

  // 3. DISTRICT SEARCH: e.g. "Darjeeling", "Kalimpong", "Jalpaiguri", "Dooars", "East Sikkim", "West Sikkim", "Kurseong", "Mirik"
  const districtKeywords = [
    'kurseong & mirik', 'kurseong', 'mirik',
    'kalimpong', 'darjeeling', 'east sikkim', 'west sikkim', 
    'south sikkim', 'north sikkim', 'jalpaiguri', 'dooars'
  ];

  const matchedDistrictKey = districtKeywords.find(d => cleanQuery.includes(d) || d.includes(cleanQuery));

  if (matchedDistrictKey) {
    const formattedDistrict = matchedDistrictKey.includes('kurseong') || matchedDistrictKey.includes('mirik')
      ? 'Kurseong & Mirik'
      : matchedDistrictKey
          .split(' ')
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ');

    const stateName = getStateForDistrictName(matchedDistrictKey);

    // STRICT DISTRICT FILTER: Only include destinations strictly in this district!
    const destsInDistrict = destinations.filter(d => {
      const dDist = getDestinationDistrict(d).toLowerCase();
      if (matchedDistrictKey.includes('kurseong') || matchedDistrictKey.includes('mirik')) {
        return dDist.includes('kurseong') || dDist.includes('mirik');
      }
      return dDist.includes(matchedDistrictKey) || matchedDistrictKey.includes(dDist);
    });

    const destIds = new Set(destsInDistrict.map(d => d.id.toLowerCase()));
    const destNames = new Set(destsInDistrict.map(d => d.name.toLowerCase()));

    // STRICT HOMESTAY FILTER: Only homestays strictly in this district
    const staysInDistrict = homestays.filter(h => {
      const hDist = (h.district || '').toLowerCase();
      const hDest = (h.destinationId || '').toLowerCase();
      const hAddr = (h.address || '').toLowerCase();
      const hName = (h.name || '').toLowerCase();
      const combined = `${hDist} ${hAddr} ${hName} ${hDest}`;

      if (matchedDistrictKey.includes('kurseong') || matchedDistrictKey.includes('mirik')) {
        return (
          hDist.includes('kurseong') ||
          hDist.includes('mirik') ||
          combined.includes('kurseong') ||
          combined.includes('mirik') ||
          combined.includes('soureni') ||
          combined.includes('tingling') ||
          combined.includes('chimney') ||
          combined.includes('bagora') ||
          combined.includes('dilaram') ||
          combined.includes('makaibari') ||
          combined.includes('bungkulung') ||
          combined.includes('bunkulung') ||
          combined.includes('shittong') ||
          combined.includes('sittong') ||
          combined.includes('latpanchar') ||
          combined.includes('ahaldara') ||
          destIds.has(hDest) ||
          Array.from(destNames).some(name => hDest === name || hAddr.includes(name) || hName.includes(name))
        );
      }

      if (matchedDistrictKey === 'kalimpong') {
        const id = (h.id || '').toUpperCase();
        return (
          hDist.includes('kalimpong') ||
          (id >= 'HY02001' && id <= 'HY03135') ||
          combined.includes('kalimpong') ||
          combined.includes('lava') ||
          combined.includes('rishyap') ||
          combined.includes('rishop') ||
          combined.includes('pedong') ||
          combined.includes('lolegaon') ||
          combined.includes('loleygaon') ||
          combined.includes('rikkisum') ||
          combined.includes('munsong') ||
          combined.includes('jhandi') ||
          combined.includes('samsing') ||
          combined.includes('sillery') ||
          combined.includes('algarah') ||
          combined.includes('gorubathan') ||
          destIds.has(hDest) ||
          Array.from(destNames).some(name => hDest === name || hAddr.includes(name) || hName.includes(name))
        );
      }
      if (matchedDistrictKey === 'darjeeling') {
        const id = (h.id || '').toUpperCase();
        return (
          hDist.includes('darjeeling') ||
          hDist.includes('kurseong') ||
          hDist.includes('mirik') ||
          (id >= 'HY01001' && id <= 'HY02000') ||
          combined.includes('darjeeling') ||
          combined.includes('djg') ||
          combined.includes('takdah') ||
          combined.includes('tinchuley') ||
          combined.includes('lamahatta') ||
          combined.includes('lepchajagat') ||
          combined.includes('chatakpur') ||
          combined.includes('mirik') ||
          combined.includes('kurseong') ||
          combined.includes('ghoom') ||
          combined.includes('sonada') ||
          combined.includes('sukhiapokhri') ||
          combined.includes('sukhia pokhari') ||
          combined.includes('bijanbari') ||
          combined.includes('dabaipani') ||
          combined.includes('dawaipani') ||
          combined.includes('gurdum') ||
          combined.includes('pulbazar') ||
          combined.includes('singamari') ||
          destIds.has(hDest) ||
          Array.from(destNames).some(name => hDest === name || hAddr.includes(name) || hName.includes(name))
        );
      }
      if (matchedDistrictKey === 'east sikkim') {
        return combined.includes('east district') || combined.includes('east sikkim') || combined.includes('gangtok') || combined.includes('pakyong') || combined.includes('rongli') || combined.includes('zuluk') || destIds.has(hDest);
      }
      if (matchedDistrictKey === 'west sikkim') {
        return combined.includes('west district') || combined.includes('west sikkim') || combined.includes('gyalshing') || combined.includes('pelling') || combined.includes('yuksom') || destIds.has(hDest);
      }
      if (matchedDistrictKey === 'south sikkim') {
        return combined.includes('south district') || combined.includes('south sikkim') || combined.includes('namchi') || combined.includes('ravangla') || combined.includes('borong') || destIds.has(hDest);
      }
      if (matchedDistrictKey === 'north sikkim') {
        return combined.includes('north district') || combined.includes('north sikkim') || combined.includes('lachen') || combined.includes('lachung') || combined.includes('mangan') || destIds.has(hDest);
      }
      if (matchedDistrictKey === 'jalpaiguri' || matchedDistrictKey === 'dooars') {
        return combined.includes('jalpaiguri') || combined.includes('dooars') || combined.includes('alipurduar') || combined.includes('lataguri') || combined.includes('murti') || combined.includes('jaldapara') || destIds.has(hDest);
      }

      return (
        hDist.includes(matchedDistrictKey) ||
        destIds.has(hDest) ||
        Array.from(destNames).some(name => hDest === name || hAddr.includes(name) || hName.includes(name))
      );
    });

    return {
      locationTitle: `${formattedDistrict} District`,
      districtName: formattedDistrict,
      stateName,
      entityType: 'district',
      isDistrictQuery: true,
      filteredDestinations: destsInDistrict,
      filteredHomestays: staysInDistrict,
      popularStayTypes: ['Tea Garden Stay', 'Mountain View', 'Family Friendly', 'Forest Stay']
    };
  }

  // 4. HOMESTAY SEARCH: Exact or high-confidence match on Homestay Name
  const exactStayMatch = homestays.find(h => h.name.toLowerCase().trim() === cleanQuery);
  const matchedStaysByName = homestays.filter(h => h.name.toLowerCase().includes(cleanQuery));

  if (exactStayMatch || (matchedStaysByName.length > 0 && matchedStaysByName.length <= 3 && !destinations.some(d => d.name.toLowerCase().includes(cleanQuery)))) {
    const primaryStay = exactStayMatch || matchedStaysByName[0];
    const parentDest = destinations.find(d => 
      d.id.toLowerCase() === (primaryStay.destinationId || '').toLowerCase() ||
      d.name.toLowerCase() === (primaryStay.destinationId || '').toLowerCase() ||
      (primaryStay.address || '').toLowerCase().includes(d.name.toLowerCase())
    );

    return {
      locationTitle: primaryStay.name,
      districtName: primaryStay.district || parentDest?.district || 'Darjeeling',
      stateName: getDestinationState(parentDest || primaryStay.district || 'West Bengal'),
      entityType: 'homestay',
      isDistrictQuery: false,
      filteredDestinations: parentDest ? [parentDest] : [],
      filteredHomestays: matchedStaysByName.length > 0 ? matchedStaysByName : [primaryStay],
      popularStayTypes: primaryStay.experiences || ['Mountain View', 'Homely Food'],
      exactHomestayMatch: primaryStay
    };
  }

  // 5. DESTINATION / VILLAGE SEARCH: e.g. "Lava", "Takdah", "Sittong", "Lolegaon", "Mirik", "Kolakham"
  const matchedDest = destinations.find(d => {
    const nameLower = d.name.toLowerCase();
    return cleanQuery.includes(nameLower) || nameLower.includes(cleanQuery);
  });

  if (matchedDest) {
    const destDistrict = getDestinationDistrict(matchedDest);
    const stateName = getDestinationState(matchedDest);
    const meta = DESTINATION_DISTRICT_MAP[matchedDest.name.toLowerCase()];
    const isVillage = meta ? meta.isVillage : true;
    const entityType: SearchEntityType = isVillage ? 'village' : 'destination';

    // Strictly match homestays in this destination/village
    const staysInDest = homestays.filter(h => {
      const hDest = (h.destinationId || '').toLowerCase();
      const hAddr = (h.address || '').toLowerCase();
      const hName = (h.name || '').toLowerCase();

      return (
        hDest === matchedDest.id.toLowerCase() ||
        hDest === matchedDest.name.toLowerCase() ||
        hDest.includes(matchedDest.name.toLowerCase()) ||
        hAddr.includes(matchedDest.name.toLowerCase()) ||
        hName.includes(matchedDest.name.toLowerCase())
      );
    });

    // Determine popular stay types from actual homestays
    const expSet = new Set<string>();
    staysInDest.forEach(h => {
      if (h.experiences && Array.isArray(h.experiences)) {
        h.experiences.forEach(e => expSet.add(e));
      }
    });
    let popularStayTypes = Array.from(expSet).slice(0, 3);
    if (popularStayTypes.length === 0) {
      popularStayTypes = ['Tea Garden Stay', 'Mountain View', 'Family Friendly'];
    }

    return {
      locationTitle: matchedDest.name,
      districtName: destDistrict,
      stateName,
      entityType,
      isDistrictQuery: false,
      // For Destination/Village search, we return ONLY this matched destination card so that destination grid shows only this village or homestays directly!
      filteredDestinations: [matchedDest],
      filteredHomestays: staysInDest.length > 0 ? staysInDest : homestays.filter(h => (h.destinationId || '').toLowerCase().includes(matchedDest.name.toLowerCase())),
      popularStayTypes
    };
  }

  // 6. EXPERIENCE SEARCH: e.g. "Tea Garden", "Luxury", "Workation", "Pet Friendly", "Family Stay", "Mountain View"
  const experienceKeywords = [
    'tea garden', 'tea estate', 'luxury', 'workation', 'pet friendly', 
    'family stay', 'budget stay', 'mountain view', 'riverside', 'forest stay', 'village stay'
  ];

  const matchedExp = experienceKeywords.find(exp => cleanQuery.includes(exp));
  if (matchedExp) {
    const expTitle = matchedExp.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    
    const expStays = homestays.filter(h => {
      const expList = (h.experiences || []).map(e => e.toLowerCase());
      const desc = (h.description || '').toLowerCase();
      const name = h.name.toLowerCase();
      return expList.some(e => e.includes(matchedExp)) || desc.includes(matchedExp) || name.includes(matchedExp);
    });

    const destIds = new Set(expStays.map(h => (h.destinationId || '').toLowerCase()));
    const matchingDests = destinations.filter(d => destIds.has(d.id.toLowerCase()) || destIds.has(d.name.toLowerCase()));

    return {
      locationTitle: `${expTitle} Experience`,
      districtName: 'Himalayan Region',
      stateName: 'West Bengal & Sikkim',
      entityType: 'experience',
      isDistrictQuery: false,
      filteredDestinations: matchingDests,
      filteredHomestays: expStays.length > 0 ? expStays : homestays,
      popularStayTypes: [expTitle, 'Mountain View', 'Homely Food']
    };
  }

  // 7. GENERAL SEARCH FALLBACK
  const generalDests = destinations.filter(d => 
    d.name.toLowerCase().includes(cleanQuery) ||
    getDestinationDistrict(d).toLowerCase().includes(cleanQuery) ||
    (d.description || '').toLowerCase().includes(cleanQuery)
  );

  const generalStays = homestays.filter(h => 
    h.name.toLowerCase().includes(cleanQuery) ||
    (h.destinationId || '').toLowerCase().includes(cleanQuery) ||
    (h.address || '').toLowerCase().includes(cleanQuery) ||
    (h.district || '').toLowerCase().includes(cleanQuery)
  );

  return {
    locationTitle: cleanQuery.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
    districtName: 'Himalayas',
    stateName: 'West Bengal / Sikkim',
    entityType: 'destination',
    isDistrictQuery: false,
    filteredDestinations: generalDests,
    filteredHomestays: generalStays.length > 0 ? generalStays : homestays,
    popularStayTypes: ['Mountain View', 'Family Stay', 'Tea Garden Stay']
  };
}

function getStateForDistrictName(distKey: string): string {
  if (distKey.includes('sikkim')) return 'Sikkim';
  return 'West Bengal';
}
