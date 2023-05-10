import { unstable_serialize } from 'swr';
import { createClient, JsonapiSwrClient } from './datx';
import { message, name } from './mocks/handlers';
import { server } from './mocks/server';
import { todosError } from './mocks/todos';
import { Person } from './models/Person';
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

  test('should fetch getMany query', async () => {
    const res = await client.fetchQuery(queryTodos);
    const data = res?.data;

    expect(data).toBeTruthy();
    expect((data?.data as Array<Todo>).length).toBe(1);
  });

  test('should fetch getAll query', async () => {
    const res = await client.fetchQuery(() => ({ op: 'getAll', type: 'todos' } as const));
    const data = res?.data;

    expect(data).toBeTruthy();
    expect(data?.data?.length).toBe(1);
    expect(data?.responses.length).toBe(1);
    expect(data?.lastResponse).toBeTruthy();
  });

  test('should fetch getOne query', async () => {
    const res = await client.fetchQuery({
      op: 'getOne',
      type: 'todos',
      id: '1',
    } as const);
    const data = res?.data;

    expect(data).toBeTruthy();
    expect(data?.data).toBeInstanceOf(Todo);
  });

  test('should fetch getRelatedResource query', async () => {
    const res = await client.fetchQuery({
      op: 'getRelatedResource',
      type: 'todos',
      id: '1',
      relation: 'author',
    } as const);
    const data = res?.data;

    expect(data).toBeTruthy();
    expect(data?.data).toBeInstanceOf(Person);
    expect(data?.data.name).toBe(name);
  });

  test('should fetch getRelatedResources query', async () => {
    const res = await client.fetchQuery({
      op: 'getRelatedResources',
      type: 'todo-lists',
      id: '1',
      relation: 'todos',
    } as const);
    const data = res?.data;

    expect(data).toBeTruthy();
    expect(data?.data).toBeInstanceOf(Array);
    expect(data?.data.length).toBe(1);
    expect(data?.data[0]).toBeInstanceOf(Todo);
    expect(data?.data[0].message).toBe(message);
  });

  test('should throw on deferrable query', async () => {
    await expect(client.fetchQuery(() => null)).rejects.toBeInstanceOf(Error);
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

  test('should not throw on API error if prefetch is true', async () => {
    server.use(todosError);

    await expect(client.fetchQuery(queryTodos, { prefetch: true })).resolves.toStrictEqual({
      data: undefined,
      error: expect.anything(),
    });
  });

  test('should not throw on API error if prefetch returns true', async () => {
    server.use(todosError);

    await expect(client.fetchQuery(queryTodos, { prefetch: () => true })).resolves.toStrictEqual({
      data: undefined,
      error: expect.anything(),
    });
  });

  test('should not add response to fallback if hydration if false', async () => {
    await client.fetchQuery(queryTodos, { hydrate: false });

    expect(client.fallback).toEqual({});
  });

  test('should add response to fallback by default (hydration: true)', async () => {
    await client.fetchQuery(queryTodos);

    expect(Object.keys(client.fallback).length).toBe(1);
  });

  describe('Conditional Data Fetching', () => {
    test('should throw if null is used as query', async () => {
      await expect(client.fetchQuery(null)).rejects.toThrow();
    });

    test('should throw if null is returned as query fn', async () => {
      await expect(client.fetchQuery(() => null)).rejects.toThrow();
    });

    // test('should throw if variables are used inside query but they are not provided', async () => {
    //   await expect(client.fetchQuery(queryTodos)).rejects.toThrow();
    // });

    // test('should throw if variables are used inside query but properties are undefined', async () => {
    //   await expect(client.fetchQuery(queryTodos)).rejects.toThrow();
    // });
  });
});
