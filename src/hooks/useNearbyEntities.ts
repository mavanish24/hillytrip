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
  data: {
    villages: NearbyEntityResult[];
    attractions: NearbyEntityResult[];
    homestays: NearbyEntityResult[];
    taxiStands: NearbyEntityResult[];
  };
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
  loading: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  page: number;
  loadMore: () => Promise<void>;
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
  limit = 5
}: UseNearbyEntitiesOptions): NearbyEntitiesState {
  const [radiusKm, setRadiusKm] = useState<number>(initialRadiusKm);
  const [page, setPage] = useState<number>(1);
  const [villages, setVillages] = useState<NearbyEntityResult[]>([]);
  const [attractions, setAttractions] = useState<NearbyEntityResult[]>([]);
  const [homestays, setHomestays] = useState<NearbyEntityResult[]>([]);
  const [taxiStands, setTaxiStands] = useState<NearbyEntityResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const resolvedCoords = (!isValidGeoCoordinate(latitude, longitude) && entityId)
    ? resolveCanonicalCoordinates(entityId)
    : null;
  const numLat = isValidGeoCoordinate(latitude, longitude) && latitude != null ? Number(latitude) : (resolvedCoords?.lat ?? null);
  const numLng = isValidGeoCoordinate(latitude, longitude) && longitude != null ? Number(longitude) : (resolvedCoords?.lng ?? null);
  const hasValidCoordinates = isValidGeoCoordinate(numLat, numLng);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const isFetchingRef = useRef<boolean>(false);

  const fetchNearby = useCallback(async (targetPage: number = 1, append: boolean = false) => {
    // If we have neither valid coordinates nor entityId/entityType, clear and return
    if (!hasValidCoordinates && (!entityId || !entityType)) {
      setVillages([]);
      setAttractions([]);
      setHomestays([]);
      setTaxiStands([]);
      setIsLoading(false);
      setIsLoadingMore(false);
      setHasMore(false);
      return;
    }

    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    if (append) {
      setIsLoadingMore(true);
    } else {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setIsLoading(true);
    }
    setError(null);

    const controller = new AbortController();
    if (!append) {
      abortControllerRef.current = controller;
    }

    try {
      let url = '';
      const requestLimit = limit || 5;
      if (hasValidCoordinates && numLat != null && numLng != null) {
        url = `/api/nearby?lat=${numLat}&lng=${numLng}&radius=${radiusKm}&limit=${requestLimit}&page=${targetPage}`;
        if (entityId) {
          url += `&excludeId=${encodeURIComponent(entityId)}`;
        }
        if (entityType) {
          url += `&excludeType=${encodeURIComponent(entityType)}`;
        }
      } else if (entityType && entityId) {
        url = `/api/nearby/${encodeURIComponent(entityType)}/${encodeURIComponent(entityId)}?radius=${radiusKm}&limit=${requestLimit}&page=${targetPage}`;
      }

      if (!url) return;

      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const json = await res.json();
      if (json && json.nearby) {
        const v: NearbyEntityResult[] = json.nearby.villages || [];
        const a: NearbyEntityResult[] = json.nearby.attractions || [];
        const h: NearbyEntityResult[] = json.nearby.homestays || [];
        const t: NearbyEntityResult[] = json.nearby.taxi_stands || json.nearby.taxiStands || [];

        const totalBatchCount = v.length + a.length + h.length + t.length;

        if (append) {
          const dedupe = (prev: NearbyEntityResult[], next: NearbyEntityResult[]) => {
            const seen = new Set(prev.map(item => item.entity?.id || item.entity?.village_code || item.entity?.homestay_id || item.entity?.attraction_id || item.entity?.taxi_id));
            const fresh = next.filter(item => {
              const id = item.entity?.id || item.entity?.village_code || item.entity?.homestay_id || item.entity?.attraction_id || item.entity?.taxi_id;
              return id ? !seen.has(id) : true;
            });
            return [...prev, ...fresh];
          };

          setVillages(prev => dedupe(prev, v));
          setAttractions(prev => dedupe(prev, a));
          setHomestays(prev => dedupe(prev, h));
          setTaxiStands(prev => dedupe(prev, t));
          setPage(targetPage);
          // Stop pagination if server returned fewer items than requested batch
          setHasMore(totalBatchCount >= requestLimit);
        } else {
          setVillages(v);
          setAttractions(a);
          setHomestays(h);
          setTaxiStands(t);
          setPage(1);
          setHasMore(totalBatchCount >= requestLimit);
        }
      } else {
        if (!append) {
          setVillages([]);
          setAttractions([]);
          setHomestays([]);
          setTaxiStands([]);
        }
        setHasMore(false);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.warn('[useNearbyEntities] Proximity fetch error:', err.message || err);
        setError(err.message || 'Failed to calculate nearby places');
      }
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [numLat, numLng, entityType, entityId, radiusKm, limit, hasValidCoordinates]);

  useEffect(() => {
    setPage(1);
    fetchNearby(1, false);
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchNearby]);

  const loadMore = useCallback(async () => {
    if (isLoading || isLoadingMore || !hasMore || isFetchingRef.current) return;
    const nextPage = page + 1;
    await fetchNearby(nextPage, true);
  }, [isLoading, isLoadingMore, hasMore, page, fetchNearby]);

  const data = {
    villages,
    attractions,
    homestays,
    taxiStands
  };

  return {
    data,
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
    loading: isLoading,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    page,
    loadMore,
    radiusKm,
    setRadiusKm,
    refetch: () => fetchNearby(1, false),
    hasValidCoordinates
  };
}
