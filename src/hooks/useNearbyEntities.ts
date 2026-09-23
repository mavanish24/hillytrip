import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  findNearbyEntities, 
  isValidGeoCoordinate, 
  resolveCanonicalCoordinates,
  NearbyEntityResult 
} from '../services/geoProximityService';
import { CANONICAL_TAXI_STANDS } from '../data/canonicalTaxiStands';

export interface UseNearbyEntitiesOptions {
  latitude?: number | null;
  longitude?: number | null;
  entityType?: 'village' | 'attraction' | 'homestay' | 'taxi_stand' | 'hub' | 'destination' | string;
  entityId?: string;
  initialRadiusKm?: number;
  limit?: number;
  fallbackItems?: {
    villages?: any[];
    attractions?: any[];
    homestays?: any[];
    taxiStands?: any[];
  };
}

export interface NearbyEntitiesState {
  villages: NearbyEntityResult[];
  attractions: NearbyEntityResult[];
  homestays: NearbyEntityResult[];
  taxiStands: NearbyEntityResult[];
  counts: {
    villages: number;
    attractions: number;
    homestays: number;
    taxiStands: number;
    total: number;
  };
  isLoading: boolean;
  error: string | null;
  radiusKm: number;
  setRadiusKm: (radius: number) => void;
  refetch: () => Promise<void>;
  hasValidCoordinates: boolean;
}

export function useNearbyEntities({
  latitude,
  longitude,
  entityType,
  entityId,
  initialRadiusKm = 15,
  limit = 20,
  fallbackItems
}: UseNearbyEntitiesOptions): NearbyEntitiesState {
  const [radiusKm, setRadiusKm] = useState<number>(initialRadiusKm);
  const [villages, setVillages] = useState<NearbyEntityResult[]>([]);
  const [attractions, setAttractions] = useState<NearbyEntityResult[]>([]);
  const [homestays, setHomestays] = useState<NearbyEntityResult[]>([]);
  const [taxiStands, setTaxiStands] = useState<NearbyEntityResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const resolvedCoords = (!isValidGeoCoordinate(latitude, longitude) && entityId)
    ? resolveCanonicalCoordinates(entityId)
    : null;
  const numLat = isValidGeoCoordinate(latitude, longitude) && latitude != null ? Number(latitude) : (resolvedCoords?.lat ?? null);
  const numLng = isValidGeoCoordinate(latitude, longitude) && longitude != null ? Number(longitude) : (resolvedCoords?.lng ?? null);
  const hasValidCoordinates = isValidGeoCoordinate(numLat, numLng);
  const abortControllerRef = useRef<AbortController | null>(null);
  const fallbackRef = useRef(fallbackItems);
  fallbackRef.current = fallbackItems;

  const fetchNearby = useCallback(async () => {
    const currentFallbacks = fallbackRef.current;
    const effectiveTaxiStands = (currentFallbacks?.taxiStands && currentFallbacks.taxiStands.length > 0)
      ? currentFallbacks.taxiStands
      : CANONICAL_TAXI_STANDS;

    // If we have neither valid coordinates nor entityId/entityType, clear and return
    if (!hasValidCoordinates && (!entityId || !entityType)) {
      setVillages([]);
      setAttractions([]);
      setHomestays([]);
      setTaxiStands([]);
      setIsLoading(false);
      return;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);

    // Immediate local computation if fallback items are provided and we have valid coords
    if (hasValidCoordinates && currentFallbacks && numLat != null && numLng != null) {
      if (currentFallbacks.villages?.length) {
        setVillages(findNearbyEntities(numLat, numLng, currentFallbacks.villages, { maxRadiusKm: radiusKm, limit }));
      }
      if (currentFallbacks.attractions?.length) {
        setAttractions(findNearbyEntities(numLat, numLng, currentFallbacks.attractions, { maxRadiusKm: radiusKm, limit, excludeId: entityId }));
      }
      if (currentFallbacks.homestays?.length) {
        setHomestays(findNearbyEntities(numLat, numLng, currentFallbacks.homestays, { maxRadiusKm: radiusKm, limit, excludeId: entityId }));
      }
      setTaxiStands(findNearbyEntities(numLat, numLng, effectiveTaxiStands, { maxRadiusKm: Math.max(radiusKm * 1.5, 25), limit, excludeId: entityId }));
    }

    try {
      let url = '';
      if (hasValidCoordinates && numLat != null && numLng != null) {
        url = `/api/nearby?lat=${numLat}&lng=${numLng}&radius=${radiusKm}&limit=${limit}`;
        if (entityId) {
          url += `&excludeId=${encodeURIComponent(entityId)}`;
        }
        if (entityType) {
          url += `&excludeType=${encodeURIComponent(entityType)}`;
        }
      } else if (entityType && entityId) {
        url = `/api/nearby/${encodeURIComponent(entityType)}/${encodeURIComponent(entityId)}?radius=${radiusKm}&limit=${limit}`;
      }

      if (!url) return;

      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const json = await res.json();
      if (json && json.nearby) {
        const v = json.nearby.villages || [];
        const a = json.nearby.attractions || [];
        const h = json.nearby.homestays || [];
        let t = json.nearby.taxi_stands || json.nearby.taxiStands || [];
        if (t.length === 0 && numLat != null && numLng != null) {
          t = findNearbyEntities(numLat, numLng, CANONICAL_TAXI_STANDS, { maxRadiusKm: Math.max(radiusKm * 1.5, 25), limit, excludeId: entityId });
        }
        setVillages(v);
        setAttractions(a);
        setHomestays(h);
        setTaxiStands(t);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('[useNearbyEntities] Proximity fetch error:', err.message || err);
        // Fallback to local computation if coords exist
        if (hasValidCoordinates && currentFallbacks && numLat != null && numLng != null) {
          if (currentFallbacks.villages) {
            setVillages(findNearbyEntities(numLat, numLng, currentFallbacks.villages, { maxRadiusKm: radiusKm, limit }));
          }
          if (currentFallbacks.attractions) {
            setAttractions(findNearbyEntities(numLat, numLng, currentFallbacks.attractions, { maxRadiusKm: radiusKm, limit, excludeId: entityId }));
          }
          if (currentFallbacks.homestays) {
            setHomestays(findNearbyEntities(numLat, numLng, currentFallbacks.homestays, { maxRadiusKm: radiusKm, limit, excludeId: entityId }));
          }
          setTaxiStands(findNearbyEntities(numLat, numLng, effectiveTaxiStands, { maxRadiusKm: Math.max(radiusKm * 1.5, 25), limit, excludeId: entityId }));
        } else {
          setError(err.message || 'Failed to calculate nearby places');
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [numLat, numLng, entityType, entityId, radiusKm, limit, hasValidCoordinates]);

  useEffect(() => {
    fetchNearby();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchNearby]);

  return {
    villages,
    attractions,
    homestays,
    taxiStands,
    counts: {
      villages: villages.length,
      attractions: attractions.length,
      homestays: homestays.length,
      taxiStands: taxiStands.length,
      total: villages.length + attractions.length + homestays.length + taxiStands.length
    },
    isLoading,
    error,
    radiusKm,
    setRadiusKm,
    refetch: fetchNearby,
    hasValidCoordinates
  };
}
