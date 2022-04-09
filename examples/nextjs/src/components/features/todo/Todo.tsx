import { useQuery } from '@datx/swr';
import { FC } from 'react';

import { ErrorFallback } from '../../shared/errors/ErrorFallback/ErrorFallback';

import { getTodoQuery } from './Todo.queries';

export interface ITodoProps {
  id?: string;
}

export const Todo: FC<ITodoProps> = ({ id }) => {
  const { data, error } = useQuery(getTodoQuery(id));

  if (error) {
    return <ErrorFallback error={error} />;
  }

  if (!data) {
    return <div>Loading todo...</div>;
  }

  return <div>{data?.data?.message}</div>;
};
