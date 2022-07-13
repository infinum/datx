import { renderHookWithConfig } from './utils';
import { useSWRConfig } from 'swr';
import { getResponseCompare } from '../src/compare';
import { IResponse, Response } from '@datx/jsonapi';
import { useClient } from '../src';

describe('compare', () => {
  it('should return true if response data is identical', async () => {
    const { result } = renderHookWithConfig(() => {
      const { compare } = useSWRConfig();
      const client = useClient();

      const data: IResponse = {
        data: [
          { id: '1', type: 'todos', attributes: { message: 'test' } },
          { id: '2', type: 'todos', attributes: { message: 'test' } },
        ],
      };

      const responseA = new Response({ data, status: 200 }, client, {
        cacheOptions: { skipCache: true },
      });
      const responseB = new Response({ data, status: 200 }, client, {
        cacheOptions: { skipCache: true },
      });

      return getResponseCompare(compare)(responseA, responseB);
    });

    expect(result.current).toBe(true);
  });
});
