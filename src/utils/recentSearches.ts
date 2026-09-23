export interface RecentRouteSearch {
  fromId: string;
  toId: string;
  fromName: string;
  toName: string;
  timestamp: number;
}

const STORAGE_KEY = 'hillytrip_recent_route_searches';
const MAX_SEARCHES = 5;

export function getRecentRouteSearches(): RecentRouteSearch[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.slice(0, MAX_SEARCHES);
      }
    }
  } catch (e) {
    console.error('Error reading recent route searches from localStorage', e);
  }
  return [];
}

export function saveRecentRouteSearch(
  fromId: string,
  toId: string,
  fromNameInput?: string,
  toNameInput?: string,
  hubs: Array<{ id: string; name: string }> = [],
  destinations: Array<{ id: string; name: string }> = []
): RecentRouteSearch[] {
  if (!fromId || !toId || fromId === toId) return getRecentRouteSearches();

  const resolveName = (id: string, customName?: string) => {
    if (customName && customName.trim().length > 0) return customName.split(' (')[0].trim();
    const h = hubs.find(item => item.id.toLowerCase() === id.toLowerCase());
    if (h) return h.name.split(' (')[0].trim();
    const d = destinations.find(item => item.id.toLowerCase() === id.toLowerCase());
    if (d) return d.name.split(' (')[0].trim();
    return id.charAt(0).toUpperCase() + id.slice(1);
  };

  const fromName = resolveName(fromId, fromNameInput);
  const toName = resolveName(toId, toNameInput);

  const newEntry: RecentRouteSearch = {
    fromId,
    toId,
    fromName,
    toName,
    timestamp: Date.now()
  };

  const current = getRecentRouteSearches();
  const filtered = current.filter(
    item => !(item.fromId.toLowerCase() === fromId.toLowerCase() && item.toId.toLowerCase() === toId.toLowerCase())
  );

  const updated = [newEntry, ...filtered].slice(0, MAX_SEARCHES);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('hillytrip_recent_searches_updated'));
  } catch (e) {
    console.error('Error saving recent route search to localStorage', e);
  }

  return updated;
}

export function clearRecentRouteSearches(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('hillytrip_recent_searches_updated'));
  } catch (e) {
    console.error('Error clearing recent route searches from localStorage', e);
  }
}

export function removeRecentRouteSearch(fromId: string, toId: string): RecentRouteSearch[] {
  if (typeof window === 'undefined') return [];
  const current = getRecentRouteSearches();
  const updated = current.filter(
    item => !(item.fromId.toLowerCase() === fromId.toLowerCase() && item.toId.toLowerCase() === toId.toLowerCase())
  );
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('hillytrip_recent_searches_updated'));
  } catch (e) {
    console.error('Error removing recent route search', e);
  }
  return updated;
}
