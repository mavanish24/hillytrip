import { SearchIndexItem, MatchingCriteria, SearchEntityType } from '../../../types/search';
import { GeoSearchService } from './GeoSearchService';

export class MatchingService {
  /**
   * Universal Match Engine evaluating index items against domain criteria.
   */
  public static match(item: SearchIndexItem, criteria: MatchingCriteria): boolean {
    if (item.status !== 'active') return false;

    // Filter by entity type if specified
    if (criteria.entityType && item.entityType !== criteria.entityType) {
      return false;
    }

    // Destination / District match
    if (criteria.destination) {
      const destLower = criteria.destination.toLowerCase();
      const matchesLocation =
        item.location?.district?.toLowerCase().includes(destLower) ||
        item.location?.state?.toLowerCase().includes(destLower) ||
        item.title.toLowerCase().includes(destLower) ||
        item.tags.some(t => t.toLowerCase().includes(destLower));

      if (!matchesLocation) return false;
    }

    // Max Price Check
    if (criteria.maxPrice !== undefined && item.price !== undefined) {
      if (item.price > criteria.maxPrice) return false;
    }

    // Entity Specific Criteria
    switch (item.entityType) {
      case 'taxi_operator':
      case 'taxi_stand':
      case 'route':
        return this.matchTaxi(item, criteria);

      case 'homestay':
        return this.matchHomestay(item, criteria);

      case 'attraction':
        return this.matchAttraction(item, criteria);

      case 'offer':
        return this.matchOffer(item, criteria);

      default:
        return true;
    }
  }

  private static matchTaxi(item: SearchIndexItem, criteria: MatchingCriteria): boolean {
    const attrs = item.attributes;

    // Route matching (e.g. Siliguri to Gangtok)
    if (criteria.routeFrom && attrs.routeFrom) {
      if (!attrs.routeFrom.toLowerCase().includes(criteria.routeFrom.toLowerCase())) return false;
    }
    if (criteria.routeTo && attrs.routeTo) {
      if (!attrs.routeTo.toLowerCase().includes(criteria.routeTo.toLowerCase())) return false;
    }

    // Vehicle Category
    if (criteria.vehicleCategory && attrs.vehicleCategory) {
      if (attrs.vehicleCategory.toLowerCase() !== criteria.vehicleCategory.toLowerCase()) return false;
    }

    return true;
  }

  private static matchHomestay(item: SearchIndexItem, criteria: MatchingCriteria): boolean {
    const attrs = item.attributes;

    // Capacity matching
    if (criteria.capacityNeeded && attrs.capacity) {
      if (attrs.capacity < criteria.capacityNeeded) return false;
    }

    // Required amenities matching (e.g., wifi, parking, breakfast)
    if (criteria.amenitiesRequired && criteria.amenitiesRequired.length > 0) {
      const itemAmenities = (attrs.amenities || []).map(a => a.toLowerCase());
      for (const req of criteria.amenitiesRequired) {
        if (!itemAmenities.includes(req.toLowerCase())) return false;
      }
    }

    return true;
  }

  private static matchAttraction(item: SearchIndexItem, criteria: MatchingCriteria): boolean {
    // Geo Distance check
    if (criteria.userLocation && criteria.maxDistanceKm && item.location?.coordinates) {
      if (!GeoSearchService.isWithinRadius(item.location.coordinates, criteria.userLocation, criteria.maxDistanceKm)) {
        return false;
      }
    }
    return true;
  }

  private static matchOffer(item: SearchIndexItem, criteria: MatchingCriteria): boolean {
    // Check offer validity if date provided
    if (attrsValid(item.attributes.validUntil)) {
      const validUntil = new Date(item.attributes.validUntil!);
      if (validUntil < new Date()) return false; // Expired offer
    }
    return true;
  }
}

function attrsValid(val: any): boolean {
  return typeof val === 'string' && val.length > 0;
}
