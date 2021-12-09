import React from 'react';
import { screen } from '@testing-library/react';
import { server } from './mocks/server';

import { renderWithConfig } from './utils';
import { todosError, todosErrorDetails } from './mocks/todos';
import { message } from './mocks/handlers';
import { loadingMessage, Todos } from './components/Todos';


describe('useQuery', () => {
  it('should render data', async () => {
    renderWithConfig(<Todos />);
    screen.getByText(loadingMessage);

    await screen.findByText(message);
  });

  it('should conditionally fetch data', async () => {
    renderWithConfig(<Todos shouldFetch={false} />);

    await screen.getByText(loadingMessage);
  });

  it('should handle errors', async () => {
    server.use(todosError);

    renderWithConfig(<Todos />);
    screen.getByText(loadingMessage);

    await screen.findByText(todosErrorDetails);
  });
});
