---
id: version-2.0.0-jsonapi-config
title: Config
original_id: jsonapi-config
---

The library is exposing a config for some networking related options:

## baseUrl

The base URL used for the networking. By default, this is `"/"`, but can be changed to something like `"https://example.com/api/"`

```javascript
import { config } from '@datx/jsonapi';

config.baseUrl = 'https://example.com/api/';

// Ready for some API calls
```

## fetchReference

If you want to use the [fetch API](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch), but need to use a different implementation, like [`isomorphic-fetch`](https://www.npmjs.com/package/isomorphic-fetch), you can set the new reference here.

```javascript
import { config } from '@datx/jsonapi';
import fetch from 'isomorphic-fetch';

config.fetchReference = fetch;

// Ready for some API calls
```

## defaultFetchOptions

If needed, you can define default options that are passed to the fetch method. Keep in mind that the body and method properties will be overridden.

```javascript
import { config } from '@datx/jsonapi';

config.defaultFetchOptions = {
  credentials: 'same-origin',
  headers: {
    // My custom headers
  },
};

// Ready for some API calls
```

## encodeQueryString

URL query string isn't encoded by default, so you have to manually encode query params which may contain URL-unsafe characters (for example, user input), to ensure the URL is valid. This option enables encoding of all params handled by the lib.

```javascript
import { config } from '@datx/jsonapi';

config.encodeQueryString = true;
```

## paramArrayType

Some JSON API param formats are not strictly specified (like [filter](http://jsonapi.org/recommendations/#filtering)), while others might not always be implemented according to the spec. To work around this, the lib exposes the `paramArrayType` property in the config. It can be one of the four values exposed in the `ParamArrayType` enum:

- `COMMA_SEPARATED` (default value) - filter[a]=1,2
- `MULTIPLE_PARAMS` - filter[a]=1&filter[a]=2
- `PARAM_ARRAY` - filter[a][]=1&filter[a][]=2
- `OBJECT_PATH` - filter[a.0]=1&filter[a.1]=2

## baseFetch

If you want to use something other than the fetch API (e.g. jQuery, superagent, axios or anything else), you'll need to override the `baseFetch` method.

```typescript
baseFetch(
  method: string,
  url: string,
  body?: object,
  requestHeaders?: IHeaders,
): Promise<IRawResponse>
```

The function will receive a request method, request url, a body object and request headers (key/value object), and it needs to return a promise that resolves to [a raw response object](Interfaces#irawresponse) - a JSON API valid response with some additional properties:

- `status` - HTTP status
- `requestHeaders` - the same object that was received by the function
- `headers` - A [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers) object received from the server

Depending on your `baseFetch` implementation, you might not need the `baseUrl`, `fetchReference` and `defaultHeaders` properties since they're consumed by the default `baseFetch` implementation.

## transformRequest

```typescript
transformRequest(options: ICollectionFetchOptions): ICollectionFetchOptions
```

Can be used to modify the request before it's made. It is receiving a [ICollectionFetchOptions](typescript-interfaces#icollectionfetchopts) object, and it should also return an object with the same interface.

Note: It is recommended not to modify the existing object but instead create a copy.

## transformResponse

```typescript
transformResponse(response: IRawResponse): IRawResponse
```

Can be used to modify the response before it's parsed. It is receiving a [IRawResponse](../api-reference/typescript-interfaces#irawresponse) object, and it should also return an object with the same interface.

Note: It is recommended not to modify the existing object but instead create a copy.

## onError

```typescript
onError(IResponseObject): IResponseObject;
```

Can be used to modify the response on error. By default it will just pass the regular response.

## Caching

```typescript
cache: CachingStrategy;
maxCacheAge: number; // seconds
```

Options for caching of requests. This can be overridden on a collection or request level. The default caching strategy is `NetworkOnly` (no caching).

## usePatchWhenPossible

```typescript
usePatchWhenPossible: boolean;
```

Defaults to `true`. If set to `false`, the library will always use `PUT` for updates. This is useful if your API doesn't support `PATCH` requests. (available since 2.4.5)
