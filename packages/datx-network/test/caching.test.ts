import { MockBaseRequest } from './mock/MockBaseRequest';
import { setUrl, cache, CachingStrategy, Response, BaseRequest } from '../src';
import { PureModel } from '@datx/core';
import {
  getCacheByCollection,
  saveCacheForCollection,
  clearAllCache,
} from '../src/interceptors/cache';

const sleep = (duration: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, duration));

describe('caching', () => {
  it('should fail if no cache with CacheOnly strategy', async () => {
    const request1 = new MockBaseRequest('foobar');

    const request2 = request1.pipe(setUrl('foobar'), cache(CachingStrategy.CacheOnly));

    try {
      await request2.fetch();
      expect(true).toBe(false);
    } catch (resp) {
      expect(resp).toBeInstanceOf(Response);
    }

    expect(request2['_config'].fetchReference).toHaveBeenCalledTimes(0);
  });

  describe('caching strategies', () => {
    let request: BaseRequest<any, any> = new MockBaseRequest('foobar').pipe(setUrl('/test'));

    describe('NetworkOnly', () => {
      beforeEach(() => {
        request = request.pipe(cache(CachingStrategy.NetworkOnly));
      });

      it('should fail if no network', async () => {
        request['resetMock']({ status: 0 }, false);
        try {
          await request.fetch();
          throw Error('The request should fail');
        } catch (response) {
          expect((response as Response<PureModel>)?.error).toEqual(
            new Error('Network not available'),
          );
        }
      });

      it('should use network in all calls', async () => {
        request['resetMock']({ status: 200, json: async () => ({}) });

        await request.fetch();
        const response = await request.fetch();

        expect(response.isSuccess).toBeTruthy();
        expect(request['_config'].fetchReference).toBeCalledTimes(2);
      });
    });

    describe('NetworkFirst', () => {
      beforeEach(() => {
        request = request.pipe(cache(CachingStrategy.NetworkFirst));
      });

      it('should use network if available', async () => {
        request['resetMock']({ status: 200, json: async () => ({}) });

        const response = await request.fetch();

        expect(response.isSuccess).toBeTruthy();
      });

      it('should fall back to cache if network not available', async () => {
        request['resetMock']({ status: 200, json: async () => ({}) });
        await request.fetch();

        request['resetMock']({ status: 0 }, false);
        const response = await request.fetch();

        expect(response.isSuccess).toBeTruthy();
      });

      it('should fail if network and cache not available', async () => {
        request['resetMock']({ status: 0 }, false);

        try {
          await request.fetch();
          throw Error('The request should fail');
        } catch (response) {
          expect((response as Response<PureModel>)?.error).toEqual(
            new Error('Network not available'),
          );
        }
      });
    });

    describe('StaleWhileRevalidate', () => {
      beforeEach(() => {
        request = request.pipe(cache(CachingStrategy.StaleWhileRevalidate));
      });

      it('should show new data if no cache', async () => {
        request['resetMock']({ status: 200, json: async () => ({ foo: 1 }) });

        const response = await request.fetch();
        const test = response?.data;

        if (test instanceof PureModel) {
          expect(test['foo']).toBe(1);
        } else {
          throw new Error('Response is wrong');
        }
      });

      it('should use cached data if available', async () => {
        request['resetMock']({ status: 200, json: async () => ({ foo: 1 }) });
        await request.fetch();

        request['resetMock']({ status: 0 }, false);
        const response = await request.fetch();

        const test = response?.data;

        if (test instanceof PureModel) {
          expect(test['foo']).toBe(1);
        } else {
          throw new Error('Response is wrong');
        }
      });

      it('should update the cache after call is done', async () => {
        request['resetMock']({ status: 200, json: async () => ({ foo: 1 }) });
        const response1 = await request.fetch();

        // Initial response
        const test1 = response1?.data;

        if (test1 instanceof PureModel) {
          expect(test1['foo']).toBe(1);
        } else {
          throw new Error('Response is wrong');
        }

        request['resetMock']({ status: 200, json: async () => ({ foo: 2 }) });
        const response2 = await request.fetch();

        // Cached 1st response
        const test2 = response2?.data;

        if (test2 instanceof PureModel) {
          expect(test2['foo']).toBe(1);
        } else {
          throw new Error('Response is wrong');
        }

        await sleep(1);
        request['resetMock']({ status: 0 }, false);
        const response3 = await request.fetch();

        // Cached 2nd response
        const test3 = response3?.data;

        if (test3 instanceof PureModel) {
          expect(test3['foo']).toBe(2);
        } else {
          throw new Error('Response is wrong');
        }
      });
    });

    describe('CacheOnly', () => {
      beforeEach(() => {
        request = request.pipe(cache(CachingStrategy.CacheOnly));
      });

      it('should fail if no cache', async () => {
        request['resetMock']({ status: 0 }, false);

        try {
          await request.fetch();
          throw Error('The request should fail');
        } catch (response) {
          expect((response as Response<PureModel>)?.error?.toString()).toBe(
            'Error: No cache for this request',
          );
        }
      });

      it('should use cache in all calls', async () => {
        const requestNetwork = request.pipe(cache(CachingStrategy.NetworkFirst));
        requestNetwork['resetMock']({ status: 200, json: async () => ({ foo: 1 }) });
        await requestNetwork.fetch();

        request['resetMock']({ status: 0 }, false);
        await request.fetch();
        await request.fetch();
        await request.fetch();
        const response = await request.fetch();

        const test = response?.data;

        if (test instanceof PureModel) {
          expect(test['foo']).toBe(1);
        } else {
          throw new Error('Response is wrong');
        }
      });
    });

    describe('CacheFirst', () => {
      beforeEach(() => {
        request = request.pipe(cache(CachingStrategy.CacheFirst));
      });

      it('should use cache if available', async () => {
        request['resetMock']({ status: 200, json: async () => ({ foo: 1 }) });
        await request.pipe(cache(CachingStrategy.NetworkFirst)).fetch();

        request['resetMock']({ status: 0 }, false);
        await request.fetch();
        await request.fetch();
        await request.fetch();
        const response = await request.fetch();

        const test = response?.data;

        if (test instanceof PureModel) {
          expect(test['foo']).toBe(1);
        } else {
          throw new Error('Response is wrong');
        }
      });

      it('should fall back to network if cache not available', async () => {
        request['resetMock']({ status: 200, json: async () => ({ foo: 1 }) });
        await request.fetch();

        request['resetMock']({ status: 0 }, false);
        await request.fetch();
        await request.fetch();
        const response = await request.fetch();

        const test = response?.data;

        if (test instanceof PureModel) {
          expect(test['foo']).toBe(1);
        } else {
          throw new Error('Response is wrong');
        }
      });

      it('should fail if network and cache not available', async () => {
        request['resetMock']({ status: 0 }, false);

        try {
          await request.fetch();
          throw Error('The request should fail');
        } catch (response) {
          expect((response as Response<PureModel>)?.error?.toString()).toBe(
            'Error: Network not available',
          );
        }
      });

      it('should not use a dirty model for caching', async () => {
        request['resetMock']({ status: 200, json: async () => ({ foo: 1 }) });
        const firstResponse = await request.fetch();
        const firstTest = firstResponse.data;
        firstTest.foo = 2;

        request['resetMock']({ status: 0 }, false);
        const response = await request.fetch();
        const test = response?.data;

        if (test instanceof PureModel) {
          expect(test['foo']).toBe(1);
        } else {
          throw new Error('Response is wrong');
        }
      });

      it('should support cache serialization', async () => {
        request['resetMock']({ status: 200, json: async () => ({ foo: 1 }) });

        await request.pipe(cache(CachingStrategy.NetworkFirst)).fetch();

        const cacheJson = getCacheByCollection();

        const rawCache = JSON.parse(JSON.stringify(cacheJson));

        clearAllCache();

        request['resetMock']({ status: 0 }, false);
        try {
          await request.fetch();
          throw Error('The request should fail');
        } catch (response) {
          expect((response as Response<PureModel>)?.error?.toString()).toBe(
            'Error: Network not available',
          );
        }

        saveCacheForCollection(rawCache);

        const response = await request.fetch();
        const test = response?.data;

        if (test instanceof PureModel) {
          expect(test['foo']).toBe(1);
        } else {
          throw new Error('Response is wrong');
        }
      });
    });

    describe('StaleAndUpdate', () => {
      beforeEach(() => {
        request = request.pipe(cache(CachingStrategy.StaleAndUpdate));
      });

      it('should show new data if no cache', async () => {
        request['resetMock']({ status: 200, json: async () => ({ foo: 1 }) });
        const response1 = await request.fetch();

        const test1 = response1?.data;
        if (test1 instanceof PureModel) {
          expect(test1['foo']).toBe(1);
        } else {
          throw new Error('Response is wrong');
        }
      });

      it('should use cached data if available', async () => {
        request['resetMock']({ status: 200, json: async () => ({ foo: 1 }) });
        await request.fetch();

        request['resetMock']({ status: 0 }, false);
        await request.fetch();
        await request.fetch();
        const response = await request.fetch();
        const test = response?.data;

        if (test instanceof PureModel) {
          expect(test['foo']).toBe(1);
        } else {
          throw new Error('Response is wrong');
        }
      });

      it('should fail if invalid strategy', async () => {
        request = request.pipe(cache(-9999));

        try {
          await request.fetch();
          throw Error('The request should fail');
        } catch (response) {
          expect((response as Response<PureModel>)?.error?.toString()).toBe(
            'Error: Invalid caching strategy',
          );
        }
      });
    });
  });
});
