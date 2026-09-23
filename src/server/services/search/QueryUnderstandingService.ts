import { executeGeminiOperation } from '../../geminiClient';
import type { StructuredSearchIntent } from '../../../types/search';
export type { StructuredSearchIntent };

// Query Understanding LRU Cache for AI search interpretations
interface CacheEntry {
  intent: StructuredSearchIntent;
  expiresAt: number;
  lastAccessed: number;
}

class QueryUnderstandingCache {
  private cache = new Map<string, CacheEntry>();
  private readonly maxCapacity = 300;
  private readonly ttlMs = 10 * 60 * 1000; // 10 minutes

  get(key: string): StructuredSearchIntent | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    entry.lastAccessed = Date.now();
    return entry.intent;
  }

  set(key: string, intent: StructuredSearchIntent): void {
    if (this.cache.size >= this.maxCapacity) {
      let oldestKey: string | null = null;
      let oldestTime = Infinity;
      for (const [k, v] of this.cache.entries()) {
        if (v.lastAccessed < oldestTime) {
          oldestTime = v.lastAccessed;
          oldestKey = k;
        }
      }
      if (oldestKey) this.cache.delete(oldestKey);
    }
    this.cache.set(key, {
      intent,
      expiresAt: Date.now() + this.ttlMs,
      lastAccessed: Date.now()
    });
  }
}

const queryCache = new QueryUnderstandingCache();

const KNOWN_HUBS_AND_LOCATIONS = [
  'NJP', 'New Jalpaiguri', 'Bagdogra', 'IXB', 'Siliguri', 'Darjeeling', 'Gangtok',
  'Kalimpong', 'Pelling', 'Lava', 'Rishyap', 'Rishap', 'Sittong', 'Chatakpur',
  'Mirik', 'Kurseong', 'Ravangla', 'Namchi', 'Yuksom', 'Lachen', 'Lachung',
  'Yumthang', 'Zuluk', 'Silk Route', 'Rhenock', 'Aritar', 'Rinchenpong',
  'Tiger Hill', 'Ghoom', 'Batasia Loop', 'Rock Garden', 'Tsomgo Lake', 'Changu',
  'Nathula', 'Delo', 'Deorali', 'MG Marg', 'Pedong', 'Sillery Gaon', 'Kaagey',
  'Bara Mangwa', 'Chota Mangwa', 'Takdah', 'Tinchuley', 'Lamahatta'
];

// Devanagari & Hinglish to Canonical English concept dictionary
const CONCEPT_LOCATION_MAP: Record<string, string> = {
  'कालिम्पोंग': 'Kalimpong',
  'कालिम्पोङ्ग': 'Kalimpong',
  'कालिमपोंग': 'Kalimpong',
  'kalimpong': 'Kalimpong',
  'kalimpongg': 'Kalimpong',
  'kalingpong': 'Kalimpong',
  'दार्जिलिंग': 'Darjeeling',
  'दार्जीलिंग': 'Darjeeling',
  'दार्जिलीङ': 'Darjeeling',
  'darjeeling': 'Darjeeling',
  'darjiling': 'Darjeeling',
  'darj': 'Darjeeling',
  'गंगटोक': 'Gangtok',
  'गङ्गाटोक': 'Gangtok',
  'gangtok': 'Gangtok',
  'gantok': 'Gangtok',
  'पेलिंग': 'Pelling',
  'pelling': 'Pelling',
  'peling': 'Pelling',
  'लावा': 'Lava',
  'lava': 'Lava',
  'सिटोंग': 'Sittong',
  'sittong': 'Sittong',
  'sitong': 'Sittong',
  'सिलिगुड़ी': 'Siliguri',
  'सिलिगुडी': 'Siliguri',
  'siliguri': 'Siliguri',
  'रवांगला': 'Ravangla',
  'ravangla': 'Ravangla',
  'rabangla': 'Ravangla',
  'नामची': 'Namchi',
  'namchi': 'Namchi',
  'ऋष्यप': 'Rishyap',
  'रिष्यप': 'Rishyap',
  'rishyap': 'Rishyap',
  'rishap': 'Rishyap',
  'लार्चन': 'Lachen',
  'लाचेन': 'Lachen',
  'lachen': 'Lachen',
  'लाचुंग': 'Lachung',
  'lachung': 'Lachung',
  'पेदोंग': 'Pedong',
  'pedong': 'Pedong',
  'तिनचुले': 'Tinchuley',
  'tinchuley': 'Tinchuley',
  'लामाहट्टा': 'Lamahatta',
  'lamahatta': 'Lamahatta',
  'एनजेपी': 'NJP',
  'njp': 'NJP',
  'new jalpaiguri': 'NJP',
  'बागडोगरा': 'Bagdogra',
  'bagdogra': 'Bagdogra',
  'ixb': 'Bagdogra',
  'मिरिक': 'Mirik',
  'mirik': 'Mirik',
  'खरसांग': 'Kurseong',
  'कुर्सेओंग': 'Kurseong',
  'kurseong': 'Kurseong',
  'युक्सोम': 'Yuksom',
  'yuksom': 'Yuksom',
  'युमथांग': 'Yumthang',
  'yumthang': 'Yumthang',
  'जुलुक': 'Zuluk',
  'zuluk': 'Zuluk'
};

export class QueryUnderstandingService {
  /**
   * Main entry point to parse a natural language query into a structured intent.
   * Supports English, Hindi (Devanagari), Hinglish, and mixed inputs.
   */
  public static async parseQuery(query: string): Promise<StructuredSearchIntent> {
    const rawQuery = query || '';
    const normalizedQuery = rawQuery.toLowerCase().trim();

    // 0. Cache Hit Check
    const cached = queryCache.get(normalizedQuery);
    if (cached) {
      return cached;
    }

    // 1. Deterministic rule-based NLP parser (Fast Path - <5ms)
    const ruleBasedIntent = this.ruleBasedParse(rawQuery, normalizedQuery);

    // Fast return if rule-based parser resolved a clear intent & location, or query is basic
    if (ruleBasedIntent.intent !== 'general' && ruleBasedIntent.location) {
      queryCache.set(normalizedQuery, ruleBasedIntent);
      return ruleBasedIntent;
    }

    if (!normalizedQuery || normalizedQuery.length < 3) {
      queryCache.set(normalizedQuery, ruleBasedIntent);
      return ruleBasedIntent;
    }

    // Fast return if exact single location query or basic query
    if (/^[a-zA-Z\s]{3,15}$/.test(normalizedQuery) && KNOWN_HUBS_AND_LOCATIONS.some(l => l.toLowerCase() === normalizedQuery)) {
      queryCache.set(normalizedQuery, ruleBasedIntent);
      return ruleBasedIntent;
    }

    // 2. Call Gemini Flash with 1.5s strict timeout and fallback to rule-based parser
    try {
      const prompt = `You are HillyTrip Travel Assistant AI. Analyze this travel search query for Sikkim, Darjeeling, Kalimpong, North Bengal.
User Query: "${rawQuery}"

Understand English, Hindi (Devanagari), Hinglish, and mixed language queries.
Extract intent and filters strictly matching this JSON schema with NO markdown wrappers:
{
  "intent": "browse_accommodation" | "stay" | "count" | "village_breakdown" | "find" | "attraction" | "destination" | "route" | "taxi" | "discover" | "experience" | "general",
  "entityType": "homestay" | "attraction" | "destination" | "route" | "taxi_stand" | "village" | "offer" | "all",
  "location": "string or null",
  "village": "string or null",
  "category": "string or null",
  "travelerType": "family" | "couple" | "solo" | "friends" | "adventure" | null,
  "budget": "cheap" | "budget" | "luxury" | null,
  "proximity": boolean,
  "origin": "string or null",
  "destination": "string or null",
  "preferenceKeywords": ["string"]
}`;

      const aiPromise = executeGeminiOperation(async (ai) => {
        return await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents: prompt,
          config: {
            temperature: 0.1,
            responseMimeType: 'application/json'
          }
        });
      });

      const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500));

      const response = await Promise.race([aiPromise, timeoutPromise]);

      const text = response?.text?.trim() || '';
      if (text) {
        const parsed = JSON.parse(text);
        const resolvedIntent: StructuredSearchIntent = {
          rawQuery,
          normalizedQuery,
          intent: ruleBasedIntent.intent !== 'general' ? ruleBasedIntent.intent : (parsed.intent || ruleBasedIntent.intent),
          entityType: ruleBasedIntent.entityType !== 'all' ? ruleBasedIntent.entityType : (parsed.entityType || ruleBasedIntent.entityType),
          location: ruleBasedIntent.location || parsed.location,
          village: ruleBasedIntent.village || parsed.village,
          category: ruleBasedIntent.category || parsed.category,
          travelerType: ruleBasedIntent.travelerType || parsed.travelerType,
          budget: ruleBasedIntent.budget || parsed.budget,
          proximity: Boolean(ruleBasedIntent.proximity || parsed.proximity),
          origin: ruleBasedIntent.origin || parsed.origin,
          destination: ruleBasedIntent.destination || parsed.destination,
          preferenceKeywords: Array.from(new Set([...ruleBasedIntent.preferenceKeywords, ...(Array.isArray(parsed.preferenceKeywords) ? parsed.preferenceKeywords : [])])),
          sort: ruleBasedIntent.sort || 'relevance',
          isIndirectQuery: Boolean(ruleBasedIntent.isIndirectQuery || parsed.preferenceKeywords?.length > 0),
          detectedEntities: ruleBasedIntent.detectedEntities
        };

        queryCache.set(normalizedQuery, resolvedIntent);
        return resolvedIntent;
      }
    } catch (err) {
      console.log('[QueryUnderstandingService] Fast path rule-based parser active:', (err as Error).message);
    }

    queryCache.set(normalizedQuery, ruleBasedIntent);
    return ruleBasedIntent;
  }

  /**
   * Deterministic rule-based query parser supporting typos, English, Hindi & Hinglish mappings.
   */
  private static ruleBasedParse(rawQuery: string, q: string): StructuredSearchIntent {
    let intent: StructuredSearchIntent['intent'] = 'general';
    let entityType: StructuredSearchIntent['entityType'] = 'all';
    let location: string | undefined;
    let village: string | undefined;
    let category: string | undefined;
    let origin: string | undefined;
    let destination: string | undefined;
    let budget: StructuredSearchIntent['budget'];
    let sort: StructuredSearchIntent['sort'] = 'relevance';
    let travelerType: StructuredSearchIntent['travelerType'];
    let proximity = false;
    const preferenceKeywords: string[] = [];
    const detectedLocations: string[] = [];

    // 1. Multi-lingual Location Concept Extraction (Devanagari, Hinglish, English)
    for (const [key, canonicalLoc] of Object.entries(CONCEPT_LOCATION_MAP)) {
      if (q.includes(key)) {
        if (!location) location = canonicalLoc;
        if (!detectedLocations.includes(canonicalLoc)) {
          detectedLocations.push(canonicalLoc);
        }
      }
    }

    // 2. Multi-lingual Proximity Detection ("near", "ke paas", "के पास", "paas")
    if (/(near|nearby|around|close to|ke paas|ke pass|paas|pass|के पास|पास|आसपास|aas paas)/i.test(q)) {
      proximity = true;
    }

    // 3. Multi-lingual Budget Detection ("cheap", "sasta", "budget", "सस्ता", "कम बजट")
    if (/(cheap|cheapest|budget|sasta|economical|affordable|सस्ता|कम बजट)/i.test(q)) {
      budget = 'cheap';
      sort = 'price_low';
      preferenceKeywords.push('cheap');
    } else if (/(luxury|deluxe|premium|resort|high end|best|लग्जरी)/i.test(q)) {
      budget = 'luxury';
      sort = 'rating';
      preferenceKeywords.push('luxury');
    }

    // 4. Multi-lingual Traveler Type Detection
    if (/(family|parivar|parivaar|family ke saath|परिवार|परिवार के साथ)/i.test(q)) {
      travelerType = 'family';
      preferenceKeywords.push('family');
    } else if (/(couple|honeymoon|romantic|पति पत्नी)/i.test(q)) {
      travelerType = 'couple';
      preferenceKeywords.push('romantic');
    }

    // 5. Multi-lingual Category & Concept Extraction
    // --- Waterfall ---
    if (/(waterfall|waterfalls|water fall|jharna|jharnaa|ঝর্ণা|झरना|झरने|falls|fall)/i.test(q)) {
      category = 'waterfall';
      entityType = 'attraction';
      intent = 'attraction';
      preferenceKeywords.push('waterfall');
    }
    // --- Tea Garden ---
    else if (/(tea garden|tea gardens|tea estate|tea estates|chai bagan|cha bagan|chai ka bagan|चाय बागान|चाय बगान)/i.test(q)) {
      category = 'tea_garden';
      entityType = 'attraction';
      intent = 'attraction';
      preferenceKeywords.push('tea_garden');
    }

    // 6. Multi-lingual Intent & Entity Mapping
    const stayKeywords = [
      'homestay', 'homestays', 'homstay', 'stay', 'stays', 'hotel', 'resort', 'lodge', 'cottage', 'room',
      'rehne ki jagah', 'rehne ke liye', 'rukne', 'ruko', 'rehna', 'रुकने', 'रहने', 'रहने की जगह', 'होमस्टे', 'होटल',
      'where can i stay', 'place to stay', 'places to stay'
    ];
    const attractionKeywords = [
      'waterfall', 'jharna', 'झरना', 'falls', 'lake', 'point', 'viewpoint', 'view', 'monastery',
      'ropeway', 'park', 'places to visit', 'sightseeing', 'what to see', 'things to do', 'what can i see',
      'kya dekh sakte', 'dekhne ki', 'ghoomne ki', 'घूमने की जगह', 'क्या देख सकते हैं', 'क्या देखें', 'कया देख'
    ];
    const taxiKeywords = [
      'taxi', 'cab', 'car', 'fare', 'driver', 'journey', 'route', 'reach', 'travel from',
      'njp to', 'bagdogra to', 'siliguri to', 'taxistand', 'गाड़ी', 'टैक्सी', 'किराया'
    ];
    const countKeywords = [
      'how many', 'kitne', 'kitna', 'कितने', 'कितना', 'count', 'total number'
    ];
    const villageKeywords = [
      'which villages', 'kaun se gaon', 'konse gaon', 'कौन से गाँव', 'village breakdown', 'villages'
    ];

    if (countKeywords.some(k => q.includes(k))) {
      intent = 'count';
    } else if (villageKeywords.some(k => q.includes(k))) {
      intent = 'village_breakdown';
    } else if (stayKeywords.some(k => q.includes(k))) {
      intent = 'browse_accommodation';
      entityType = 'homestay';
    } else if (attractionKeywords.some(k => q.includes(k))) {
      intent = 'attraction';
      if (entityType === 'all') entityType = 'attraction';
    } else if (taxiKeywords.some(k => q.includes(k))) {
      intent = 'route';
      entityType = 'route';
    }

    // 7. Route Parsing ("njp to kalimpong", "bagdogra to gangtok")
    const routeMatch = q.match(/(?:from\s+)?([a-z\s]+?)\s+(?:to|2)\s+([a-z\s]+)/i);
    if (routeMatch) {
      const candidateOrigin = routeMatch[1].trim();
      const candidateDest = routeMatch[2].trim();
      const matchedOrig = KNOWN_HUBS_AND_LOCATIONS.find(loc => loc.toLowerCase() === candidateOrigin || candidateOrigin.includes(loc.toLowerCase()));
      const matchedDest = KNOWN_HUBS_AND_LOCATIONS.find(loc => loc.toLowerCase() === candidateDest || candidateDest.includes(loc.toLowerCase()));

      if (matchedOrig && matchedDest) {
        origin = matchedOrig;
        destination = matchedDest;
        intent = 'route';
        entityType = 'route';
      }
    }

    // 8. Aesthetic & experience preferences
    if (/\b(peaceful|quiet|serene|calm|shaant|शांत|tranquil|isolated|offbeat)\b/i.test(q)) {
      preferenceKeywords.push('peaceful');
    }
    if (/\b(mountain view|kanchendzonga|kanchenjunga|mountain|pahar|pahad|पहाड़|पर्वत)\b/i.test(q)) {
      preferenceKeywords.push('mountain_view');
    }

    const isIndirect = preferenceKeywords.length > 0 || /\b(i want|where can|how can|good places|somewhere|weekend trip|kya dekh)\b/i.test(q);

    return {
      rawQuery,
      normalizedQuery: q,
      intent,
      entityType,
      location,
      village,
      category,
      travelerType,
      budget,
      proximity,
      origin,
      destination,
      preferenceKeywords: Array.from(new Set(preferenceKeywords)),
      sort,
      isIndirectQuery: isIndirect,
      detectedEntities: {
        locations: detectedLocations,
        attractions: [],
        hubs: []
      }
    };
  }
}

