import { getModelEndpointUrl, modelToJsonApi } from '@datx/jsonapi';
import { MutationFn, QueryFn, useMutation, useQuery } from '@datx/react';
import { FC, useRef } from 'react';

import { Todo } from '../../../models/Todo';

const queryTodo: QueryFn<any, any> = (store, variables) => {
  const model = new Todo();
  const url = getModelEndpointUrl(model);

  return {
    key: url,
    fetcher: () => store.request(url, 'GET'),
  }
}

const createTodo: MutationFn<any, any> = (store, message) => {
  const model = new Todo({ message });
  const url = getModelEndpointUrl(model);
  const data = modelToJsonApi(model);

  return store.request(url, 'POST', { data });
};

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

      {data.data.map((todo) => (
        <div key={todo.id}>{todo.message}</div>
      ))}
    </div>
  );
};
