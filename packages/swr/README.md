# @datx/swr

React Hooks for DatX

---

## Install

```bash
npm install --save swr @datx/swr
```

## Basic usage with Next.js

### Datx Client initializer function

```ts
// src/datx/createClient.ts

import { Collection } from '@datx/core';
import { jsonapiCollection, config } from '@datx/jsonapi';

import { Todo } from '../models/Todo';

class Client extends jsonapiCollection(Collection) {
  public static types = [Todo];
}

export function createClient() {
  config.baseUrl = process.env.NEXT_PUBLIC_JSONAPI_URL as string;
  config.cache = 1;

  return new Client();
}
```

### Client initialization

```ts
// src/pages/_app.tsx

import type { AppProps } from 'next/app';
import { createFetcher, DatxProvider, useSafeClient } from '@datx/swr';
import { createClient } from '../datx/createClient';
import { SWRConfig } from 'swr';

function ExampleApp({ Component, pageProps }: AppProps) {
  const client = useSafeClient(createClient);

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

### Define queries and mutations

```ts
// src/components/features/todos/Todos.queries.ts

import { Response } from '@datx/jsonapi';
import { GetManyExpression } from '@datx/swr';

import { Todo } from '../../../models/Todo';

export type TodosResponse = Response<Todo, Array<Todo>>;

export const queryTodos: GetManyExpression<Todo> = {
  op: 'getMany',
  type: Todo,
};
```

```ts
// src/components/features/todos/Todos.mutations.ts

export const createTodo = (client: Client, message: string | undefined) => {
  const model = new Todo({ message });
  const url = getModelEndpointUrl(model);
  const data = modelToJsonApi(model);

  return client.request<Todo, Array<Todo>>(url, 'POST', { data });
};
```

### Use hook to fetch data

```ts
// src/components/features/todos/Todos.ts

export const Todos: FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { data, error, mutate } = useQuery(queryTodos);
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
        <NextLink href={`/todos/${todo.id}`} key={todo.id}>
          <a style={{ display: 'block' }}>{todo.message}</a>
        </NextLink>
      ))}
    </div>
  );
};
```

## API

### hooks

#### useSafeClient

On the server side it is important to create an entirely new instance of Datx Client for each request.
Otherwise, your response to a request might include sensitive cached query results from a previous request.

```ts
const client = useSafeClient(() => new Client());
```

#### useDatx

For accessing `Client` instance from the context. It's made mainly for internal usage.

```ts
const client = useDatx();
```

#### useQuery

```ts
const queryExpression: GetManyExpression<Todo> = {
  op: 'getMany',
  type: Todo,
};

const config: DatxConfiguration<Todo, Array<Todo>> = {
  shouldRetryOnError: false
};

const = useQuery(queryExpression, config);
```

##### Expression signature

```ts
export type Operation = 'getOne' | 'getMany' | 'getAll';

export type ExpressionLike = {
  op: Operation;
};

export type GetOneExpression<TModel extends IJsonapiModel> = {
  op: 'getOne';
  type: IModelConstructor<TModel>;
  id: string;
  queryParams?: IRequestOptions['queryParams'];
};

export type GetManyExpression<TModel extends IJsonapiModel> = {
  op: 'getMany';
  type: IModelConstructor<TModel>;
  queryParams?: IRequestOptions['queryParams'];
};

export type GetAllExpression<TModel extends IJsonapiModel> = {
  op: 'getAll';
  type: IModelConstructor<TModel>;
  queryParams?: IRequestOptions['queryParams'];
  maxRequests?: number | undefined;
};
```

##### Query config

It's the [SWR config](https://swr.vercel.app/docs/options#options) extended with `networkConfig` prop.

```ts
export type DatxConfiguration<
  TModel extends IJsonapiModel,
  TData extends IResponseData,
> = SWRConfiguration<
  Response<TModel, TData>,
  Response<TModel, TData>,
  Fetcher<Response<TModel, TData>>
> & {
  networkConfig: IRequestOptions['networkConfig']
};
```

#### useMutation

A hook for remote mutations
This is a helper hook until [this](https://github.com/vercel/swr/pull/1450) is merged to SWR core!

// TODO example

### SSR

When fetching data on the server, you'll have to setup your fetchQuery method on your Client class.
Fallback responses will be held inside private Map which will be passed serialized to the component for hydrating.

```ts
export class Client extends jsonapi(Collection) {
  private _fallback = new Map();
  // ... models and other stuff

  public async fetchQuery<TModel extends DatxJsonapiModel>(expression: Expression<TModel>) {
    try {
      const response = await createFetcher(this)(expression);
      this._fallback.set(expression.type, response);

      return {
        [expression.type]: response,
      };
    } catch (error) {
      if (error instanceof Response) {
        throw error.error;
      }

      throw error;
    }
  }


  public get fallback() {
    return JSON.stringify(Object.fromEntries(this._fallback));
  }
}
```

Then, you will use the `fetchQuery` method inside `getServerSideProps` to fetch the data and pass the fallback to the page for hydration. 
```tsx
type SSRProps = InferGetServerSidePropsType<typeof getServerSideProps>;

const SSR: NextPage<SSRProps> = ({ fallback }) => {
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

  const todo = await client.fetchQuery(queryTodos);

  return {
    props: {
      fallback: client.fallback,
    },
  };
};

export default SSR;
```

#### hydrate

```tsx
type Fallback = Record<string, IResponseSnapshot>

const fallback = {
  './api/v1/todos': responseSnapshot
}

<Hydrate fallback={fallback}>
```

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
