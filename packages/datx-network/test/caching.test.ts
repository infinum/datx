import { MockBaseRequest } from './mock/MockBaseRequest';
import { setUrl, cache, CachingStrategy, Response } from '../src';

describe('caching', () => {
  it('should fail if no cache with CACHE_ONLY strategy', async () => {
    const request1 = new MockBaseRequest('foobar');

    const request2 = request1.pipe(setUrl('foobar'), cache(CachingStrategy.CacheOnly));

    try {
      await request2.fetch();
      expect(true).toBe(false);
    } catch (resp) {
      expect(resp).toBeInstanceOf(Response);
    }

    expect(request2.config.fetchReference).toHaveBeenCalledTimes(0);
  });
});
