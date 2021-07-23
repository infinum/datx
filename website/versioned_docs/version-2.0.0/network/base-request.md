---
id: version-2.0.0-base-request
title: BaseRequest
original_id: base-request
---

BaseRequest is the main class to create a new request pipeline.

# constructor

```typescript
constructor(baseUrl: string): BaseRequest;
```

The constructor has one mandatory argument and that's the base url.

# pipe

```typescript
pipe<
  TNewModel extends PureModel | Array<PureModel> = TModel,
  TNewParams extends object = TParams
>(...operators: Array<IPipeOperator>): BaseRequest<TNewModel, TNewParams>;
```

The pipe method is used to configure the requests. It will always create a clone of the current base request and modify the clone.
To see what's possible to configure, check out the [operators](./operators) page.
This method can receive two types in the generic. The first one is the expected return type of the `fetch` method. This can be either a model type or an array of models. The second type is a `Record` defining which params are expected in the fetch method - this should match the `setUrl` placeholders that weren't defined in the `params` operator.

# clone

```typescript
clone<TNewModel extends PureModel = TModel, TNewParams extends object = TParams>(
  BaseRequestConstructor?: typeof BaseRequest,
): BaseRequest<TNewModel, TNewParams>;
```

This method clones the current BaseRequest class instance. Since it's possible to use custom BaseRequest classes that extend the original one, the clone method will make sure the correct class is used. If needed, you can also pass a different BaseClass implementation.

# fetch

```typescript
fetch(params?: TParams): Promise<Response<TModel>>;
```

The fetch method will make the API request and either return a [`Response`](./response) with the `data` property if successful or throw a `Response` with an `error` property.

# useHook

```typescript
useHook(
  params?: TParams,
  options?: { suspense: boolean },
): [Response<TModel> | null, boolean, string | Error | null];
```

This method is a React hook. It can receive two arguments - the first one is the params object, and the second one is a hook options object. The only option supported right now is a `suspense` flag that will work with the [React suspense for data fetching](https://reactjs.org/docs/concurrent-mode-suspense.html).
The return value is an array consisting of three items: The first one is a `Response` that will contain either the `data` or `error` property. The second value is a boolean loading flag, and the third one is an error value that will either be `null`, a string or an `Error` object.
