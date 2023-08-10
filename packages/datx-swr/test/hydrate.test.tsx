import { useDatx } from '@datx/swr';
import { renderHook } from '@testing-library/react';
import { DatxProvider, Expression, Fallback, Hydrate, useInitialize } from '../src';
import { createClient, JsonapiSwrClient } from './datx';

const renderUseDatx = <TExpression extends Expression>({
  query,
  fallback,
}: {
  query: TExpression;
  fallback?: Fallback;
}) => {
  return renderHook(() => useDatx(query), {
    // initialProps: query,
    wrapper: ({ children }: { children: React.ReactNode }) => {
      const client = useInitialize(createClient);

      return (
        <DatxProvider client={client}>
          <Hydrate fallback={fallback}>{children}</Hydrate>
        </DatxProvider>
      );
    },
  });
};

describe('hydrate', () => {
  let client: JsonapiSwrClient;

  beforeEach(() => {
    client = createClient();
  });

  it("should warn if fallback isn't provided", () => {
    const spy = jest.spyOn(console, 'warn').mockImplementation();

    renderUseDatx({ query: { op: 'getOne', type: 'todos', id: '1' } });
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it("should not warn if fallback isn't provided in production", () => {
    const previousNodeEnv = process.env.NODE_ENV;

    process.env.NODE_ENV = 'production';
    const spy = jest.spyOn(console, 'warn').mockImplementation();

    renderUseDatx({ query: { op: 'getOne', type: 'todos', id: '1' } });
    expect(spy).not.toBeCalled();

    process.env.NODE_ENV = previousNodeEnv;
  });

  [
    { op: 'getOne', type: 'todos', id: '1' } as const,
    { op: 'getMany', type: 'todos' } as const,
    { op: 'getAll', type: 'todos' } as const,
    { op: 'getRelatedResources', type: 'todo-lists', id: '1', relation: 'todos' } as const,
    { op: 'getRelatedResource', type: 'todos', id: '1', relation: 'author' } as const,
  ].forEach((query) => {
    it(`should hydrate a ${query.op} query`, async () => {
      const { data: serverResponse } = await client.fetchQuery(query);

      const { result } = renderUseDatx({ query, fallback: client.fallback });

      const { data: clientResponse, isLoading } = result.current;

      expect(isLoading).toBe(false);
      expect(clientResponse).toBeTruthy();
      expect(clientResponse?.data).toEqual(serverResponse?.data);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
