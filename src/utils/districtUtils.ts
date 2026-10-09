export function extractNumericDistrictCode(val?: string | number | null): string | null {
  if (val === undefined || val === null) return null;
  const str = String(val).trim();
  if (!str || str.toLowerCase() === 'all') return null;

  // Extract numeric code from UI values like "SK-741" -> "741", "WB-702" -> "702", "WB-309" -> "309", "741" -> "741"
  const match = str.match(/\d+/);
  if (match && match[0]) {
    const num = match[0];
    if (num === '308') return '314'; // Jalpaiguri legacy code mapping
    if (['309', '702', '314', '664', '225', '228', '226', '227', '741', '742'].includes(num)) {
      return num;
    }
  }

  // Name-based mapping
  const d = str.toLowerCase();
  if (d.includes('alipurduar') || d.includes('buxa') || d.includes('jaldapara')) return '664';
  if (d.includes('darjeeling') || d.includes('kurseong') || d.includes('mirik') || d.includes('takdah') || d.includes('lamahatta') || d.includes('tinchuley')) return '309';
  if (d.includes('jalpaiguri') || d.includes('dooars') || d.includes('lataguri') || d.includes('murti')) return '314';
  if (d.includes('kalimpong') || d.includes('lava') || d.includes('rishyap') || d.includes('rishop') || d.includes('pedong') || d.includes('lolegaon')) return '702';
  if (d.includes('gangtok') || d.includes('east sikkim') || d.includes('east district')) return '225';
  if (d.includes('gyalshing') || d.includes('west sikkim') || d.includes('west district') || d.includes('pelling') || d.includes('yuksom')) return '228';
  if (d.includes('mangan') || d.includes('north sikkim') || d.includes('north district') || d.includes('lachen') || d.includes('lachung')) return '226';
  if (d.includes('namchi') || d.includes('south sikkim') || d.includes('south district') || d.includes('ravangla') || d.includes('borong')) return '227';
  if (d.includes('pakyong') || d.includes('zuluk') || d.includes('dzuluk') || d.includes('aritar') || d.includes('rongli') || d.includes('silk route')) return '741';
  if (d.includes('soreng') || d.includes('okhrey') || d.includes('sombaria') || d.includes('ribdi')) return '742';

  return null;
}

export interface DistrictInfo {
  district: string;
  state: 'West Bengal' | 'Sikkim';
  district_code: string;
  state_code: 'WB' | 'SK';
  slug: string;
  icon?: string;
  tagline?: string;
}

export const DISTRICT_CODE_MAP: Record<string, DistrictInfo> = {
  // Official DB Districts (West Bengal: 309 Darjeeling, 702 Kalimpong, 314 Jalpaiguri, 664 Alipurduar)
  '309': { district: 'Darjeeling', state: 'West Bengal', district_code: '309', state_code: 'WB', slug: 'darjeeling', icon: '🏔️', tagline: 'Queen of Hills & Tea Valleys' },
  'wb-309': { district: 'Darjeeling', state: 'West Bengal', district_code: '309', state_code: 'WB', slug: 'darjeeling', icon: '🏔️', tagline: 'Queen of Hills & Tea Valleys' },
  'darjeeling': { district: 'Darjeeling', state: 'West Bengal', district_code: '309', state_code: 'WB', slug: 'darjeeling', icon: '🏔️', tagline: 'Queen of Hills & Tea Valleys' },

  '702': { district: 'Kalimpong', state: 'West Bengal', district_code: '702', state_code: 'WB', slug: 'kalimpong', icon: '🌸', tagline: 'Orchids, Monasteries & Rishop' },
  'wb-702': { district: 'Kalimpong', state: 'West Bengal', district_code: '702', state_code: 'WB', slug: 'kalimpong', icon: '🌸', tagline: 'Orchids, Monasteries & Rishop' },
  'kalimpong': { district: 'Kalimpong', state: 'West Bengal', district_code: '702', state_code: 'WB', slug: 'kalimpong', icon: '🌸', tagline: 'Orchids, Monasteries & Rishop' },

  '314': { district: 'Jalpaiguri', state: 'West Bengal', district_code: '314', state_code: 'WB', slug: 'jalpaiguri', icon: '🌲', tagline: 'Gateway to Dooars & Murti' },
  'wb-314': { district: 'Jalpaiguri', state: 'West Bengal', district_code: '314', state_code: 'WB', slug: 'jalpaiguri', icon: '🌲', tagline: 'Gateway to Dooars & Murti' },
  '308': { district: 'Jalpaiguri', state: 'West Bengal', district_code: '314', state_code: 'WB', slug: 'jalpaiguri', icon: '🌲', tagline: 'Gateway to Dooars & Murti' },
  'jalpaiguri': { district: 'Jalpaiguri', state: 'West Bengal', district_code: '314', state_code: 'WB', slug: 'jalpaiguri', icon: '🌲', tagline: 'Gateway to Dooars & Murti' },

  '664': { district: 'Alipurduar', state: 'West Bengal', district_code: '664', state_code: 'WB', slug: 'alipurduar', icon: '🦏', tagline: 'Jaldapara & Buxa Wilderness' },
  'wb-664': { district: 'Alipurduar', state: 'West Bengal', district_code: '664', state_code: 'WB', slug: 'alipurduar', icon: '🦏', tagline: 'Jaldapara & Buxa Wilderness' },
  'alipurduar': { district: 'Alipurduar', state: 'West Bengal', district_code: '664', state_code: 'WB', slug: 'alipurduar', icon: '🦏', tagline: 'Jaldapara & Buxa Wilderness' },

  // Official DB Districts (Sikkim: 225 Gangtok, 228 Gyalshing, 226 Mangan, 227 Namchi, 741 Pakyong, 742 Soreng)
  '225': { district: 'Gangtok', state: 'Sikkim', district_code: '225', state_code: 'SK', slug: 'gangtok', icon: '🏙️', tagline: 'East Sikkim & Capital Hub' },
  'sk-225': { district: 'Gangtok', state: 'Sikkim', district_code: '225', state_code: 'SK', slug: 'gangtok', icon: '🏙️', tagline: 'East Sikkim & Capital Hub' },
  'gangtok': { district: 'Gangtok', state: 'Sikkim', district_code: '225', state_code: 'SK', slug: 'gangtok', icon: '🏙️', tagline: 'East Sikkim & Capital Hub' },
  'east sikkim': { district: 'Gangtok', state: 'Sikkim', district_code: '225', state_code: 'SK', slug: 'gangtok', icon: '🏙️', tagline: 'East Sikkim & Capital Hub' },

  '228': { district: 'Gyalshing', state: 'Sikkim', district_code: '228', state_code: 'SK', slug: 'gyalshing', icon: '❄️', tagline: 'West Sikkim, Pelling & Yuksom' },
  'sk-228': { district: 'Gyalshing', state: 'Sikkim', district_code: '228', state_code: 'SK', slug: 'gyalshing', icon: '❄️', tagline: 'West Sikkim, Pelling & Yuksom' },
  'gyalshing': { district: 'Gyalshing', state: 'Sikkim', district_code: '228', state_code: 'SK', slug: 'gyalshing', icon: '❄️', tagline: 'West Sikkim, Pelling & Yuksom' },
  'west sikkim': { district: 'Gyalshing', state: 'Sikkim', district_code: '228', state_code: 'SK', slug: 'gyalshing', icon: '❄️', tagline: 'West Sikkim, Pelling & Yuksom' },

  '226': { district: 'Mangan', state: 'Sikkim', district_code: '226', state_code: 'SK', slug: 'mangan', icon: '🏔️', tagline: 'North Sikkim, Lachung & Lachen' },
  'sk-226': { district: 'Mangan', state: 'Sikkim', district_code: '226', state_code: 'SK', slug: 'mangan', icon: '🏔️', tagline: 'North Sikkim, Lachung & Lachen' },
  'mangan': { district: 'Mangan', state: 'Sikkim', district_code: '226', state_code: 'SK', slug: 'mangan', icon: '🏔️', tagline: 'North Sikkim, Lachung & Lachen' },
  'north sikkim': { district: 'Mangan', state: 'Sikkim', district_code: '226', state_code: 'SK', slug: 'mangan', icon: '🏔️', tagline: 'North Sikkim, Lachung & Lachen' },

  '227': { district: 'Namchi', state: 'Sikkim', district_code: '227', state_code: 'SK', slug: 'namchi', icon: '🌺', tagline: 'South Sikkim, Ravangla & Temi' },
  'sk-227': { district: 'Namchi', state: 'Sikkim', district_code: '227', state_code: 'SK', slug: 'namchi', icon: '🌺', tagline: 'South Sikkim, Ravangla & Temi' },
  'namchi': { district: 'Namchi', state: 'Sikkim', district_code: '227', state_code: 'SK', slug: 'namchi', icon: '🌺', tagline: 'South Sikkim, Ravangla & Temi' },
  'south sikkim': { district: 'Namchi', state: 'Sikkim', district_code: '227', state_code: 'SK', slug: 'namchi', icon: '🌺', tagline: 'South Sikkim, Ravangla & Temi' },

  '741': { district: 'Pakyong', state: 'Sikkim', district_code: '741', state_code: 'SK', slug: 'pakyong', icon: '✈️', tagline: 'Airport, Zuluk & Silk Route' },
  'sk-741': { district: 'Pakyong', state: 'Sikkim', district_code: '741', state_code: 'SK', slug: 'pakyong', icon: '✈️', tagline: 'Airport, Zuluk & Silk Route' },
  'pakyong': { district: 'Pakyong', state: 'Sikkim', district_code: '741', state_code: 'SK', slug: 'pakyong', icon: '✈️', tagline: 'Airport, Zuluk & Silk Route' },

  '742': { district: 'Soreng', state: 'Sikkim', district_code: '742', state_code: 'SK', slug: 'soreng', icon: '🌿', tagline: 'Alpine Valleys & Okhrey' },
  'sk-742': { district: 'Soreng', state: 'Sikkim', district_code: '742', state_code: 'SK', slug: 'soreng', icon: '🌿', tagline: 'Alpine Valleys & Okhrey' },
  'soreng': { district: 'Soreng', state: 'Sikkim', district_code: '742', state_code: 'SK', slug: 'soreng', icon: '🌿', tagline: 'Alpine Valleys & Okhrey' }
};

export const OFFICIAL_DISTRICTS: DistrictInfo[] = [
  // West Bengal
  DISTRICT_CODE_MAP['309'],
  DISTRICT_CODE_MAP['702'],
  DISTRICT_CODE_MAP['314'],
  DISTRICT_CODE_MAP['664'],
  // Sikkim
  DISTRICT_CODE_MAP['225'],
  DISTRICT_CODE_MAP['228'],
  DISTRICT_CODE_MAP['226'],
  DISTRICT_CODE_MAP['227'],
  DISTRICT_CODE_MAP['741'],
  DISTRICT_CODE_MAP['742']
];

export function resolveHomestayDistrictAndState(row: any): { district: string; state: 'West Bengal' | 'Sikkim'; district_code: string } {
  if (!row || typeof row !== 'object') {
    return { district: 'Darjeeling', state: 'West Bengal', district_code: '309' };
  }

  // 1. Direct district code lookup
  const normCode = extractNumericDistrictCode(row.district_code || row.districtCode || row.district);
  if (normCode && DISTRICT_CODE_MAP[normCode]) {
    return {
      district: DISTRICT_CODE_MAP[normCode].district,
      state: DISTRICT_CODE_MAP[normCode].state,
      district_code: DISTRICT_CODE_MAP[normCode].district_code
    };
  }

  const rawDist = String(row.district || row.district_name || '').trim();
  if (rawDist && DISTRICT_CODE_MAP[rawDist.toLowerCase()]) {
    const item = DISTRICT_CODE_MAP[rawDist.toLowerCase()];
    return {
      district: item.district,
      state: item.state,
      district_code: item.district_code
    };
  }

  const addr = String(row.address || '').toLowerCase();
  const name = String(row.homestay_name || row.name || '').toLowerCase();
  const destId = String(row.village_code || row.villageCode || row.destinationId || row.destination_id || '').toLowerCase();
  const combined = `${rawDist.toLowerCase()} ${addr} ${name} ${destId}`;

  // 2. Darjeeling & Kurseong/Mirik settlements
  if (
    combined.includes('darjeeling') || combined.includes('djg') || combined.includes('takdah') ||
    combined.includes('tinchuley') || combined.includes('lamahatta') || combined.includes('lepchajagat') ||
    combined.includes('chatakpur') || combined.includes('sukhiapokhri') || combined.includes('sukhia pokhari') ||
    combined.includes('bijanbari') || combined.includes('ghoom') || combined.includes('sonada') ||
    combined.includes('singamari') || combined.includes('dabaipani') || combined.includes('dawaipani') ||
    combined.includes('gurdum') || combined.includes('pulbazar') || combined.includes('maneybhanjan') ||
    combined.includes('tumling') || combined.includes('tonglu') || combined.includes('sandakphu') ||
    combined.includes('sreekhola') || combined.includes('srikhol') || combined.includes('risti') ||
    combined.includes('rimbick') || combined.includes('lebong') || combined.includes('batasia') ||
    combined.includes('rangbhang') || combined.includes('kurseong') || combined.includes('mirik') ||
    combined.includes('soureni') || combined.includes('tingling') || combined.includes('chimney') ||
    combined.includes('bagora') || combined.includes('dilaram') || combined.includes('makaibari') ||
    combined.includes('bungkulung') || combined.includes('bunkulung') || combined.includes('rohini') ||
    combined.includes('gayabari') || combined.includes('sepoydhura') || combined.includes('sittong') ||
    combined.includes('shittong') || combined.includes('latpanchar') || combined.includes('ahaldara') ||
    combined.includes('selphu') || combined.includes('mahanadi') || combined.includes('tung') ||
    combined.includes('tindharia') || combined.includes('pankhabari') || combined.includes('nagri') ||
    combined.includes('thurbo')
  ) {
    return { district: 'Darjeeling', state: 'West Bengal', district_code: '309' };
  }

  // 3. Kalimpong settlements
  if (
    combined.includes('kalimpong') || combined.includes('lava') || combined.includes('rishyap') || combined.includes('rishop') ||
    combined.includes('pedong') || combined.includes('lolegaon') || combined.includes('loleygaon') || combined.includes('rikkisum') ||
    combined.includes('munsong') || combined.includes('jhandi') || combined.includes('samsing') || combined.includes('sillery') ||
    combined.includes('algarah') || combined.includes('gorubathan') || combined.includes('ramdhura') || combined.includes('echhey') ||
    combined.includes('chuba') || combined.includes('dalapchand') || combined.includes('pabringtar') || combined.includes('burmaik') ||
    combined.includes('samthar') || combined.includes('kaffer') || combined.includes('kafer') || combined.includes('dello') ||
    combined.includes('deolo') || combined.includes('sangsay') || combined.includes('kagey') || combined.includes('pachey') ||
    combined.includes('gitdubling') || combined.includes('bindu') || combined.includes('jaldhaka') || combined.includes('todey') ||
    combined.includes('tangta') || combined.includes('nokdara') || combined.includes('charkhole') || combined.includes('charcole') ||
    combined.includes('lingsey') || combined.includes('ecchey') || combined.includes('kaffir') || combined.includes('relly')
  ) {
    return { district: 'Kalimpong', state: 'West Bengal', district_code: '702' };
  }

  // 4. Pakyong (Silk Route / East Sikkim)
  if (
    combined.includes('pakyong') || combined.includes('zuluk') || combined.includes('dzuluk') ||
    combined.includes('aritar') || combined.includes('rongli') || combined.includes('rolep') ||
    combined.includes('padamchen') || combined.includes('lingtam') || combined.includes('gnathang') ||
    combined.includes('nathang') || combined.includes('kupup') || combined.includes('reshi') ||
    combined.includes('rhenock') || combined.includes('mankhim')
  ) {
    return { district: 'Pakyong', state: 'Sikkim', district_code: '741' };
  }

  // 5. Soreng (West Sikkim)
  if (
    combined.includes('soreng') || combined.includes('sombaria') || combined.includes('okhrey') ||
    combined.includes('ribdi') || combined.includes('dodak') || combined.includes('chumbong') ||
    combined.includes('barsey') || combined.includes('bermiok')
  ) {
    return { district: 'Soreng', state: 'Sikkim', district_code: '742' };
  }

  // 6. Mangan (North Sikkim)
  if (
    combined.includes('north district') || combined.includes('north sikkim') || 
    combined.includes('lachen') || combined.includes('lachung') || 
    combined.includes('mangan') || combined.includes('yumthang') || 
    combined.includes('chungthang') || combined.includes('lingdong') || combined.includes('dzongu') ||
    combined.includes('lingthem') || combined.includes('tingchim') || combined.includes('singhik') ||
    combined.includes('hee gyathang') || combined.includes('shipgyer') || combined.includes('tumlong') ||
    combined.includes('kabi') || combined.includes('phodong') || combined.includes('phensang') ||
    combined.includes('namok') || combined.includes('thangu') || combined.includes('chopta') || combined.includes('katao')
  ) {
    return { district: 'Mangan', state: 'Sikkim', district_code: '226' };
  }

  // 7. Namchi (South Sikkim)
  if (
    combined.includes('south district') || combined.includes('south sikkim') || 
    combined.includes('namchi') || combined.includes('ravangla') || 
    combined.includes('borong') || combined.includes('jorethang') || combined.includes('sikip') || combined.includes('temi') ||
    combined.includes('tarku') || combined.includes('damthang') || combined.includes('sadam') || combined.includes('rabong') ||
    combined.includes('perbing') || combined.includes('yangang') || combined.includes('lingmoo') || combined.includes('kitam') ||
    combined.includes('sumbuk') || combined.includes('maniram')
  ) {
    return { district: 'Namchi', state: 'Sikkim', district_code: '227' };
  }

  // 8. Gyalshing (West Sikkim)
  if (
    combined.includes('west district') || combined.includes('west sikkim') || 
    combined.includes('pelling') || combined.includes('gyalshing') || 
    combined.includes('yuksom') || combined.includes('rinchenpong') || 
    combined.includes('dentam') || combined.includes('hee bermiok') || combined.includes('uttarey') || combined.includes('darap') ||
    combined.includes('tashiding') || combined.includes('kaluk') || combined.includes('khecheopalri') || combined.includes('singshore') || combined.includes('legship')
  ) {
    return { district: 'Gyalshing', state: 'Sikkim', district_code: '228' };
  }

  // 9. Gangtok (East Sikkim)
  if (
    combined.includes('east district') || combined.includes('east sikkim') || 
    combined.includes('gangtok') || combined.includes('rumtek') || 
    combined.includes('ranipool') || combined.includes('singtam') || combined.includes('martam') || combined.includes('luing') ||
    combined.includes('tathangchen') || combined.includes('burtuk') || combined.includes('pajer') || combined.includes('bakkhim') ||
    combined.includes('paleytam') || combined.includes('singbel') || combined.includes('tsomgo') || combined.includes('tadong') ||
    combined.includes('deorali')
  ) {
    return { district: 'Gangtok', state: 'Sikkim', district_code: '225' };
  }

  // 10. Alipurduar
  if (
    combined.includes('alipurduar') || combined.includes('jaldapara') || combined.includes('buxa') ||
    combined.includes('jayanti') || combined.includes('rajabhatkhawa') || combined.includes('chilapata') ||
    combined.includes('totopara') || combined.includes('kumargram') || combined.includes('hasimara') ||
    combined.includes('falakata') || combined.includes('madarihat')
  ) {
    return { district: 'Alipurduar', state: 'West Bengal', district_code: '664' };
  }

  // 11. Jalpaiguri
  if (
    combined.includes('jalpaiguri') || combined.includes('dooars') ||
    combined.includes('lataguri') || combined.includes('murti') || combined.includes('gorumara') ||
    combined.includes('chalsa') || combined.includes('nagrakata') || combined.includes('malbazar') ||
    combined.includes('suntalekhola') || combined.includes('birpara') || combined.includes('dhupguri') ||
    combined.includes('mainaguri')
  ) {
    return { district: 'Jalpaiguri', state: 'West Bengal', district_code: '314' };
  }

  // Coordinate fallback
  const lat = row.latitude !== undefined && row.latitude !== null ? Number(row.latitude) : null;
  const lng = row.longitude !== undefined && row.longitude !== null ? Number(row.longitude) : null;
  if (lat !== null && lng !== null && !isNaN(lat) && !isNaN(lng)) {
    if (lat >= 27.45) return { district: 'Mangan', state: 'Sikkim', district_code: '226' };
    if (lat >= 27.15 && lng < 88.35) return { district: 'Gyalshing', state: 'Sikkim', district_code: '228' };
    if (lat >= 27.25 && lng >= 88.55) return { district: 'Gangtok', state: 'Sikkim', district_code: '225' };
    if (lat >= 27.10 && lat <= 27.35 && lng >= 88.35 && lng < 88.52) return { district: 'Namchi', state: 'Sikkim', district_code: '227' };
    if (lat < 26.75 && lng >= 89.15) return { district: 'Alipurduar', state: 'West Bengal', district_code: '664' };
    if (lat < 26.85) return { district: 'Jalpaiguri', state: 'West Bengal', district_code: '314' };
    if (lng >= 88.48 && lat < 27.20) return { district: 'Kalimpong', state: 'West Bengal', district_code: '702' };
    if (lat >= 26.90 && lat <= 27.15) return { district: 'Darjeeling', state: 'West Bengal', district_code: '309' };
  }

  // State fallback
  const st = String(row.state || '').toLowerCase();
  if (st.includes('sikkim')) {
    return { district: 'Gangtok', state: 'Sikkim', district_code: '225' };
  }

  return { district: 'Darjeeling', state: 'West Bengal', district_code: '309' };
}

export function getHomestayDistrict(h: any): string {
  return resolveHomestayDistrictAndState(h).district;
}

export function getHomestayState(h: any): 'West Bengal' | 'Sikkim' {
  return resolveHomestayDistrictAndState(h).state;
}

export interface PopularSearchPlace {
  name: string;
  district: string;
  state: 'West Bengal' | 'Sikkim';
  type: 'hill_town' | 'hamlet' | 'district' | 'scenic_village' | 'wildlife';
  tagline: string;
  icon?: string;
  aliases?: string[];
}

export const POPULAR_SEARCH_PLACES: PopularSearchPlace[] = [
  { name: 'Darjeeling', district: 'Darjeeling', state: 'West Bengal', type: 'district', tagline: 'Queen of Hills, Toy Train & Tea Estates', icon: '🏔️' },
  { name: 'Kalimpong', district: 'Kalimpong', state: 'West Bengal', type: 'district', tagline: 'Scenic Ridges, Monasteries & Nursery Hamlets', icon: '🌸' },
  { name: 'Gangtok', district: 'Gangtok', state: 'Sikkim', type: 'district', tagline: 'Capital City, MG Marg & Himalayan Monasteries', icon: '🏙️' },
  { name: 'Pelling', district: 'Gyalshing', state: 'Sikkim', type: 'hill_town', tagline: 'Closest Kanchenjunga Vistas & Skywalk', icon: '❄️', aliases: ['geyzing', 'gyalshing'] },
  { name: 'Sittong', district: 'Darjeeling', state: 'West Bengal', type: 'scenic_village', tagline: 'Orange Orchards, Lepcha Valley & Birding', icon: '🍊', aliases: ['shittong', 'ahaldara', 'latpanchar'] },
  { name: 'Lachen', district: 'Mangan', state: 'Sikkim', type: 'hill_town', tagline: 'Gateway to Gurudongmar Lake & High Alpine Pastures', icon: '🏔️', aliases: ['thangu', 'chopta'] },
  { name: 'Lachung', district: 'Mangan', state: 'Sikkim', type: 'hill_town', tagline: 'Valley of Flowers, Yumthang & Zero Point', icon: '🌺', aliases: ['yumthang', 'katao'] },
  { name: 'Namchi', district: 'Namchi', state: 'Sikkim', type: 'district', tagline: 'Char Dham, Samdruptse & South Sikkim Culture', icon: '🛕' },
  { name: 'Kurseong', district: 'Darjeeling', state: 'West Bengal', type: 'hill_town', tagline: 'Land of White Orchids & Eagle\'s Crag Vistas', icon: '🚂', aliases: ['dilaram', 'makaibari', 'chimney'] },
  { name: 'Mirik', district: 'Darjeeling', state: 'West Bengal', type: 'hill_town', tagline: 'Sumendu Lake, Cardamom Groves & Pine Ridges', icon: '🌲', aliases: ['soureni', 'tingling'] },
  { name: 'Lava', district: 'Kalimpong', state: 'West Bengal', type: 'hamlet', tagline: 'Pine Forests, Neora Valley Gateway & Serene Canopy', icon: '🌲', aliases: ['neora valley'] },
  { name: 'Rishop', district: 'Kalimpong', state: 'West Bengal', type: 'hamlet', tagline: '360° Panoramic Mountain Vistas & Tiffindara', icon: '🌄', aliases: ['rishyap'] },
  { name: 'Ravangla', district: 'Namchi', state: 'Sikkim', type: 'hill_town', tagline: 'Buddha Park, Ralang Monasteries & Mist-clad Forests', icon: '☸️', aliases: ['rabong', 'borong'] },
  { name: 'Zuluk', district: 'Pakyong', state: 'Sikkim', type: 'hamlet', tagline: 'Ancient Silk Route, Zig-Zag Curves & Gnathang Valley', icon: '✈️', aliases: ['dzuluk', 'padamchen', 'silk route', 'aritar', 'rongli'] },
  { name: 'Yuksom', district: 'Gyalshing', state: 'Sikkim', type: 'scenic_village', tagline: 'First Capital of Sikkim & Dzongri Trek Base', icon: '⛺', aliases: ['yuksam', 'norbugang'] },
  { name: 'Lamahatta', district: 'Darjeeling', state: 'West Bengal', type: 'scenic_village', tagline: 'Pine Park & Sacred Lake Sanctuary', icon: '🌲', aliases: ['tinchuley', 'takdah'] },
  { name: 'Takdah', district: 'Darjeeling', state: 'West Bengal', type: 'scenic_village', tagline: 'British Heritage Bungalows & Orchid Gardens', icon: '🏡', aliases: ['tinchuley'] },
  { name: 'Tinchuley', district: 'Darjeeling', state: 'West Bengal', type: 'scenic_village', tagline: 'Eco-village with Tri-Peak Kanchenjunga Vistas', icon: '🌄' },
  { name: 'Pedong', district: 'Kalimpong', state: 'West Bengal', type: 'hamlet', tagline: 'Historic Fort Ruins & Cross Hill Panorama', icon: '🏰', aliases: ['sillery gaon', 'icche gaon'] },
  { name: 'Dooars', district: 'Jalpaiguri', state: 'West Bengal', type: 'wildlife', tagline: 'Lataguri, Murti River & Gorumara National Park', icon: '🦏', aliases: ['lataguri', 'murti', 'gorumara', 'chalsa'] },
  { name: 'Buxa', district: 'Alipurduar', state: 'West Bengal', type: 'wildlife', tagline: 'Historic Fort, Jayanti Riverbed & Wilderness', icon: '🐅', aliases: ['jaldapara', 'jayanti', 'chilapata'] },
  { name: 'Okhrey', district: 'Soreng', state: 'Sikkim', type: 'scenic_village', tagline: 'Barsey Rhododendron Sanctuary & Sherpa Village', icon: '🌿', aliases: ['sombaria', 'ribdi', 'barsey'] },
  { name: 'Dzongu', district: 'Mangan', state: 'Sikkim', type: 'scenic_village', tagline: 'Special Indigenous Lepcha Reserve & Waterfalls', icon: '🍃', aliases: ['passingdang', 'tingvong'] },
  { name: 'Lepchajagat', district: 'Darjeeling', state: 'West Bengal', type: 'hamlet', tagline: 'Silent Oak & Pine Canopy Haven', icon: '🦉', aliases: ['sukhiapokhri'] },
  { name: 'Dawaipani', district: 'Darjeeling', state: 'West Bengal', type: 'scenic_village', tagline: 'Clear Kanchanjunga Views Opposite Darjeeling Ridge', icon: '✨' }
];

export interface HomestaySearchResult {
  matches: boolean;
  score: number;
  matchedFields: string[];
  matchedPlace?: PopularSearchPlace;
  detectedDistrict?: string;
}

/**
 * High precision, tokenized search matcher for homestays.
 * Matches any place, district, homestay name, village, address, owner name, or amenities.
 */
export function matchHomestaySearch(
  homestay: any,
  rawQuery: string,
  destinationNameMap?: Record<string, string>
): HomestaySearchResult {
  const q = (rawQuery || '').trim().toLowerCase();
  if (!q) {
    return { matches: true, score: 100, matchedFields: [] };
  }

  // Tokens of query
  const tokens = q.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) {
    return { matches: true, score: 100, matchedFields: [] };
  }

  // Meaningful search tokens ignoring stopwords
  const STOP_WORDS = new Set([
    'in', 'at', 'near', 'around', 'for', 'of', 'the', 'and', '&', 'to', 
    'homestay', 'homestays', 'stay', 'stays', 'hotel', 'hotels', 'resort', 'resorts', 
    'lodge', 'lodges', 'room', 'rooms', 'best', 'top', 'good', 'place', 'places'
  ]);
  const meaningfulTokens = tokens.filter(t => !STOP_WORDS.has(t) && t.length > 1);
  const effectiveTokens = meaningfulTokens.length > 0 ? meaningfulTokens : tokens;

  const name = String(homestay.name || homestay.homestay_name || '').toLowerCase();
  const rawDist = String(homestay.district || homestay.district_name || '').toLowerCase();
  const canonicalDist = getHomestayDistrict(homestay).toLowerCase();
  const state = String(homestay.state || getHomestayState(homestay)).toLowerCase();
  const village = String(homestay.village_name || homestay.village || '').toLowerCase();
  const address = String(homestay.address || '').toLowerCase();
  const owner = String(homestay.owner_name || homestay.ownerName || '').toLowerCase();
  const tagline = String(homestay.tagline || '').toLowerCase();
  const description = String(homestay.description || '').toLowerCase();
  const destId = String(homestay.destinationId || homestay.village_code || '').toLowerCase();
  const destName = destinationNameMap && homestay.destinationId && destinationNameMap[homestay.destinationId]
    ? destinationNameMap[homestay.destinationId].toLowerCase()
    : '';

  const matchedFields: string[] = [];
  let score = 0;

  // 1. Direct Place recognition
  const matchedPlace = POPULAR_SEARCH_PLACES.find(p => {
    const pName = p.name.toLowerCase();
    if (q === pName || q.includes(pName) || pName.includes(q)) return true;
    if (effectiveTokens.some(tok => tok === pName || (tok.length >= 3 && pName.includes(tok)))) return true;
    if (p.aliases && p.aliases.some(a => {
      const aLower = a.toLowerCase();
      return q === aLower || q.includes(aLower) || effectiveTokens.some(tok => tok === aLower);
    })) return true;
    return false;
  });

  // Check if query is looking for a specific place/district
  let detectedDistrict: string | undefined = undefined;
  if (matchedPlace) {
    detectedDistrict = matchedPlace.district;
  } else {
    const distMatch = OFFICIAL_DISTRICTS.find(d => {
      const dName = d.district.toLowerCase();
      return q.includes(dName) || dName.includes(q);
    });
    if (distMatch) {
      detectedDistrict = distMatch.district;
    }
  }

  // Exact full name match
  if (name === q) {
    score += 2000;
    matchedFields.push('name_exact');
  } else if (name.startsWith(q)) {
    score += 1200;
    matchedFields.push('name_prefix');
  } else if (name.includes(q)) {
    score += 800;
    matchedFields.push('name_substring');
  }

  // Exact village / destination match
  if (village && (village === q || village.includes(q))) {
    score += 900;
    matchedFields.push('village');
  }
  if (destName && (destName === q || destName.includes(q))) {
    score += 850;
    matchedFields.push('destination');
  }

  // Place name contained in name, village, address, or description
  if (matchedPlace) {
    const pLower = matchedPlace.name.toLowerCase();
    const isDistrictType = matchedPlace.type === 'district';

    if (name.includes(pLower)) {
      score += 1000;
      matchedFields.push('place_in_name');
    }
    if (village.includes(pLower)) {
      score += 850;
      matchedFields.push('place_in_village');
    }
    if (address.includes(pLower)) {
      score += 700;
      matchedFields.push('place_in_address');
    }
    if (description.includes(pLower)) {
      score += 500;
      matchedFields.push('place_in_description');
    }

    // Check place aliases (e.g. "makaibari", "dowhill" for Kurseong, "neora valley" for Lava)
    if (matchedPlace.aliases) {
      for (const alias of matchedPlace.aliases) {
        const aLower = alias.toLowerCase();
        if (name.includes(aLower) || village.includes(aLower) || address.includes(aLower) || description.includes(aLower)) {
          score += 650;
          matchedFields.push('alias_in_homestay');
          break;
        }
      }
    }

    // District affiliation match:
    // Only if the matchedPlace represents an entire district (e.g. "Darjeeling", "Kalimpong", "Gangtok")
    if (isDistrictType) {
      if (canonicalDist === matchedPlace.district.toLowerCase() || rawDist === matchedPlace.district.toLowerCase()) {
        score += 800;
        matchedFields.push('place_district');
      }
    }
  }

  // Official district direct match (e.g. "kalimpong", "darjeeling", "namchi", "sikkim")
  const isDirectDistrictQuery = OFFICIAL_DISTRICTS.some(d => {
    const dLower = d.district.toLowerCase();
    return q === dLower || q.includes(dLower) || dLower.includes(q);
  });
  if (isDirectDistrictQuery && (canonicalDist.includes(q) || rawDist.includes(q) || (detectedDistrict && canonicalDist === detectedDistrict.toLowerCase()))) {
    score += 800;
    matchedFields.push('district');
  }

  // Address match
  if (address.includes(q)) {
    score += 400;
    matchedFields.push('address');
  }

  // Owner match
  if (owner.includes(q)) {
    score += 500;
    matchedFields.push('owner');
  }

  // Tagline match
  if (tagline.includes(q)) {
    score += 300;
    matchedFields.push('tagline');
  }

  // Token-by-token verification
  // Every effective token must match somewhere in the comprehensive text haystack
  const haystack = `${name} ${rawDist} ${canonicalDist} ${state} ${village} ${address} ${owner} ${tagline} ${description} ${destName} ${destId}`;
  const allTokensMatch = effectiveTokens.every(tok => haystack.includes(tok));

  if (allTokensMatch) {
    score += 300 * effectiveTokens.length;
    matchedFields.push('all_tokens');
  }

  // If query targets a specific town/hamlet (not a whole district),
  // the homestay MUST explicitly match the place, an alias, or all effective tokens.
  let isMatched = false;
  if (matchedPlace && matchedPlace.type !== 'district') {
    const hasPlaceSignal = matchedFields.some(f => 
      ['place_in_name', 'place_in_village', 'place_in_address', 'place_in_description', 'alias_in_homestay'].includes(f)
    );
    isMatched = hasPlaceSignal || allTokensMatch;
  } else {
    isMatched = score > 0 && (allTokensMatch || score >= 400);
  }

  return {
    matches: isMatched,
    score,
    matchedFields,
    matchedPlace,
    detectedDistrict
  };
}
