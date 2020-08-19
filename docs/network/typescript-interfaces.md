---
id: typescript-interfaces
title: TypeScript interfaces
---

## IRequestOptions

```typescript
interface IRequestOptions {
  query?: Record<string, string | Array<string> | object>;
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

## IPipeOperator

```typescript
type IPipeOperator = (request: BaseRequest) => void;
```

## IInterceptor

```typescript
type IInterceptor<T extends PureModel = PureModel> = (
  request: IFetchOptions,
  next?: INetworkHandler,
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
  data?: string | object | FormData;
  method: HttpMethod;
  collection?: PureCollection;
  skipCache?: boolean;
  views?: Array<View>;
  type?: IType | typeof PureModel;
}
```
