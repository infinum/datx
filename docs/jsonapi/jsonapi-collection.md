---
id: jsonapi-collection
title: Collection
---

The JSON API Collection enhances the `datx` collection with the following properties and methods:

## defaultModel

```typescript
static defaultModel: typeof PureModel
```

A default model that will be used if no model is defined for a certain model type received from the server (default is `GenericModel` which is a combination of [JSON API Model](jsonapi-model) and [`PureModel`](../api-reference/pure-model)).

## sync

```typescript
sync<T extends IJsonapiModel = IJsonapiModel>(body?: IResponse): T|Array<T>|null;
```

Add the data from a JSON API response to the store. The return value is a model or an array of models from the JSON API `data` property.

## getOne

```typescript
getOne<T extends IJsonapiModel = IJsonapiModel>(type: IType | IModelConstructor<T>, id: string, options?: IRequestOptions): Promise<Response<T>>
```

Get a single model from the server.

The options can be used to send additional parameters to the server.

If an error happens, the function will reject with the [`Response`](jsonapi-response) object with the `error` property set.

## getMany

```typescript
getMany<T extends IJsonapiModel = IJsonapiModel>(type: IType | IModelConstructor<T>, options?: IRequestOptions)
```

Fetch multiple models of the given type from the server. This will either be all models or a first page of models, depending on the server configuration.

The options can be used to send additional parameters to the server.

If an error happens, the function will reject with the [`Response`](jsonapi-response) object with the `error` property set.

## getAll

```typescript
getAll<T extends IJsonapiModel = IJsonapiModel>(type: IType | IModelConstructor<T>, options?: IRequestOptions): Promise<IGetAllResponse<T>>
```

Fetch all records of the given type from the server.

Unlike other collection methods that return a `Response` instance, `getAll` returns an object that contains:

- data: array of all models
- responses: array of all responses that came from the server
- lastResponse: `Response` instance for easy acces to all `Response` properties

See [`IGetAllResponse`](jsonapi-typescript-interfaces#igetallresponse) interface for detailed info.

The options can be used to send additional parameters to the server.

If an error happens, the function will reject with the [`Response`](jsonapi-response) object with the `error` property set.


## request

```typescript
request<T extends IJsonapiModel = IJsonapiModel>(url: string, method?: string, data?: object, options?: IRequestOptions): Promise<Response<T>>
```

Make a custom API request to the server. The response will still be parsed in the same way it would be in `getOne` or `getMany`.

## removeOne

```typescript
removeOne(type: IType|typeof PureModel, id?: IIdentifier, remote?: boolean|IRequestOptions): Promise<void>;
removeOne(model: PureModel, remote?: boolean|IRequestOptions): Promise<void>;
```

The [`removeOne`](../api-reference/collection#removeOne) method equal to the one in the `datx` collection, but with an additional optional `remote` property. If set, the model will also be removed from the server.

## removeAll and reset

The `removeAll` and `reset` methods are equal to the `datx` collection methods, but will also clear the network cache.
