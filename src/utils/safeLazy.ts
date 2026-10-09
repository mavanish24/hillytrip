import React, { ComponentType, lazy, LazyExoticComponent } from 'react';

/**
 * Safe lazy-loading wrapper with automatic retry & fallback mechanism for Vite chunks.
 * Prevents white-screen crashes on dynamic import errors or network hiccups.
 */
export function safeLazy<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T } | T | any>,
  FallbackComp?: ComponentType<any>
): LazyExoticComponent<T> {
  return lazy(async () => {
    try {
      const res = await retryImport(factory, 2, 600);

      let resolvedComponent: any = res;

      // Extract component from module namespace or wrapper object
      if (resolvedComponent && typeof resolvedComponent === 'object') {
        // Direct default or nested default unwrapping
        while (resolvedComponent && typeof resolvedComponent === 'object' && 'default' in resolvedComponent && resolvedComponent.default) {
          resolvedComponent = resolvedComponent.default;
        }

        // If not a valid component yet, search all named keys in object
        const isComp = (val: any) => typeof val === 'function' || (typeof val === 'object' && val !== null && '$$typeof' in val);
        if (!isComp(resolvedComponent)) {
          const keys = Object.keys(resolvedComponent);
          for (const k of keys) {
            const val = resolvedComponent[k];
            if (isComp(val)) {
              resolvedComponent = val;
              break;
            }
          }
        }
      }

      const isValidComponent = typeof resolvedComponent === 'function' ||
        (typeof resolvedComponent === 'object' && resolvedComponent !== null && '$$typeof' in resolvedComponent);

      if (!isValidComponent) {
        console.warn('[SafeLazy] Imported module did not contain a valid React component. Using safe fallback.');
        const SafeFallback: React.FC = (props) => FallbackComp ? React.createElement(FallbackComp, props) : null;
        return { default: SafeFallback as unknown as T };
      }

      return { default: resolvedComponent as T };
    } catch (error: any) {
      console.warn('[SafeLazy] Dynamic chunk import failed after retries, applying graceful fallback:', error?.message || error);

      // Safe non-crashing component fallback
      const SafeFallback: React.FC = (props) => FallbackComp ? React.createElement(FallbackComp, props) : null;
      return { default: SafeFallback as unknown as T };
    }
  });
}

async function retryImport<T>(
  factory: () => Promise<T>,
  retriesLeft: number = 2,
  interval: number = 600
): Promise<T> {
  try {
    return await factory();
  } catch (error) {
    if (retriesLeft <= 0) {
      throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
    return retryImport(factory, retriesLeft - 1, interval);
  }
}

export default safeLazy;
