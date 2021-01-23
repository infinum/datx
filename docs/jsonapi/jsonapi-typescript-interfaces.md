---
id: jsonapi-typescript-interfaces
title: Typescript interfaces
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

```typescript
interface IRequestOptions {
  queryParams?: {
    // JSON API params (Note: support depends on the server implementation)
    include?: string | Array<string>; // Models that should be included in the response
    filter?: IFilters; // A dictionary of the filters that should be used on the server
    sort?: string | Array<string>; // Sorting rules for the server
    fields?: Record<string, string | Array<string>>; // Fields that should be returned in the response
    custom?: Array<{ key: string; value: string } | string>; // Any custom params you want to pass
  };
  cacheOptions?: {
    cachingStrategy?: CachingStrategy;
    maxAge?: number; // in seconds
    skipCache?: boolean; // Ignore the network cache (deprecated)
  };
  networkConfig?: {
    headers?: IHeaders; // Request headers object
  };
}
```
