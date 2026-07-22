/**
 * Centralized Slug Utilities for HillyTrip SEO Optimization
 */

export function toSlug(text: any): string {
  if (text === undefined || text === null) return '';
  const str = String(text);
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s_'-]/g, '')
    .trim()
    .replace(/[\s_']+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getItemSlug(item: any): string {
  if (!item) return '';
  if (typeof item === 'string') return toSlug(item);
  
  if (item.slug && typeof item.slug === 'string' && item.slug.trim()) {
    return item.slug.trim().toLowerCase();
  }
  
  const name = item.name || 
    item.village_name || 
    item.villageName || 
    item.attraction_name || 
    item.attractionName || 
    item.homestay_name || 
    item.homestayName || 
    item.taxi_stand_name || 
    item.taxiStandName || 
    item.route_name || 
    item.routeName || 
    item.id || 
    item.destination_id || 
    item.attraction_id || 
    item.homestay_id || 
    item.taxi_id || '';
    
  return toSlug(name);
}

export function matchSlugOrId(item: any, query: string): boolean {
  if (!item || !query) return false;
  const q = decodeURIComponent(query).toLowerCase().trim();
  const slug = getItemSlug(item);
  const rawSlug = (item.slug || '').toLowerCase().trim();
  const id = String(item.id || item.destination_id || item.attraction_id || item.homestay_id || item.taxi_id || '').toLowerCase().trim();
  const name = String(item.name || item.village_name || item.attraction_name || item.homestay_name || item.taxi_stand_name || item.route_name || '').toLowerCase().trim();
  const nameSlug = toSlug(name);
  const idSlug = toSlug(id);

  return slug === q || rawSlug === q || id === q || name === q || nameSlug === q || idSlug === q;
}
