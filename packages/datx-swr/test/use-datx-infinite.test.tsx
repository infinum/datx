import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

import { CollectionResponse, useDatxInfinite } from '@datx/swr';
import { message } from './mocks/handlers';
import { server } from './mocks/server';
import { todosError, todosErrorDetails } from './mocks/todos';
import { getErrorMessage, renderWithConfig } from './utils';
import { Todo } from './models/Todo';

const loadingMessage = 'Loading...';
const isLoadingTestId = 'isLoading';
const loadMoreTestId = 'loadMore';
const responsesLengthTestId = 'responses.length';
const totalTodosLengthTestId = 'totalTodos';

const getPageExpression = (index: number, size = 10) => {
  return {
    op: 'getMany',
    type: 'todos',
    queryParams: {
      custom: [
        { key: 'page[index]', value: String(index) },
        { key: 'page[size]', value: String(size) },
      ] as const,
    },
  } as const;
};

const getExpressionKey = (pageIndex: number, previousPageData: CollectionResponse) => {
  if (previousPageData && previousPageData.data.length === 0) {
    return null;
  }

  return getPageExpression(pageIndex);
};

const getURLKey = (pageIndex: number, previousPageData: CollectionResponse) => {
  if (previousPageData && previousPageData.data.length === 0) {
    return null;
  }

  if (previousPageData?.links?.next) {
    return previousPageData.links.next;
  }

  return `/todos?page[index]=10&page[index]=${pageIndex}`;
};

interface ITodosViewProps {
  data: Array<CollectionResponse<Todo>> | undefined;
  error: CollectionResponse<Todo> | undefined;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

function TodosView({ data, error, isLoadingMore, onLoadMore }: ITodosViewProps) {
  if (error) {
    return <div>{getErrorMessage(error)}</div>;
  }

  if (!data) {
    return <div>{loadingMessage}</div>;
  }

  const [response] = data || [];

  let totalTodos = 0;
  for (let i = 0; i < data.length; i++) {
    totalTodos += data[i].data.length;
  }

  return (
    <div>
      <p data-testid={responsesLengthTestId}>{data.length}</p>
      <p data-testid={totalTodosLengthTestId}>{totalTodos}</p>
      <p data-testid={isLoadingTestId}>{String(isLoadingMore)}</p>
      <div>{response.data[0]?.message}</div>
      <button
        data-testid={loadMoreTestId}
        type="button"
        onClick={onLoadMore}
        disabled={data[data.length - 1].data.length === 0}
      >
        Load more
      </button>
    </div>
  );
}

function TodosExpression() {
  const { data, error, size, setSize } = useDatxInfinite(getExpressionKey);

  return (
    <TodosView
      data={data}
      error={error}
      isLoadingMore={size !== data?.length}
      onLoadMore={() => setSize(size + 1)}
    />
  );
}

function TodosURL() {
  const { data, error, size, setSize } = useDatxInfinite(getURLKey);

  return (
    <TodosView
      data={data}
      error={error}
      isLoadingMore={size !== data?.length}
      onLoadMore={() => setSize(size + 1)}
    />
  );
}

describe('useDatxInfinite', () => {
  describe('query expression', () => {
    it('should render data', async () => {
      renderWithConfig(<TodosExpression />);
      screen.getByText(loadingMessage);

      expect(await screen.findByText(message)).toBeInTheDocument();
      expect((await screen.findByTestId('isLoading')).textContent).toBe('false');
    });

    it('should fetch more data if there is any', async () => {
      renderWithConfig(<TodosExpression />);

      let loadMoreButton = await screen.findByTestId(loadMoreTestId);
      expect(loadMoreButton).toBeInTheDocument();

      await userEvent.click(loadMoreButton);

      expect(screen.getByTestId(responsesLengthTestId).textContent).toBe('2');

      loadMoreButton = await screen.findByTestId(loadMoreTestId);
      expect((loadMoreButton as HTMLButtonElement).disabled).toBe(true);
    });

    it('should handle error', async () => {
      server.use(todosError);

      renderWithConfig(<TodosExpression />);

      await screen.findByText(todosErrorDetails);
    });

    it('should handle error on fetch more', async () => {
      renderWithConfig(<TodosExpression />);

      const loadMoreButton = await screen.findByTestId(loadMoreTestId);

      server.use(todosError);
      await userEvent.click(loadMoreButton);

      await screen.findByText(todosErrorDetails);
    });
  });

  describe('query URL', () => {
    it('should allow using relative url strings instead of expressions', async () => {
      renderWithConfig(<TodosURL />);
      screen.getByText(loadingMessage);

      expect(await screen.findByText(message)).toBeInTheDocument();
      expect((await screen.findByTestId('isLoading')).textContent).toBe('false');
    });

    it('should follow next link form the previous request', async () => {
      renderWithConfig(<TodosURL />);

      let loadMoreButton = await screen.findByTestId(loadMoreTestId);
      expect(loadMoreButton).toBeInTheDocument();

      await userEvent.click(loadMoreButton);

      expect(screen.getByTestId(responsesLengthTestId).textContent).toBe('2');

      loadMoreButton = await screen.findByTestId(loadMoreTestId);
      expect((loadMoreButton as HTMLButtonElement).disabled).toBe(true);
    });
  });
});
