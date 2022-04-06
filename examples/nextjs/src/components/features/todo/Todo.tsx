import { useQuery } from '@datx/swr';
import { FC } from 'react';

import { Todo as TodoModel } from '../../../models/Todo';
import { ErrorFallback } from '../../shared/errors/ErrorFallback/ErrorFallback';

import { queryTodo } from './Todo.queries';

export interface ITodoProps {
  id: string;
}

export const Todo: FC<ITodoProps> = ({ id }) => {
  const { data, error } = useQuery<TodoModel>(queryTodo(id));

  if (error) {
    return <ErrorFallback error={error} />;
  }

  if (!data) {
    return <div>Loading todo...</div>;
  }

  return <div>{data?.data?.message}</div>;
};
