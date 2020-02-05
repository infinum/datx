---
id: typescript-interfaces
title: Typescript interfaces
---

## IRawModel

A serialized model interface. It's a regular dictionary with an additional `__META__` property for internal library needs.

## ICollectionConstructor

Interface for the [`Collection`](collection) constructor.

## IIdentifier

Interface for the model ID.

## IModelConstructor

Interface for the [`PureModel`](pure-model) constructor.

## IType

Interface for the model type.

## IActionsMixin

Interface for the [`withActions`](withActions) mixin.

## IMetaMixin

Interface for the [`withMeta`](withMeta) mixin.

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
