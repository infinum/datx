// Based on service worker strategies https://developers.google.com/web/tools/workbox/modules/workbox-strategies

export enum CachingStrategy {
  NetworkOnly = 1, // Ignore cache
  NetworkFirst = 2, // Fallback to cache only on network error
  StaleWhileRevalidate = 3, // Use cache and update it in background
  CacheOnly = 4, // Fail if nothing in cache
  CacheFirst = 5, // Use cache if available
  StaleAndUpdate = 6, // Use cache and update response once network is complete
}
