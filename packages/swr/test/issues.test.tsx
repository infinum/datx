import { createFetcher } from '@datx/swr';
import { createClient } from './datx';

describe('issues', () => {
  it('should use static endpoint for building an URL when fetching related resources', async () => {
    const client = createClient();
    const fetcher = createFetcher(client);

    const requestSpy = jest.spyOn(client, 'request');

    await fetcher({ op: 'getRelatedResource', type: 'withEndpoint', id: '1', relation: 'related' });

    expect(requestSpy).toBeCalledWith(
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

    expect(requestSpy).toBeCalledWith(
      expect.stringContaining('/with-endpoint/2/related'),
      undefined,
      undefined,
      expect.anything(),
    );

    expect(requestSpy).toBeCalledTimes(2);
  });
});
