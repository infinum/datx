import { unstable_serialize } from 'swr';
import { createClient, JsonapiSwrClient } from './datx';
import { server } from './mocks/server';
import { todosError } from './mocks/todos';
import { Todo } from './models/Todo';

const queryTodos = {
  op: 'getMany',
  type: 'todos',
} as const;

describe('fetchQuery', () => {
  let client: JsonapiSwrClient;

  beforeEach(() => {
    client = createClient();
  });

  test('should fetch query', async () => {
    const res = await client.fetchQuery(queryTodos);
    const data = res?.data;

    expect(data).toBeTruthy();
    expect((data?.data as Array<Todo>).length).toBe(1);
  });

  test('client stores fallback under the appropriate key', async () => {
    const key = unstable_serialize(queryTodos);

    await client.fetchQuery(queryTodos);
    const fallback = client.fallback;

    expect(Object.keys(fallback)[0]).toBe(key);
    expect(fallback[key]).toBeTruthy();
    // expect((fallback[key].data as Array<Todo>).length).toBe(1);
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
