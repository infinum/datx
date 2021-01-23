---
id: caching
title: Caching
---

The library can use multiple caching strategies in order to optimize your network communication. The caching works only for `GET` requests and it can be controlled by using the [`cache` operator](./operators).

Supported caching strategies are:

```typescript
enum CachingStrategy {
  NetworkOnly = 1, // Ignore cache
  NetworkFirst = 2, // Fallback to cache only on network error
  StaleWhileRevalidate = 3, // Use cache and update it in background
  CacheOnly = 4, // Fail if nothing in cache
  CacheFirst = 5, // Use cache if available
  StaleAndUpdate = 6, // Use cache and update response once network is complete
}
```

The default caching strategy in the browser is `CachingStrategy.CacheFirst` and on the server it's `CachingStrategy.NetworkOnly`.

Besides the caching strategy, you can also set the `maxAge` value, which is a number of seconds a response will be cached for. The default maxAge is `Infinity`.
