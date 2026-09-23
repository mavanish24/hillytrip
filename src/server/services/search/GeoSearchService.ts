import { GeoLocation } from '../../../types/search';

export class GeoSearchService {
  /**
   * Calculate Haversine distance between two coordinates in kilometers.
   */
  public static calculateDistance(point1: GeoLocation, point2: GeoLocation): number {
    const R = 6371; // Radius of Earth in kilometers
    const dLat = this.toRadians(point2.lat - point1.lat);
    const dLng = this.toRadians(point2.lng - point1.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.lat)) *
        Math.cos(this.toRadians(point2.lat)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10; // Round to 1 decimal place
  }

  /**
   * Check if point is within maxDistanceKm from centerLocation.
   */
  public static isWithinRadius(
    point: GeoLocation | undefined,
    center: GeoLocation | undefined,
    maxDistanceKm: number
  ): boolean {
    if (!point || !center) return false;
    const distance = this.calculateDistance(point, center);
    return distance <= maxDistanceKm;
  }

  private static toRadians(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}
