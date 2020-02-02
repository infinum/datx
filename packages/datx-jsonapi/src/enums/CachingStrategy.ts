// Based on service worker strategies https://developers.google.com/web/tools/workbox/modules/workbox-strategies

export enum CachingStrategy {
  NETWORK_ONLY = 1, // Ignore cache
  NETWORK_FIRST = 2, // Fallback to cache only on network error
  STALE_WHILE_REVALIDATE = 3, // Use cache and update it in background
  CACHE_ONLY = 4, // Fail if nothing in cache
  CACHE_FIRST = 5, // Use cache if available
  STALE_AND_UPDATE = 6, // Use cache and update response once network is complete
}
