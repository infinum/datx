import {
  useMutation,
  useQuery,
} from '@datx/react';
import { FC, useRef } from 'react';

import { createTodo } from './Todos.mutations';
import { queryTodo } from './Todos.queries';

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