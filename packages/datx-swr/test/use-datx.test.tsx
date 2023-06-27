import { FC } from 'react';
import { screen } from '@testing-library/react';
import { server } from './mocks/server';

import { getErrorMessage, renderWithConfig } from './utils';
import { todosError, todosErrorDetails } from './mocks/todos';
import { message, name } from './mocks/handlers';
import { useDatx } from '@datx/swr';

const loadingMessage = 'Loading...';

const Todos: FC = () => {
  const { data: response, error } = useDatx({
    op: 'getMany',
    type: 'todos',
  } as const);

  if (error) {
    return <div>{getErrorMessage(error)}</div>;
  }

  if (!response) {
    return <div>{loadingMessage}</div>;
  }

  return <div>{response.data[0]?.message}</div>;
};

describe('useDatx', () => {
  it('should render data', async () => {
    renderWithConfig(<Todos />);
    screen.getByText(loadingMessage);

    await screen.findByText(message);
  });

  it('should render resource relation', async () => {
    const TodoAuthor: FC = () => {
      const { data: response, error } = useDatx({
        op: 'getRelatedResource',
        type: 'todos',
        id: '1',
        relation: 'author',
      } as const);

      if (error) {
        return <div>{getErrorMessage(error)}</div>;
      }

      if (!response) {
        return <div>{loadingMessage}</div>;
      }

      return <div>{response.data.name}</div>;
    };
    renderWithConfig(<TodoAuthor />);
    screen.getByText(loadingMessage);

    await screen.findByText(name);
  });

  it('should render all data', async () => {
    const AllTodos: FC = () => {
      const { data: getAllResponse, error } = useDatx({
        op: 'getAll',
        type: 'todos',
        id: '1',
      } as const);

      if (error) {
        return <div>{getErrorMessage(error.lastResponse)}</div>;
      }

      if (!getAllResponse) {
        return <div>{loadingMessage}</div>;
      }

      return <div>{getAllResponse.data[0]?.message}</div>;
    };

    renderWithConfig(<AllTodos />);
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
