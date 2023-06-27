import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FC } from 'react';

import { CollectionResponse, useDatxInfinite } from '@datx/swr';
import { message } from './mocks/handlers';
import { server } from './mocks/server';
import { todosError, todosErrorDetails } from './mocks/todos';
import { getErrorMessage, renderWithConfig } from './utils';

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

const getKey = (pageIndex: number, previousPageData: CollectionResponse) => {
  if (previousPageData && previousPageData.data.length === 0) {
    return null;
  }

  return getPageExpression(pageIndex);
};

const Todos: FC = () => {
  const { data: responses, error, size, setSize } = useDatxInfinite(getKey);

  const isLoadingMore = size !== responses?.length;

  if (error) {
    return <div>{getErrorMessage(error)}</div>;
  }

  if (!responses) {
    return <div>{loadingMessage}</div>;
  }

  const [response] = responses || [];

  let totalTodos = 0;
  for (let i = 0; i < responses.length; i++) {
    totalTodos += responses[i].data.length;
  }

  return (
    <div>
      <p data-testid={responsesLengthTestId}>{responses.length}</p>
      <p data-testid={totalTodosLengthTestId}>{totalTodos}</p>
      <p data-testid={isLoadingTestId}>{String(isLoadingMore)}</p>
      <div>{response.data[0]?.message}</div>
      <button
        data-testid={loadMoreTestId}
        type="button"
        onClick={() => setSize((s) => s + 1)}
        disabled={responses[responses.length - 1].data.length === 0}
      >
        Load more
      </button>
    </div>
  );
};

describe('useDatxInfinite', () => {
  it('should render data', async () => {
    renderWithConfig(<Todos />);
    screen.getByText(loadingMessage);

    expect(await screen.findByText(message)).toBeInTheDocument();
    expect((await screen.findByTestId('isLoading')).textContent).toBe('false');
  });

  it('should fetch more data if there is any', async () => {
    renderWithConfig(<Todos />);
    // console.log(screen.getByText(loadingMessage));
    // await waitForElementToBeRemoved(screen.getByText(loadingMessage));

    let loadMoreButton = await screen.findByTestId(loadMoreTestId);
    expect(loadMoreButton).toBeInTheDocument();
    // console.log(
    //   'loadMoreButton',
    //   Boolean(loadMoreButton),
    //   (loadMoreButton as HTMLButtonElement).disabled,
    // );

    await userEvent.click(loadMoreButton);

    expect(screen.getByTestId(responsesLengthTestId).textContent).toBe('2');

    loadMoreButton = await screen.findByTestId(loadMoreTestId);
    expect((loadMoreButton as HTMLButtonElement).disabled).toBe(true);
  });

  it('should handle error', async () => {
    server.use(todosError);

    renderWithConfig(<Todos />);

    await screen.findByText(todosErrorDetails);
  });

  it('should handle error on fetch more', async () => {
    renderWithConfig(<Todos />);

    const loadMoreButton = await screen.findByTestId(loadMoreTestId);

    server.use(todosError);
    await userEvent.click(loadMoreButton);

    await screen.findByText(todosErrorDetails);
  });
});
