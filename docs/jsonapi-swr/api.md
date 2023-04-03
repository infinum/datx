---
id: api
title: useDatx API
sidebar_label: API
---

## useInitialize

On the server side it is important to create an entirely new instance of Datx Client for each request.
Otherwise, your response to a request might include sensitive cached query results from a previous request.

```ts
const client = useInitialize(() => new Client());
```

## useClient

For accessing `Client` instance from the context. It's made mainly for internal usage.

```ts
const client = useClient();
```

## useDatx

```ts
const expression: IGetManyExpression<typeof Todo> = {
  op: 'getMany',
  type: 'todos',
};

const config: DatxConfiguration<Todo, Array<Todo>> = {
  // datx config
  networkConfig: {
    headers: {
      'Accept-Language': 'en',
    }
  },
  // SWR config
  onSuccess: (data) => console.log(data.data[0].id),
}

const = useDatx(expression, config);
```

Second parameter of `useDatx` is for passing config options. It extends default SWR config prop with additional `networkConfig` property useful for passing custom headers.

### Expression signature

Currently, we support 3 expressions for fetching resources `getOne`, `getMany`, `getAll` and `getRelatedResource`.

```ts
// fetch single resource by id
export interface IGetOneExpression<TModel extends JsonapiModelType = JsonapiModelType> {
  readonly op: 'getOne';
  readonly type: TModel['type'];
  id: string;
  queryParams?: IRequestOptions['queryParams'];
}

// fetch resource collection
export interface IGetManyExpression<TModel extends JsonapiModelType = JsonapiModelType> {
  readonly op: 'getMany';
  readonly type: TModel['type'];
  queryParams?: IRequestOptions['queryParams'];
}

// fetch all the pages of resource collection
export interface IGetAllExpression<TModel extends JsonapiModelType = JsonapiModelType> {
  readonly op: 'getAll';
  readonly type: TModel['type'];
  queryParams?: IRequestOptions['queryParams'];
  maxRequests?: number | undefined;
}

// fetch related resource through the primary resource
export interface IGetRelatedResourceExpression<
  TModelType extends JsonapiModelType = JsonapiModelType,
> {
  readonly op: 'getRelatedResource';
  readonly type: TModelType['type'];
  readonly relation: string;
  id: string;
  queryParams?: IRequestOptions['queryParams'];
}
```

## useDatxInfinite

For fetching paginated data. It uses `useSWRInfinite` internally so all the options from the [documentation](https://swr.vercel.app/docs/pagination#useswrinfinite) can be applied to `useDatxInfinite`.

```ts
const getPageExpression = (index: number, size = 10) => ({
  op: 'getMany',
  type: 'todos',
  queryParams: {
    custom: [
      { key: 'page[index]', value: String(index) },
      { key: 'page[size]', value: String(size) },
    ] as const,
  },
} as const satisfies IGetManyExpression<typeof Todo>);
// omit `satisfies IGetManyExpression<typeof Todo>` if you are using typescript < 4.9

const config: DatxInfiniteConfiguration<Todo> = {
  // datx config
  networkConfig: {
    headers: {
      'Accept-Language': 'en',
    }
  },
  // SWR config
  onSuccess: (data) => console.log(data[0].data[0].id),
}

const getKey = (pageIndex: number, previousPageData: CollectionResponse) => {
  if (previousPageData && previousPageData.data.length === 0) return null;

  return getPageExpression(pageIndex);
};

const datx = useDatxInfinite(getKey, config);
```

Second parameter of `useDatxInfinite` is for passing config options. It extends default SWRInfinite config prop with additional `networkConfig` property useful for passing custom headers.

> Core expression should always be a `getMany` operation.

## useMutation

A hook for remote mutations.
This is a helper hook until [this](https://github.com/vercel/swr/pull/1450) is merged to SWR core!

```tsx
// ./src/queries/todo.ts

import { IGetManyExpression } from '@datx/swr';

import { Todo } from '../models/Todo';

export const querytodos: IGetManyExpression<typeof Todo> = {
  op: 'getMany',
  type: 'todos',
};
```

```tsx
// ./src/mutations/todo.ts

import { getModelEndpointUrl, modelToJsonApi } from '@datx/jsonapi';
import { IClientInstance } from '@datx/swr';

import { Todo } from '../models/Todo';

export const createTodo = (client: IClientInstance, message: string | undefined) => {
  const model = new Todo({ message });
  const url = getModelEndpointUrl(model);
  const data = modelToJsonApi(model);

  return client.request<Todo, Array<Todo>>(url, 'POST', { data });
};
```

```tsx
import { useMutation, useDatx } from '@datx/swr';

export const Todos: FC = () => {
  const { data, error, mutate } = useDatx(todosQuery);

  const [create, { status }] = useMutation(createTodo, {
    onSuccess: async () => {
      mutate();
    },
  });

  // ...
};
```

## Utils

### SWR Client

#### fetchQuery

Takes in an expression as an argument and returns a promise with the response. Useful on server side for fetching data before rendering.

```tsx
const client = createClient();

const todo = await client.fetchQuery(todosQuery);
```

#### requestSingle and requestCollection

Same as `request` but with a bit more type safety.

```tsx
const client = createClient();

const todo = await client.requestSingle('todos/1', 'GET', undefined); // returns SingleResponse
const todos = await client.requestCollection('todos', 'GET', undefined); // returns CollectionResponse
```

### hydrate

```tsx
type Fallback = Record<string, IRawResponse>

const fallback = {
  '/api/v1/todos': rawResponse
}

<Hydrate fallback={fallback} />
```
