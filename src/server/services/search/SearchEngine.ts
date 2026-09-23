import {
  SearchQueryParams,
  GroupedSearchResults,
  ScoredSearchResult,
  SearchEntityType,
  AutocompleteSuggestion,
  MatchingCriteria,
  SearchIndexItem,
  SearchFilterState,
  UniversalSearchFactResponse,
  StructuredSearchIntent
} from '../../../types/search';
import { IndexService } from './IndexService';
import { RankingService } from './RankingService';
import { GeoSearchService } from './GeoSearchService';
import { MatchingService } from './MatchingService';
import { SuggestionService } from './SuggestionService';
import { SearchAnalyticsService } from './SearchAnalyticsService';
import { QueryUnderstandingService } from './QueryUnderstandingService';
import { GoogleRoutesService } from '../location/GoogleRoutesService';

export class SearchEngine {
  /**
   * Main Universal Search method powering all queries on the platform.
   */
  public static async search(params: SearchQueryParams): Promise<GroupedSearchResults & { redirectUrl?: string }> {
    IndexService.initializeIndex();
    const startTime = Date.now();

    const { query, filters = {}, page = 1, limit = 20, userId, userLocation, includeUnclaimed = false } = params;

    // Check for direct keyword redirects
    const redirect = SearchAnalyticsService.checkRedirect(query);

    // 1. Intelligent Query Understanding & Intent Parsing
    const parsedIntent: StructuredSearchIntent = await QueryUnderstandingService.parseQuery(query);

    // Get all items (include unclaimed homestays ONLY if includeUnclaimed is true)
    const items = IndexService.getAllItems({ includeUnclaimed: includeUnclaimed || filters.includeUnclaimed });
    const synonymMap = SearchAnalyticsService.getSynonymsMap();

    // 2. Score & Rank All Items with Semantic Concept Matching
    const scoredResults: ScoredSearchResult[] = [];

    const loc = parsedIntent.location || parsedIntent.detectedEntities?.locations[0];
    const locLower = loc ? loc.toLowerCase() : undefined;

    for (const item of items) {
      // Apply strict filters first
      if (!this.passesFilters(item, filters, userLocation)) {
        continue;
      }

      // Semantic Location Check
      let matchesLoc = true;
      if (locLower) {
        matchesLoc =
          Boolean(item.location?.district?.toLowerCase().includes(locLower)) ||
          Boolean(item.location?.state?.toLowerCase().includes(locLower)) ||
          Boolean(item.title.toLowerCase().includes(locLower)) ||
          Boolean(item.subtitle?.toLowerCase().includes(locLower)) ||
          Boolean(item.description.toLowerCase().includes(locLower)) ||
          item.keywords.some(k => k.toLowerCase().includes(locLower)) ||
          item.tags.some(t => t.toLowerCase().includes(locLower));

        if (!matchesLoc) {
          continue; // Exclude items not matching requested location
        }
      }

      // Semantic Entity Type Check
      if (parsedIntent.entityType && parsedIntent.entityType !== 'all') {
        if (parsedIntent.entityType === 'homestay' && item.entityType !== 'homestay') {
          continue;
        }
        if (parsedIntent.entityType === 'attraction' && item.entityType !== 'attraction' && item.entityType !== 'destination') {
          continue;
        }
        if (parsedIntent.entityType === 'route' && item.entityType !== 'route' && item.entityType !== 'taxi_stand' && item.entityType !== 'taxi_operator') {
          continue;
        }
      }

      // Semantic Category Check (Waterfall / Tea Garden)
      if (parsedIntent.category === 'waterfall') {
        const isWaterfall =
          item.category?.toLowerCase().includes('waterfall') ||
          item.title.toLowerCase().includes('waterfall') ||
          item.keywords.some(k => k.toLowerCase().includes('waterfall') || k.toLowerCase().includes('jharna')) ||
          item.tags.some(t => t.toLowerCase().includes('waterfall') || t.toLowerCase().includes('jharna')) ||
          item.description.toLowerCase().includes('waterfall');

        if (!isWaterfall) {
          continue; // Exclude non-waterfall items when waterfall is explicitly requested
        }
      }

      if (parsedIntent.category === 'tea_garden' || parsedIntent.preferenceKeywords.includes('tea_garden')) {
        const isTeaGarden =
          item.category?.toLowerCase().includes('tea') ||
          item.title.toLowerCase().includes('tea') ||
          item.description.toLowerCase().includes('tea') ||
          item.keywords.some(k => k.toLowerCase().includes('tea') || k.toLowerCase().includes('chai')) ||
          item.tags.some(t => t.toLowerCase().includes('tea') || t.toLowerCase().includes('chai'));

        if (!isTeaGarden) {
          continue; // Exclude non-tea garden items when tea garden is explicitly requested
        }
      }

      let scored = RankingService.scoreItem(item, query, synonymMap, userLocation);

      // Fallback for Devanagari / Hinglish or conceptual semantic match where raw query tokens didn't match English text
      if (!scored && matchesLoc) {
        let baseSemanticScore = 60;
        if (item.isVerified) baseSemanticScore += 10;
        if (item.isFeatured) baseSemanticScore += 15;
        baseSemanticScore += (item.popularityScore / 100) * 20;

        scored = {
          item,
          score: Math.round(baseSemanticScore * 10) / 10,
          matchType: 'keyword',
          highlights: { titleMatch: true }
        };
      }

      if (scored) {
        // Boost scores dynamically based on parsed Intent
        if (parsedIntent.intent === 'journey' && (item.entityType === 'route' || item.entityType === 'taxi_stand' || item.entityType === 'taxi_operator')) {
          scored.score += 40;
        } else if ((parsedIntent.intent === 'browse_accommodation' || parsedIntent.intent === 'stay') && item.entityType === 'homestay') {
          scored.score += 35;
        } else if (parsedIntent.intent === 'attraction' && item.entityType === 'attraction') {
          scored.score += 35;
        } else if (parsedIntent.intent === 'blog' && item.entityType === 'blog') {
          scored.score += 35;
        }

        // Location entity matches
        if (locLower && matchesLoc) {
          scored.score += 25;
        }

        // Preference keywords (e.g. peaceful, cheap, mountain_view)
        if (parsedIntent.preferenceKeywords.length > 0) {
          const itemText = `${item.title} ${item.description} ${item.tags.join(' ')}`.toLowerCase();
          for (const pref of parsedIntent.preferenceKeywords) {
            if (itemText.includes(pref.toLowerCase().replace('_', ' '))) {
              scored.score += 20;
            }
          }
        }

        scoredResults.push(scored);
      }
    }

    // Dynamic Google Routes Calculation for Journey Intents
    if ((parsedIntent.origin && parsedIntent.destination) || (parsedIntent.intent === 'journey' && query.trim().length > 3)) {
      try {
        const origName = parsedIntent.origin || query.split(/\b(?:to|from|2)\b/i)[0]?.trim() || 'Origin';
        const destName = parsedIntent.destination || query.split(/\b(?:to|from|2)\b/i)[1]?.trim() || 'Destination';

        if (origName && destName && origName.length >= 2 && destName.length >= 2) {
          const dynRoute = await GoogleRoutesService.calculateJourney(origName, destName);
          const dynItem: SearchIndexItem = {
            id: dynRoute.id,
            entityId: dynRoute.id,
            entityType: 'route',
            title: `${dynRoute.fromName} ➔ ${dynRoute.toName}`,
            subtitle: `Google Routes API • ${dynRoute.distanceKm} km • ~${dynRoute.timeFormatted}`,
            description: `Live road transit calculation from ${dynRoute.fromName} to ${dynRoute.toName}. Estimated fare: ₹${dynRoute.fareMin.toLocaleString()} - ₹${dynRoute.fareMax.toLocaleString()}. Shared jeep seat: ₹${dynRoute.sharedFarePerSeat}.`,
            slug: `${dynRoute.fromHubId}-to-${dynRoute.toHubId}`,
            canonicalUrl: `/#/journeys/${dynRoute.fromHubId}-to-${dynRoute.toHubId}`,
            tags: ['route', 'journey', 'taxi', dynRoute.fromHubId, dynRoute.toHubId, dynRoute.fromName.toLowerCase(), dynRoute.toName.toLowerCase()],
            keywords: [dynRoute.fromName.toLowerCase(), dynRoute.toName.toLowerCase(), 'taxi', 'route'],
            isVerified: true,
            isFeatured: true,
            price: dynRoute.fareMin,
            priceUnit: 'onwards (Private Cab)',
            popularityScore: 100,
            status: 'active',
            attributes: {},
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            location: {
              state: 'Sikkim/West Bengal',
              district: dynRoute.toName
            }
          };

          // Remove any existing duplicate route item
          const filtered = scoredResults.filter(sr => sr.item.id !== dynRoute.id && !(sr.item.entityType === 'route' && sr.item.title.toLowerCase().includes(dynRoute.fromName.toLowerCase()) && sr.item.title.toLowerCase().includes(dynRoute.toName.toLowerCase())));
          scoredResults.length = 0;
          scoredResults.push(
            {
              item: dynItem,
              score: 200,
              matchType: 'exact',
              highlights: { titleMatch: true }
            },
            ...filtered
          );
        }
      } catch (err) {
        console.warn('[SearchEngine] Google Routes dynamic calculation error:', err);
      }
    }

    // Determine sort preference from query or filter
    const effectiveSortBy = filters.sortBy || parsedIntent.sortPreference || 'relevance';
    this.sortResults(scoredResults, effectiveSortBy);

    // 3. Fallback Experience for zero-result queries
    let fallbackSuggestions: SearchIndexItem[] | undefined;
    if (scoredResults.length === 0 && query.trim().length > 0) {
      fallbackSuggestions = items
        .filter(it => it.isFeatured || it.popularityScore >= 88)
        .sort((a, b) => b.popularityScore - a.popularityScore)
        .slice(0, 6);
    }

    // 4. Group by Entity Types
    const byEntity: Record<SearchEntityType, ScoredSearchResult[]> = {
      destination: [],
      attraction: [],
      homestay: [],
      taxi_operator: [],
      taxi_stand: [],
      route: [],
      business: [],
      offer: [],
      moment: [],
      blog: []
    };

    const entityCounts: Record<SearchEntityType, number> = {
      destination: 0,
      attraction: 0,
      homestay: 0,
      taxi_operator: 0,
      taxi_stand: 0,
      route: 0,
      business: 0,
      offer: 0,
      moment: 0,
      blog: 0
    };

    for (const result of scoredResults) {
      const type = result.item.entityType;
      if (byEntity[type]) {
        byEntity[type].push(result);
        entityCounts[type]++;
      }
    }

    // 5. Paginate overall results
    const totalCount = scoredResults.length;
    const startIndex = (page - 1) * limit;
    const paginatedAll = scoredResults.slice(startIndex, startIndex + limit);
    const totalPages = Math.ceil(totalCount / limit) || 1;

    // 6. Calculate Real DB Fact Aggregations & Conversational AI Response
    let factResponse: UniversalSearchFactResponse | undefined = undefined;

    if (query && query.trim().length > 0) {
      const loc = parsedIntent.location || parsedIntent.detectedEntities?.locations[0];
      const entityType = parsedIntent.entityType;
      const intent = parsedIntent.intent;

      // Filter homestays matching location for village-wise breakdown
      const matchingHomestays = scoredResults.filter(
        r => r.item.entityType === 'homestay' &&
        (!loc || r.item.location?.district?.toLowerCase().includes(loc.toLowerCase()) || r.item.title.toLowerCase().includes(loc.toLowerCase()) || r.item.keywords.some(k => k.toLowerCase().includes(loc.toLowerCase())))
      );

      // Group homestays by village
      const villageMap = new Map<string, ScoredSearchResult[]>();
      for (const res of matchingHomestays) {
        const vName = res.item.subtitle || res.item.location?.address || res.item.location?.district || loc || 'Central';
        const cleanName = vName.split(',')[0].trim();
        if (!villageMap.has(cleanName)) {
          villageMap.set(cleanName, []);
        }
        villageMap.get(cleanName)!.push(res);
      }

      const villagesList = Array.from(villageMap.entries()).map(([vName, items]) => ({
        villageName: vName,
        count: items.length,
        itemIds: items.map(i => i.item.id)
      })).sort((a, b) => b.count - a.count);

      const totalHomestays = matchingHomestays.length;
      const totalVillages = villagesList.length || (totalHomestays > 0 ? 1 : 0);

      const totalAttractions = scoredResults.filter(r => r.item.entityType === 'attraction').length;
      const totalRoutes = scoredResults.filter(r => r.item.entityType === 'route' || r.item.entityType === 'taxi_stand').length;
      const totalDestinations = scoredResults.filter(r => r.item.entityType === 'destination').length;

      let responseType: UniversalSearchFactResponse['responseType'] = 'ENTITY_RESULTS';
      let aiMsg = `We found ${totalCount} matching results across HillyTrip.`;

      if (intent === 'count') {
        responseType = 'COUNT_RESULT';
        if (entityType === 'homestay') {
          aiMsg = `We have ${totalCount} homestays${loc ? ' in ' + loc : ''}.`;
        } else {
          aiMsg = `We have ${totalCount} verified listings matching your query.`;
        }
      } else if (intent === 'village_breakdown' || (intent === 'browse_accommodation' && loc)) {
        responseType = 'VILLAGE_BREAKDOWN';
        aiMsg = `We have ${totalCount} homestays${loc ? ' in ' + loc : ''}, spread across ${totalVillages} village${totalVillages === 1 ? '' : 's'}. You can explore them village-wise below.`;
      } else if (intent === 'browse_accommodation' || intent === 'stay' || entityType === 'homestay') {
        responseType = 'STAY_RESULTS';
        aiMsg = `We found ${totalCount} verified homestays${loc ? ' in ' + loc : ''}.`;
      } else if (intent === 'attraction' || entityType === 'attraction') {
        responseType = 'ATTRACTION_RESULTS';
        const categoryLabel = parsedIntent.category === 'waterfall' ? 'waterfall ' : (parsedIntent.category === 'tea_garden' ? 'tea garden ' : '');
        aiMsg = `We found ${totalCount} ${categoryLabel}attraction${totalCount === 1 ? '' : 's'}${loc ? ' in and around ' + loc : ''}. You can explore them below.`;
      } else if (intent === 'route' || entityType === 'route') {
        responseType = 'ROUTE_RESULTS';
        aiMsg = `We found ${totalCount} direct taxi routes and transfer options${loc ? ' for ' + loc : ''}.`;
      } else if (intent === 'destination' || entityType === 'destination') {
        responseType = 'DESTINATION_RESULTS';
        aiMsg = `We found ${totalCount} Himalayan destinations${loc ? ' around ' + loc : ''}.`;
      }

      factResponse = {
        responseType,
        aiResponse: aiMsg,
        facts: {
          totalCount,
          villageCount: totalVillages,
          entityType,
          location: loc,
          district: loc,
          villages: villagesList,
          attractionsCount: totalAttractions,
          routesCount: totalRoutes,
          destinationsCount: totalDestinations
        }
      };
    }

    // 7. Log search query analytics
    SearchAnalyticsService.logQuery(query, totalCount, userId);

    return {
      all: paginatedAll,
      byEntity,
      totalCount,
      entityCounts,
      page,
      totalPages,
      redirectUrl: redirect?.targetUrl,
      parsedIntent,
      factResponse,
      fallbackSuggestions
    };
  }

  /**
   * Fast Autocomplete endpoint (<100ms response).
   */
  public static autocomplete(query: string, limit: number = 8): AutocompleteSuggestion[] {
    IndexService.initializeIndex();
    const items = IndexService.getAllItems();
    return SuggestionService.getAutocomplete(items, query, limit);
  }

  /**
   * Fast Geospatial Nearby Search (Near Me / Radius search).
   */
  public static nearby(
    lat: number,
    lng: number,
    radiusKm: number = 10,
    entityTypes?: SearchEntityType[]
  ): ScoredSearchResult[] {
    IndexService.initializeIndex();
    const center = { lat, lng };
    const items = IndexService.getAllItems();
    const results: ScoredSearchResult[] = [];

    for (const item of items) {
      if (item.status !== 'active') continue;
      if (entityTypes && entityTypes.length > 0 && !entityTypes.includes(item.entityType)) continue;

      if (item.location?.coordinates) {
        const distance = GeoSearchService.calculateDistance(center, item.location.coordinates);
        if (distance <= radiusKm) {
          results.push({
            item,
            score: 100 - distance * 2,
            matchType: 'geo',
            distanceKm: distance,
            highlights: {}
          });
        }
      }
    }

    return results.sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
  }

  /**
   * Universal Domain Matching Engine.
   */
  public static matchEntities(criteria: MatchingCriteria): SearchIndexItem[] {
    IndexService.initializeIndex();
    const items = IndexService.getAllItems();
    return items.filter(item => MatchingService.match(item, criteria));
  }

  /**
   * Filter validator helper.
   */
  private static passesFilters(
    item: SearchIndexItem,
    filters: SearchFilterState,
    userLocation?: { lat: number; lng: number }
  ): boolean {
    // Entity Type filter
    if (filters.entityTypes && filters.entityTypes.length > 0) {
      if (!filters.entityTypes.includes(item.entityType)) return false;
    }

    // District filter
    if (filters.district) {
      if (!item.location?.district?.toLowerCase().includes(filters.district.toLowerCase())) {
        return false;
      }
    }

    // State filter
    if (filters.state) {
      if (!item.location?.state?.toLowerCase().includes(filters.state.toLowerCase())) {
        return false;
      }
    }

    // Category filter
    if (filters.category) {
      if (!item.category?.toLowerCase().includes(filters.category.toLowerCase())) {
        return false;
      }
    }

    // Price Range filter
    if (filters.minPrice !== undefined && item.price !== undefined) {
      if (item.price < filters.minPrice) return false;
    }
    if (filters.maxPrice !== undefined && item.price !== undefined) {
      if (item.price > filters.maxPrice) return false;
    }

    // Rating filter
    if (filters.minRating !== undefined && item.rating !== undefined) {
      if (item.rating < filters.minRating) return false;
    }

    // Verified badge filter
    if (filters.isVerifiedOnly && !item.isVerified) {
      return false;
    }

    // Available today filter
    if (filters.isAvailableTodayOnly && !item.isAvailableToday) {
      return false;
    }

    // Distance filter
    if (filters.maxDistanceKm !== undefined && (filters.centerLocation || userLocation)) {
      const center = filters.centerLocation || userLocation;
      if (item.location?.coordinates && center) {
        if (!GeoSearchService.isWithinRadius(item.location.coordinates, center, filters.maxDistanceKm)) {
          return false;
        }
      }
    }

    // Homestay specific attribute filters
    const attrs = item.attributes;
    if (filters.isFamilyFriendly && !attrs.isFamilyFriendly) return false;
    if (filters.isPetFriendly && !attrs.isPetFriendly) return false;
    if (filters.hasParking && !attrs.hasParking) return false;
    if (filters.hasBreakfast && !attrs.hasBreakfast) return false;
    if (filters.hasWifi && !attrs.hasWifi) return false;

    // Taxi specific attribute filters
    if (filters.isSharedTaxi && !attrs.isSharedTaxi) return false;
    if (filters.isPrivateTaxi && !attrs.isPrivateTaxi) return false;

    return true;
  }

  /**
   * Result sorting helper.
   */
  private static sortResults(results: ScoredSearchResult[], sortBy: string) {
    switch (sortBy) {
      case 'rating':
        results.sort((a, b) => (b.item.rating || 0) - (a.item.rating || 0));
        break;
      case 'popularity':
        results.sort((a, b) => b.item.popularityScore - a.item.popularityScore);
        break;
      case 'price_low':
        results.sort((a, b) => (a.item.price || 0) - (b.item.price || 0));
        break;
      case 'price_high':
        results.sort((a, b) => (b.item.price || 0) - (a.item.price || 0));
        break;
      case 'distance':
        results.sort((a, b) => (a.distanceKm || 9999) - (b.distanceKm || 9999));
        break;
      case 'relevance':
      default:
        results.sort((a, b) => b.score - a.score);
        break;
    }
  }
}
