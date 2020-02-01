/* eslint-disable max-classes-per-file */

import { Collection } from 'datx';
import * as fetch from 'isomorphic-fetch';

import { config, jsonapi } from '../../src';

import { clearAllCache } from '../../src/cache';
import { setupNetwork, setRequest } from '../utils/api';
import { Event, TestStore } from '../utils/setup';

describe('caching', () => {
  beforeEach(() => {
    config.fetchReference = fetch;
    config.baseUrl = 'https://example.com/';
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

      expect(events2).toBe(events);
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

    it('should ignore fetch cache if static cache is false', async () => {
      setRequest({
        name: 'event-1',
        url: 'event/12345',
      });

      class TestCollection extends Collection {
        public static cache = false;

        public static types = [Event];
      }

      const store = new (jsonapi(TestCollection))();

      const events = await store.fetch('event', '12345');
      const event = events.data as Event;

      expect(event).toBeInstanceOf(Object);
      expect(event.meta.id).toBe('12345');

      const req = setRequest({
        name: 'event-1',
        url: 'event/12345',
      });

      const events2 = await store.fetch('event', '12345');
      const event2 = events2.data as Event;

      expect(events2).not.toBe(events);
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

      expect(events2).toBe(events);
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

    it('should ignore fetchAll cache if static cache is false', async () => {
      setRequest({
        name: 'events-1',
        url: 'event',
      });

      class TestCollection extends Collection {
        public static cache = false;
      }

      const store = new (jsonapi(TestCollection))();
      const events = await store.fetchAll('event');

      expect(events.data).toBeInstanceOf(Array);
      expect(events.data).toHaveLength(4);

      const req = setRequest({
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
});
