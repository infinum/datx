import * as fetch from 'isomorphic-fetch';

// tslint:disable:no-string-literal

import {config} from '../../src';

import {clearAllCache} from '../../src/cache';
import mockApi from '../utils/api';
import {Event, Image, Organizer, Photo, TestStore, User} from '../utils/setup';

describe('error handling', () => {
  beforeEach(() => {
    config.fetchReference = fetch;
    // tslint:disable-next-line:no-http-string
    config.baseUrl = 'http://example.com/';
    config.getPaginationParams = undefined;
    config.pageInfoParser = undefined;
    clearAllCache();
  });

  it('should handle network failure', async () => {
    const store = new TestStore();

    mockApi({
      name: 'events-1',
      status: 404,
      url: 'event',
    });

    let hasFailed = false;
    try {
      const res = await store.fetchAll('event');
    } catch (response) {
      hasFailed = true;
      const err = response.error;
      expect(err).toBeInstanceOf(Object);
      expect(err.status).toBe(404);
      expect(err.message).toBe('Invalid HTTP status: 404');
    }
    expect(hasFailed).toBe(true);
  });

  it('should handle invalid responses', async () => {
    const store = new TestStore();

    mockApi({
      name: 'invalid',
      url: 'event',
    });

    let hasFailed = false;
    try {
      const res = await store.fetchAll('event');
    } catch (response) {
      hasFailed = true;
      expect(Object.keys(response.error)).toEqual(['name', 'message', 'type']);
    }
    expect(hasFailed).toBe(true);
  });

  it('should handle api error', async () => {
    const store = new TestStore();

    mockApi({
      name: 'error',
      url: 'event',
    });

    let hasFailed = false;
    try {
      const res = await store.fetchAll('event');
    } catch (response) {
      hasFailed = true;
      expect(response.error[0]).toBeInstanceOf(Object);
    }
    expect(hasFailed).toBe(true);
  });

  it('should handle api error on save', async () => {
    const store = new TestStore();

    const record = new Event({
      title: 'Test',
    });
    store.add(record);

    mockApi({
      method: 'POST',
      name: 'error',
      url: 'event',
    });

    let hasFailed = false;
    try {
      const res = await record.save();
    } catch (response) {
      hasFailed = true;
      expect(response.error[0]).toBeInstanceOf(Object);
    }
    expect(hasFailed).toBe(true);
  });

  it('should handle api error on remove', async () => {
    const store = new TestStore();

    mockApi({
      name: 'events-1',
      url: 'event',
    });

    const response = await store.fetchAll('event');

    mockApi({
      method: 'DELETE',
      name: 'error',
      url: 'event/1',
    });

    const event = response.data && response.data[0] as Event;

    expect(event).toBeInstanceOf(Event);
    if (event) {
      let hasFailed = false;
      try {
        await event.destroy();
      } catch (response) {
        hasFailed = true;
        expect(response.error[0]).toBeInstanceOf(Object);
      }
      expect(hasFailed).toBe(true);
    }
  });
});
