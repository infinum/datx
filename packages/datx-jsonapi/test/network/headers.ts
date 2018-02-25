import * as fetch from 'isomorphic-fetch';

// tslint:disable:no-string-literal
import {config} from '../../src';

import {clearAllCache} from '../../src/cache';
import mockApi from '../utils/api';
import {Event, Image, Organiser, Photo, TestStore, User} from '../utils/setup';

describe('headers', () => {
  beforeEach(() => {
    config.fetchReference = fetch;
    config.baseUrl = 'http://example.com/';
    config.defaultFetchOptions = {
      headers: {
        'X-Auth': '12345',
        'content-type': 'application/vnd.api+json',
      },
    };
    clearAllCache();
  });

  it ('should send the default headers', async () => {
    mockApi({
      name: 'events-1',
      reqheaders: {
        'X-Auth': '12345',
      },
      url: 'event',
    });

    const store = new TestStore();
    const events = await store.fetchAll('event');

    expect(events.data).toBeInstanceOf(Array);
  });

  it ('should send custom headers', async () => {
    mockApi({
      name: 'events-1',
      reqheaders: {
        'X-Auth': '54321',
      },
      url: 'event',
    });

    const store = new TestStore();
    const events = await store.fetchAll('event', {
      headers: {
        'X-Auth': '54321',
      },
    });

    expect(events.data).toBeInstanceOf(Array);
  });

  it ('should receive headers', async () => {
    mockApi({
      headers: {
        'X-Auth': '98765',
      },
      name: 'events-1',
      url: 'event',
    });

    const store = new TestStore();
    const events = await store.fetchAll('event');

    expect(events.data).toBeInstanceOf(Array);
    expect(events.headers && events.headers.get('X-Auth')).toBe('98765');
  });
});
