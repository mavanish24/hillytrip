// HillyTrip Google Analytics 4 (GA4) Utility Helper File
// Tracks pageviews and custom analytics events across React + Vite SPA components.

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

const MEASUREMENT_ID = 'G-ZHSYK7CNHE';
let isGAInitialized = false;

/**
 * Initializes Google Analytics 4 globally.
 * Dynamically injects the Gtag script and runs the initial setup.
 * send_page_view is configured to false to prevent duplicate pageviews (we track pageviews manually on route changes).
 */
export function initGA(): void {
  if (isGAInitialized || typeof window === 'undefined') {
    return;
  }

  // Only inject external Google Analytics scripts on the real production domain.
  // This completely eliminates cross-origin "Script error." occurrences in
  // sandboxes, automated test containers, preview domains, or local hosts.
  const isProdHost = window.location.hostname === 'hillytrip.com' || window.location.hostname === 'www.hillytrip.com';
  const isIframe = window.self !== window.top;

  if (isIframe || !isProdHost) {
    console.log('[HillyTrip Analytics] Sandbox, Testing, or Local Development mode detected. Emulating Google Analytics without injecting external scripts.');
    
    // Polyfill window.dataLayer and window.gtag so routing trackPageView works without crashes
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer?.push(arguments);
    };
    
    isGAInitialized = true;
    
    // Track the initial pageview manually using the polyfill
    const initialPath = window.location.pathname + window.location.hash;
    trackPageView(initialPath);
    return;
  }

  try {
    // 1. Inject gtag.js script dynamically
    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.onerror = (e) => {
      console.warn('[HillyTrip Analytics Warning] Google Analytics script loading was blocked or failed.', e);
    };
    script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
    document.head.appendChild(script);

    // 2. Initialize dataLayer and gtag function
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer?.push(arguments);
    };

    // 3. Configure baseline GA options
    window.gtag('js', new Date());
    
    // Disable automatic page_view measurement to avoid duplications in SPA routing
    window.gtag('config', MEASUREMENT_ID, {
      send_page_view: false,
      cookie_flags: 'SameSite=None;Secure'
    });

    isGAInitialized = true;
    console.log(`[HillyTrip Analytics] GA4 initialized successfully with Measurement ID: ${MEASUREMENT_ID}`);

    // Track the initial pageview manually
    const initialPath = window.location.pathname + window.location.hash;
    trackPageView(initialPath);
  } catch (error) {
    console.error('[HillyTrip Analytics] Failed to initialize Google Analytics:', error);
  }
}

/**
 * Tracks standard page_view event manually on routing/hash shifts.
 * Ensures compatibility with React + Vite SPA routing.
 */
export function trackPageView(path: string): void {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  // Fallback if path is empty
  const cleanPath = path || '/';
  
  window.gtag('event', 'page_view', {
    page_path: cleanPath,
    page_title: document.title || 'HillyTrip',
    page_location: window.location.href,
    send_to: MEASUREMENT_ID
  });
  
  console.log(`[HillyTrip Analytics] Pageview tracked: ${cleanPath} - "${document.title}"`);
}

/**
 * General purpose lightweight event tracker helper.
 */
export function trackEvent(eventName: string, params?: Record<string, any>): void {
  if (typeof window === 'undefined' || !window.gtag) {
    return;
  }

  window.gtag('event', eventName, {
    ...params,
    send_to: MEASUREMENT_ID
  });

  console.log(`[HillyTrip Analytics] Event tracked "${eventName}":`, params);
}

/**
 * Custom Event: route_search
 * Tracks when a user searches for a route.
 */
export function trackRouteSearch(fromHub: string, toHub: string, additionalParams?: Record<string, any>): void {
  trackEvent('route_search', {
    from_hub: fromHub,
    to_hub: toHub,
    search_query: `${fromHub}_to_${toHub}`,
    ...additionalParams
  });
}

/**
 * Custom Event: destination_view
 * Tracks when a user views a specific destination detail.
 */
export function trackDestinationView(destinationId: string, destinationName: string, additionalParams?: Record<string, any>): void {
  trackEvent('destination_view', {
    destination_id: destinationId,
    destination_name: destinationName,
    ...additionalParams
  });
}

/**
 * Custom Event: attraction_view
 * Tracks when a user views a specific attraction detail.
 */
export function trackAttractionView(attractionId: string, attractionName: string, category?: string, additionalParams?: Record<string, any>): void {
  trackEvent('attraction_view', {
    attraction_id: attractionId,
    attraction_name: attractionName,
    attraction_category: category || 'Sightseeing Spot',
    ...additionalParams
  });
}

/**
 * Custom Event: route_result_view
 * Tracks when results of a route search are displayed.
 */
export function trackRouteResultView(fromHub: string, toHub: string, resultCount: number, additionalParams?: Record<string, any>): void {
  trackEvent('route_result_view', {
    from_hub: fromHub,
    to_hub: toHub,
    result_count: resultCount,
    search_query: `${fromHub}_to_${toHub}`,
    ...additionalParams
  });
}

/**
 * Custom Event: navigate_google_maps
 * Tracks when a user triggers outer navigation redirection to Google Maps.
 */
export function trackNavigateGoogleMaps(targetName: string, lat?: number, lng?: number, additionalParams?: Record<string, any>): void {
  trackEvent('navigate_google_maps', {
    target_name: targetName,
    latitude: lat || null,
    longitude: lng || null,
    ...additionalParams
  });
}

/**
 * Custom Event: save_destination
 * Tracks when a user saves a destination or attraction to their collection.
 */
export function trackSaveDestination(id: string, name: string, type: string = 'destination', additionalParams?: Record<string, any>): void {
  trackEvent('save_destination', {
    item_id: id,
    item_name: name,
    item_type: type,
    ...additionalParams
  });
}

/**
 * Custom Event: like_destination
 * Tracks when a user likes/unlikes a destination or attraction.
 */
export function trackLikeDestination(id: string, name: string, liked: boolean, type: string = 'destination', additionalParams?: Record<string, any>): void {
  trackEvent('like_destination', {
    item_id: id,
    item_name: name,
    item_type: type,
    liked_state: liked ? 'liked' : 'unliked',
    ...additionalParams
  });
}
