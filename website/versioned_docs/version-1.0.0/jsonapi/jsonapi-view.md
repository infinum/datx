---
id: version-1.0.0-jsonapi-view
title: View
original_id: jsonapi-view
---

The JSON API View enhances the `datx` view with the following properties and methods:

## sync

```typescript
sync<T extends IJsonapiModel = IJsonapiModel>(body?: IResponse): T|Array<T>|null;
```

Add the data from a JSON API response to the view. The return value is a model or an array of models from the JSON API `data` property.

## fetch

```typescript
fetch<T extends IJsonapiModel = IJsonapiModel>(id: number|string, options?: IRequestOptions): Promise<Response<T>>;
```

Fetch a single model from the server.

The options can be used to send additional parameters to the server.

If an error happens, the function will reject with the [`Response`](jsonapi-response) object with the `error` property set.

## fetchAll

```typescript
fetchAll<T extends IJsonapiModel = IJsonapiModel>(options?: IRequestOptions): Promise<Response<T>>
```

Fetch multiple models of the view type from the server. This will either be all models or a first page of models, depending on the server configuration. When requesting other pages with the response getters, they will also be added to the view automatically.

The options can be used to send additional parameters to the server.

If an error happens, the function will reject with the [`Response`](jsonapi-response) object with the `error` property set.
