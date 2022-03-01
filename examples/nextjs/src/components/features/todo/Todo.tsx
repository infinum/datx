import { useQuery } from '@datx/swr';
import { FC } from 'react';

import { ErrorFallback } from '../../shared/errors/ErrorFallback/ErrorFallback';

import { queryTodo } from './Todo.queries';

export interface ITodoProps {
  id: string;
  shouldFetch?: boolean;
}

export const Todo: FC<ITodoProps> = ({ id, shouldFetch = true }) => {
  const { data, error } = useQuery(queryTodo(id), { shouldFetch });

  if (error) {
    return <ErrorFallback error={error} />;
  }

  if (!shouldFetch) {
    return <div>Waiting for dependant call...</div>;
  }

  if (!data && shouldFetch) {
    return <div>Loading todo...</div>;
  }

  return <div>{data?.data?.message}</div>;
};
