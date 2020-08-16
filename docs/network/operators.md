---
id: operators
title: Operators
---

The operators are used to configure the [base request](./base-request).

## setUrl

```typescript
function setUrl(url: string, type: IType | typeof PureModel = PureModel);
```

Set the endpoint that should be loaded and the model that should be initialized. The url can contain placeholders that will be filled by using the `params` operator or as a fetch argument.
The url will be appended to the base url. An example with placeholders: `/articles/{articleId}`.

## addInterceptor

```typescript
function addInterceptor(interceptor: IInterceptor);
```

The library is using a concept of interceptors to handle use cases like authentication or other flows. This is conceptually similar to [Angular interceptors](https://angular.io/api/common/http/HttpInterceptor) or [Express middleware](https://expressjs.com/en/guide/using-middleware.html).

To find more about interceptors, check out the [interceptors](./interceptors) page.

## cache

```typescript
function cache(strategy: CachingStrategy, maxAge?: number);
```

The library supports multiple caching strategies. Only the GET request can be cached and you can configure the behavior by using the `cache` operator. The operator receives a strategy and the max age.
The default caching strategy in the browser is `CachingStrategy.CacheFirst` and on the server it's `CachingStrategy.NetworkOnly`. The default maxAge is `Infinity`.

To find out more about the caching strategies, check out the [caching](./caching) page.

## method

```typescript
function method(method: HttpMethod);
```

Set the HTTP method that should be used for the request.

## body

```typescript
function body(body: any, bodyType?: BodyType);
```

To send a body with your request, use the `body` operator. As a first argument, it receives the payload to be send. If the second argument is not set, the library will try to discover what type should be used. The body type is used for the payload serialization and `Content-Type` header value.

## query

```typescript
function query(name: string, value: string | Array<string> | object);
```

With this operator you can add query parameters to your url. The parameters can also be objects and arrays, and the `paramArrayType` operator can be used to set the way the query params will be serialized.

## header

```typescript
function header(name: string, value: string);
```

Set the HTTP headers that should be used for the request. Calling it multiple times with the same name will override the value.

## params

```typescript
function params(name: string, value: string): (pipeline: BaseRequest) => void;
function params(params: Record<string, string>): (pipeline: BaseRequest) => void;
```

Set the parameters that will be set in the url. Calling it multiple times with the same name will override the value.

## fetchReference

```typescript
function fetchReference(fetchReference: typeof fetch);
```

Set the reference to the fetch method. When running in the browser, this will default to `window.fetch`, while there will be no default for the server. To make the network work across server and client, you can use a library like `isomorphic-fetch`.

## encodeQueryString

```typescript
function encodeQueryString(encodeQueryString: boolean);
```

By default, all query strings added by using the `query` operator will be url encoded. If needed, you can disable the encoding with this operator.

## paramArrayType

```typescript
function paramArrayType(paramArrayType: ParamArrayType);
```

Since the `query` operator params can be complex objects and there are multiple ways to serialize them, this option defines a desired way to do it. The default value is `ParamArrayType.ParamArray` and the possible options are:

```typescript
export enum ParamArrayType {
  MultipleParams, // filter[a]=1&filter[a]=2
  CommaSeparated, // filter[a]=1,2
  ParamArray, // filter[a][]=1&filter[a][]=2
}
```

## serializer

```typescript
function serializer(serialize: (data: any, type: BodyType) => any);
```

Prepare the body of the request for sending. The default serializer just passes the unmodified data argument.

## parser

```typescript
function parser(parse: (data: IResponseObject) => IResponseObject);
```

Parse the API response before data initialization. The function also receives other data that could be useful for parsing. An example use case for the parser is if all your API response is wrapped in a `data` object or something similar.

## collection

```typescript
function collection(collection?: PureCollection);
```

Link the base request to a specific DatX collection. By using this, all the models received by the API response will be added to the specified collection. This is also required in order to use references inside of your models.

## Custom operators

You can also create custom operators that work with the base request. The operator needs to follow the `IPipeOperator` typing.

```typescript
type IPipeOperator = (request: BaseRequest) => void;
```

For now, no options of the base request are publicly exposed, but they might be in future. If you have some specific requests, please open an issue with the suggestion.
