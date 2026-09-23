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
  const rawQ = decodeURIComponent(query).trim();
  const q = rawQ.toLowerCase();
  const qSlug = toSlug(rawQ);

  if (!q && !qSlug) return false;

  const slug = getItemSlug(item);
  const rawSlug = (item.slug || '').toLowerCase().trim();
  const normSlug = toSlug(rawSlug);

  const id = String(item.id || item.destination_id || item.attraction_id || item.homestay_id || item.taxi_id || item.route_id || item.route_code || '').toLowerCase().trim();
  const idSlug = toSlug(id);

  const name = String(item.name || item.village_name || item.attraction_name || item.homestay_name || item.taxi_stand_name || item.route_name || '').toLowerCase().trim();
  const nameSlug = toSlug(name);

  // Exact checks
  if (slug === q || slug === qSlug) return true;
  if (rawSlug === q || normSlug === qSlug) return true;
  if (id === q || idSlug === qSlug) return true;
  if (name === q || nameSlug === qSlug) return true;

  // Partial / Substring checks (e.g., "yuksam-forest-block-west-district" vs "yuksam-forest-block")
  if (nameSlug && qSlug && (qSlug.includes(nameSlug) || nameSlug.includes(qSlug))) return true;
  if (idSlug && qSlug && (qSlug.includes(idSlug) || idSlug.includes(qSlug))) return true;
  if (normSlug && qSlug && (qSlug.includes(normSlug) || normSlug.includes(qSlug))) return true;

  return false;
}
