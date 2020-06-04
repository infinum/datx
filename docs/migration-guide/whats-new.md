---
id: whats-new
title: What's new
---

## JSON API getOne/getMany

`getOne` and `getMany` behave similarly to `fetch` and `fetchAll` (now deprecated) but make use of better caching strategies.
Caching options can be defined globally (config object), on the collection level and on the request level. The options contain a maxAge value in seconds and the caching strategy type. Available caching strategies are:

```typescript
export enum CachingStrategy {
  NETWORK_ONLY, // Ignore cache
  NETWORK_FIRST, // Fallback to cache only on network error
  STALE_WHILE_REVALIDATE, // Use cache and update it in background
  CACHE_ONLY, // Fail if nothing in cache
  CACHE_FIRST, // Use cache if available
  STALE_AND_UPDATE, // Use cache and update response once network is complete
}
```

## JSON API Collection caching

The collection has a new static `maxCacheAge` value that is the maximal age of the cache in seconds. The default value is `undefined` (fallback to the global value).
The collection `toJSON` will now also serialise and hydrate the cache that was linked to that collection.

## Polymorphic relationships

TODO

## Parsers & serializers

TODO

## Buckets

TODO
