---
id: jsonapi-typescript-interfaces
title: Typescript interfaces TODO
---

## IJsonapiCollection

Interface used to represent a `datx` collection enhanced with the `datx-jsonapi` mixin.

## IJsonapiModel

Interface used to represent a `datx` model enhanced with the `datx-jsonapi` mixin.

## ICollectionFetchOptions

Options received by the [`transformRequest`](jsonapi-config#transformrequest) method

```typescript
interface ICollectionFetchOpts {
  url: string;
  options?: IRequestOptions & { headers?: IHeaders };
  data?: object;
  method: string;
  collection?: IJsonapiCollection;
  skipCache?: boolean;
  views?: Array<View>;
}
```

## IRawResponse

Options received by the [`transformResponse`](JSONAPI-Config#transformresponse) method:

```typescript
interface IRawResponse {
  data?: IResponse;
  error?: Error;
  headers?: IResponseHeaders;
  requestHeaders?: IHeaders;
  status?: number;
  jsonapi?: IJsonApiObject;
  collection?: Collection;
}
```

## IRequestOptions

Interface defining the network request options (all optional):

- `skipCache: boolean;` - Ignore the network cache
- `headers` - Request headers object
- JSON API params (Note: support depends on the server implementation)
  - `include: string|Array<string>` - Models that should be included in the response
  - `sort: string|Array<string>` - Sorting rules for the server
  - `fields: IDictionary<string|Array<string>>` - Fields that should be returned in the response
  - `filter: IFilters` - A dictionary of the filters that should be used on the server
- `params` - Raw params sent to the server (if not covered by the JSON API options)
