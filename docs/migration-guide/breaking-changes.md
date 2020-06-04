---
id: breaking-changes
title: Breaking changes since v1
---

## `id` and `type` fields

In v1, `id` and `type` fields weren't consistent - in some cases `id` and `type` were used to define the model, but in some other cases they had to be defined separately. In v2, this will be consistent and it will need to be defined explicitly.

## Removed deprecated stuff

`CompatCollection`, `CompatModel`, `collection.find`, `collection.remove`, `setupModel`

## Stricter action support

In v1, some of the mutations have been automatically wrapped into actions. In v2 this is only done in some cases where multiple changes are being done (e.g. the `model.update()` method). This will be a breaking change if you're using the MobX strict mode

## Snapshot/patch format changes

The serialised format of the model is a bit different, more specifically the meta object inside of it. This is a breaking change if you depend on the snapshot structure or you want to reuse v1 snapshots in v2 (or vice versa).

## References to missing models

In v1, if a model had a reference to another model that is not in a collection, it would return the model id instead of the instance. In v2, such models will be skipped - this means that the reference value will always be either a model or an array of models.

## JSON API pagination

The pagination is now using methods instead of just plain property access: `await response.next` becomes `await response.next()`.

## Caching

`config.cache` is no longer a boolean, but a `CachingStrategy` enum instead. `true` maps to `CachingStrategy.CACHE_FIRST` and `false` maps to `CachingStrategy.NETWORK_ONLY`.

## JSON API Collection caching

The static `cache` property on the collection is no longer a boolean. It's a `CachingStrategy` enum instead, without any default value (the global fallback is used).

## Response data is `null` instead of `[]` when no data

In v1, empty data would fall back to `[]` during response parsing, which is not technically correct. In v2, the response data value will be the same as the API response.

## Endpoint function base URL

In v1, the return value of the endpoint function would be appended to the base url, which made some operations where a model has a different base url much harder.
In v2, this is not done (it's still done when there is no endpoint or when it's a string) - instead, the endpoint function receives a baseurl parameter, and you are responsible of prepending it to your endpoint url.

## JSON API IRequestOptions options changes

Rename `params` to `queryParams.custom`, separate `IRequestOptions` into three parts - `queryParams`, `networkConfig` and `cacheOptions`.
