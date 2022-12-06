import fetch from 'isomorphic-fetch';

import { setupNetwork, setRequest, confirmNetwork } from '../utils/api';
import { TestStore } from '../utils/setup';
import { config } from '../../src/NetworkUtils';
import { clearAllCache } from '../../src/cache';

describe('headers', () => {
  beforeEach(() => {
    config.fetchReference = fetch;
    config.baseUrl = 'https://example.com/';
    config.defaultFetchOptions = {
      headers: {
        'X-Auth': '12345',
        'content-type': 'application/vnd.api+json',
      },
    };
    clearAllCache();
    setupNetwork();
  });

  afterEach(confirmNetwork);

  it('should send the default headers', async () => {
    setRequest({
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

  it('should send custom headers', async () => {
    setRequest({
      name: 'events-1',
      reqheaders: {
        'X-Auth': '54321',
      },
      url: 'event',
    });

    const store = new TestStore();
    const events = await store.fetchAll('event', {
      networkConfig: {
        headers: {
          'X-Auth': '54321',
        },
      },
    });

    expect(events.data).toBeInstanceOf(Array);
  });

  it('should receive headers', async () => {
    setRequest({
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
