import React, { FC } from 'react';
import { screen } from '@testing-library/react';
import { server } from './mocks/server';

import { getErrorMessage, renderWithConfig } from './utils';
import { todosError, todosErrorDetails } from './mocks/todos';
import { message } from './mocks/handlers';
import { useQuery } from '../src';
import { queryTodos } from './queries';

const loadingMessage = 'Loading...';
const shouldFetchMessage = 'Waiting for dependant call...';

interface ITesterProps {
  shouldFetch?: boolean;
}

const Tester: FC<ITesterProps> = ({ shouldFetch = true }) => {
  const { data, error } = useQuery(queryTodos, { shouldFetch });

  if (error) {
    return <div>{getErrorMessage(error)}</div>;
  }

  if (!data && shouldFetch) {
    return <div>{loadingMessage}</div>;
  }

  if (!shouldFetch) {
    return <div>{shouldFetchMessage}</div>;
  }

  return <div>{data?.data[0].message}</div>;
};

describe('useQuery', () => {
  it('should render data', async () => {
    renderWithConfig(<Tester shouldFetch />);
    screen.getByText(loadingMessage);

    await screen.findByText(message);
  });

  it('should conditionally fetch data', async () => {
    const renderResult = renderWithConfig(<Tester shouldFetch={false} />);
    screen.getByText(shouldFetchMessage);

    renderResult.rerender(<Tester />);
    screen.getByText(loadingMessage);

    await screen.findByText(message);
  });

  it('should handle errors', async () => {
    server.use(todosError);

    renderWithConfig(<Tester />);
    screen.getByText(loadingMessage);

    await screen.findByText(todosErrorDetails);
  });
});
