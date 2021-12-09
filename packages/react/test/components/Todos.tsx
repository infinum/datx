import { getModelEndpointUrl } from '@datx/jsonapi';
import React, { FC } from 'react';

import { createQuery, useQuery } from '../../src';
import { Todo } from '../models/Todo';
import { getErrorMessage } from '../utils';

export const loadingMessage = 'Loading...';

interface IQueryTodoVariables { shouldFetch?: boolean }

const queryTodos = createQuery((client, variables: IQueryTodoVariables) => {
  const model = new Todo();
  const key = variables.shouldFetch ? getModelEndpointUrl(model) : null;

  return {
    key,
    fetcher: (url: string) => client.request<Todo, Array<Todo>>(url, 'GET'),
  };
});

interface ITodoProps { shouldFetch?: boolean }

export const Todos: FC<ITodoProps> = ({ shouldFetch = true }) => {
  const { data, error } = useQuery(queryTodos, { variables: { shouldFetch } });

  if (error) {
    return <div>{getErrorMessage(error)}</div>;
  }

  if (!data) {
    return <div>{loadingMessage}</div>;
  }

  return <div>{data.data[0].message}</div>;
};
