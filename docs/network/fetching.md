---
id: fetching
title: Fetching
---

# Fetching data

Once you have your base request ready (defined url, models, interceptors, etc.) you can call the `fetch` method. This method can receive four optional arguments:

```ts
fetch(
  params?: TParams | null,
  queryParams?: Record<string, string | Array<string> | object> | null,
  body?: any,
  bodyType?: BodyType,
): Promise<Response<TModel>>;
```

- `params` - An object containing all variables we want to use in the process of building the request URL
- `queryParams` - The values we want to add as query params to the request URL
- `body` - The value that will be sent as a request body - only available in some request methods (e.g. `POST` or `PUT`)
- `bodyType` - The type of the body payload. This will be automatically determined based on the body value, but it can be overridden here.
