import { fetchQuery, Client } from '../src';
import { createClient } from './datx';
import { server } from './mocks/server';
import { todosError } from './mocks/todos';
import { queryTodos } from './queries';

describe('fetchQuery', () => {
  let client: Client;

  beforeEach(() => {
    client = createClient();
  });

  test('should fetch query', async () => {
    const todos = await fetchQuery(client, queryTodos, { shouldFetch: true });

    const key = 'http://localhost:3000/todos';
    const rawResponse = {
      response: {
        data: {
          data: [
            {
              attributes: {
                message: 'JSON:API paints my bikeshed!',
              },
              id: '1',
              type: 'todos',
            },
          ],
        },
        headers: [
          ['content-type', 'application/json'],
          ['x-powered-by', 'msw'],
        ],
        status: 200,
      },
    };

    expect(todos).toStrictEqual({
      [key]: rawResponse,
    });
  });

  test('should throw on API error', async () => {
    server.use(todosError);

    await expect(fetchQuery(client, queryTodos, { shouldFetch: true })).rejects.toStrictEqual([
      {
        detail: 'Not authorized on Sundays.',
        status: '403',
      },
    ]);
  });

  describe('Conditional Data Fetching', () => {
    test('should throw if variables are used inside query but they are not provided', async () => {
      await expect(fetchQuery(client, queryTodos)).rejects.toThrow();
    });

    test('should throw if variables are used inside query but properties are undefined', async () => {
      await expect(fetchQuery(client, queryTodos, {})).rejects.toThrow();
    });
  });
});
