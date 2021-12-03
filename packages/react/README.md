# @datx/react

React Hooks for DatX

---

## Install

```bash
npm install --save @datx/react swr
```

## Basic usage with Next.js

### Datx Client initializer function

```ts
// src/datx/createClient.ts

import { Collection } from "@datx/core";
import { jsonapiCollection, config, CachingStrategy } from "@datx/jsonapi";

import { Todo } from "../models/Todo";

class Client extends jsonapiCollection(Collection) {
  public static types = [Todo];
};

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
import { DatxProvider, useSafeClient } from '@datx/react';
import { createClient } from '../datx/createClient';

function ExampleApp({ Component, pageProps }: AppProps) {
  const client = useSafeClient(createClient);

  return (
    <DatxProvider client={client}>
      <Component {...pageProps} />
    </DatxProvider>
  );
}

export default ExampleApp;
```

### Define queries and mutations

```ts
// src/components/features/todos/Todos.queries.ts

export const queryTodo = createQuery((client) => {
  const model = new Todo();
  const key = getModelEndpointUrl(model);

  return {
    key,
    fetcher: (url: string) => client.request<Todo, Array<Todo>>(url, 'GET')
  };
});
```

```ts
// src/components/features/todos/Todos.mutations.ts

export const createTodo = createMutation((client, message: string | undefined) => {
  const model = new Todo({ message });
  const url = getModelEndpointUrl(model);
  const data = modelToJsonApi(model);

  return client.request<Todo>(url, 'POST', { data });
});

```

### Use hook to fetch data

```ts
// src/components/features/todos/Todos.ts

export const Todos: FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { data, error, mutate } = useQuery(queryTodo);
  const [create, { status }] = useMutation(createTodo, {
    onSuccess: async () => {
      const input = inputRef.current;
      if (input) input.value = '';
      mutate();
    },
  });

  if (error) {
    return <div>{JSON.stringify(error)}</div>;
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
        <div key={todo.id}>{todo.message}</div>
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

#### useQuery

#### useMutation

#### useResource

#### useResourceList

## createQuery

## createMutation

### SSR

#### hydrate


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

@datx/react is maintained and sponsored by
[Infinum](https://www.infinum.com).

<img src="https://infinum.com/infinum.png" width="264">
