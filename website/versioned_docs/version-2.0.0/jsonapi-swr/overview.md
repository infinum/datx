---
id: version-2.0.0-overview
title: useDatx
sidebar_label: Overview
original_id: overview
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

To correctly infer types form expression in `useDatx` you need to globally override client typings.

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

### Define models

```ts
// src/models/Post.ts

import { Attribute, PureModel } from '@datx/core';
import { jsonapiModel } from '@datx/jsonapi';

export class Post extends jsonapiModel(PureModel) {
  public static readonly type = 'posts';

  @Attribute({ isIdentifier: true })
  id!: number;

  @Attribute()
  title!: string;

  @Attribute()
  body!: string;
}
```

```ts
// src/models/Todo.ts

import { Attribute, PureModel } from '@datx/core';
import { jsonapiModel } from '@datx/jsonapi';

export class Todo extends jsonapiModel(PureModel) {
  public static readonly type = 'todos';

  @Attribute({ isIdentifier: true })
  id!: number;

  @Attribute()
  message!: string;
}
```

> It's important to use `readonly` in `public static readonly type = 'posts';`. It helps TS to infer the typings in `useDatx` without the need to manually pass generics.

### Define queries

Using expression types (Preferred):

```ts
import { IGetManyExpression } from '@datx/swr';

import { Todo } from '../../../models/Todo';

export const todosQuery: IGetManyExpression<typeof Todo> = {
  op: 'getMany',
  type: 'todos',
};
```

Using `as const`:

```ts
import { Todo } from '../../../models/Todo';

export const todosQuery = {
  op: 'getMany',
  type: 'todos',
} as const;
```

> It's important to use `as const` assertion. It tells the compiler to infer the narrowest or most specific type it can for an expression. If you leave it off, the compiler will use its default type inference behavior, which will possibly result in a wider or more general type.

If your project uses TypeScript 4.9 or newer you can use `satisfies` to limit the type:

```ts
import { Todo } from '../../../models/Todo';

export const todosQuery = {
  op: 'getMany',
  type: 'todos',
} as const satisfies IGetManyExpression<typeof Todo>;
```

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

const { data, error } = useDatx(getTodoQuery(id));

// ...or return a falsy value, a.k.a currying
export const getTodoQuery = (id?: string) => () =>
  id
    ? ({
        id,
        op: 'getOne',
        type: 'todos',
      } as IGetOneExpression<typeof Todo>)
    : null;

const { data, error } = useDatx(getTodoQuery(id));

// ...or throw an error when property is not defined
export const getTodoByUserQuery = (user?: User) => () =>
  ({
    id: user.todo.id, // if user is not defined this will throw an error
    op: 'getOne',
    type: 'todos',
  } as IGetOneExpression<typeof Todo>);

const { data: user } = useDatx(getUserQuery(id));
const { data: todo } = useDatx(getTodoByUserQuery(user));
```

### Query naming convention

Query can be a static object or a function. Both cases should be suffixed with `query` to make it clear that it's a query.
If you use a function, it's recommended to add `get` prefix to indicate that it's a getter.
Query could also be lazy initializer function that returns a query. In this case it's recommended to use `get` prefix as well.

> Rule of thumb is to use `get` prefix if query depends on some other data. 

> Lazy initializer function is SWR concept used for conditional fetching. You can find more details in [SWR Conditional Fetching](https://swr.vercel.app/docs/conditional-fetching) documentation.

```ts
// collection query
const todosQuery = {
  op: 'getMany',
  type: 'todos',
} as const;

// single item query
const getTodoQuery = (id?: string) =>
  id
    ? ({
        id,
        op: 'getOne',
        type: 'todos',
      } as const satisfies IGetOneExpression<typeof Todo>)
    : null;

// single item lazy query, a.k.a currying
const getTodoQuery = (id?: string) => () =>
  id
    ? ({
        id,
        op: 'getOne',
        type: 'todos',
      } as const satisfies IGetOneExpression<typeof Todo>)
    : null;

// related query through primary resource
const getPostCommentsRelationshipQuery = (postId?: string) =>
  postId
    ? ({
        id: postId,
        op: 'getRelationship',
        relationship: 'comments',
        type: 'posts',
      } as const satisfies IGetRelationshipExpression<typeof Post>)
    : null;

// related query through primary resource lazy query
const getPostCommentsRelationshipQuery = (postId?: string) => () =>
  postId
    ? ({
        id: postId,
        op: 'getRelationship',
        relationship: 'comments',
        type: 'posts',
      } as const satisfies IGetRelationshipExpression<typeof Post>)
    : null;
```

### Define mutations

```tsx
// src/components/features/todos/Todos.mutations.ts

import { getModelEndpointUrl, modelToJsonApi } from '@datx/jsonapi';
import { IClientInstance } from '@datx/swr';

import { Todo } from '../../../models/Todo';

export const createTodo = (client: IClientInstance, message: string | undefined) => {
  const model = new Todo({ message });
  const url = getModelEndpointUrl(model);
  const data = modelToJsonApi(model);

  return client.request<Todo, Array<Todo>>(url, 'POST', { data });
};
```

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

### Use data fetching and mutations together

```tsx
// src/components/features/todos/Todos.ts

import { useMutation, useDatx } from '@datx/swr';
import { FC, useRef } from 'react';
import { ErrorFallback } from '../../shared/errors/ErrorFallback/ErrorFallback';
import NextLink from 'next/link';

import { createTodo } from './Todos.mutations';
import { todosQuery } from './Todos.queries';

export interface ITodosProps {}

export const Todos: FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { data, error, mutate } = useDatx(todosQuery);

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

## Disable Mobx in Next.js projects

Since we don't want to use Mobx, we need to add a little boilerplate to work around that. First, we need to instruct DatX not to use Mobx, by adding `@datx/core/disable-mobx` before App bootstrap:

```tsx
// src/pages/_app.tsx

import '@datx/core/disable-mobx';
```

Next, we need to overwrite Mobx path so that it can be resolved by Datx:

```json
// /tsconfig.json

{
  "compilerOptions": {
    "paths": {
      "mobx": ["./mobx.js"]
    }
  }
}
```

> `./mobx.js` is an empty file!
