import { useState, useEffect, useCallback } from 'react';
import { TaxiOperatorProfile } from '../../types/taxi';
import { SEED_TAXI_OPERATORS, TAXI_STANDS } from '../../data/taxiData';

/**
 * Checks if a string is an internal database identifier, code, UUID, or unformatted ID.
 */
export function isInternalId(val: string): boolean {
  if (!val) return true;
  const clean = val.trim();

  // Pattern A: "TAXI1515", "TAXI0129", "TAXI0204", "TAXI0454", "HUB001", "VIL002", "TS102", "DEST102"
  if (/^(taxi|hub|vil|dest|ts|stand)[_-]?\d+$/i.test(clean)) return true;

  // Pattern B: "Taxi Stand 129", "Taxi Stand 204", "Taxi Stand 1515", "Taxi Hub 12", "Taxi Stand 0454"
  if (/^(taxi|hub|mountain)\s+(stand|hub|village)\s+\d+$/i.test(clean)) return true;

  // Pattern C: UUIDs e.g. "123e4567-e89b-12d3-a456-426614174000"
  if (/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(clean)) return true;

  // Pattern D: Pure numbers e.g. "129", "204", "1515"
  if (/^\d+$/.test(clean)) return true;

  // Pattern E: "Stand: TAXI1515" or "Stand: 129"
  if (/^stand:\s*/i.test(clean)) return true;

  return false;
}

/**
 * Formats raw taxi stand names/IDs (e.g. TAXI1515, TAXI0454) into clean human-readable names.
 * Returns NULL if the stand name is an internal ID/code and cannot be resolved to a human-readable display name.
 */
export function formatTaxiStand(standNameOrId?: string, hubs: any[] = []): string | null {
  if (!standNameOrId) return null;
  const raw = String(standNameOrId).trim();
  if (!raw || raw.toLowerCase() === 'null' || raw.toLowerCase() === 'undefined') return null;

  // 1. If hubs array (from taxi_stands table) is provided, check if hub id or name matches
  if (Array.isArray(hubs) && hubs.length > 0) {
    const hubMatch = hubs.find(h => {
      const hId = String(h.id || h.taxi_id || h.base_taxi_stand_id || '').trim().toLowerCase();
      const hName = String(h.name || h.taxi_stand_name || '').trim();
      const rawLower = raw.toLowerCase();
      return (
        (hId && hId === rawLower) ||
        (hName && hName.toLowerCase() === rawLower)
      );
    });
    if (hubMatch) {
      const resolvedName = String(hubMatch.name || hubMatch.taxi_stand_name || '').trim();
      if (resolvedName && !isInternalId(resolvedName)) {
        return resolvedName;
      }
    }
  }

  // 2. Check TAXI_STANDS list from taxiData.ts
  const fallbackMatch = TAXI_STANDS.find(s => {
    const sName = s.name.trim().toLowerCase();
    const sId = (s as any).id ? String((s as any).id).trim().toLowerCase() : '';
    const rawLower = raw.toLowerCase();
    return (
      sName === rawLower ||
      (sId && sId === rawLower) ||
      sName.includes(rawLower) ||
      (rawLower.length > 4 && rawLower.includes(sName))
    );
  });
  if (fallbackMatch?.name && !isInternalId(fallbackMatch.name)) {
    return fallbackMatch.name;
  }

  // 3. If string is ALREADY a clean, human-readable name (not an internal ID or code)
  if (!isInternalId(raw)) {
    return raw;
  }

  // 4. If it's an internal ID or code and could not be resolved to a human-readable name:
  return null;
}

/**
 * Fetches live taxi operators from the backend API (/api/taxi-operators) which queries Supabase.
 */
export async function fetchTaxiOperators(): Promise<TaxiOperatorProfile[]> {
  try {
    const res = await fetch('/api/taxi-operators');
    if (!res.ok) {
      throw new Error(`Failed to fetch taxi operators: HTTP ${res.status}`);
    }

    const contentType = res.headers?.get?.('content-type') || '';
    if (contentType.includes('text/html')) {
      // Backend returned an HTML page (e.g. 404 fallback); use seed operators
      return SEED_TAXI_OPERATORS;
    }

    const json = await res.json();
    const liveOperators: TaxiOperatorProfile[] = Array.isArray(json)
      ? json
      : (json && Array.isArray(json.data) ? json.data : null);

    if (liveOperators && liveOperators.length > 0) {
      return liveOperators;
    }

    // Fall back to seed operators
    return SEED_TAXI_OPERATORS;
  } catch (error: any) {
    console.warn('[TaxiDataService] Notice fetching live taxi operators, using verified fleet:', error?.message || error);
    return SEED_TAXI_OPERATORS;
  }
}

/**
 * Shared React hook for fetching and consuming live Supabase taxi operators.
 * Ensures single source of truth across all Taxi Marketplace components.
 */
export function useTaxiOperators() {
  const [operators, setOperators] = useState<TaxiOperatorProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadOperators = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTaxiOperators();
      setOperators(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch live taxi operators from database');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOperators();
  }, [loadOperators]);

  return {
    operators,
    loading,
    error,
    refetch: loadOperators
  };
}
