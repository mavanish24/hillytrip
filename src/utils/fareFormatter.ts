import { Route } from '../types';

/**
 * Calculates average fare from the Hillytrip fare database as accepted by customer.
 * If there is no price/fare in the database, returns 'NA'.
 */
export function formatHillytripFare(route: Partial<Route> | null | undefined): {
  avgFareText: string;
  fareRangeText: string;
  hasPrice: boolean;
} {
  if (!route) {
    return { avgFareText: 'Fare not available', fareRangeText: 'Fare not available', hasPrice: false };
  }

  const min = route.fareMin !== undefined && route.fareMin !== null && Number(route.fareMin) > 0 ? Number(route.fareMin) : null;
  const max = route.fareMax !== undefined && route.fareMax !== null && Number(route.fareMax) > 0 ? Number(route.fareMax) : null;

  if (min === null && max === null) {
    return { avgFareText: 'Fare not available', fareRangeText: 'Fare not available', hasPrice: false };
  }

  if (min !== null && max !== null) {
    const avg = Math.round((min + max) / 2);
    return {
      avgFareText: `₹${avg.toLocaleString('en-IN')}`,
      fareRangeText: `₹${min.toLocaleString('en-IN')}–₹${max.toLocaleString('en-IN')}`,
      hasPrice: true
    };
  }

  if (min !== null) {
    return {
      avgFareText: `₹${min.toLocaleString('en-IN')}`,
      fareRangeText: `₹${min.toLocaleString('en-IN')}`,
      hasPrice: true
    };
  }

  const maxVal = max!;
  return {
    avgFareText: `₹${maxVal.toLocaleString('en-IN')}`,
    fareRangeText: `₹${maxVal.toLocaleString('en-IN')}`,
    hasPrice: true
  };
}

/**
 * Formats Distance from Google API or Route data.
 */
export function formatRouteDistance(route: Partial<Route> | null | undefined, googleDistText?: string): string {
  if (googleDistText && googleDistText.trim()) {
    return googleDistText;
  }
  if (route && route.distance && Number(route.distance) > 0) {
    return `${route.distance} km`;
  }
  return 'NA';
}

/**
 * Formats Travel Time/Duration from Google API or Route data.
 */
export function formatRouteDuration(route: Partial<Route> | null | undefined, googleDurationText?: string): string {
  if (googleDurationText && googleDurationText.trim()) {
    return googleDurationText;
  }
  if (route && route.timeMin && Number(route.timeMin) > 0) {
    const mins = Number(route.timeMin);
    const hrs = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (hrs > 0 && remainingMins > 0) {
      return `${hrs}h ${remainingMins}m`;
    } else if (hrs > 0) {
      return `${hrs}h`;
    }
    return `${remainingMins} mins`;
  }
  return 'NA';
}
