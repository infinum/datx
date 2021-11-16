import { Collection } from '@datx/core';
import nock from 'nock';
import fetch from 'node-fetch';
import { Network, NetworkClient, Response, setUrl } from '../src';

describe('Request', () => {
  it('should initialize', () => {
    const network = new Network.Promise('http://example.com/', fetch);
    const store = new Collection();
    const client = new NetworkClient(store, network);
    expect(client).toBeTruthy();
  });

  it('throw if no url is set', async () => {
    const network = new Network.Promise('http://example.com/', fetch);
    const store = new Collection();
    const client = new NetworkClient(store, network);
    expect(() => client.request.fetch()).toThrowError('URL should be defined');
  });

  it('throw on server error', async () => {
    const network = new Network.Promise('http://example.com', fetch);
    const store = new Collection();
    const client = new NetworkClient(store, network);
    client.request.update(setUrl('/'));
    nock('http://example.com').get('/').reply(404, {});

    try {
      await client.request.fetch();
      expect(true).toBe(false);
    } catch (e) {
      expect(store.length).toBe(0);
      expect(e).toBeInstanceOf(Response);
      expect(e.error).toEqual({ message: 'Invalid HTTP status: 404', status: 404 });
    }
  });

  it('throw on non-json error response', async () => {
    const network = new Network.Promise('http://example.com', fetch);
    const store = new Collection();
    const client = new NetworkClient(store, network);
    client.request.update(setUrl('/'));
    nock('http://example.com').get('/').reply(404, 'Not found');

    try {
      await client.request.fetch();
      expect(true).toBe(false);
    } catch (e) {
      expect(store.length).toBe(0);
      expect(e).toBeInstanceOf(Response);
      expect(e.error).toEqual({ message: 'Invalid HTTP status: 404', status: 404 });
    }
  });

  it('throw on non-json success response', async () => {
    const network = new Network.Promise('http://example.com', fetch);
    const store = new Collection();
    const client = new NetworkClient(store, network);
    client.request.update(setUrl('/'));
    nock('http://example.com').get('/').reply(200, 'Not valid JSON');

    try {
      await client.request.fetch();
      expect(true).toBe(false);
    } catch (e) {
      expect(store.length).toBe(0);
      expect(e).toBeInstanceOf(Response);
      expect(e.error).toEqual({
        message: 'The response is in an unexpected format',
        status: 200,
      });
    }
  });
});
