import { config } from '@datx/jsonapi';
import { createFetcher } from '@datx/swr';
import { createClient } from './datx';

describe('issues', () => {
  it('should use static endpoint for building an URL when fetching related resources', async () => {
    const client = createClient();
    const fetcher = createFetcher(client);

    const requestSpySingle = jest.spyOn(client, 'requestSingle');
    const requestSpyCollection = jest.spyOn(client, 'requestCollection');

    await fetcher({ op: 'getRelatedResource', type: 'withEndpoint', id: '1', relation: 'related' });

    expect(requestSpySingle).toBeCalledWith(
      expect.stringContaining('/with-endpoint/1/related'),
      undefined,
      undefined,
      expect.anything(),
    );

    await fetcher({
      op: 'getRelatedResources',
      type: 'withEndpoint',
      id: '2',
      relation: 'related',
    });

    expect(requestSpyCollection).toBeCalledWith(
      expect.stringContaining('/with-endpoint/2/related'),
      undefined,
      undefined,
      expect.anything(),
    );

    expect(requestSpySingle).toBeCalledTimes(1);
    expect(requestSpyCollection).toBeCalledTimes(1);
  });

  it('should not duplicate query params when relation query is used', async () => {
    const client = createClient();
    const fetcher = createFetcher(client);

    const fetchSpy = jest.spyOn(config, 'fetchReference');

    await fetcher({
      op: 'getRelatedResources',
      type: 'withEndpoint',
      id: '1',
      relation: 'related',
      queryParams: {
        custom: ['custom=1'],
      },
    });

    expect(fetchSpy).toBeCalledWith(expect.stringMatching('\\?custom=1$'), expect.anything());

    await fetcher({
      op: 'getRelatedResource',
      type: 'withEndpoint',
      id: '1',
      relation: 'related',
      queryParams: {
        custom: ['custom=1'],
      },
    });

    expect(fetchSpy).toHaveBeenLastCalledWith(
      expect.stringMatching('\\?custom=1$'),
      expect.anything(),
    );
  });

  it('should not allow to use client.request', async () => {
    const client = createClient();

    expect(() => client.request('test')).toThrowError();
  });
});
