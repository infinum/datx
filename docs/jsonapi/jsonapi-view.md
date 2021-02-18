---
id: jsonapi-view
title: View
---

The JSON API View enhances the `datx` view with the following properties and methods:

## sync

```typescript
sync<T extends IJsonapiModel = IJsonapiModel>(body?: IResponse): T|Array<T>|null;
```

Add the data from a JSON API response to the view. The return value is a model or an array of models from the JSON API `data` property.

## getOne

```typescript
getOne<T extends IJsonapiModel = IJsonapiModel>(id: number|string, options?: IRequestOptions): Promise<Response<T>>;
```

Fetch a single model from the server.

The options can be used to send additional parameters to the server.

If an error happens, the function will reject with the [`Response`](jsonapi-response) object with the `error` property set.

## getMany

```typescript
getMany<T extends IJsonapiModel = IJsonapiModel>(options?: IRequestOptions): Promise<Response<T>>
```

Fetch multiple models of the view type from the server. This will either be all models or a first page of models, depending on the server configuration. When requesting other pages with the response getters, they will also be added to the view automatically.

The options can be used to send additional parameters to the server.

If an error happens, the function will reject with the [`Response`](jsonapi-response) object with the `error` property set.

## getAll

```typescript
getAll<T extends IJsonapiModel = IjsonapiModel>(type: IType | IModelConstructor<T>, options?: IRequestOptions): Promise<IGetAllResponse<T>>
```

Fetches all records of the given type from the server and saves it into the view.

Unlike other view methods that return a `Response` instance, `getAll` returns an object that contains:

- data: array of all models
- responses: array of all responses that came from the server
- lastResponse: `Response` instance for easy acces to all `Response` properties

See [`IGetAllResponse`](jsonapi-typescript-interfaces#igetallresponse) interface for detailed info.

The options can be used to send additional parameters to the server.

If an error happens, the function will reject with the [`Response`](jsonapi-response) object with the `error` property set.