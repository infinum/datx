import { Collection } from 'datx';
import * as fetch from 'isomorphic-fetch';

import { config, jsonapi } from '../../src';

import { clearAllCache } from '../../src/cache';
import mockApi from '../utils/api';
import { Event, TestStore } from '../utils/setup';

describe('caching', () => {
  beforeEach(() => {
    config.fetchReference = fetch;
    config.baseUrl = 'https://example.com/';
    clearAllCache();
  });

  describe('fetch caching', () => {
    beforeEach(clearAllCache);

    it('should cache fetch requests', async () => {
      mockApi({
        name: 'event-1',
        url: 'event/12345',
      });

      const store = new TestStore();
      const events = await store.fetch(Event, 12345);
      const event = events.data as Event;

      expect(event).toBeInstanceOf(Object);
      expect(event.meta.id).toBe(12345);

      const events2 = await store.fetch(Event, 12345);

      expect(events2).toBe(events);
    });

    it('should clear fetch cache on removeAll', async () => {
      mockApi({
        name: 'event-1',
        url: 'event/12345',
      });

      const store = new TestStore();
      const events = await store.fetch('event', 12345);
      const event = events.data as Event;

      expect(event.meta.id).toBe(12345);

      store.removeAll(Event);

      const req2 = mockApi({
        name: 'event-1',
        url: 'event/12345',
      });

      const events2 = await store.fetch(Event, 12345);
      const event2 = events2.data as Event;
      expect(event2.meta.id).toBe(12345);
      expect(req2.isDone()).toBe(true);
    });

    it('should ignore fetch cache if skipCache is true', async () => {
      mockApi({
        name: 'event-1',
        url: 'event/12345',
      });

      const store = new TestStore();
      const events = await store.fetch('event', 12345);
      const event = events.data as Event;

      expect(event).toBeInstanceOf(Object);
      expect(event.meta.id).toBe(12345);

      const req = mockApi({
        name: 'event-1',
        url: 'event/12345',
      });

      const events2 = await store.fetch(Event, 12345, { skipCache: true });
      const event2 = events2.data as Event;

      expect(events2).not.toEqual(events);
      expect(event2).toBeInstanceOf(Object);
      expect(event2.meta.id).toBe(12345);
      expect(req.isDone()).toBe(true);
    });

    it('should ignore fetch cache if static cache is false', async () => {
      mockApi({
        name: 'event-1',
        url: 'event/12345',
      });

      // tslint:disable-next-line:max-classes-per-file
      class TestCollection extends Collection {
        public static cache = false;

        public static types = [Event];
      }

      const store = new (jsonapi(TestCollection))();

      const events = await store.fetch('event', 12345);
      const event = events.data as Event;

      expect(event).toBeInstanceOf(Object);
      expect(event.meta.id).toBe(12345);

      const req = mockApi({
        name: 'event-1',
        url: 'event/12345',
      });

      const events2 = await store.fetch('event', 12345);
      const event2 = events2.data as Event;

      expect(events2).not.toBe(events);
      expect(event2).toBeInstanceOf(Object);
      expect(event2.meta.id).toBe(12345);
      expect(req.isDone()).toBe(true);
    });

    it('should not cache fetch if the response was an jsonapi error', async () => {
      mockApi({
        name: 'error',
        url: 'event/12345',
      });

      const store = new TestStore();
      let hasFailed = false;
      try {
        await store.fetch(Event, 12345);
      } catch (resp) {
        expect(resp.error).toBeInstanceOf(Array);
        hasFailed = true;
      }
      expect(hasFailed).toBe(true);

      mockApi({
        name: 'event-1',
        url: 'event/12345',
      });

      const events2 = await store.fetch(Event, 12345);
      const event2 = events2.data as Event;

      expect(event2).toBeInstanceOf(Object);
      expect(event2.meta.id).toBe(12345);
    });

    it('should not cache fetch if the response was an http error', async () => {
      mockApi({
        name: 'event-1',
        status: 500,
        url: 'event/12345',
      });

      const store = new TestStore();
      let hasFailed = false;
      try {
        await store.fetch('event', 12345);
      } catch (e) {
        hasFailed = true;
        expect(e).toBeInstanceOf(Object);
      }
      expect(hasFailed).toBe(true);

      mockApi({
        name: 'event-1',
        url: 'event/12345',
      });

      const events2 = await store.fetch(Event, 12345);
      const event2 = events2.data as Event;

      expect(event2).toBeInstanceOf(Object);
      expect(event2.meta.id).toBe(12345);
    });
  });

  describe('fetchAll caching', () => {
    it('should cache fetchAll requests', async () => {
      mockApi({
        name: 'events-1',
        url: 'event',
      });

      const store = new TestStore();
      const events = await store.fetchAll(Event);
      const event = events.data as Array<Event>;

      expect(event).toBeInstanceOf(Array);
      expect(event.length).toBe(4);

      const events2 = await store.fetchAll(Event);

      expect(events2).toBe(events);
    });

    it('should clear fetchAll cache on removeAll', async () => {
      mockApi({
        name: 'events-1',
        url: 'event',
      });

      const store = new TestStore();
      const events = await store.fetchAll(Event);
      const event = events.data as Array<Event>;

      expect(event).toBeInstanceOf(Array);
      expect(event.length).toBe(4);

      store.removeAll(Event);

      const req2 = mockApi({
        name: 'events-1',
        url: 'event',
      });

      const events2 = await store.fetchAll(Event);
      expect(events2.data).toHaveLength(4);
      expect(req2.isDone()).toBe(true);
    });

    it('should ignore fetchAll cache if force is true', async () => {
      mockApi({
        name: 'events-1',
        url: 'event',
      });

      const store = new TestStore();
      const events = await store.fetchAll('event');

      expect(events.data).toBeInstanceOf(Array);
      expect(events.data).toHaveLength(4);

      mockApi({
        name: 'events-1',
        url: 'event',
      });

      const events2 = await store.fetchAll('event', { skipCache: true });

      expect(events2).not.toEqual(events);
      expect(events2.data).toBeInstanceOf(Array);
      expect(events2.data).toHaveLength(4);
    });

    it('should ignore fetchAll cache if static cache is false', async () => {
      mockApi({
        name: 'events-1',
        url: 'event',
      });

      // tslint:disable-next-line:max-classes-per-file
      class TestCollection extends Collection {
        public static cache = false;
      }

      const store = new (jsonapi(TestCollection))();
      const events = await store.fetchAll('event');

      expect(events.data).toBeInstanceOf(Array);
      expect(events.data).toHaveLength(4);

      const req = mockApi({
        name: 'events-1',
        url: 'event',
      });

      const events2 = await store.fetchAll('event');

      expect(events2).not.toBe(events);
      expect(events2.data).toBeInstanceOf(Array);
      expect(events2.data).toHaveLength(4);
      expect(req.isDone()).toBe(true);
    });

    it('should not cache fetchAll if the response was an jsonapi error', async () => {
      mockApi({
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

      mockApi({
        name: 'events-1',
        url: 'event',
      });

      const events2 = await store.fetchAll('event');

      expect(events2.data).toBeInstanceOf(Array);
      expect(events2.data).toHaveLength(4);
    });

    it('should not cache fetchAll if the response was an http error', async () => {
      mockApi({
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

      mockApi({
        name: 'events-1',
        url: 'event',
      });

      const events2 = await store.fetchAll('event');

      expect(events2.data).toBeInstanceOf(Array);
      expect(events2.data).toHaveLength(4);
    });

    it('should reset cache when resetting the store', async () => {
      const store = new TestStore();

      mockApi({ name: 'event-1', url: 'event' });
      await store.fetchAll('event');

      store.reset();

      const mockedApi = mockApi({ name: 'event-1', url: 'event' });
      await store.fetchAll('event');

      expect(mockedApi.isDone()).toBe(true);
    });
  });
});
