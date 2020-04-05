/* eslint-disable max-classes-per-file */

import { autorun } from 'mobx';

import { config } from '../../src';

import { clearAllCache } from '../../src/cache';
import { setupNetwork, setRequest } from '../utils/api';
import { Event, TestStore } from '../utils/setup';
import { CachingStrategy } from '../../src/enums/CachingStrategy';

function sleep(duration: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, duration));
}

describe('caching', () => {
  beforeEach(() => {
    config.baseUrl = 'https://example.com/';
    config.cache = CachingStrategy.CACHE_FIRST;
    clearAllCache();
    setupNetwork();
  });

  describe('fetch caching', () => {
    beforeEach(() => {
      clearAllCache();
      setupNetwork();
    });

    it('should cache fetch requests', async () => {
      setRequest({
        name: 'event-1',
        url: 'event/12345',
      });

      const store = new TestStore();
      const events = await store.fetch(Event, '12345');
      const event = events.data as Event;

      expect(event).toBeInstanceOf(Object);
      expect(event.meta.id).toBe('12345');

      const events2 = await store.fetch(Event, '12345');

      expect(events2.snapshot).toEqual(events.snapshot);
    });

    it('should clear fetch cache on removeAll', async () => {
      setRequest({
        name: 'event-1',
        url: 'event/12345',
      });

      const store = new TestStore();
      const events = await store.fetch('event', '12345');
      const event = events.data as Event;

      expect(event.meta.id).toBe('12345');

      store.removeAll(Event);

      const req2 = setRequest({
        name: 'event-1',
        url: 'event/12345',
      });

      const events2 = await store.fetch(Event, '12345');
      const event2 = events2.data as Event;

      expect(event2.meta.id).toBe('12345');
      expect(req2.isDone()).toBe(true);
    });

    it('should ignore fetch cache if skipCache is true', async () => {
      setRequest({
        name: 'event-1',
        url: 'event/12345',
      });

      const store = new TestStore();
      const events = await store.fetch('event', '12345');
      const event = events.data as Event;

      expect(event).toBeInstanceOf(Object);
      expect(event.meta.id).toBe('12345');

      const req = setRequest({
        name: 'event-1',
        url: 'event/12345',
      });

      const events2 = await store.fetch(Event, '12345', { cacheOptions: { skipCache: true } });
      const event2 = events2.data as Event;

      expect(events2).not.toEqual(events);
      expect(event2).toBeInstanceOf(Object);
      expect(event2.meta.id).toBe('12345');
      expect(req.isDone()).toBe(true);
    });

    it('should not cache fetch if the response was an jsonapi error', async () => {
      setRequest({
        name: 'error',
        url: 'event/12345',
      });

      const store = new TestStore();
      let hasFailed = false;

      try {
        await store.fetch(Event, '12345');
      } catch (resp) {
        expect(resp.error).toBeInstanceOf(Array);
        hasFailed = true;
      }
      expect(hasFailed).toBe(true);

      setRequest({
        name: 'event-1',
        url: 'event/12345',
      });

      const events2 = await store.fetch(Event, '12345');
      const event2 = events2.data as Event;

      expect(event2).toBeInstanceOf(Object);
      expect(event2.meta.id).toBe('12345');
    });

    it('should not cache fetch if the response was an http error', async () => {
      setRequest({
        name: 'event-1',
        status: 500,
        url: 'event/12345',
      });

      const store = new TestStore();
      let hasFailed = false;

      try {
        await store.fetch('event', '12345');
      } catch (e) {
        hasFailed = true;
        expect(e).toBeInstanceOf(Object);
      }
      expect(hasFailed).toBe(true);

      setRequest({
        name: 'event-1',
        url: 'event/12345',
      });

      const events2 = await store.fetch(Event, '12345');
      const event2 = events2.data as Event;

      expect(event2).toBeInstanceOf(Object);
      expect(event2.meta.id).toBe('12345');
    });
  });

  describe('fetchAll caching', () => {
    beforeEach(() => {
      clearAllCache();
      setupNetwork();
    });

    it('should cache fetchAll requests', async () => {
      setRequest({
        name: 'events-1',
        url: 'event',
      });

      const store = new TestStore();
      const events = await store.fetchAll(Event);
      const event = events.data as Array<Event>;

      expect(event).toBeInstanceOf(Array);
      expect(event.length).toBe(4);

      const events2 = await store.fetchAll(Event);

      expect(events2.snapshot).toEqual(events.snapshot);
    });

    it('should clear fetchAll cache on removeAll', async () => {
      setRequest({
        name: 'events-1',
        url: 'event',
      });

      const store = new TestStore();
      const events = await store.fetchAll(Event);
      const event = events.data as Array<Event>;

      expect(event).toBeInstanceOf(Array);
      expect(event.length).toBe(4);

      store.removeAll(Event);

      const req2 = setRequest({
        name: 'events-1',
        url: 'event',
      });

      const events2 = await store.fetchAll(Event);

      expect(events2.data).toHaveLength(4);
      expect(req2.isDone()).toBe(true);
    });

    it('should ignore fetchAll cache if force is true', async () => {
      setRequest({
        name: 'events-1',
        url: 'event',
      });

      const store = new TestStore();
      const events = await store.fetchAll('event');

      expect(events.data).toBeInstanceOf(Array);
      expect(events.data).toHaveLength(4);

      setRequest({
        name: 'events-1',
        url: 'event',
      });

      const events2 = await store.fetchAll('event', { cacheOptions: { skipCache: true } });

      expect(events2).not.toEqual(events);
      expect(events2.data).toBeInstanceOf(Array);
      expect(events2.data).toHaveLength(4);
    });

    it('should not cache fetchAll if the response was an jsonapi error', async () => {
      setRequest({
        name: 'error',
        url: 'event',
      });

      const store = new TestStore();
      let hasFailed = false;

      try {
        await store.fetchAll('event');
      } catch (resp) {
        hasFailed = true;
        expect(resp.error).toBeInstanceOf(Array);
      }
      expect(hasFailed).toBe(true);

      setRequest({
        name: 'events-1',
        url: 'event',
      });

      const events2 = await store.fetchAll('event');

      expect(events2.data).toBeInstanceOf(Array);
      expect(events2.data).toHaveLength(4);
    });

    it('should not cache fetchAll if the response was an http error', async () => {
      setRequest({
        name: 'events-1',
        status: 500,
        url: 'event',
      });

      const store = new TestStore();
      let hasFailed = false;

      try {
        await store.fetchAll('event');
      } catch (e) {
        hasFailed = true;
        expect(e).toBeInstanceOf(Object);
      }
      expect(hasFailed).toBe(true);

      setRequest({
        name: 'events-1',
        url: 'event',
      });

      const events2 = await store.fetchAll('event');

      expect(events2.data).toBeInstanceOf(Array);
      expect(events2.data).toHaveLength(4);
    });

    it('should reset cache when resetting the store', async () => {
      const store = new TestStore();

      setRequest({ name: 'event-1', url: 'event' });
      await store.fetchAll('event');

      store.reset();

      const mockedApi = setRequest({ name: 'event-1', url: 'event' });

      await store.fetchAll('event');

      expect(mockedApi.isDone()).toBe(true);
    });
  });

  describe('caching strategies', () => {
    let baseCacheStrategy: CachingStrategy;

    beforeEach(() => {
      baseCacheStrategy = config.cache;
    });

    afterEach(() => {
      config.cache = baseCacheStrategy;
    });

    describe('NETWORK_ONLY', () => {
      beforeEach(() => {
        config.cache = CachingStrategy.NETWORK_ONLY;
      });

      it('should fail if no network', async () => {
        const store = new TestStore();

        setRequest({
          url: 'image',
          status: 0,
          responseFn: () => '',
        });

        try {
          await store.getMany('image');
          throw Error('The request should fail');
        } catch (response) {
          expect(response?.error?.toString()).toBe('Error: Network not available');
        }
      });

      it('should use network in all calls', async () => {
        const store = new TestStore();

        setRequest({
          url: 'image',
          responseFn: () => '{data: []}',
        });

        setRequest({
          url: 'image',
          responseFn: () => '{data: []}',
        });

        await store.getMany('image');
        const response = await store.getMany('image');

        expect(response.isSuccess).toBeTruthy();
      });
    });

    describe('NETWORK_FIRST', () => {
      beforeEach(() => {
        config.cache = CachingStrategy.NETWORK_FIRST;
      });

      it('should use network if available', async () => {
        const store = new TestStore();

        setRequest({
          url: 'image',
          responseFn: () => '{data: []}',
        });

        const response = await store.getMany('image');

        expect(response.isSuccess).toBeTruthy();
      });

      it('should fall back to cache if network not available', async () => {
        const store = new TestStore();

        setRequest({
          url: 'image',
          responseFn: () => '{data: []}',
        });

        await store.getMany('image');
        const response = await store.getMany('image');

        expect(response.isSuccess).toBeTruthy();
      });

      it('should fail if network and cache not available', async () => {
        const store = new TestStore();

        setRequest({
          url: 'image',
          status: 0,
          responseFn: () => '',
        });

        try {
          await store.getMany('image');
          throw Error('The request should fail');
        } catch (response) {
          expect(response?.error?.toString()).toBe('Error: Network not available');
        }
      });
    });

    describe('STALE_WHILE_REVALIDATE', () => {
      beforeEach(() => {
        config.cache = CachingStrategy.STALE_WHILE_REVALIDATE;
      });

      it('should show new data if no cache', async () => {
        const store = new TestStore();

        setRequest({
          url: 'event/1',
          name: 'event-1',
        });

        const response = await store.getOne(Event, '1');
        const event = response?.data;

        if (event instanceof Event) {
          expect(event?.title).toBe('Test 1');
        } else {
          throw new Error('Response is wrong');
        }
      });

      it('should use cached data if available', async () => {
        const store = new TestStore();

        setRequest({
          url: 'event/1',
          name: 'event-1',
        });

        setRequest({
          url: 'event/1',
          status: 0,
          responseFn: () => '',
        });

        await store.getOne(Event, '1');
        const response = await store.getOne(Event, '1');
        const event = response?.data;

        if (event instanceof Event) {
          expect(event?.title).toBe('Test 1');
        } else {
          throw new Error('Response is wrong');
        }
      });

      it('should update the cache after call is done', async () => {
        const store = new TestStore();

        setRequest({
          url: 'event/1',
          name: 'event-1',
        });

        setRequest({
          url: 'event/1',
          name: 'event-1b',
        });

        setRequest({
          url: 'event/1',
          status: 0,
          responseFn: () => '',
        });

        const response1 = await store.getOne(Event, '1');

        // Initial response
        const event1 = response1?.data;

        if (event1 instanceof Event) {
          expect(event1?.meta.id).toBe('12345');
        } else {
          throw new Error('Response is wrong');
        }

        const response2 = await store.getOne(Event, '1');
        // Cached 1st response
        const event2 = response2?.data;

        if (event2 instanceof Event) {
          expect(event2?.meta.id).toBe('12345');
        } else {
          throw new Error('Response is wrong');
        }

        await sleep(1);
        const response3 = await store.getOne(Event, '1');

        // Cached 2nd response
        const event3 = response3?.data;

        if (event3 instanceof Event) {
          expect(event3?.meta.id).toBe('1');
        } else {
          throw new Error('Response is wrong');
        }
      });
    });

    describe('CACHE_ONLY', () => {
      beforeEach(() => {
        config.cache = CachingStrategy.CACHE_ONLY;
      });

      it('should fail if no cache', async () => {
        const store = new TestStore();

        try {
          await store.getMany(Event);
          throw Error('The request should fail');
        } catch (response) {
          expect(response?.error?.toString()).toBe('Error: No cache for this request');
        }
      });

      it('should use cache in all calls', async () => {
        const store = new TestStore();

        setRequest({
          url: 'event/1',
          name: 'event-1',
        });

        await store.getOne(Event, '1', {
          cacheOptions: { cachingStrategy: CachingStrategy.NETWORK_FIRST },
        });

        await store.getOne(Event, '1');
        await store.getOne(Event, '1');
        await store.getOne(Event, '1');
        const response = await store.getOne(Event, '1');
        const event = response?.data;

        if (event instanceof Event) {
          expect(event?.title).toBe('Test 1');
        } else {
          throw new Error('Response is wrong');
        }
      });
    });

    describe('CACHE_FIRST', () => {
      beforeEach(() => {
        config.cache = CachingStrategy.CACHE_FIRST;
      });

      it('should use cache if available', async () => {
        const store = new TestStore();

        setRequest({
          url: 'event/1',
          name: 'event-1',
        });

        await store.getOne(Event, '1', {
          cacheOptions: { cachingStrategy: CachingStrategy.NETWORK_FIRST },
        });

        await store.getOne(Event, '1');
        await store.getOne(Event, '1');
        await store.getOne(Event, '1');
        const response = await store.getOne(Event, '1');
        const event = response?.data;

        if (event instanceof Event) {
          expect(event?.title).toBe('Test 1');
        } else {
          throw new Error('Response is wrong');
        }
      });

      it('should fall back to network if cache not available', async () => {
        const store = new TestStore();

        setRequest({
          url: 'event/1',
          name: 'event-1',
        });

        await store.getOne(Event, '1');

        await store.getOne(Event, '1');
        await store.getOne(Event, '1');
        await store.getOne(Event, '1');
        const response = await store.getOne(Event, '1');
        const event = response?.data;

        if (event instanceof Event) {
          expect(event?.title).toBe('Test 1');
        } else {
          throw new Error('Response is wrong');
        }
      });

      it('should fail if network and cache not available', async () => {
        const store = new TestStore();

        setRequest({
          url: 'image',
          status: 0,
          responseFn: () => '',
        });

        try {
          await store.getMany('image');
          throw Error('The request should fail');
        } catch (response) {
          expect(response?.error?.toString()).toBe('Error: Network not available');
        }
      });

      it('should not use a dirty model for caching', async () => {
        const store = new TestStore();

        setRequest({
          url: 'event/1',
          name: 'event-1',
        });

        const eventResponse = await store.getOne(Event, '1', {
          cacheOptions: { cachingStrategy: CachingStrategy.NETWORK_FIRST },
        });

        const originalEvent = eventResponse.data as Event;

        originalEvent.title = 'Modified title';

        const response = await store.getOne(Event, '1');
        const event = response?.data;

        if (event instanceof Event) {
          expect(event?.title).toBe('Test 1');
        } else {
          throw new Error('Response is wrong');
        }
      });

      it('should support cache serialization', async () => {
        const store = new TestStore();

        setRequest({
          url: 'event/1',
          name: 'event-1',
        });

        await store.getOne(Event, '1', {
          cacheOptions: { cachingStrategy: CachingStrategy.NETWORK_FIRST },
        });

        const storeJson = store.toJSON();

        const rawStore = JSON.parse(JSON.stringify(storeJson));

        clearAllCache();

        try {
          await store.getOne(Event, '1');
          throw Error('The request should fail');
        } catch (e) {
          expect(e.error.message).toBe('Unexpected request: GET https://example.com/event/1');
        }

        const store2 = new TestStore(rawStore);

        const response1 = await store.getOne(Event, '1');
        const event1 = response1?.data;

        if (event1 instanceof Event) {
          expect(event1?.title).toBe('Test 1');
        } else {
          throw new Error('Response is wrong');
        }

        const response = await store2.getOne(Event, '1');
        const event = response?.data;

        if (event instanceof Event) {
          expect(event?.title).toBe('Test 1');
        } else {
          throw new Error('Response is wrong');
        }
      });
    });

    describe('STALE_AND_UPDATE', () => {
      beforeEach(() => {
        config.cache = CachingStrategy.STALE_AND_UPDATE;
      });

      it('should show new data if no cache', async () => {
        const store = new TestStore();

        setRequest({
          url: 'event/1',
          name: 'event-1',
        });

        const response = await store.getOne(Event, '1');
        const event = response?.data;

        if (event instanceof Event) {
          expect(event?.title).toBe('Test 1');
        } else {
          throw new Error('Response is wrong');
        }
      });

      it('should use cached data if available', async () => {
        const store = new TestStore();

        setRequest({
          url: 'event/1',
          name: 'event-1',
        });

        await store.getOne(Event, '1');
        await store.getOne(Event, '1');
        await store.getOne(Event, '1');
        const response = await store.getOne(Event, '1');
        const event = response?.data;

        if (event instanceof Event) {
          expect(event?.title).toBe('Test 1');
        } else {
          throw new Error('Response is wrong');
        }
      });

      it('should update the cache and response after call is done', async () => {
        const store = new TestStore();

        setRequest({
          url: 'event/1',
          name: 'event-1',
        });

        const response = await store.getOne(Event, '1');

        let autorunCounter1 = 0;
        let autorunCounter2 = 0;

        autorun(() => {
          const event = response?.data as Event;

          autorunCounter1++;
          expect(event.id).toBe('12345');
        });

        const req = setRequest({
          url: 'event/1',
          name: 'event-1b',
        });

        const response2 = await store.getOne(Event, '1');
        let expectedId = '12345';

        autorun(() => {
          const event2 = response2?.data as Event;

          autorunCounter2++;
          expect(event2.id).toBe(expectedId);
          expectedId = '1';
        });

        expect(autorunCounter1).toBe(1);

        await sleep(0);

        const event3 = response2?.data as Event;

        expect(req.isDone()).toBe(true);
        expect(event3.id).toBe('1');
        expect(autorunCounter2).toBe(2);
      });
    });

    it('should use maxAge', async () => {
      config.cache = CachingStrategy.CACHE_FIRST;

      const store = new TestStore();

      setRequest({
        url: 'event/1',
        name: 'event-1',
      });

      await store.getOne(Event, '1', {
        cacheOptions: { cachingStrategy: CachingStrategy.NETWORK_FIRST },
      });

      await store.getOne(Event, '1');
      await store.getOne(Event, '1');
      await store.getOne(Event, '1');
      const response = await store.getOne(Event, '1');
      const event = response?.data;

      if (event instanceof Event) {
        expect(event?.title).toBe('Test 1');
      } else {
        throw new Error('Response is wrong');
      }

      setRequest({
        url: 'event/1',
        status: 0,
        responseFn: () => '',
      });

      await sleep(1);

      try {
        await store.getOne(Event, '1', { cacheOptions: { maxAge: 0 } });
        throw Error('The request should fail');
      } catch (errorResponse) {
        expect(errorResponse?.error?.toString()).toBe('Error: Network not available');
      }
    });

    it('should fail if invalid strategy', async () => {
      const store = new TestStore();

      try {
        await store.getMany(Event, { cacheOptions: { cachingStrategy: 123 } });
        throw Error('The request should fail');
      } catch (response) {
        expect(response?.error?.toString()).toBe('Error: Invalid caching strategy');
      }
    });
  });
});
