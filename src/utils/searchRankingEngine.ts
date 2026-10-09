import { SearchEntityType } from './locationIntelligence';

export interface SearchRankableItem {
  id?: string;
  name: string;
  type?: SearchEntityType | string;
  district?: string;
  state?: string;
  description?: string;
  aliases?: string[];
  tags?: string[];
  popularityCount?: number;
  originalObj?: any;
}

export interface ScoredSearchResult<T = any> {
  item: T;
  score: number;
  matchType: 'exact' | 'startsWith' | 'wordStartsWith' | 'contains' | 'fuzzy' | 'secondary' | 'none';
}

/**
 * Entity type weights based on hierarchical importance
 */
export const ENTITY_TYPE_BOOSTS: Record<string, number> = {
  destination: 20,
  district: 18,
  town: 16,
  village: 15,
  state: 12,
  trek: 10,
  attraction: 10,
  homestay: 8,
  taxi_stand: 8,
  taxi_operator: 8,
  route: 8,
  category: 5,
  experience: 5,
  blog: 5
};

/**
 * Normalizes text for consistent comparison
 */
export function normalizeSearchString(str: string): string {
  if (!str) return '';
  return str.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Checks fuzzy match / char subsequence / edit distance
 */
function calculateFuzzyNameMatchScore(query: string, text: string): number {
  if (!query || !text) return 0;
  const q = normalizeSearchString(query);
  const t = normalizeSearchString(text);

  if (!q || !t) return 0;

  // Exact subsequence match (for minor typos e.g., "takda" vs "takdah")
  let qIdx = 0;
  for (let i = 0; i < t.length && qIdx < q.length; i++) {
    if (t[i] === q[qIdx]) qIdx++;
  }
  if (qIdx === q.length) {
    return 5;
  }

  // Edit distance check for minor spelling mistakes (e.g., "siton" vs "sittong")
  if (q.length >= 3 && Math.abs(q.length - t.length) <= 3) {
    let diffs = 0;
    const minLen = Math.min(q.length, t.length);
    for (let i = 0; i < minLen; i++) {
      if (q[i] !== t[i]) diffs++;
    }
    diffs += Math.abs(q.length - t.length);
    if (diffs <= 2) return 5;
  }

  return 0;
}

/**
 * Calculates weighted relevance ranking score for a single entity against search query.
 *
 * Search priority rules:
 * 1. Exact match (base score = 100)
 * 2. Starts with query (base score = 90)
 * 3. Word in name starts with query (base score = 85)
 * 4. Entity Type Boost:
 *    - Destination: +20
 *    - District: +18
 *    - Village: +15
 *    - State: +12
 *    - Attraction/Trek: +10
 *    - Homestay/Taxi/Route: +8
 *    - Category/Experience: +5
 * 5. Contains query in name (base score = 10)
 * 6. Fuzzy match / Alias match (base score = 5)
 * 7. Secondary metadata match (district/state/tags/desc) when name doesn't match = 1 - 3
 */
export function calculateWeightedSearchScore(
  query: string,
  item: SearchRankableItem
): { score: number; matchType: 'exact' | 'startsWith' | 'wordStartsWith' | 'contains' | 'fuzzy' | 'secondary' | 'none' } {
  const q = normalizeSearchString(query);
  if (!q || !item || !item.name) {
    return { score: 0, matchType: 'none' };
  }

  const n = normalizeSearchString(item.name);
  const typeKey = (item.type || '').toLowerCase();
  const typeBoost = ENTITY_TYPE_BOOSTS[typeKey] || 5;

  // 1. Exact Match on Name
  if (n === q) {
    return {
      score: 100 + typeBoost,
      matchType: 'exact'
    };
  }

  // Check aliases for exact or startsWith match
  if (item.aliases && item.aliases.length > 0) {
    for (const alias of item.aliases) {
      const normAlias = normalizeSearchString(alias);
      if (normAlias === q) {
        return {
          score: 95 + typeBoost,
          matchType: 'exact'
        };
      }
    }
  }

  // 2. Starts With Query on Name
  if (n.startsWith(q)) {
    // Slight tie-breaker deduction for extra characters so shorter exact prefixes rank slightly higher
    const lenPenalty = Math.min(5, (n.length - q.length) * 0.1);
    return {
      score: 90 + typeBoost - lenPenalty,
      matchType: 'startsWith'
    };
  }

  // 3. Word in Name Starts With Query
  const words = n.split(/\s+/);
  for (const word of words) {
    if (word.startsWith(q)) {
      return {
        score: 85 + typeBoost,
        matchType: 'wordStartsWith'
      };
    }
  }

  // Check aliases for startsWith
  if (item.aliases && item.aliases.length > 0) {
    for (const alias of item.aliases) {
      const normAlias = normalizeSearchString(alias);
      if (normAlias.startsWith(q)) {
        return {
          score: 80 + typeBoost,
          matchType: 'startsWith'
        };
      }
    }
  }

  // 4. Contains Query in Name
  if (n.includes(q)) {
    return {
      score: 10 + typeBoost,
      matchType: 'contains'
    };
  }

  // 5. Fuzzy match on Name
  const fuzzyScore = calculateFuzzyNameMatchScore(q, n);
  if (fuzzyScore > 0) {
    return {
      score: fuzzyScore + (typeBoost * 0.5),
      matchType: 'fuzzy'
    };
  }

  // 6. Secondary metadata match (when name does NOT match)
  // E.g., district or state matches query
  const dist = normalizeSearchString(item.district || '');
  const state = normalizeSearchString(item.state || '');
  const desc = normalizeSearchString(item.description || '');
  const tagsStr = normalizeSearchString((item.tags || []).join(' '));

  if (dist.includes(q)) {
    return {
      score: 3,
      matchType: 'secondary'
    };
  }

  if (state.includes(q)) {
    return {
      score: 2,
      matchType: 'secondary'
    };
  }

  if (tagsStr.includes(q) || desc.includes(q)) {
    return {
      score: 1,
      matchType: 'secondary'
    };
  }

  return { score: 0, matchType: 'none' };
}

/**
 * Sorts array of items descending by weighted relevance score
 */
export function rankSearchEntities<T>(
  query: string,
  items: T[],
  itemAdapter: (item: T) => SearchRankableItem
): ScoredSearchResult<T>[] {
  const q = normalizeSearchString(query);
  if (!q || !items || items.length === 0) return [];

  const scoredResults: ScoredSearchResult<T>[] = [];

  for (const rawItem of items) {
    if (!rawItem) continue;
    const rankable = itemAdapter(rawItem);
    const result = calculateWeightedSearchScore(q, rankable);
    if (result.score > 0) {
      scoredResults.push({
        item: rawItem,
        score: result.score,
        matchType: result.matchType
      });
    }
  }

  // Sort descending by score
  scoredResults.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    // Tie-breaker 1: Name length closer to query length
    const itemA = itemAdapter(a.item);
    const itemB = itemAdapter(b.item);
    const diffA = Math.abs((itemA.name || '').length - q.length);
    const diffB = Math.abs((itemB.name || '').length - q.length);
    if (diffA !== diffB) return diffA - diffB;

    // Tie-breaker 2: Popularity count / homestay count
    const popA = itemA.popularityCount || 0;
    const popB = itemB.popularityCount || 0;
    if (popA !== popB) return popB - popA;

    // Tie-breaker 3: Alphabetical
    return (itemA.name || '').localeCompare(itemB.name || '');
  });

  return scoredResults;
}
