# @datx/swr

React Hooks for DatX

---

## Install

```bash
npm install --save swr @datx/swr
```

## Basic usage with Next.js

### Datx Client initializer function

For extra SSR setup, see [SSR Setup section](#ssr)

```ts
// src/datx/createClient.ts

import { Collection } from '@datx/core';
import { CachingStrategy, config } from '@datx/jsonapi';
import { jsonapiSwrClient } from '@datx/swr';

import { Post } from '../models/Post';
import { Todo } from '../models/Todo';

export class JsonapiSwrClient extends jsonapiSwrClient(Collection) {
  public static types = [Todo, Post];
}

export function createClient() {
  config.baseUrl = process.env.NEXT_PUBLIC_JSONAPI_URL as string;
  config.cache = CachingStrategy.NetworkOnly;

  const client = new JsonapiSwrClient();

  return client;
}

export type Client = typeof JsonapiSwrClient;
```

### Client types override

To correctly infer types form expression in `useQuery` you need to globally override client typings.

```tsx
// /typings/datx.d.ts

import { Client } from '../src/datx/createClient';

declare module '@datx/swr' {
  export interface IClient extends Client {
    types: Client['types'];
  }
}
```

### Client initialization

```tsx
// src/pages/_app.tsx

import '@datx/core/disable-mobx';

import type { AppProps } from 'next/app';
import { createFetcher, DatxProvider, useInitialize } from '@datx/swr';
import { createClient } from '../datx/createClient';
import { SWRConfig } from 'swr';

function ExampleApp({ Component, pageProps }: AppProps) {
  const client = useInitialize(createClient);

  return (
    <DatxProvider client={client}>
      <SWRConfig
        value={{
          fetcher: createFetcher(client),
        }}
      >
        <Component {...pageProps} />
      </SWRConfig>
    </DatxProvider>
  );
}

export default ExampleApp;
```

For more details how to disable Mobx see [Disable Mobx](#disable-mobx) section.

### Define queries

Using expression types (Preferred):

```ts
// src/components/features/todos/Todos.queries.ts

import { IGetManyExpression } from '@datx/swr';

import { Todo } from '../../../models/Todo';

export const todosQuery: IGetManyExpression<typeof Todo> = {
  op: 'getMany',
  type: 'todos',
};
```

Using `as const`:

```ts
// src/components/features/todos/Todos.queries.ts

import { Todo } from '../../../models/Todo';

export const todosQuery = {
  op: 'getMany',
  type: 'todos',
} as const;
```

> It's important to use `as const` assertion. It tells the compiler to infer the narrowest or most specific type it can for an expression. If you leave it off, the compiler will use its default type inference behavior, which will possibly result in a wider or more general type.

### Conditional data fetching

```ts
// conditionally fetch
export const getTodoQuery = (id?: string) =>
  id
    ? ({
        id,
        op: 'getOne',
        type: 'todos',
      } as IGetOneExpression<typeof Todo>)
    : null;

const { data, error } = useQuery(getTodoQuery(id));

// ...or return a falsy value, a.k.a currying
export const getTodoQuery = (id?: string) => () =>
  id
    ? ({
        id,
        op: 'getOne',
        type: 'todos',
      } as IGetOneExpression<typeof Todo>)
    : null;

const { data, error } = useQuery(getTodoQuery(id));

// ...or throw an error when property is not defined
export const getTodoByUserQuery = (user?: User) => () =>
  ({
    id: user.todo.id, // if user is not defined this will throw an error
    op: 'getOne',
    type: 'todos',
  } as IGetOneExpression<typeof Todo>);

const { data: user } = useQuery(getUserQuery(id));
const { data: todo } = useQuery(getTodoByUserQuery(user));
```

### Define mutations

```tsx
// src/components/features/todos/Todos.mutations.ts

import { getModelEndpointUrl, modelToJsonApi } from '@datx/jsonapi';
import { ClientInstance } from '@datx/swr';

import { Todo } from '../../../models/Todo';

export const createTodo = (client: ClientInstance, message: string | undefined) => {
  const model = new Todo({ message });
  const url = getModelEndpointUrl(model);
  const data = modelToJsonApi(model);

  return client.request<Todo, Array<Todo>>(url, 'POST', { data });
};
```

### Use data fetching and mutations together

```tsx
// src/components/features/todos/Todos.ts

import { useMutation, useQuery } from '@datx/swr';
import { FC, useRef } from 'react';
import { ErrorFallback } from '../../shared/errors/ErrorFallback/ErrorFallback';
import NextLink from 'next/link';

import { createTodo } from './Todos.mutations';
import { todosQuery } from './Todos.queries';

export interface ITodosProps {}

export const Todos: FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { data, error, mutate } = useQuery(todosQuery);

  const [create, { status }] = useMutation(createTodo, {
    onSuccess: async () => {
      const input = inputRef.current;
      if (input) input.value = '';
      mutate();
    },
  });

  if (error) {
    return <ErrorFallback error={error} />;
  }

  if (!data) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <input ref={inputRef} disabled={status === 'running'} />
      <button onClick={() => create(inputRef.current?.value)} disabled={status === 'running'}>
        add
      </button>

      {data.data?.map((todo) => (
        <NextLink href={`./todos/${todo.id}`} key={todo.id}>
          <a style={{ display: 'block' }}>{todo.message}</a>
        </NextLink>
      ))}
    </div>
  );
};
```

## API

### hooks

#### useInitialize

On the server side it is important to create an entirely new instance of Datx Client for each request.
Otherwise, your response to a request might include sensitive cached query results from a previous request.

```ts
const client = useInitialize(() => new Client());
```

#### useClient

For accessing `Client` instance from the context. It's made mainly for internal usage.

```ts
const client = useClient();
```

#### useQuery

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

const = useQuery(expression, config);
```

Second parameter of `useQuery` is for passing config options. It extends default SWR config prop with additional `networkConfig` property useful for passing custom headers.

##### Expression signature

Currently we support 3 expressions for fetching resources `getOne`, `getMany` and `getAll`.
Future plan is to support generic `request` operation and `getRelated`.

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
```

#### useMutation (deprecated)

A hook for remote mutations
This is a helper hook until [this](https://github.com/vercel/swr/pull/1450) is merged to SWR core!

// TODO example

### SSR

You will use the `fetchQuery` method inside `getServerSideProps` to fetch the data and pass the fallback to the page for hydration.

```tsx
type HomeProps = InferGetServerSidePropsType<typeof getServerSideProps>;

const Home: NextPage<SSRProps> = ({ fallback }) => {
  return (
    <Hydrate fallback={fallback}>
      <Layout>
        <Todos />
      </Layout>
    </Hydrate>
  );
};

export const getServerSideProps = async () => {
  const client = createClient();

  const todo = await client.fetchQuery(todosQuery);

  return {
    props: {
      fallback: client.fallback,
    },
  };
};

export default Home;
```

#### hydrate

```tsx
type Fallback = Record<string, IRawResponse>

const fallback = {
  '/api/v1/todos': rawResponse
}

<Hydrate fallback={fallback}>
```

## Disable Mobx

Since we don't want to use Mobx, we need to add a little boilerplate to work around that. First we need to instruct DatX not to use Mobx, by adding `@datx/core/disable-mobx` before App bootstrap:

```tsx
// src/pages/_app.tsx

import '@datx/core/disable-mobx';
```

Next, we need to overwrite mobx path so that it can be resolved by datx:

```json
// /tsconfig.json

{
  // ...
  "compilerOptions": {
    //...
    "paths": {
      // ...
      "mobx": ["./mobx.js"]
    }
  }
}
```

> `./mobx.js` is an empty file!

## Troubleshooting

Having issues with the library? Check out the [troubleshooting](https://datx.dev/docs/troubleshooting/known-issues) page or [open](https://github.com/infinum/datx/issues/new) an issue.

---

[![Build Status](https://travis-ci.org/infinum/datx.svg?branch=master)](https://travis-ci.org/infinum/datx)
[![npm version](https://badge.fury.io/js/@datx/jsonapi.svg)](https://badge.fury.io/js/@datx/jsonapi)
[![Dependency Status](https://david-dm.org/infinum/datx.svg?path=packages/@datx/jsonapi)](https://david-dm.org/infinum/datx?path=packages/@datx/jsonapi)
[![devDependency Status](https://david-dm.org/infinum/datx/dev-status.svg?path=packages/@datx/jsonapi)](https://david-dm.org/infinum/datx?path=packages/@datx/jsonapi#info=devDependencies)

## License

The [MIT License](LICENSE)

## Credits

@datx/swr is maintained and sponsored by
[Infinum](https://www.infinum.com).

<img src="https://infinum.com/infinum.png" width="264">
