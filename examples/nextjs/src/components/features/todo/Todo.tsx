import { useQuery } from '@datx/react';
import { FC } from 'react';
import { ErrorFallback } from '../../shared/errors/ErrorFallback/ErrorFallback';

import { queryTodo } from './Todo.queries';

export interface ITodoProps {
  id: string;
}

export const Todo: FC<ITodoProps> = ({ id }) => {
  const { data, error } = useQuery(queryTodo, { variables: { id } });

  if (error) {
    return <ErrorFallback error={error} />;
  }

  if (!data) {
    return <div>Loading...</div>;
  }

  return <div>{data.data?.message}</div>;
};
