---
id: typescript-interfaces
title: TypeScript interfaces
---

## IResponseObject

```typescript
interface IResponseObject {
  data?: object;
  error?: Error;
  headers?: Headers;
  requestHeaders?: Record<string, string>;
  status?: number;
  collection?: PureCollection;
  type?: IType | typeof PureModel;
}
```

## IRequestOptions

```typescript
interface IRequestOptions {
  query?: Array<{ key: string; value: string } | string>;
  cacheOptions?: {
    cachingStrategy?: CachingStrategy;
    maxAge?: number;
    skipCache?: boolean;
  };
  networkConfig?: {
    headers?: Record<string, string>;
  };
}
```

## IPipeOperator

```typescript
type IPipeOperator = (request: BaseRequest) => void;
```

## IInterceptor

```typescript
type IInterceptor<T extends PureModel = PureModel> = (
  request: IFetchOptions,
  next: INetworkHandler,
) => Promise<Response<T>>;
```

## INetworkHandler

```typescript
type INetworkHandler<T extends PureModel = PureModel> = (
  request: IFetchOptions,
) => Promise<Response<T>>;
```

## IFetchOptions

```typescript
interface IFetchOptions {
  url: string;
  options?: IRequestOptions;
  data?: string | FormData;
  method: HttpMethod;
  collection?: PureCollection;
  skipCache?: boolean;
  views?: Array<View>;
}
```
