import React, { FC } from 'react';
import { screen } from '@testing-library/react';
import { server } from './mocks/server';

import { getErrorMessage, renderWithConfig } from './utils';
import { todosError, todosErrorDetails } from './mocks/todos';
import { message } from './mocks/handlers';

import { getModelEndpointUrl } from "@datx/jsonapi";
import { createQuery } from "@datx/react";
import { Todo } from './models/Todo';
import { useQuery } from '../src';


interface IQueryTodoVariables { shouldFetch?: boolean }

export const queryTodos = createQuery((client, variables: IQueryTodoVariables) => {
  const model = new Todo();
  const key = variables.shouldFetch ? getModelEndpointUrl(model) : null;

  return {
    key,
    fetcher: (url: string) => client.request<Todo, Array<Todo>>(url, 'GET')
  };
});

const loadingMessage = 'Loading...';

interface ITesterProps { shouldFetch?: boolean }

const Tester: FC<ITesterProps> = ({ shouldFetch = true }) => {
  const { data, error } = useQuery(queryTodos, { variables: { shouldFetch } });

  if (error) {
    return <div>{getErrorMessage(error)}</div>;
  }

  if (!data) {
    return <div>{loadingMessage}</div>;
  }

  return <div>{data.data[0].message}</div>;
};


describe('useQuery', () => {
  it('should render data', async () => {
    renderWithConfig(<Tester />);
    screen.getByText(loadingMessage);

    await screen.findByText(message);
  });

  it('should conditionally fetch data', async () => {
    renderWithConfig(<Tester shouldFetch={false} />);

    await screen.getByText(loadingMessage);
  });

  it('should handle errors', async () => {
    server.use(todosError);

    renderWithConfig(<Tester />);
    screen.getByText(loadingMessage);

    await screen.findByText(todosErrorDetails);
  });
});
