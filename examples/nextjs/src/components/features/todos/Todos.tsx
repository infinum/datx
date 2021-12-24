import {
  useMutation,
  QueryExpression,
} from '@datx/swr';
import { FC, useRef } from 'react';
import { ErrorFallback } from '../../shared/errors/ErrorFallback/ErrorFallback';
import NextLink from 'next/link';

import { createTodo } from './Todos.mutations';
import { queryTodos } from './Todos.queries';
import useSWR from 'swr';
import { Todo } from 'src/models/Todo';
import { Response } from '@datx/jsonapi';

export interface ITodosProps {

}

export const Todos: FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { data, error, mutate } = useSWR<Response<Todo, Array<Todo>>, Response<Todo, Array<Todo>>>(queryTodos);
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
