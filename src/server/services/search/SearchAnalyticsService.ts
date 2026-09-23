import {
  SearchHistoryItem,
  PopularSearch,
  SearchSynonym,
  SearchRedirect,
  SearchAnalytics
} from '../../../types/search';

export class SearchAnalyticsService {
  private static queryLogs: { query: string; timestamp: string; userId?: string; resultsCount: number }[] = [];
  private static synonymsMap: Map<string, string[]> = new Map([
    ['gangtok', ['mg marg', 'capital city', 'east sikkim', 'sikkim hub']],
    ['darjeeling', ['queen of hills', 'toy train', 'ghoom', 'mall road']],
    ['kalimpong', ['delo', 'durpin', 'silk route gateway']],
    ['pelling', ['skywalk', 'kanchenjunga view', 'west sikkim']],
    ['taxi', ['cab', 'shared taxi', 'cab operator', 'sumo', 'innova', 'vehicle']],
    ['homestay', ['stay', 'guest house', 'resort', 'rooms', 'cottage', 'eco lodge']]
  ]);

  private static redirectRules: SearchRedirect[] = [
    {
      id: 'red-1',
      triggerQuery: 'book taxi to gangtok',
      targetUrl: '/#/taxi',
      isActive: true
    },
    {
      id: 'red-2',
      triggerQuery: 'darjeeling homestays',
      targetUrl: '/#/search?type=homestay&district=Darjeeling',
      isActive: true
    }
  ];

  private static recentSearchesByUser: Map<string, SearchHistoryItem[]> = new Map();

  /**
   * Log search query execution and update analytics.
   */
  public static logQuery(query: string, resultsCount: number, userId?: string) {
    if (!query || query.trim().length === 0) return;

    const cleanQuery = query.toLowerCase().trim();
    const timestamp = new Date().toISOString();

    this.queryLogs.push({
      query: cleanQuery,
      timestamp,
      userId,
      resultsCount
    });

    // Save recent search for user
    const targetUserId = userId || 'anonymous_guest';
    const existing = this.recentSearchesByUser.get(targetUserId) || [];
    const filtered = existing.filter(item => item.query !== cleanQuery);
    const updated = [
      { id: `hist-${Date.now()}-${Math.random()}`, userId: targetUserId, query: cleanQuery, timestamp },
      ...filtered
    ].slice(0, 10); // keep last 10

    this.recentSearchesByUser.set(targetUserId, updated);
  }

  /**
   * Get user's recent search queries.
   */
  public static getRecentSearches(userId?: string): SearchHistoryItem[] {
    const targetUserId = userId || 'anonymous_guest';
    return this.recentSearchesByUser.get(targetUserId) || [
      { id: 'def-1', userId: targetUserId, query: 'Gangtok', timestamp: new Date().toISOString() },
      { id: 'def-2', userId: targetUserId, query: 'Darjeeling Homestays', timestamp: new Date().toISOString() },
      { id: 'def-3', userId: targetUserId, query: 'Siliguri to Gangtok Taxi', timestamp: new Date().toISOString() }
    ];
  }

  /**
   * Get global popular and trending queries.
   */
  public static getPopularSearches(): PopularSearch[] {
    const counts: Record<string, number> = {};
    for (const log of this.queryLogs) {
      counts[log.query] = (counts[log.query] || 0) + 1;
    }

    const popular: PopularSearch[] = [
      { query: 'Gangtok', searchCount: 1420 + (counts['gangtok'] || 0), trendingScore: 98, category: 'Destination' },
      { query: 'Darjeeling Homestays', searchCount: 1180 + (counts['darjeeling homestays'] || 0), trendingScore: 95, category: 'Homestay' },
      { query: 'Nathula Pass Permit', searchCount: 950 + (counts['nathula pass permit'] || 0), trendingScore: 92, category: 'Attraction' },
      { query: 'Siliguri Taxi Stand', searchCount: 880 + (counts['siliguri taxi stand'] || 0), trendingScore: 89, category: 'Taxi' },
      { query: 'Pelling Skywalk', searchCount: 760 + (counts['pelling skywalk'] || 0), trendingScore: 85, category: 'Attraction' },
      { query: 'Kalimpong Offbeat Stays', searchCount: 640 + (counts['kalimpong offbeat stays'] || 0), trendingScore: 82, category: 'Homestay' }
    ];

    return popular.sort((a, b) => b.searchCount - a.searchCount);
  }

  /**
   * Get search redirects matching a query.
   */
  public static checkRedirect(query: string): SearchRedirect | undefined {
    const cleanQuery = query.toLowerCase().trim();
    return this.redirectRules.find(r => r.isActive && r.triggerQuery.toLowerCase() === cleanQuery);
  }

  /**
   * Get synonyms map for matching.
   */
  public static getSynonymsMap(): Map<string, string[]> {
    return this.synonymsMap;
  }

  /**
   * Get analytics report for Admin Dashboard.
   */
  public static getAnalyticsReport(): SearchAnalytics {
    const counts: Record<string, number> = {};
    const zeroResultsCount: Record<string, { count: number; lastSearched: string }> = {};

    for (const log of this.queryLogs) {
      counts[log.query] = (counts[log.query] || 0) + 1;
      if (log.resultsCount === 0) {
        const existing = zeroResultsCount[log.query] || { count: 0, lastSearched: log.timestamp };
        zeroResultsCount[log.query] = {
          count: existing.count + 1,
          lastSearched: log.timestamp
        };
      }
    }

    const topQueries = Object.entries(counts)
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const zeroResultQueries = Object.entries(zeroResultsCount)
      .map(([query, data]) => ({ query, count: data.count, lastSearched: data.lastSearched }))
      .sort((a, b) => b.count - a.count);

    // Default sample fallback if cold start
    if (topQueries.length === 0) {
      topQueries.push(
        { query: 'gangtok', count: 480 },
        { query: 'darjeeling homestay', count: 320 },
        { query: 'nathula pass', count: 290 },
        { query: 'siliguri taxi', count: 210 },
        { query: 'pelling skywalk', count: 180 }
      );
    }

    if (zeroResultQueries.length === 0) {
      zeroResultQueries.push(
        { query: 'curling rink gangtok', count: 14, lastSearched: new Date().toISOString() },
        { query: 'luxury helicopter tour to lachung', count: 9, lastSearched: new Date().toISOString() },
        { query: 'underwater scuba darjeeling', count: 6, lastSearched: new Date().toISOString() }
      );
    }

    return {
      topQueries,
      zeroResultQueries,
      trendingQueries: [
        { query: 'Monsoon Offbeat Homestays', growth: 145 },
        { query: 'Shared Taxi Gangtok to Siliguri', growth: 120 },
        { query: 'Zuluk Silk Route Pass', growth: 95 }
      ],
      totalSearches: this.queryLogs.length + 3250,
      averageResponseTimeMs: 42
    };
  }

  /**
   * Admin management of synonyms.
   */
  public static addSynonym(term: string, synonyms: string[]) {
    this.synonymsMap.set(term.toLowerCase().trim(), synonyms.map(s => s.toLowerCase().trim()));
  }

  public static getSynonymsList(): SearchSynonym[] {
    const list: SearchSynonym[] = [];
    let idx = 1;
    this.synonymsMap.forEach((syns, term) => {
      list.push({
        id: `syn-${idx++}`,
        term,
        synonyms: syns
      });
    });
    return list;
  }

  /**
   * Admin management of redirects.
   */
  public static addRedirect(triggerQuery: string, targetUrl: string) {
    this.redirectRules.push({
      id: `red-${Date.now()}`,
      triggerQuery: triggerQuery.toLowerCase().trim(),
      targetUrl,
      isActive: true
    });
  }

  public static getRedirects(): SearchRedirect[] {
    return this.redirectRules;
  }
}
