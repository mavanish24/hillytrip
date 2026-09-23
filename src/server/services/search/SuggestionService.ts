import { SearchIndexItem, AutocompleteSuggestion } from '../../../types/search';
import { SearchAnalyticsService } from './SearchAnalyticsService';

export class SuggestionService {
  /**
   * Fast autocomplete (<100ms response) returning suggestions with entity icons.
   */
  public static getAutocomplete(
    indexItems: SearchIndexItem[],
    query: string,
    limit: number = 8
  ): AutocompleteSuggestion[] {
    const cleanQuery = query.toLowerCase().trim();
    if (!cleanQuery) return [];

    const suggestions: AutocompleteSuggestion[] = [];
    const synonymMap = SearchAnalyticsService.getSynonymsMap();

    for (const item of indexItems) {
      if (item.status !== 'active') continue;

      const titleLower = item.title.toLowerCase();
      const tagsLower = item.tags.map(t => t.toLowerCase());
      const keywordsLower = item.keywords.map(k => k.toLowerCase());

      let isMatch = false;
      let matchedKeyword: string | undefined;

      // 1. Title match
      if (titleLower.includes(cleanQuery)) {
        isMatch = true;
      }
      // 2. Local name / Alt spelling match
      else if (keywordsLower.some(k => k.includes(cleanQuery))) {
        isMatch = true;
        matchedKeyword = keywordsLower.find(k => k.includes(cleanQuery));
      }
      // 3. Tag match
      else if (tagsLower.some(t => t.includes(cleanQuery))) {
        isMatch = true;
        matchedKeyword = tagsLower.find(t => t.includes(cleanQuery));
      }
      // 4. Synonym match
      else {
        for (const [term, syns] of synonymMap.entries()) {
          if (cleanQuery.includes(term) || term.includes(cleanQuery)) {
            if (syns.some(s => titleLower.includes(s) || keywordsLower.some(k => k.includes(s)))) {
              isMatch = true;
              matchedKeyword = `Synonym: ${term}`;
              break;
            }
          }
        }
      }

      if (isMatch) {
        suggestions.push({
          id: item.id,
          title: item.title,
          subtitle: item.subtitle || `${item.location?.district || ''} ${item.location?.state ? '• ' + item.location.state : ''}`,
          entityType: item.entityType,
          slug: item.slug,
          canonicalUrl: item.canonicalUrl,
          imageUrl: item.imageUrl,
          matchKeyword: matchedKeyword,
          iconType: this.getIconForEntity(item)
        });

        if (suggestions.length >= limit) break;
      }
    }

    return suggestions;
  }

  /**
   * Maps entity types & attributes to UI icon identifiers.
   */
  private static getIconForEntity(item: SearchIndexItem): string {
    if (item.entityType === 'destination') return 'map-pin';
    if (item.entityType === 'attraction') {
      if (item.title.toLowerCase().includes('ropeway')) return 'cable-car';
      return 'compass';
    }
    if (item.entityType === 'homestay') return 'home';
    if (item.entityType === 'taxi_stand') return 'car-taxi';
    if (item.entityType === 'taxi_operator' || item.entityType === 'route') return 'car';
    if (item.entityType === 'offer') return 'tag';
    if (item.entityType === 'business') return 'store';
    if (item.entityType === 'moment') return 'camera';
    if (item.entityType === 'blog') return 'book-open';
    return 'search';
  }
}
