---
id: mobx-jsonapi-store
title: Mobx jsonapi store
---

**Since mobx-jsonapi-store is relying on mobx-collection-store, you also need to apply the [mobx-collection-store migration](mobx-collection-store).**

# Model and Collection definition

Model and Collection definition examples use [`Model`](../api-reference/model) and [`Collection`](../api-reference/collection), but it would work the same way for [`CompatModel`](compat-model), [`PureModel`](../api-reference/pure-model), or [`CompatCollection`](compat-collection).

## Code diff

```diff
-- import { Store, Record } from 'mobx-jsonapi-store';
++ import { Collection, Model } from 'datx';
++ import { jsonapi } from 'datx-jsonapi';

// Collection definition
-- class AppStore extends Store { /* ... */ }
++ class AppStore extends jsonapi(Collection) { /* ... */ }

// Model definition
-- class Person extends Record { /* ... */ }
++ class Person extends jsonapi(Model) { /* ... */ }
```

## Store changes

Same:

- `sync` - Stays the same
- `destroy` - Stays the same

Changes:

- `fetch` - Second argument (`force`) moved to the options object as the `skipCache` property
- `fetchAll` - Second argument (`force`) moved to the options object as the `skipCache` property
- `request` - Stays the same, but will be cached if it's a 'GET' method, unless `skipCache` is set to `true`

## Record changes

Same:

- `save` - Stays the same

Changed:

- `getMeta` - Use [`getModelMeta`](jsonapi-utils#getmodelmeta)
- `getLinks` - Use [`getModelLinks`](jsonapi-utils#getmodellinks)
- `fetchLink` - Use [`fetchModelLink`](jsonapi-utils#fetchmodellink)
- `getRelationshipLinks` - Use [`getModelRefLinks`](jsonapi-utils#getmodelreflinks)
- `fetchRelationshipLink` - Use [`fetchModelRefLink`](jsonapi-utils#fetchmodelreflink)
- `toJsonApi` - Use [`modelToJsonApi`](jsonapi-utils#modeltojsonapi)
- `saveRelationship` - Use [`saveRelationship`](jsonapi-utils#saverelationship)
- `remove` - Renamed to [`destroy`](jsonapi-model)
- `setPersisted` - Removed

## Config changes

Same:

- `baseUrl` - Stays the same
- `fetchReference` - Stays the same
- `defaultFetchOptions` - Stays the same
- `paramArrayType` - Stays the same
- `baseFetch` - Stays the same
- `transformRequest` - Stays the same
- `transformResponse` - Stays the same

Changed:

- `defaultHeaders` - Removed in favour of `defaultFetchOptions`
- `storeFetch` - Removed in favour of `transformRequest` and `transformResponse`
