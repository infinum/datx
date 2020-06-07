---
id: jsonapi-response
title: Response TODO
---

## constructor

```typescript
constructor(response: IRawResponse, collection?: IJsonapiCollection, options?: IRequestOptions, overrideData?: IJsonapiModel |Array<IJsonapiModel >)
```

Creates a new `Response` object instance. It needs to receive at lest the [raw response](typescript-interfaces#irawresponse).

## replaceData

```typescript
replaceData(data: IJsonapiModel): Response
```

Replace the response model with a different model. Used to replace a model while keeping the same reference. Mostly for internal use.

## data

An model or an array of model received from the API

## error

An error object received from the API

## jsonapi

The JSON API version received from the API

## meta

Metadata received in the API response (not including the model or relationship meta data)

## links

Links received in the API response. The link promises are exposed as methods of the `Response` object. The promise will resolve to a different `Response` object.

## headers

A [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers) object returned from the API

## requestHeaders

A key/value object with custom headers sent to the server in the API call

## status

HTTP response status
