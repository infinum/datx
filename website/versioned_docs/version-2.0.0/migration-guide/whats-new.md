---
id: version-2.0.0-whats-new
title: What's new
original_id: whats-new
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

DatX v1 had a limitation where a relationship on the model could only hold references to one model type. This limitation was removed in v2. When you define the reference by [using the `@Attribute` decorator](../attribute#polymorphic-relationships), you can either define the default type (another one will be used if another model type instance is passed) or you can define a function.

## Parsers & serializers

Sometimes, you'll need to map your data in a way that might not be compatible with your API (or maybe for some other reason specific to your use case). This could range from renaming properties to converting them to other types (e.g. from a date string to a date object). This is where [parsers and serializers](../attribute) can be used. The functions are passed as options to the `@Attribute` decorator.

## Buckets

[Buckets](../bucket) are a new concept for storing model references. They were created to be used internally, but they are also exposed to the developers.
