import { auth } from './firebase';

// Retained for backwards compatibility with server.ts until district consolidation phase
export function determineHomestayDistrict(row: any): string {
  if (row.district && typeof row.district === 'string' && row.district.trim() && row.district !== 'All') {
    const d = row.district.trim();
    if (d.toLowerCase().includes('kalimpong')) return 'Kalimpong';
    if (d.toLowerCase().includes('darjeeling')) return 'Darjeeling';
    if (d.toLowerCase().includes('east district') || d.toLowerCase().includes('east sikkim') || d.toLowerCase().includes('gangtok') || d.toLowerCase().includes('pakyong')) return 'East Sikkim';
    if (d.toLowerCase().includes('west district') || d.toLowerCase().includes('west sikkim') || d.toLowerCase().includes('gyalshing') || d.toLowerCase().includes('pelling')) return 'West Sikkim';
    if (d.toLowerCase().includes('south district') || d.toLowerCase().includes('south sikkim') || d.toLowerCase().includes('namchi')) return 'South Sikkim';
    if (d.toLowerCase().includes('north district') || d.toLowerCase().includes('north sikkim') || d.toLowerCase().includes('lachen') || d.toLowerCase().includes('mangan')) return 'North Sikkim';
    if (d.toLowerCase().includes('jalpaiguri') || d.toLowerCase().includes('dooars') || d.toLowerCase().includes('alipurduar')) return 'Jalpaiguri / Dooars';
    if (d.toLowerCase().includes('kurseong') || d.toLowerCase().includes('mirik')) return 'Kurseong & Mirik';
    return d;
  }

  const id = (row.homestay_id || row.id || '').toUpperCase();
  const addr = (row.address || '').toLowerCase();
  const name = (row.homestay_name || row.name || '').toLowerCase();
  const combined = `${addr} ${name}`;

  // 1. Explicit Sikkim Districts from address / name
  if (combined.includes('north district') || combined.includes('north sikkim') || combined.includes('lachen') || combined.includes('lachung') || combined.includes('mangan') || combined.includes('yumthang') || combined.includes('chungthang')) {
    return 'North Sikkim';
  }
  if (combined.includes('south district') || combined.includes('south sikkim') || combined.includes('namchi') || combined.includes('ravangla') || combined.includes('borong') || combined.includes('jorethang')) {
    return 'South Sikkim';
  }
  if (combined.includes('west district') || combined.includes('west sikkim') || combined.includes('pelling') || combined.includes('gyalshing') || combined.includes('yuksom') || combined.includes('rinchenpong') || combined.includes('dentam')) {
    return 'West Sikkim';
  }
  if (combined.includes('east district') || combined.includes('east sikkim') || combined.includes('gangtok') || combined.includes('pakyong') || combined.includes('rongli') || combined.includes('zuluk')) {
    return 'East Sikkim';
  }

  // 2. Explicit Bengal Hill Towns / Districts
  if (combined.includes('kalimpong') || combined.includes('lava') || combined.includes('rishyap') || combined.includes('pedong') || combined.includes('lolegaon') || combined.includes('sillery') || combined.includes('munsong') || combined.includes('jhandi') || combined.includes('algarah') || combined.includes('gorubathan')) {
    return 'Kalimpong';
  }
  if (combined.includes('darjeeling') || combined.includes('takdah') || combined.includes('tinchuley') || combined.includes('lamahatta') || combined.includes('lepchajagat') || combined.includes('chatakpur') || combined.includes('ghoom') || combined.includes('sonada') || combined.includes('bijanbari') || combined.includes('sukhiapokhri') || combined.includes('dawaipani')) {
    return 'Darjeeling';
  }
  if (combined.includes('kurseong') || combined.includes('mirik')) {
    return 'Kurseong & Mirik';
  }
  if (combined.includes('dooars') || combined.includes('jalpaiguri') || combined.includes('alipurduar') || combined.includes('lataguri') || combined.includes('murti') || combined.includes('jaldapara') || combined.includes('buxa')) {
    return 'Jalpaiguri / Dooars';
  }

  // 3. Fallback to Homestay ID Blocks
  if (id.startsWith('HY01') || id.startsWith('HS01') || id.startsWith('DAR-')) {
    return 'Darjeeling';
  }
  if (id.startsWith('HY02') || id.startsWith('HS02') || id.startsWith('KAL-')) {
    return 'Kalimpong';
  }
  if (id.startsWith('HY03') || id.startsWith('HS03') || id.startsWith('SKM-') || id.startsWith('GTK-') || id.startsWith('EAST-')) {
    return 'East Sikkim';
  }
  if (id.startsWith('HY04') || id.startsWith('HS04') || id.startsWith('WEST-') || id.startsWith('PEL-')) {
    return 'West Sikkim';
  }
  if (id.startsWith('HY05') || id.startsWith('HS05') || id.startsWith('SOUTH-') || id.startsWith('NAM-')) {
    return 'South Sikkim';
  }
  if (id.startsWith('HY06') || id.startsWith('HS06') || id.startsWith('NORTH-')) {
    return 'North Sikkim';
  }
  if (id.startsWith('HY07') || id.startsWith('HS07') || id.startsWith('KUR-') || id.startsWith('MRK-')) {
    return 'Kurseong & Mirik';
  }
  if (id.startsWith('HY08') || id.startsWith('HS08') || id.startsWith('DOO-') || id.startsWith('JAL-')) {
    return 'Jalpaiguri / Dooars';
  }

  return '';
}

// Store or retrieve original native browser fetch safely
let realNativeFetch: typeof fetch | undefined = undefined;

function getNativeBrowserFetch(): typeof fetch | undefined {
  if (typeof window === 'undefined') return undefined;
  const w = window as any;
  if (w.__hillyTrip_realNativeFetch && !(w.__hillyTrip_realNativeFetch as any).isHillyTrip) {
    return w.__hillyTrip_realNativeFetch;
  }
  if (realNativeFetch && !(realNativeFetch as any).isHillyTrip) {
    return realNativeFetch;
  }
  if (w._hillyTripRealNativeFetch && !(w._hillyTripRealNativeFetch as any).isHillyTrip) {
    realNativeFetch = w._hillyTripRealNativeFetch;
    return realNativeFetch;
  }
  if (w.originalFetch && !(w.originalFetch as any).isHillyTrip) {
    realNativeFetch = w.originalFetch;
    return realNativeFetch;
  }
  if (w.fetch && !(w.fetch as any).isHillyTrip) {
    realNativeFetch = w.fetch;
    w._hillyTripRealNativeFetch = w.fetch;
    return realNativeFetch;
  }
  try {
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.documentElement.appendChild(iframe);
    const iframeFetch = iframe.contentWindow?.fetch;
    document.documentElement.removeChild(iframe);
    if (iframeFetch && !(iframeFetch as any).isHillyTrip) {
      realNativeFetch = iframeFetch.bind(window);
      w._hillyTripRealNativeFetch = realNativeFetch;
      return realNativeFetch;
    }
  } catch (e) {
    // Sandbox / iframe restriction fallback
  }
  return undefined;
}

if (typeof window !== 'undefined') {
  const currentFetch = window.fetch;
  if (currentFetch && !(currentFetch as any).isHillyTrip) {
    (window as any)._hillyTripRealNativeFetch = currentFetch;
    if (!(window as any).originalFetch) {
      (window as any).originalFetch = currentFetch;
    }
    realNativeFetch = currentFetch;
  }
}

function getBackendUrl(urlString: string): string {
  // If running in external/deployed environment and VITE_BACKEND_URL is configured, route /api/ requests there
  try {
    const metaObj = typeof import.meta !== 'undefined' ? (import.meta as any) : null;
    const backendBase = metaObj?.env?.VITE_BACKEND_URL || '';
    if (backendBase && (urlString.startsWith('/api/') || urlString.startsWith('/api'))) {
      const cleanBase = backendBase.replace(/\/+$/, '');
      return `${cleanBase}${urlString}`;
    }
  } catch (e) {
    // Ignore environment resolution errors
  }
  return urlString;
}

export async function hillyTripFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const urlString = typeof input === 'string' ? input : (input instanceof URL ? input.toString() : (input as Request).url);
  const origFetch = getNativeBrowserFetch();

  // Automatically inject currently authenticated user email into back-office requests
  let modifiedInit = init;
  if (auth && auth.currentUser && auth.currentUser.email) {
    const customHeaders = {
      ...init?.headers,
      'x-admin-email': auth.currentUser.email
    } as any;
    modifiedInit = {
      ...init,
      headers: customHeaders
    };
  }

  // Handle requests directed to internal '/api/' endpoints
  if (urlString.startsWith('/api') || urlString.includes('/api/')) {
    const targetUrl = getBackendUrl(urlString);
    if (typeof origFetch === 'function' && origFetch !== hillyTripFetch) {
      let response: Response;
      try {
        response = await origFetch(targetUrl, modifiedInit);
      } catch (callErr) {
        response = await origFetch.call(window, targetUrl, modifiedInit);
      }

      // Safety wrapper for response.json to avoid unexpected token '<'
      const originalJson = response.json.bind(response);
      response.json = async () => {
        try {
          return await originalJson();
        } catch (jsonErr) {
          console.warn(`[HillyTrip Fetch] Failed parsing JSON from ${targetUrl}:`, jsonErr);
          throw jsonErr;
        }
      };

      return response;
    }
  }
  
  if (typeof origFetch === 'function' && origFetch !== hillyTripFetch) {
    try {
      return await origFetch(input, init);
    } catch (err) {
      return await origFetch.call(window, input, init);
    }
  }

  // Fallback to native window.fetch if available
  return fetch(input, init);
}

(hillyTripFetch as any).isHillyTrip = true;

// Intercept window.fetch securely and transparently if writable
if (typeof window !== 'undefined') {
  try {
    (window as any).fetch = hillyTripFetch;
  } catch (err) {
    try {
      Object.defineProperty(window, 'fetch', {
        value: hillyTripFetch,
        configurable: true,
        writable: true,
        enumerable: true
      });
    } catch (e2) {
      console.warn('[HillyTrip API Interceptor] defineProperty fetch failed:', e2);
    }
  }
}
