import { useQuery } from '@datx/swr';
import { FC } from 'react';

import { useDependantCall } from '../../../hooks/useDependantCall';
import { ErrorFallback } from '../../shared/errors/ErrorFallback/ErrorFallback';

import { queryTodo } from './Todo.queries';

export interface ITodoProps {
  id: string;
}

export const Todo: FC<ITodoProps> = ({ id }) => {
  const shouldFetch = useDependantCall();
  const { data, error } = useQuery(shouldFetch ? queryTodo(id) : null);

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
