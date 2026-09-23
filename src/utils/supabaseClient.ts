let supabaseInstance: any = null;

export async function getSupabase() {
  if (supabaseInstance) return supabaseInstance;

  try {
    const { createClient } = await import('@supabase/supabase-js');

    // 1. Try environment variables
    // @ts-ignore
    const url = import.meta.env?.VITE_SUPABASE_URL || '';
    // @ts-ignore
    const anonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

    // Check if we are running in a static web environment (like Netlify)
    const hostname = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname : '';
    const isNetlifyOrStatic = Boolean(hostname && 
      (hostname.endsWith('netlify.app') || 
       hostname.includes('static') ||
       (!hostname.includes('localhost') && !hostname.endsWith('run.app'))));

    const getSafeStorage = () => {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          const test = '__sb_test__';
          window.localStorage.setItem(test, test);
          window.localStorage.removeItem(test);
          return window.localStorage;
        }
      } catch (e) {}
      return undefined;
    };

    if (url && anonKey && !url.includes('your-project-id')) {
      console.log('[Supabase Client] Successfully initialized Supabase using VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: getSafeStorage(),
        },
      });
      return supabaseInstance;
    }

    if (isNetlifyOrStatic) {
      console.error(
        '%c[Supabase Client Error] Supabase environment variables are MISSING or INVALID in production!\n\n' +
        'To fix this in your Netlify deployment:\n' +
        '1. Go to your Netlify Dashboard for this site.\n' +
        '2. Navigate to Site Configuration > Environment variables.\n' +
        '3. Add the following variables (exactly as shown, with the VITE_ prefix):\n' +
        '   - VITE_SUPABASE_URL\n' +
        '   - VITE_SUPABASE_ANON_KEY\n' +
        '4. Trigger a new deployment (Clear cache and redeploy site).\n\n' +
        'Current values checked:\n' +
        `- VITE_SUPABASE_URL: ${url ? 'Found (masked)' : 'MISSING'}\n` +
        `- VITE_SUPABASE_ANON_KEY: ${anonKey ? 'Found (masked)' : 'MISSING'}`,
        'color: #ef4444; font-weight: bold; font-size: 14px;'
      );
    } else {
      console.warn(
        '[Supabase Client Warning] Direct VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are not available. ' +
        'Attempting fallback to server /api/config endpoint...'
      );
    }

    // 2. Fallback: Fetch from the Express /api/config endpoint
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const config = await res.json();
        if (config.supabaseUrl && config.supabaseAnonKey) {
          console.log('[Supabase Client] Initialized Supabase via fallback /api/config.');
          supabaseInstance = createClient(config.supabaseUrl, config.supabaseAnonKey, {
            auth: {
              persistSession: true,
              autoRefreshToken: true,
              detectSessionInUrl: true,
              storage: getSafeStorage(),
            },
          });
          return supabaseInstance;
        }
      }
    } catch (e) {
      console.error('[Supabase Client] Failed to fetch /api/config fallback:', e);
    }

    // 3. Fallback placeholder so other calls do not throw undefined errors immediately
    if (!supabaseInstance) {
      console.warn('[Supabase Client] Using dummy placeholder Supabase instance as final fallback.');
      const dummyUrl = 'https://placeholder-project-id.supabase.co';
      const dummyKey = 'placeholder-key';
      supabaseInstance = createClient(dummyUrl, dummyKey);
    }

    return supabaseInstance;
  } catch (err) {
    console.error('[Supabase Client] Failed to load @supabase/supabase-js dynamic module:', err);
    return null;
  }
}
