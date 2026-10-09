import { SearchIndexItem, ScoredSearchResult, GeoLocation } from '../../../types/search';
import { GeoSearchService } from './GeoSearchService';

export class RankingService {
  /**
   * Score an index item against user query, synonyms, filters, and user location.
   */
  public static scoreItem(
    item: SearchIndexItem,
    query: string,
    synonymMap: Map<string, string[]>,
    userLocation?: GeoLocation
  ): ScoredSearchResult | null {
    if (item.status !== 'active') {
      return null; // Exclude non-active items
    }

    const cleanQuery = query.toLowerCase().trim();
    if (!cleanQuery) {
      // If query is empty, return baseline score based on popularity & rating
      let score = item.popularityScore * 2 + (item.rating || 0) * 10;
      if (item.isFeatured) score += 20;
      if (item.isVerified) score += 10;

      let distanceKm: number | undefined;
      if (userLocation && item.location?.coordinates) {
        distanceKm = GeoSearchService.calculateDistance(userLocation, item.location.coordinates);
      }

      return {
        item,
        score,
        matchType: 'geo',
        distanceKm,
        highlights: {}
      };
    }

    const titleLower = item.title.toLowerCase();
    const descLower = item.description.toLowerCase();
    const tagsLower = item.tags.map(t => t.toLowerCase());
    const keywordsLower = item.keywords.map(k => k.toLowerCase());

    let matchType: 'exact' | 'prefix' | 'keyword' | 'synonym' | 'fuzzy' | 'geo' | null = null;
    let baseScore = 0;
    let titleMatch = false;
    let matchedTag: string | undefined;

    // 1. Exact Title Match
    if (titleLower === cleanQuery) {
      baseScore += 100;
      matchType = 'exact';
      titleMatch = true;
    }
    // 2. Title Starts With Query (Prefix)
    else if (titleLower.startsWith(cleanQuery)) {
      baseScore += 80;
      matchType = 'prefix';
      titleMatch = true;
    }
    // 3. Title Contains Query
    else if (titleLower.includes(cleanQuery)) {
      baseScore += 60;
      matchType = 'prefix';
      titleMatch = true;
    }
    // 4. Keyword / Local Name / Alt Spelling Match
    else if (keywordsLower.some(k => k === cleanQuery || k.includes(cleanQuery))) {
      baseScore += 50;
      matchType = 'keyword';
    }
    // 5. Tags Match
    else {
      const tag = tagsLower.find(t => t.includes(cleanQuery));
      if (tag) {
        baseScore += 40;
        matchType = 'keyword';
        matchedTag = tag;
      }
    }

    // 6. Synonym expansion check
    if (!matchType) {
      for (const [term, syns] of synonymMap.entries()) {
        if (cleanQuery.includes(term.toLowerCase()) || term.toLowerCase().includes(cleanQuery)) {
          const matchedSyn = syns.find(syn =>
            titleLower.includes(syn.toLowerCase()) ||
            keywordsLower.some(k => k.includes(syn.toLowerCase())) ||
            tagsLower.some(t => t.includes(syn.toLowerCase()))
          );
          if (matchedSyn) {
            baseScore += 35;
            matchType = 'synonym';
            break;
          }
        }
      }
    }

    // 7. Fuzzy/Description substring fallback
    if (!matchType && descLower.includes(cleanQuery)) {
      baseScore += 20;
      matchType = 'fuzzy';
    }

    // 8. Multi-word Tokenized Natural Language Matching (e.g. "Homestay in Darjeeling", "waterfall near Kalimpong", "taxi NJP to Darjeeling")
    if (!matchType) {
      const stopWords = new Set([
        'in', 'near', 'at', 'to', 'from', 'for', 'a', 'an', 'the', 'of', 'and', 'or', 'is', 'where', 'can', 'i',
        'places', 'place', 'visit', 'with', 'by', 'on', 'best', 'top', 'good', 'find', 'show', 'cheap', 'what',
        'see', 'look', 'are', 'there', 'which', 'how', 'many', 'have', 'do', 'does', 'kya', 'dekh', 'sakte',
        'sakta', 'hain', 'hai', 'dekhne', 'jagah', 'ke', 'me', 'mein', 'par', 'paas', 'pass', 'chahiye', 'batao',
        'bataiye', 'mujhe', 'ko', 'ka', 'ki', 'se', 'rahe', 'raha', 'saath', 'ke'
      ]);
      const tokens = cleanQuery.split(/\s+/).filter(t => t.length > 1 && !stopWords.has(t));

      if (tokens.length > 0) {
        let matchedTokenCount = 0;
        let tokenScore = 0;

        for (const token of tokens) {
          let tokenMatched = false;

          // Check title
          if (titleLower.includes(token)) {
            tokenScore += 30;
            tokenMatched = true;
          }
          // Check entity type / category
          else if (item.entityType.toLowerCase().includes(token) || item.category.toLowerCase().includes(token)) {
            tokenScore += 25;
            tokenMatched = true;
          }
          // Check location (district/state)
          else if (item.location?.district?.toLowerCase().includes(token) || item.location?.state?.toLowerCase().includes(token)) {
            tokenScore += 25;
            tokenMatched = true;
          }
          // Check keywords & tags
          else if (keywordsLower.some(k => k.includes(token)) || tagsLower.some(t => t.includes(token))) {
            tokenScore += 20;
            tokenMatched = true;
          }
          // Check description
          else if (descLower.includes(token)) {
            tokenScore += 10;
            tokenMatched = true;
          }

          if (tokenMatched) {
            matchedTokenCount++;
          }
        }

        // Require at least 50% of non-stopword tokens to match (or all if 1-2 tokens)
        const requiredMatches = tokens.length <= 2 ? tokens.length : Math.ceil(tokens.length * 0.5);
        if (matchedTokenCount >= requiredMatches) {
          baseScore += Math.min(80, tokenScore);
          matchType = 'keyword';
        }
      }
    }

    // If no match found at all, return null
    if (!matchType || baseScore <= 0) {
      return null;
    }

    // --- BOOSTS & PENALTIES ---
    let finalScore = baseScore;

    // Popularity score boost (0-100 scale -> max +30 points)
    finalScore += (item.popularityScore / 100) * 30;

    // Rating boost (0-5 scale -> max +15 points)
    if (item.rating) {
      finalScore += item.rating * 3;
    }

    // Verified Badge Bonus (+10 points)
    if (item.isVerified) {
      finalScore += 10;
    }

    // Featured Listing Bonus (+15 points)
    if (item.isFeatured) {
      finalScore += 15;
    }

    // Geo Distance penalty/bonus
    let distanceKm: number | undefined;
    if (userLocation && item.location?.coordinates) {
      distanceKm = GeoSearchService.calculateDistance(userLocation, item.location.coordinates);
      // If within 10km, give proximity boost
      if (distanceKm <= 10) {
        finalScore += (10 - distanceKm) * 2;
      }
    }

    return {
      item,
      score: Math.round(finalScore * 10) / 10,
      matchType,
      distanceKm,
      highlights: {
        titleMatch,
        tagMatch: matchedTag
      }
    };
  }
}
