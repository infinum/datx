import { getModelEndpointUrl, modelToJsonApi } from '@datx/jsonapi';
import {
  createMutation,
  createQuery,
  useMutation,
  useQuery,
} from '@datx/react';
import { FC, useRef } from 'react';

import { Todo } from '../../../models/Todo';

const queryTodo = createQuery((client) => {
  const model = new Todo();
  const key = getModelEndpointUrl(model);

  return {
    key,
    fetcher: (url: string) => client.request<Todo, Array<Todo>>(url, 'GET')
  };
});

const createTodo = createMutation((client, message: string | undefined) => {
  const model = new Todo({ message });
  const url = getModelEndpointUrl(model);
  const data = modelToJsonApi(model);

  return client.request<Todo>(url, 'POST', { data });
});

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
