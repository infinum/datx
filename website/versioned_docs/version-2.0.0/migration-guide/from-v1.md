---
id: version-2.0.0-from-v1
title: Migration from v1
original_id: from-v1
---

## Short term migration

In order to migrate from v1, those are the minimal changes. If you're using TypeScript, it should report errors in most of those cases.

### Update package names and imports

The packages are now scoped:

- `datx-utils` => `@datx/utils`
- `datx` => `@datx/core`
- `datx-jsonapi` => `@datx/jsonapi`

### `CompatCollection` and `CompatModel`

You'll first need to migrate to v1 Collection and model by following the [v1 migration guide](https://datx.dev/docs/migration-guide/mobx-collection-store).

### `collection.find`

If you're using the find method with a function, you don't need to do anything - this is still supported.

If you're using find with the type and id arguments, you should change to `collection.findOne`. Keep in mind that the behavior is slightly different. If a model with the given id was not found, `find` would return the first model of the type, while `findOne` will not return any model.

### `collection.remove`

If you're using remove, you should change to `collection.removeOne`. Keep in mind that the behavior is slightly different. If a model with the given id was not found, `remove` would remove the first model of the type, while `removeOne` will not remove any model.

### `setupModel`

You should migrate to using the `Attribute` decorator/function. The [defining models](../getting-started/defining-models) page describes how to do this in both cases - if you have decorators or if you don't.

### `id` and `type` fields

If you notice inconsistent behavior since v1, this probably means you're affected by a bug in v1. The most likely fix would be to set the id and type fields explicitely.

### Stricter action support

In v2, DatX is removing some internal MobX actions. This means that MobX might throw some errors because of that. To fix, mark your code that updates the data as action.

### Reference changes related to the polymorphic relationship changes

In order to support polymorphic relationships, internal references (e.g. `model.meta.refs`) were changed from `IIdentifier` (`string` or `number`) to `IModelRef` (`{ id: IIdentifier; type: IType }`).

### References to missing models

The references in v2 will always be an instance of the model (in v1, they also could have been an `IIdentifier`). This makes the code simpler, but means that the results will differ if you don't have all reference instances. If you need exact number of references or something similar, you can get it by using `model.meta.refs[fieldName]`. Depending on the reference type, this will be either `IModelRef` or `Array<IModelRef>`.

### JSON API IRequestOptions changes

The following changes should be made:

- `options.headers` to `options.networkConfig.header`
- `options.include` to `options.queryParams.include`
- `options.filter` to `options.queryParams.filter`
- `options.sort` to `options.queryParams.sort`
- `options.fields` to `options.queryParams.fields`
- `options.params` to `options.queryParams.custom`
- `options.skipCache` to `options.cacheOptions.cachingStrategy`
  - If the value was `true`, the new value should be `CachingStrategy.CACHE_FIRST`
  - If the walue was `false`, the new value should be `CachingStrategy.NETWORK_ONLY`

### JSON API Caching

`config.cache` is no longer a boolean, but a `CachingStrategy` enum instead. `true` maps to `CachingStrategy.CACHE_FIRST` and `false` maps to `CachingStrategy.NETWORK_ONLY`.

### JSON API Collection caching

The static `cache` property on the collection is no longer a boolean. It's a `CachingStrategy` enum instead, without any default value (the global fallback is used).

### JSON API Endpoint function base URL

If you're using the endpoint _function_ in your models, the function is no longer automatically adding the baseUrl to your endpoint. Instead, the function is getting a single argument, `baseUrl`, and you're responsible for adding the base to your url:

`static endpoint = () => '/url'` to `static endpoint = (baseUrl: string) => baseUrl + '/url'`.

### JSON API Pagination

The pagination is now using methods instead of just plain property access: `await response.next` becomes `await response.next()`.

### JSON API Response data is null instead of [] when no data

In v1, empty data would fall back to `[]` during response parsing, which is not technically correct. In v2, the response data value will be the same as the API response.

## Long term migration

In order to make use of all the v2 features and make your app future proof, you should do the following changes:

### Removing deprecation warnings

#### `fetch/fetchAll`

To make naming more consistent, the deprecated functions should be replaced with `getOne` and `getMany`. The behavior is the same, but the new methods support more caching strategies.

#### `prop`

The `prop` decorator was replaced with `Attribute` that supports some new features like polymorphic relationship, prop mapping, parsing & serializing, etc.

The changes are:

- `@prop` to `@Attribute()`
- `@prop.identifier` to `@Attribute({ isIdentifier: true })`
- `@prop.type` to `@Attribute({ isType: true })`
- `@prop.defaultValue(val)` to `@Attribute({ defaultValue: val })`
- `@prop.toOne(RefModel)` to `@Attribute({ toOne: RefModel })`
- `@prop.toOneOrMany(RefModel)` to `@Attribute({ toOneOrMany: RefModel })`
- `@prop.toMany(RefModel)` to `@Attribute({ toMany: RefModel })`
- `@prop.toMany(RefModel, 'backProp')` to `@Attribute({ toMany: RefModel, referenceProperty: 'backProp' })`

### Caching enhancements

Caching strategies can be set globally (`config.cache`), per collection (static `cache`) or per request (`IRequestOptions`). The supported strategies are:

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

You can also use `maxCacheAge` (in seconds) in all three places.

### New features

Besides the changes mentioned here, there are a few completely new features [you should check out](./whats-new).
