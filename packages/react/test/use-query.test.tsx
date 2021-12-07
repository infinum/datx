import { getModelEndpointUrl } from '@datx/jsonapi';
import React from 'react';
import { createQuery, useQuery } from '../src';
import { Todo } from './models/Todo';
import { renderWithConfig } from './utils';

describe('useQuery', () => {
  it.skip('should render data', async () => {
    // todo
  });

  it.skip('should conditionally fetch data', async () => {
    // todo
  });

  it.skip('should handle errors', async () => {
    const queryTodo = createQuery((client) => {
      const model = new Todo();
      const key = getModelEndpointUrl(model);

      return {
        key,
        fetcher: (url: string) => client.request<Todo, Array<Todo>>(url, 'GET'),
      };
    });

    function Page() {
      const { data, error } = useQuery(queryTodo);

      if (error) {
        return <div>{error.error.message}</div>;
      }

      return <div>hello, {data}</div>;
    }

    renderWithConfig(<Page />);
    screen.getByText('hello,');

    // mount
    await screen.findByText('error!');
  });
});
