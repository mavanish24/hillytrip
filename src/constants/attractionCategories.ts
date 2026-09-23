/**
 * ATTRACTION CATEGORY MASTER
 * 
 * STRICT MASTER LIST: Exactly these 24 categories are the ONLY allowed attraction categories.
 * No additional categories, no renames, no deletions.
 * This exact list governs all future attraction classification, manual processing, and AI categorization.
 */

export const ATTRACTION_CATEGORIES_MASTER = [
  'Mountain & Peaks',
  'Viewpoints & Scenic Points',
  'Waterfalls',
  'Rivers & Lakes',
  'Forests & Nature',
  'Wildlife & Sanctuaries',
  'Tea Gardens',
  'Gardens & Parks',
  'Trekking & Hiking',
  'Camping & Adventure',
  'Temples & Shrines',
  'Monasteries',
  'Churches & Religious Sites',
  'Heritage & Historical',
  'Villages & Local Life',
  'Scenic Roads & Passes',
  'Bridges & Infrastructure',
  'Railways & Stations',
  'Caves & Rock Formations',
  'Hot Springs & Wellness',
  'Beaches & Riverfronts',
  'Culture & Experiences',
  'Food & Local Markets',
  'Other Attractions'
] as const;

export type AttractionMasterCategory = typeof ATTRACTION_CATEGORIES_MASTER[number];

export interface AttractionCategoryMetadata {
  id: number;
  name: AttractionMasterCategory;
  slug: string;
  description: string;
  keywords: string[];
  examples: string[];
  icon: string;
  color: string;
}

export const ATTRACTION_CATEGORIES_METADATA: AttractionCategoryMetadata[] = [
  {
    id: 1,
    name: 'Mountain & Peaks',
    slug: 'mountain-and-peaks',
    description: 'High altitude mountain summits, Himalayan peaks, cliffs, snow crests, and prominent massifs.',
    keywords: ['mountain', 'peak', 'summit', 'ridge', 'cliff', 'kanchenjunga', 'himalaya', 'hilltop', 'altitude'],
    examples: ['Kanchenjunga Peak', 'Sandakphu Summit', 'Phalut', 'Mt Pandim'],
    icon: 'Mountain',
    color: 'emerald'
  },
  {
    id: 2,
    name: 'Viewpoints & Scenic Points',
    slug: 'viewpoints-and-scenic-points',
    description: 'Designated sunrise/sunset points, panoramic viewing decks, lookouts, and scenic horizon vantage spots.',
    keywords: ['viewpoint', 'view point', 'scenic point', 'lookout', 'sunrise point', 'sunset point', 'observatory', 'panorama'],
    examples: ['Tiger Hill', 'Tashi Viewpoint', 'Pelling Skywalk', 'Delo Hill'],
    icon: 'Eye',
    color: 'sky'
  },
  {
    id: 3,
    name: 'Waterfalls',
    slug: 'waterfalls',
    description: 'Cascades, natural water chutes, tiered falls, mountain cataracts, and seasonal plunge falls.',
    keywords: ['waterfall', 'falls', 'cascade', 'cataract', 'chute', 'plunge', 'stream falls'],
    examples: ['Khangchendzonga Waterfalls', 'Changey Falls', 'Rimbi Waterfall', 'Paglajhora Falls'],
    icon: 'Droplets',
    color: 'cyan'
  },
  {
    id: 4,
    name: 'Rivers & Lakes',
    slug: 'rivers-and-lakes',
    description: 'Glacial lakes, sacred tso water bodies, river confluences, riverbanks, and alpine tarns.',
    keywords: ['lake', 'river', 'tso', 'confluence', 'tarn', 'pond', 'stream', 'teesta', 'rangit'],
    examples: ['Gurudongmar Lake', 'Tsomgo Lake (Changu)', 'Khecheopalri Lake', 'Teesta-Rangeet Confluence'],
    icon: 'Waves',
    color: 'blue'
  },
  {
    id: 5,
    name: 'Forests & Nature',
    slug: 'forests-and-nature',
    description: 'Pine/oak woodlands, botanical reserves, biodiversity biomes, valleys, and lush green natural expanses.',
    keywords: ['forest', 'woods', 'jungle', 'nature', 'valley', 'flora', 'pine', 'rhododendron', 'reserve'],
    examples: ['Yumthang Valley of Flowers', 'Senchal Pine Forest', 'Lava Pine Forest', 'Barsey Rhododendron Sanctuary'],
    icon: 'Trees',
    color: 'green'
  },
  {
    id: 6,
    name: 'Wildlife & Sanctuaries',
    slug: 'wildlife-and-sanctuaries',
    description: 'National parks, wildlife sanctuaries, high-altitude zoos, birding havens, and protected conservation zones.',
    keywords: ['wildlife', 'sanctuary', 'national park', 'zoo', 'safari', 'birding', 'red panda', 'fauna'],
    examples: ['Singalila National Park', 'Neora Valley National Park', 'Padmaja Naidu Himalayan Zoo', 'Fambong Lho Sanctuary'],
    icon: 'Bug',
    color: 'amber'
  },
  {
    id: 7,
    name: 'Tea Gardens',
    slug: 'tea-gardens',
    description: 'Historic tea estates, rolling tea plantations, tea tasting centers, and organic tea gardens.',
    keywords: ['tea garden', 'tea estate', 'plantation', 'tea tasting', 'tea factory', 'makaibari', 'happy valley'],
    examples: ['Happy Valley Tea Estate', 'Makaibari Tea Estate', 'Glenburn Tea Estate', 'Temi Tea Garden'],
    icon: 'Leaf',
    color: 'lime'
  },
  {
    id: 8,
    name: 'Gardens & Parks',
    slug: 'gardens-and-parks',
    description: 'Manicured public parks, botanical rock gardens, flower gardens, landscaped recreation spaces.',
    keywords: ['garden', 'park', 'botanical garden', 'rock garden', 'nursery', 'recreation', 'arboretum'],
    examples: ['Lloyd Botanical Garden', 'Barbotey Rock Garden', 'Jawaharlal Nehru Botanical Garden', 'Pine View Cactus Nursery'],
    icon: 'Flower2',
    color: 'teal'
  },
  {
    id: 9,
    name: 'Trekking & Hiking',
    slug: 'trekking-and-hiking',
    description: 'Designated hiking trails, mountain expedition trailheads, ridge walks, and alpine trekking circuits.',
    keywords: ['trek', 'trekking', 'hike', 'hiking', 'trail', 'trailhead', 'climb', 'route', 'path'],
    examples: ['Goechala Trek Route', 'Sandakphu-Phalut Trail', 'Dzongri Trail', 'Varsey Trek'],
    icon: 'Footprints',
    color: 'orange'
  },
  {
    id: 10,
    name: 'Camping & Adventure',
    slug: 'camping-and-adventure',
    description: 'Campsites, riverside tenting, paragliding takeoffs, river rafting points, zip-lining, and rope courses.',
    keywords: ['camping', 'camp', 'adventure', 'paragliding', 'rafting', 'zipline', 'rope course', 'rock climbing', 'kayak'],
    examples: ['Teesta River Rafting Point', 'Kalimpong Paragliding Launch', 'Triveni Riverside Camping', 'Lachen Wilderness Camps'],
    icon: 'Tent',
    color: 'rose'
  },
  {
    id: 11,
    name: 'Temples & Shrines',
    slug: 'temples-and-shrines',
    description: 'Hindu, Buddhist, or folk shrines, sacred caves, deity temples, and traditional pilgrimage sites.',
    keywords: ['temple', 'mandir', 'shrine', 'dham', 'sacred', 'deity', 'shiva', 'kali', 'devi'],
    examples: ['Mahakal Temple Darjeeling', 'Char Dham (Siddheshwar Dham)', 'Samdruptse Temple', 'Kirateshwar Mahadev Mandir'],
    icon: 'Landmark',
    color: 'amber'
  },
  {
    id: 12,
    name: 'Monasteries',
    slug: 'monasteries',
    description: 'Tibetan Buddhist gompas, chortens, stupas, monasteries, meditation halls, and lamaserais.',
    keywords: ['monastery', 'gompa', 'chorten', 'stupa', 'buddhist', 'lama', 'prayer wheel', 'rumtek', 'ghoom'],
    examples: ['Rumtek Monastery', 'Ghoom Monastery (Yiga Choeling)', 'Pemayangtse Monastery', 'Enchey Monastery'],
    icon: 'Flame',
    color: 'red'
  },
  {
    id: 13,
    name: 'Churches & Religious Sites',
    slug: 'churches-and-religious-sites',
    description: 'Colonial churches, cathedrals, historic chapels, mosques, gurudwaras, and interfaith spiritual centers.',
    keywords: ['church', 'cathedral', 'chapel', 'basilica', 'mosque', 'gurudwara', 'convent', 'spiritual'],
    examples: ['St. Andrew\'s Church Darjeeling', 'St. Paul\'s Cathedral', 'MacFarlane Memorial Church', 'Gurudwara Nanak Lama Chungthang'],
    icon: 'Church',
    color: 'violet'
  },
  {
    id: 14,
    name: 'Heritage & Historical',
    slug: 'heritage-and-historical',
    description: 'Historic palaces, royal ruins, colonial clocktowers, memorials, museums, and archaeological sites.',
    keywords: ['heritage', 'history', 'historical', 'palace', 'fort', 'ruins', 'museum', 'monument', 'memorial', 'clock tower'],
    examples: ['Rabdentse Ruins', 'Darjeeling Himalayan Railway Museum', 'Gorkha War Memorial', 'Morgan House'],
    icon: 'Shield',
    color: 'slate'
  },
  {
    id: 15,
    name: 'Villages & Local Life',
    slug: 'villages-and-local-life',
    description: 'Traditional rural hamlets, tribal settlements, indigenous craft centers, eco-tourism mountain villages.',
    keywords: ['village', 'hamlet', 'rural', 'settlement', 'eco village', 'community', 'indigenous', 'homestay village'],
    examples: ['Lepchajagat Village', 'Chatakpur Eco Village', 'Rishyap', 'Yuksom Ancient Village'],
    icon: 'Home',
    color: 'emerald'
  },
  {
    id: 16,
    name: 'Scenic Roads & Passes',
    slug: 'scenic-roads-and-passes',
    description: 'High-altitude mountain passes (La), hair-pin loop drives, scenic mountain highways, and ridge bypasses.',
    keywords: ['pass', 'mountain pass', 'scenic road', 'drive', 'highway', 'loops', 'la', 'nathula', 'jalep la'],
    examples: ['Nathula Pass', 'Silk Route (Zuluk Loops)', 'Peshok Tea Garden Road', 'Chungthang-Lachen Highway'],
    icon: 'Navigation2',
    color: 'indigo'
  },
  {
    id: 17,
    name: 'Bridges & Infrastructure',
    slug: 'bridges-and-infrastructure',
    description: 'Hanging suspension bridges, glass skywalks, river viaducts, dam reservoirs, and engineering landmarks.',
    keywords: ['bridge', 'suspension bridge', 'hanging bridge', 'skywalk', 'dam', 'viaduct', 'ropeway'],
    examples: ['Singshore Bridge (Suspension)', 'Coronation Bridge (Sevoke)', 'Darjeeling Ropeway', 'Teesta Dam Reservoir'],
    icon: 'CableCar',
    color: 'zinc'
  },
  {
    id: 18,
    name: 'Railways & Stations',
    slug: 'railways-and-stations',
    description: 'UNESCO heritage toy train lines, steam sheds, mountain railway loops, and historic mountain train stations.',
    keywords: ['railway', 'station', 'toy train', 'dhr', 'steam loco', 'batasia loop', 'ghoom station', 'train track'],
    examples: ['Batasia Loop & War Memorial', 'Ghoom Railway Station (Highest Altitude)', 'Kurseong DHR Station', 'Darjeeling Station'],
    icon: 'Train',
    color: 'red'
  },
  {
    id: 19,
    name: 'Caves & Rock Formations',
    slug: 'caves-and-rock-formations',
    description: 'Sacred limestone caves, natural cavern chambers, dramatic rock spires, balancing boulders.',
    keywords: ['cave', 'cavern', 'rock formation', 'boulder', 'limestone', 'gufa', 'rock face'],
    examples: ['Lha-ri-nying-phu Holy Cave', 'Phur-cha-chu Caves', 'Ganga Maya Rock Formations', 'Kanchenjunga Spires'],
    icon: 'MountainSnow',
    color: 'stone'
  },
  {
    id: 20,
    name: 'Hot Springs & Wellness',
    slug: 'hot-springs-and-wellness',
    description: 'Natural sulfur hot springs, therapeutic medicinal pools, herbal bath spots, and wellness retreats.',
    keywords: ['hot spring', 'springs', 'sulfur', 'wellness', 'spa', 'medicinal water', 'reshi hot spring', 'yumthang hot spring'],
    examples: ['Reshi Hot Water Spring', 'Yumthang Hot Springs', 'Borong Hot Spring', 'Ralang Sulphur Baths'],
    icon: 'Sparkles',
    color: 'fuchsia'
  },
  {
    id: 21,
    name: 'Beaches & Riverfronts',
    slug: 'beaches-and-riverfronts',
    description: 'Pebble beaches, sandy riverbanks, riverside picnic meadows, and mountain stream shorelines.',
    keywords: ['beach', 'riverfront', 'riverbank', 'pebble beach', 'sandy bank', 'riverside meadow', 'shore'],
    examples: ['Triveni River Beach', 'Sevoke Riverbank', 'Rangeet River Beach', 'Rishi Riverfront'],
    icon: 'Sun',
    color: 'yellow'
  },
  {
    id: 22,
    name: 'Culture & Experiences',
    slug: 'culture-and-experiences',
    description: 'Handicraft craft workshops, cultural centers, traditional music/dance hubs, and heritage institutes.',
    keywords: ['culture', 'experience', 'cultural center', 'handicraft', 'craft', 'art', 'himalayan institute', 'pottery'],
    examples: ['Tibetan Refugee Self-Help Centre', 'Namgyal Institute of Tibetology', 'Himalayan Mountaineering Institute', 'Kalimpong Arts & Crafts'],
    icon: 'Palette',
    color: 'purple'
  },
  {
    id: 23,
    name: 'Food & Local Markets',
    slug: 'food-and-local-markets',
    description: 'Traditional hill bazaars, organic farmers markets, tea cafes, bakeries, and street food lanes.',
    keywords: ['market', 'bazaar', 'food', 'market lane', 'bakery', 'organic produce', 'street food', 'cafe', 'mall road market'],
    examples: ['Darjeeling Mall Road Bazaar', 'MG Marg Gangtok', 'Kalimpong Haat Bazaar', 'Glenary\'s Bakery & Cafe'],
    icon: 'ShoppingBag',
    color: 'orange'
  },
  {
    id: 24,
    name: 'Other Attractions',
    slug: 'other-attractions',
    description: 'Catch-all category for unique landmarks, multipurpose attractions, or unclassified points of interest.',
    keywords: ['other', 'landmark', 'sight', 'point of interest', 'general', 'miscellaneous'],
    examples: ['Local Clock Tower', 'Town Center Plazas', 'Boundary Markers'],
    icon: 'HelpCircle',
    color: 'gray'
  }
];

/**
 * Strict validator: Checks if a category string exactly matches one of the 24 Master Categories.
 */
export function isValidAttractionCategory(category: string): category is AttractionMasterCategory {
  if (!category) return false;
  return (ATTRACTION_CATEGORIES_MASTER as readonly string[]).includes(category.trim());
}

/**
 * AI & Normalization Helper:
 * Strictly maps any raw category, text or AI classification to ONE of the 24 exact Master Categories.
 * Never invents, alters, or returns an unapproved category string.
 */
export function normalizeAttractionCategory(rawCategory: string, attractionName = '', description = ''): AttractionMasterCategory {
  if (!rawCategory && !attractionName) {
    return 'Other Attractions';
  }

  const rawTrimmed = (rawCategory || '').trim();
  // 1. Direct exact match
  if (isValidAttractionCategory(rawTrimmed)) {
    return rawTrimmed;
  }

  // 2. Case-insensitive exact match
  const rawLower = rawTrimmed.toLowerCase();
  const exactCaseInsensitive = ATTRACTION_CATEGORIES_MASTER.find(c => c.toLowerCase() === rawLower);
  if (exactCaseInsensitive) {
    return exactCaseInsensitive;
  }

  // 3. Known historical/synonym dictionary mapping to the 24 fixed categories
  const SYNONYM_MAP: Record<string, AttractionMasterCategory> = {
    'viewpoint': 'Viewpoints & Scenic Points',
    'view point': 'Viewpoints & Scenic Points',
    'scenic point': 'Viewpoints & Scenic Points',
    'sunrise point': 'Viewpoints & Scenic Points',
    'sunset point': 'Viewpoints & Scenic Points',
    'mountain': 'Mountain & Peaks',
    'peak': 'Mountain & Peaks',
    'summit': 'Mountain & Peaks',
    'snow peak': 'Mountain & Peaks',
    'waterfall': 'Waterfalls',
    'falls': 'Waterfalls',
    'cascade': 'Waterfalls',
    'lake': 'Rivers & Lakes',
    'river': 'Rivers & Lakes',
    'water body': 'Rivers & Lakes',
    'forest': 'Forests & Nature',
    'nature': 'Forests & Nature',
    'valley': 'Forests & Nature',
    'wildlife': 'Wildlife & Sanctuaries',
    'sanctuary': 'Wildlife & Sanctuaries',
    'national park': 'Wildlife & Sanctuaries',
    'zoo': 'Wildlife & Sanctuaries',
    'tea garden': 'Tea Gardens',
    'tea estate': 'Tea Gardens',
    'tea plantation': 'Tea Gardens',
    'garden': 'Gardens & Parks',
    'park': 'Gardens & Parks',
    'botanical garden': 'Gardens & Parks',
    'trek': 'Trekking & Hiking',
    'trekking': 'Trekking & Hiking',
    'hiking': 'Trekking & Hiking',
    'trail': 'Trekking & Hiking',
    'camping': 'Camping & Adventure',
    'adventure': 'Camping & Adventure',
    'paragliding': 'Camping & Adventure',
    'rafting': 'Camping & Adventure',
    'temple': 'Temples & Shrines',
    'mandir': 'Temples & Shrines',
    'shrine': 'Temples & Shrines',
    'monastery': 'Monasteries',
    'gompa': 'Monasteries',
    'chorten': 'Monasteries',
    'stupa': 'Monasteries',
    'church': 'Churches & Religious Sites',
    'cathedral': 'Churches & Religious Sites',
    'religious': 'Churches & Religious Sites',
    'heritage': 'Heritage & Historical',
    'historical': 'Heritage & Historical',
    'history': 'Heritage & Historical',
    'monument': 'Heritage & Historical',
    'museum': 'Heritage & Historical',
    'village': 'Villages & Local Life',
    'rural': 'Villages & Local Life',
    'eco village': 'Villages & Local Life',
    'pass': 'Scenic Roads & Passes',
    'road': 'Scenic Roads & Passes',
    'drive': 'Scenic Roads & Passes',
    'bridge': 'Bridges & Infrastructure',
    'suspension bridge': 'Bridges & Infrastructure',
    'skywalk': 'Bridges & Infrastructure',
    'railway': 'Railways & Stations',
    'train': 'Railways & Stations',
    'toy train': 'Railways & Stations',
    'station': 'Railways & Stations',
    'cave': 'Caves & Rock Formations',
    'rock': 'Caves & Rock Formations',
    'hot spring': 'Hot Springs & Wellness',
    'wellness': 'Hot Springs & Wellness',
    'beach': 'Beaches & Riverfronts',
    'riverfront': 'Beaches & Riverfronts',
    'culture': 'Culture & Experiences',
    'experience': 'Culture & Experiences',
    'market': 'Food & Local Markets',
    'food': 'Food & Local Markets',
    'bazaar': 'Food & Local Markets',
    'cafe': 'Food & Local Markets',
    'other': 'Other Attractions',
    'sight': 'Other Attractions',
    'sights': 'Other Attractions',
    'attraction': 'Other Attractions',
    'attractions': 'Other Attractions',
    'point of interest': 'Other Attractions',
    'poi': 'Other Attractions',
    'scenic routes': 'Scenic Roads & Passes',
    'forest & wildlife': 'Forests & Nature',
    'culture & markets': 'Food & Local Markets',
    'temples & religious sites': 'Temples & Shrines',
    'parks & recreation': 'Gardens & Parks',
    'gardens & tea estates': 'Tea Gardens',
    'heritage & museums': 'Heritage & Historical',
    'treks & adventure': 'Trekking & Hiking',
    'mountains & peaks': 'Mountain & Peaks',
    'geological sites': 'Caves & Rock Formations',
    'gurudwara': 'Churches & Religious Sites',
    'gurudwaras': 'Churches & Religious Sites',
    'mosque': 'Churches & Religious Sites',
    'landmarks': 'Other Attractions'
  };

  if (SYNONYM_MAP[rawLower]) {
    return SYNONYM_MAP[rawLower];
  }

  // 4. Keyword heuristic based on category metadata
  const fullText = `${rawLower} ${(attractionName || '').toLowerCase()} ${(description || '').toLowerCase()}`;
  for (const meta of ATTRACTION_CATEGORIES_METADATA) {
    if (meta.name === 'Other Attractions') continue;
    for (const kw of meta.keywords) {
      if (fullText.includes(kw)) {
        return meta.name;
      }
    }
  }

  return 'Other Attractions';
}

export interface ClassificationResult {
  normalized_category: AttractionMasterCategory | null;
  category_status: 'AUTO_ASSIGNED' | 'NEEDS_REVIEW';
  category_reason: string;
}

/**
 * Normalizes an attraction record using its name, description, village_name, and raw category.
 * Strictly adheres to the 24 Master Categories.
 * Sets category_status = 'NEEDS_REVIEW' and normalized_category = null when genuinely uncertain or missing context.
 */
export function classifyAttractionRecord(record: {
  attraction_name?: string | null;
  description?: string | null;
  village_name?: string | null;
  category?: string | null;
}): ClassificationResult {
  const rawCat = (record.category || '').trim();
  const name = (record.attraction_name || '').trim();
  const desc = (record.description || '').trim();
  const village = (record.village_name || '').trim();

  // If attraction name is missing and description/raw category are both empty -> genuinely uncertain
  if (!name && !desc && !rawCat) {
    return {
      normalized_category: null,
      category_status: 'NEEDS_REVIEW',
      category_reason: 'Missing attraction_name, description, and original category.'
    };
  }

  // If raw category is already an exact Master Category match
  if (isValidAttractionCategory(rawCat)) {
    return {
      normalized_category: rawCat,
      category_status: 'AUTO_ASSIGNED',
      category_reason: `Exact match with Master Category "${rawCat}".`
    };
  }

  // Check if raw category is something explicitly ambiguous / invalid
  const rawLower = rawCat.toLowerCase();
  if (['unknown', 'n/a', 'na', 'null', 'undefined', 'tbd', 'temp', 'test', '?', 'none', 'blank'].includes(rawLower)) {
    if (!name && !desc) {
      return {
        normalized_category: null,
        category_status: 'NEEDS_REVIEW',
        category_reason: `Original category "${rawCat}" is placeholder and no descriptive name/description available.`
      };
    }
  }

  const nameLower = name.toLowerCase();
  const descLower = desc.toLowerCase();
  const combined = `${rawLower} | ${nameLower} | ${descLower} | ${village.toLowerCase()}`;

  // 1. Specific High-Confidence Keyword Matchers
  // Monasteries
  if (
    rawLower.includes('monaster') || rawLower.includes('gompa') || rawLower.includes('chorten') || rawLower.includes('stupa') ||
    nameLower.includes('monastery') || nameLower.includes('gompa') || nameLower.includes('chorten') || nameLower.includes('stupa') ||
    descLower.includes('buddhist monastery') || descLower.includes('tibetan monastery') || descLower.includes('sacred gompa')
  ) {
    return {
      normalized_category: 'Monasteries',
      category_status: 'AUTO_ASSIGNED',
      category_reason: 'Identified Buddhist monastery/gompa/stupa keywords in name, category, or description.'
    };
  }

  // Waterfalls
  if (
    rawLower.includes('waterfall') || rawLower.includes('falls') || rawLower.includes('cascade') ||
    nameLower.includes('waterfall') || nameLower.includes('falls') || nameLower.includes('cascade') || nameLower.includes('jharna') ||
    descLower.includes('waterfall') || descLower.includes('perennial cascade')
  ) {
    return {
      normalized_category: 'Waterfalls',
      category_status: 'AUTO_ASSIGNED',
      category_reason: 'Identified waterfall/falls/cascade features in name or description.'
    };
  }

  // Tea Gardens
  if (
    rawLower.includes('tea') || nameLower.includes('tea garden') || nameLower.includes('tea estate') || nameLower.includes('tea factory') ||
    descLower.includes('tea garden') || descLower.includes('tea estate') || descLower.includes('tea plantation') || descLower.includes('tea tasting')
  ) {
    return {
      normalized_category: 'Tea Gardens',
      category_status: 'AUTO_ASSIGNED',
      category_reason: 'Identified tea estate/tea garden plantation keywords.'
    };
  }

  // Wildlife & Sanctuaries
  if (
    rawLower.includes('wildlife') || rawLower.includes('sanctuary') || rawLower.includes('zoo') || rawLower.includes('national park') || rawLower.includes('safari') ||
    nameLower.includes('wildlife') || nameLower.includes('sanctuary') || nameLower.includes('national park') || nameLower.includes('zoological') || nameLower.includes('zoo') ||
    descLower.includes('wildlife sanctuary') || descLower.includes('national park') || descLower.includes('high-altitude zoo') || descLower.includes('fauna conservation')
  ) {
    return {
      normalized_category: 'Wildlife & Sanctuaries',
      category_status: 'AUTO_ASSIGNED',
      category_reason: 'Identified wildlife sanctuary, national park, or zoological reserve features.'
    };
  }

  // Mountain & Peaks
  if (
    rawLower === 'mountains & peaks' || rawLower === 'mountain & peaks' || rawLower.includes('mountain') || rawLower.includes('peak') ||
    nameLower.includes(' peak') || nameLower.endsWith(' peak') || nameLower.includes('summit') || nameLower.includes('kanchenjunga') ||
    descLower.includes('mountain peak') || descLower.includes('highest summit') || descLower.includes('snow peak')
  ) {
    // If it is primarily a viewpoint looking AT the peak, check for viewpoint keywords
    if (nameLower.includes('viewpoint') || nameLower.includes('view point') || descLower.includes('panoramic viewpoint') || descLower.includes('sunrise view')) {
      return {
        normalized_category: 'Viewpoints & Scenic Points',
        category_status: 'AUTO_ASSIGNED',
        category_reason: 'Identified viewpoint overlooking mountain peaks.'
      };
    }
    return {
      normalized_category: 'Mountain & Peaks',
      category_status: 'AUTO_ASSIGNED',
      category_reason: 'Identified mountain summit, peak, or geological elevation.'
    };
  }

  // Viewpoints & Scenic Points
  if (
    rawLower.includes('viewpoint') || rawLower.includes('view point') || rawLower.includes('scenic point') || rawLower.includes('sunrise') || rawLower.includes('sunset') ||
    nameLower.includes('viewpoint') || nameLower.includes('view point') || nameLower.includes('lookout') || nameLower.includes('observatory') || nameLower.includes('point') ||
    descLower.includes('panoramic view') || descLower.includes('scenic viewpoint') || descLower.includes('overlook') || descLower.includes('mountain view point')
  ) {
    return {
      normalized_category: 'Viewpoints & Scenic Points',
      category_status: 'AUTO_ASSIGNED',
      category_reason: 'Identified viewpoint, panorama overlook, or sunrise/sunset point.'
    };
  }

  // Rivers & Lakes
  if (
    rawLower.includes('river') || rawLower.includes('lake') || rawLower.includes('water body') ||
    nameLower.includes('lake') || nameLower.includes('river') || nameLower.includes('stream') || nameLower.includes('pokhri') || nameLower.includes('tso') ||
    descLower.includes('alpine lake') || descLower.includes('glacial lake') || descLower.includes('river confluence') || descLower.includes('sacred lake')
  ) {
    return {
      normalized_category: 'Rivers & Lakes',
      category_status: 'AUTO_ASSIGNED',
      category_reason: 'Identified river, glacial lake, tso, or water body.'
    };
  }

  // Caves & Rock Formations
  if (
    rawLower.includes('cave') || rawLower.includes('rock') || rawLower.includes('geological') ||
    nameLower.includes('cave') || nameLower.includes('gupha') || nameLower.includes('rock') || nameLower.includes('formation') ||
    descLower.includes('limestone cave') || descLower.includes('sacred cave') || descLower.includes('natural rock formation')
  ) {
    return {
      normalized_category: 'Caves & Rock Formations',
      category_status: 'AUTO_ASSIGNED',
      category_reason: 'Identified cave, natural rock formation, or geological monument.'
    };
  }

  // Hot Springs & Wellness
  if (
    rawLower.includes('hot spring') || rawLower.includes('wellness') || rawLower.includes('spa') ||
    nameLower.includes('hot spring') || nameLower.includes('hotspring') || nameLower.includes('reshi hot spring') || nameLower.includes('yumthang hot spring') ||
    descLower.includes('thermal sulfur spring') || descLower.includes('natural hot spring') || descLower.includes('medicinal waters')
  ) {
    return {
      normalized_category: 'Hot Springs & Wellness',
      category_status: 'AUTO_ASSIGNED',
      category_reason: 'Identified thermal hot spring or therapeutic wellness site.'
    };
  }

  // Trekking & Hiking
  if (
    rawLower.includes('trek') || rawLower.includes('hiking') || rawLower.includes('trail') ||
    nameLower.includes('trek') || nameLower.includes('trail') || nameLower.includes('hiking trail') || nameLower.includes('trailhead') ||
    descLower.includes('trekking route') || descLower.includes('hiking trail') || descLower.includes('multi-day trek') || descLower.includes('ridge hike')
  ) {
    return {
      normalized_category: 'Trekking & Hiking',
      category_status: 'AUTO_ASSIGNED',
      category_reason: 'Identified trekking route, hiking trail, or mountain walk.'
    };
  }

  // Camping & Adventure
  if (
    rawLower.includes('camp') || rawLower.includes('adventure') || rawLower.includes('paragliding') || rawLower.includes('rafting') ||
    nameLower.includes('camp') || nameLower.includes('paragliding') || nameLower.includes('rafting') || nameLower.includes('adventure') ||
    descLower.includes('riverside camping') || descLower.includes('paragliding launch') || descLower.includes('white water rafting')
  ) {
    return {
      normalized_category: 'Camping & Adventure',
      category_status: 'AUTO_ASSIGNED',
      category_reason: 'Identified adventure activity (camping, paragliding, rafting, outdoor sports).'
    };
  }

  // Temples & Shrines
  if (
    rawLower.includes('temple') || rawLower.includes('mandir') || rawLower.includes('shrine') || rawLower.includes('dham') ||
    nameLower.includes('temple') || nameLower.includes('mandir') || nameLower.includes('shrine') || nameLower.includes('dham') ||
    descLower.includes('hindu temple') || descLower.includes('sacred shrine') || descLower.includes('pilgrimage temple')
  ) {
    return {
      normalized_category: 'Temples & Shrines',
      category_status: 'AUTO_ASSIGNED',
      category_reason: 'Identified Hindu or local deity temple / sacred pilgrimage shrine.'
    };
  }

  // Churches & Religious Sites
  if (
    rawLower.includes('church') || rawLower.includes('cathedral') || rawLower.includes('gurudwara') || rawLower.includes('mosque') ||
    nameLower.includes('church') || nameLower.includes('cathedral') || nameLower.includes('gurudwara') || nameLower.includes('mosque') ||
    descLower.includes('historic church') || descLower.includes('cathedral') || descLower.includes('gurudwara')
  ) {
    return {
      normalized_category: 'Churches & Religious Sites',
      category_status: 'AUTO_ASSIGNED',
      category_reason: 'Identified church, cathedral, gurudwara, or non-monastery/temple religious site.'
    };
  }

  // Railways & Stations
  if (
    rawLower.includes('railway') || rawLower.includes('train') || rawLower.includes('toy train') ||
    nameLower.includes('railway') || nameLower.includes('station') || nameLower.includes('toy train') || nameLower.includes('dhr') ||
    descLower.includes('himalayan railway') || descLower.includes('toy train station') || descLower.includes('unesco dhr')
  ) {
    return {
      normalized_category: 'Railways & Stations',
      category_status: 'AUTO_ASSIGNED',
      category_reason: 'Identified Darjeeling Himalayan Railway / station heritage infrastructure.'
    };
  }

  // Bridges & Infrastructure
  if (
    rawLower.includes('bridge') || rawLower.includes('ropeway') || rawLower.includes('cable car') || rawLower.includes('skywalk') ||
    nameLower.includes('bridge') || nameLower.includes('ropeway') || nameLower.includes('cable car') || nameLower.includes('skywalk') || nameLower.includes('dam') ||
    descLower.includes('suspension bridge') || descLower.includes('coronation bridge') || descLower.includes('glass skywalk') || descLower.includes('passenger ropeway')
  ) {
    return {
      normalized_category: 'Bridges & Infrastructure',
      category_status: 'AUTO_ASSIGNED',
      category_reason: 'Identified bridge, suspension bridge, ropeway, skywalk, or civil infrastructure.'
    };
  }

  // Scenic Roads & Passes
  if (
    rawLower.includes('pass') || rawLower.includes('road') || rawLower.includes('scenic route') ||
    nameLower.includes(' pass') || nameLower.includes('la pass') || nameLower.includes('highway') || nameLower.includes('silk route') ||
    descLower.includes('high altitude pass') || descLower.includes('mountain pass') || descLower.includes('historic silk route') || descLower.includes('scenic drive')
  ) {
    return {
      normalized_category: 'Scenic Roads & Passes',
      category_status: 'AUTO_ASSIGNED',
      category_reason: 'Identified mountain pass, scenic road, or highway pass.'
    };
  }

  // Gardens & Parks
  if (
    rawLower.includes('garden') || rawLower.includes('park') || rawLower.includes('botanical') || rawLower.includes('nursery') ||
    nameLower.includes('garden') || nameLower.includes('park') || nameLower.includes('nursery') ||
    descLower.includes('botanical garden') || descLower.includes('public park') || descLower.includes('flower garden') || descLower.includes('rock garden')
  ) {
    return {
      normalized_category: 'Gardens & Parks',
      category_status: 'AUTO_ASSIGNED',
      category_reason: 'Identified public park, botanical garden, or curated floral grounds.'
    };
  }

  // Food & Local Markets
  if (
    rawLower.includes('market') || rawLower.includes('bazaar') || rawLower.includes('food') || rawLower.includes('bakery') || rawLower.includes('cafe') ||
    nameLower.includes('market') || nameLower.includes('bazaar') || nameLower.includes('haat') || nameLower.includes('bakery') || nameLower.includes('cafe') ||
    descLower.includes('local market') || descLower.includes('hill bazaar') || descLower.includes('street food') || descLower.includes('famous bakery')
  ) {
    return {
      normalized_category: 'Food & Local Markets',
      category_status: 'AUTO_ASSIGNED',
      category_reason: 'Identified local hill market, traditional bazaar, cafe, or culinary point.'
    };
  }

  // Culture & Experiences
  if (
    rawLower.includes('culture') || rawLower.includes('handicraft') || rawLower.includes('craft') || rawLower.includes('institute') ||
    nameLower.includes('centre') || nameLower.includes('center') || nameLower.includes('institute') || nameLower.includes('craft') ||
    descLower.includes('cultural centre') || descLower.includes('handicrafts workshop') || descLower.includes('mountaineering institute')
  ) {
    return {
      normalized_category: 'Culture & Experiences',
      category_status: 'AUTO_ASSIGNED',
      category_reason: 'Identified cultural center, handicraft workshop, or experiential institute.'
    };
  }

  // Heritage & Historical
  if (
    rawLower.includes('heritage') || rawLower.includes('museum') || rawLower.includes('history') || rawLower.includes('fort') || rawLower.includes('palace') ||
    nameLower.includes('museum') || nameLower.includes('fort') || nameLower.includes('palace') || nameLower.includes('memorial') || nameLower.includes('war memorial') ||
    descLower.includes('historical palace') || descLower.includes('heritage monument') || descLower.includes('museum collections')
  ) {
    return {
      normalized_category: 'Heritage & Historical',
      category_status: 'AUTO_ASSIGNED',
      category_reason: 'Identified heritage site, historical palace, museum, or memorial.'
    };
  }

  // Beaches & Riverfronts
  if (
    rawLower.includes('beach') || rawLower.includes('riverfront') || rawLower.includes('riverbank') ||
    nameLower.includes('beach') || nameLower.includes('riverfront') || nameLower.includes('river bank') ||
    descLower.includes('river beach') || descLower.includes('pebble riverfront') || descLower.includes('sandy riverbank')
  ) {
    return {
      normalized_category: 'Beaches & Riverfronts',
      category_status: 'AUTO_ASSIGNED',
      category_reason: 'Identified riverside beach, shoreline, or riverfront bank.'
    };
  }

  // Villages & Local Life
  if (
    rawLower.includes('village') || rawLower.includes('rural') || rawLower.includes('settlement') ||
    nameLower.includes('village') || nameLower.includes('basti') || nameLower.includes('gaothan') || nameLower.includes('gaon') ||
    descLower.includes('traditional village') || descLower.includes('rural settlement') || descLower.includes('himalayan hamlets')
  ) {
    return {
      normalized_category: 'Villages & Local Life',
      category_status: 'AUTO_ASSIGNED',
      category_reason: 'Identified traditional village, rural hamlet, or community settlement.'
    };
  }

  // Forests & Nature
  if (
    rawLower.includes('forest') || rawLower.includes('nature') || rawLower.includes('valley') || rawLower.includes('jungle') || rawLower.includes('wilderness') ||
    nameLower.includes('forest') || nameLower.includes('jungle') || nameLower.includes('valley') || nameLower.includes('woods') ||
    descLower.includes('dense pine forest') || descLower.includes('himalayan valley') || descLower.includes('virgin forest') || descLower.includes('natural alpine flora')
  ) {
    return {
      normalized_category: 'Forests & Nature',
      category_status: 'AUTO_ASSIGNED',
      category_reason: 'Identified forest landscape, alpine nature area, or mountain valley.'
    };
  }

  // Generic fallback with normalization mapping
  const normalized = normalizeAttractionCategory(rawCat, name, desc);
  if (normalized && normalized !== 'Other Attractions') {
    return {
      normalized_category: normalized,
      category_status: 'AUTO_ASSIGNED',
      category_reason: `Mapped from original category "${rawCat}" to Master Category "${normalized}".`
    };
  }

  // If normalized to 'Other Attractions', check if the original category was genuinely empty or unknown
  if (!rawCat || rawCat === 'Other' || rawCat === 'Sight' || rawCat === 'Attraction') {
    return {
      normalized_category: 'Other Attractions',
      category_status: 'AUTO_ASSIGNED',
      category_reason: `Classified as general landmark/point of interest ("Other Attractions") based on available details.`
    };
  }

  return {
    normalized_category: 'Other Attractions',
    category_status: 'AUTO_ASSIGNED',
    category_reason: `Normalized from "${rawCat}" to Master Category "Other Attractions".`
  };
}

/**
 * AI System Prompt Constraint for Gemini / Classification LLMs:
 * Embed this in all AI prompts for attraction classification to guarantee 100% deterministic outputs.
 */
export const ATTRACTION_AI_CLASSIFICATION_PROMPT_GUIDE = `
You are an expert Himalayan travel taxonomy classifier.
You MUST classify the attraction into EXACTLY ONE of the following 24 fixed master categories:

1. Mountain & Peaks
2. Viewpoints & Scenic Points
3. Waterfalls
4. Rivers & Lakes
5. Forests & Nature
6. Wildlife & Sanctuaries
7. Tea Gardens
8. Gardens & Parks
9. Trekking & Hiking
10. Camping & Adventure
11. Temples & Shrines
12. Monasteries
13. Churches & Religious Sites
14. Heritage & Historical
15. Villages & Local Life
16. Scenic Roads & Passes
17. Bridges & Infrastructure
18. Railways & Stations
19. Caves & Rock Formations
20. Hot Springs & Wellness
21. Beaches & Riverfronts
22. Culture & Experiences
23. Food & Local Markets
24. Other Attractions

STRICT RULES:
- Output MUST be the EXACT string of one of these 24 categories.
- Do NOT output abbreviations, numbers, synonyms, or additional text.
- If uncertain, default to "Other Attractions".
`.trim();
