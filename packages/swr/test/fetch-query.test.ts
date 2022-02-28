import { createClient, Client } from './datx';
import { server } from './mocks/server';
import { todosError } from './mocks/todos';
import { Todo } from './models/Todo';
import { queryTodos } from './queries';

describe('fetchQuery', () => {
  let client: Client;

  beforeEach(() => {
    client = createClient();
  });

  test('should fetch query', async () => {
    const response = await client.fetchQuery(queryTodos);

    const key = Todo.type;

    expect(response[key].data).toBeTruthy();
    expect((response[key].data as Todo[]).length).toBe(1);
  });

  test('client stores fallback under the appropriate key', async () => {
    const key = Todo.type;
    await client.fetchQuery(queryTodos);

    expect(Object.keys(client.fallback)[0]).toBe(key);
    expect(client.fallback[key]).toBeTruthy();
    expect(client.fallback[key].length).toBe(1);
  });

  test('should throw on API error', async () => {
    server.use(todosError);

    await expect(client.fetchQuery(queryTodos)).rejects.toStrictEqual([
      {
        detail: 'Not authorized on Sundays.',
        status: '403',
      },
    ]);
  });

  // describe('Conditional Data Fetching', () => {
  //   test('should throw if variables are used inside query but they are not provided', async () => {
  //     await expect(client.fetchQuery(queryTodos)).rejects.toThrow();
  //   });

  //   test('should throw if variables are used inside query but properties are undefined', async () => {
  //     await expect(client.fetchQuery(queryTodos)).rejects.toThrow();
  //   });
  // });
});
