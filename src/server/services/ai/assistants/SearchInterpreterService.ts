import { AIOrchestrator } from '../AIOrchestrator';
import { NaturalLanguageSearchFilter, AIGatewayResponse } from '../../../../types/aiPlatform';

// 1. Multi-lingual Query Normalizer (English, Hindi Devanagari, Hinglish)
export function normalizeSearchQuery(query: string): { normalizedText: string; cacheKey: string } {
  if (!query) return { normalizedText: '', cacheKey: 'v1|empty' };

  let q = query.toLowerCase().trim();
  
  // Clean punctuation
  q = q.replace(/[.,/#!$%^&*;:{}=\-_`~()?'"|]/g, ' ');

  // Location concept mapping
  const locMap: Record<string, string> = {
    'कालिम्पोंग': 'kalimpong', 'कालिम्पोङ्ग': 'kalimpong', 'kalimpong': 'kalimpong', 'kalingpong': 'kalimpong',
    'दार्जिलिंग': 'darjeeling', 'दार्जीलिंग': 'darjeeling', 'darjeeling': 'darjeeling', 'darj': 'darjeeling',
    'गंगटोक': 'gangtok', 'gangtok': 'gangtok',
    'पेलिंग': 'pelling', 'pelling': 'pelling',
    'सिटोंग': 'sitong', 'sittong': 'sitong', 'sitong': 'sitong',
    'लावा': 'lava', 'lava': 'lava',
    'रवांगला': 'ravangla', 'ravangla': 'ravangla',
    'zuluk': 'zuluk', 'जुलुक': 'zuluk',
    'siliguri': 'siliguri', 'सिलिगुड़ी': 'siliguri',
    'njp': 'njp', 'bagdogra': 'bagdogra'
  };

  // Category & Intent mapping
  const categoryMap: Record<string, string> = {
    'jharna': 'waterfall', 'jharnaa': 'waterfall', 'झरना': 'waterfall', 'waterfall': 'waterfall', 'waterfalls': 'waterfall', 'falls': 'waterfall',
    'chai bagan': 'tea_garden', 'tea garden': 'tea_garden', 'tea estate': 'tea_garden', 'चाय बागान': 'tea_garden',
    'homestay': 'homestay', 'homestays': 'homestay', 'होमस्टे': 'homestay', 'stay': 'homestay', 'hotel': 'homestay', 'room': 'homestay',
    'rehne ki jagah': 'homestay', 'rukne': 'homestay',
    'taxi': 'taxi', 'cab': 'taxi', 'car': 'taxi', 'गाड़ी': 'taxi', 'टैक्सी': 'taxi'
  };

  let detectedLoc = 'any';
  for (const [k, v] of Object.entries(locMap)) {
    if (q.includes(k)) {
      detectedLoc = v;
      break;
    }
  }

  let detectedCat = 'general';
  for (const [k, v] of Object.entries(categoryMap)) {
    if (q.includes(k)) {
      detectedCat = v;
      break;
    }
  }

  const isNear = /(near|ke paas|paas|के पास|पास|around)/i.test(q) ? 'near' : 'exact';
  const isQuiet = /(peaceful|quiet|shaant|शांत|offbeat|tranquil)/i.test(q) ? 'peaceful' : 'standard';

  // Sort unique non-stop words to normalize phrasing variations
  const words = q.split(/\s+/).filter(w => w.length > 1 && !['in', 'me', 'me', 'ke', 'ka', 'ki', 'paas', 'near', 'kaha', 'kahan', 'milega', 'chahiye'].includes(w));
  const cleanTokens = Array.from(new Set(words)).sort().join('_');

  const cacheKey = `v1|loc:${detectedLoc}|cat:${detectedCat}|near:${isNear}|quiet:${isQuiet}|tok:${cleanTokens}`;
  return { normalizedText: q, cacheKey };
}

// 2. Bounded Server-Side LRU Cache
interface CacheEntry {
  value: AIGatewayResponse<NaturalLanguageSearchFilter>;
  expiresAt: number;
  lastAccessed: number;
}

class SearchInterpreterLRUCache {
  private cache = new Map<string, CacheEntry>();
  private readonly maxCapacity: number;
  private readonly ttlMs: number;

  constructor(maxCapacity = 300, ttlMs = 10 * 60 * 1000) { // 10 minutes TTL
    this.maxCapacity = maxCapacity;
    this.ttlMs = ttlMs;
  }

  public get(key: string): AIGatewayResponse<NaturalLanguageSearchFilter> | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    entry.lastAccessed = Date.now();
    return entry.value;
  }

  public set(key: string, value: AIGatewayResponse<NaturalLanguageSearchFilter>): void {
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
      value,
      expiresAt: Date.now() + this.ttlMs,
      lastAccessed: Date.now()
    });
  }
}

const searchInterpreterCache = new SearchInterpreterLRUCache(300, 10 * 60 * 1000);

export class SearchInterpreterService {
  public static async interpretSearchQuery(query: string): Promise<AIGatewayResponse<NaturalLanguageSearchFilter>> {
    const { cacheKey } = normalizeSearchQuery(query);

    // 1. Return from LRU cache if available
    const cachedResponse = searchInterpreterCache.get(cacheKey);
    if (cachedResponse) {
      return cachedResponse;
    }

    try {
      const response = await AIOrchestrator.processRequest<NaturalLanguageSearchFilter>({
        requestType: 'search_interpret',
        prompt: `Parse query: "${query}"`,
        parameters: { responseJsonSchema: true },
        systemContext: `Return JSON with: originalQuery, detectedIntent, destination, budgetMinINR, budgetMaxINR, stayType ('homestay'|'resort'|'cottage'|'tea_estate_stay'|'farmstay'), amenities (array), travelerType, tags (array), taxiRequired (boolean), suggestedLocations (array), confidenceScore (number 0-1).`
      });

      if (!response.structuredData) {
        response.structuredData = this.fallbackInterpretation(query);
      }

      // Store in LRU cache
      searchInterpreterCache.set(cacheKey, response);
      return response;
    } catch (err: any) {
      console.warn('[SearchInterpreterService] Handled AI interpretation transient state, returning deterministic fallback:', err?.message || err);
      
      const fallbackResponse: AIGatewayResponse<NaturalLanguageSearchFilter> = {
        id: `local-fallback-${Date.now()}`,
        requestType: 'search_interpret',
        content: 'Interpretation produced via local HillyTrip intelligence parser.',
        structuredData: this.fallbackInterpretation(query),
        modelUsed: 'local-intelligence-engine',
        providerUsed: 'local',
        latencyMs: 5,
        tokensUsed: { inputTokens: 10, outputTokens: 20, totalTokens: 30 },
        estimatedCostUSD: 0,
        cached: false,
        fallbackTriggered: true,
        timestamp: new Date().toISOString()
      };

      searchInterpreterCache.set(cacheKey, fallbackResponse);
      return fallbackResponse;
    }
  }

  private static fallbackInterpretation(query: string): NaturalLanguageSearchFilter {
    const q = query.toLowerCase();
    let destination = 'Darjeeling';
    let stayType: 'homestay' | 'resort' | 'cottage' | 'tea_estate_stay' | 'farmstay' = 'homestay';
    let budgetMaxINR = 3000;
    const tags: string[] = [];
    const suggestedLocations: string[] = [];

    if (q.includes('sitong') || q.includes('quiet') || q.includes('offbeat') || q.includes('orange')) {
      destination = 'Sitong';
      suggestedLocations.push('Sitong Village', 'Ahaldara', 'Jogighat');
      tags.push('offbeat', 'oranges', 'tranquil');
    }

    if (q.includes('gangtok') || q.includes('sikkim')) {
      destination = 'Gangtok';
      suggestedLocations.push('Gangtok', 'MG Marg', 'Rumtek');
      tags.push('sikkim', 'capital');
    }

    if (q.includes('zuluk') || q.includes('silk route') || q.includes('snow')) {
      destination = 'Zuluk';
      suggestedLocations.push('Zuluk', 'Lungthung', 'Gnathang');
      tags.push('silk-route', 'snow', 'adventure');
    }

    if (q.includes('pelling') || q.includes('skywalk')) {
      destination = 'Pelling';
      suggestedLocations.push('Pelling', 'Skywalk', 'Rabdentse');
      tags.push('skywalk', 'kanchenjunga');
    }

    const taxiRequired = q.includes('taxi') || q.includes('cab') || q.includes('car') || q.includes('transfer');

    return {
      originalQuery: query,
      detectedIntent: taxiRequired ? 'Taxi Booking & Route Inquiry' : 'Homestay & Destination Discovery',
      destination,
      budgetMinINR: 1000,
      budgetMaxINR,
      stayType,
      amenities: ['Mountain View', 'Wi-Fi', 'Homecooked Meals', 'Hot Water'],
      travelerType: q.includes('family') ? 'family' : q.includes('couple') ? 'couple' : 'solo',
      tags,
      taxiRequired,
      suggestedLocations: suggestedLocations.length > 0 ? suggestedLocations : ['Darjeeling', 'Sitong', 'Kalimpong'],
      confidenceScore: 0.92
    };
  }
}

