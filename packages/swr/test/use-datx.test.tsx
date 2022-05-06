import React, { FC } from 'react';
import { screen } from '@testing-library/react';
import { server } from './mocks/server';

import { getErrorMessage, renderWithConfig } from './utils';
import { todosError, todosErrorDetails } from './mocks/todos';
import { message } from './mocks/handlers';
import { useDatx } from '@datx/swr';

const loadingMessage = 'Loading...';

const Todos: FC = () => {
  const { data, error } = useDatx({
    op: 'getMany',
    type: 'todos',
  } as const);

  if (error) {
    return <div>{getErrorMessage(error)}</div>;
  }

  if (!data) {
    return <div>{loadingMessage}</div>;
  }

  return <div>{data?.data[0].message}</div>;
};

describe('useDatx', () => {
  it('should render data', async () => {
    renderWithConfig(<Todos />);
    screen.getByText(loadingMessage);

    await screen.findByText(message);
  });

  it('should conditionally fetch data', async () => {
    // todo
  });

  it('should handle errors', async () => {
    server.use(todosError);

    renderWithConfig(<Todos />);
    screen.getByText(loadingMessage);

    await screen.findByText(todosErrorDetails);
  });
});
