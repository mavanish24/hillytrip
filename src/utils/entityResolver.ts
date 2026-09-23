import { Hub, Destination, Attraction } from '../types';
import { TAXI_STANDS } from '../data/taxiData';
import { toSlug } from './slug';

/**
 * Safely resolves any entity ID, code (e.g. TAXI0001, VIL1761, DEST0001, nagrakata-taxi-stand), or slug
 * to a clean, human-readable name using available hubs, destinations, attractions, taxi stands, and homestays.
 */
export function resolveEntityName(
  idOrName: string,
  hubs: Hub[] = [],
  destinations: Destination[] = [],
  attractions: Attraction[] = [],
  homestays: any[] = [],
  isEnd = false,
  routePath?: string[]
): string {
  if (!idOrName) return isEnd ? 'Destination' : 'Origin';
  const clean = idOrName.trim().toLowerCase();

  // 1. Direct match in TAXI_STANDS
  const taxiStand = TAXI_STANDS.find(t => 
    (t.id || '').toLowerCase() === clean || 
    toSlug(t.name) === toSlug(clean) ||
    (t.name || '').toLowerCase() === clean
  );
  if (taxiStand?.name) return taxiStand.name;

  // 2. Direct match in hubs
  const hub = hubs.find(h => 
    (h?.id || '').toLowerCase() === clean || 
    toSlug(h?.name) === toSlug(clean)
  );
  if (hub?.name) return hub.name;

  // 3. Direct match in destinations
  const dest = destinations.find(d => 
    (d?.id || '').toLowerCase() === clean || 
    ((d as any)?.destination_id || '').toLowerCase() === clean ||
    (d?.slug || '').toLowerCase() === clean || 
    toSlug(d?.name) === toSlug(clean)
  );
  if (dest?.name) return dest.name;

  // 4. Direct match in attractions
  const attr = attractions.find(a => 
    (a?.id || '').toLowerCase() === clean || 
    ((a as any)?.attraction_id || '').toLowerCase() === clean ||
    (a?.slug || '').toLowerCase() === clean || 
    toSlug(a?.name) === toSlug(clean)
  );
  if (attr?.name) return attr.name;

  // 5. Direct match in homestays
  const home = homestays.find(h => 
    (h?.id || '').toLowerCase() === clean || 
    toSlug(h?.name) === toSlug(clean)
  );
  if (home?.name) return home.name;

  // 6. Check route path array if available
  if (routePath && routePath.length > 0) {
    if (isEnd) {
      const lastStop = routePath[routePath.length - 1];
      if (lastStop && !/^(vil|hub|dest|taxi)\d+/i.test(lastStop.trim())) {
        return lastStop;
      }
    } else {
      const firstStop = routePath[0];
      if (firstStop && !/^(vil|hub|dest|taxi)\d+/i.test(firstStop.trim())) {
        return firstStop;
      }
    }
  }

  // 7. Partial contains match in collections
  const partialHub = hubs.find(h => (h.id || '').toLowerCase().includes(clean) || clean.includes((h.id || '').toLowerCase()));
  if (partialHub?.name) return partialHub.name;
  const partialDest = destinations.find(d => (d.id || '').toLowerCase().includes(clean) || clean.includes((d.id || '').toLowerCase()));
  if (partialDest?.name) return partialDest.name;

  // 8. Handle codes like TAXI0001, TAXI0002, VIL0007, VIL1761, HUB0012, DEST0003
  if (/^(taxi|vil|hub|dest)/i.test(clean)) {
    if (/^taxi/i.test(clean)) {
      // Map known TAXI IDs directly
      if (clean === 'taxi0001') return 'NJP Railway Station Stand';
      if (clean === 'taxi0002') return 'Bagdogra Airport Prepaid Stand';
      if (clean === 'taxi0003') return 'Siliguri Junction Motor Stand';
      if (clean === 'taxi0004') return 'Kalimpong Motor Stand';
      if (clean === 'taxi0005') return 'Deorali Taxi Stand (Gangtok)';
      if (clean === 'taxi0006') return 'Darjeeling Motor Stand';
      if (clean === 'taxi0007') return 'Pelling Taxi Association Stand';
      if (clean === 'taxi0008') return 'Ravangla Taxi Stand';
      if (clean === 'taxi0009') return 'Lachen/Lachung Union Stand';
    }

    return idOrName.replace(/([a-zA-Z]+)(_|-)?([0-9]+)/, (_, prefix, sep, num) => {
      const pUpper = prefix.toUpperCase();
      const cleanNum = parseInt(num, 10) || num;
      if (pUpper === 'TAXI') return `Taxi Stand ${cleanNum}`;
      if (pUpper === 'VIL') return `Mountain Village ${cleanNum}`;
      if (pUpper === 'HUB') return `Taxi Hub ${cleanNum}`;
      if (pUpper === 'DEST') return `Destination ${cleanNum}`;
      return `${prefix} ${cleanNum}`;
    });
  }

  // 9. If slug/dash style string like "khanisherbung-west-district"
  if (idOrName.includes('-')) {
    return idOrName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  return idOrName;
}
