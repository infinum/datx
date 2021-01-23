---
id: version-2.0.0-response
title: Response
original_id: response
---

## constructor

```typescript
constructor(response: IResponseObject, collection?: PureCollection, options?: IRequestOptions, overrideData?: PureModel |Array<PureModel>)
```

Creates a new `Response` object instance. It needs to receive at lest the [response object](typescript-interfaces#iresponseobject).

## replaceData

```typescript
replaceData(data: PureModel): Response
```

Replace the response model with a different model. Used to replace a model while keeping the same reference. Mostly for internal use.

## data

An model or an array of models received from the API

## error

An error object received from the API

## headers

A [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Headers) object returned from the API

## requestHeaders

A key/value object with custom headers sent to the server in the API call

## status

HTTP response status
