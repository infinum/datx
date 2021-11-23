import { getModelEndpointUrl, modelToJsonApi } from '@datx/jsonapi';
import { MutationFn, useMutation, useResourceList } from '@datx/react';
import { FC, useRef } from 'react';

import { Todo } from '../../../models/Todo';

const createTodo: MutationFn<string | undefined, any> = (message, store) => {
  const todo = new Todo({ message });

  const url = getModelEndpointUrl(todo);
  const data = modelToJsonApi(todo);

  return store.request(url, 'POST', { data });
};

export const Todos: FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { data, error, mutate } = useResourceList([Todo]);
  const [create, { status }] = useMutation(createTodo, {
    onSuccess: () => {
      const input = inputRef.current;
      if (input) input.value = '';
      debugger;
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
