import { Collection, Model } from '@datx/core';
// import nock from 'nock';
import fetch from 'node-fetch';
import { Network, Client, JsonApiQueryBuilder, Request, Response } from '../src';

describe('Request', () => {
  it('should initialize', () => {
    const network = new Network.Promise(fetch);
    const collection = new Collection();
    const client = new Client({
      collection,
      network,
      // @ts-ignore
      QueryBuilder: JsonApiQueryBuilder,
      request: Request,
    });
    expect(client).toBeTruthy();
  });

  it('throw if no url is set', async () => {
    const network = new Network.Promise(fetch);
    const collection = new Collection();
    const client = new Client({
      collection,
      network,
      // @ts-ignore
      QueryBuilder: JsonApiQueryBuilder,
      request: Request,
    });
    expect(() => client.from(Model).buildRequest()).toThrowError('URL should be defined');
  });

  it('not to throw if baseUrl is set', async () => {
    const network = new Network.Promise(fetch);
    const collection = new Collection();
    const client = new Client({
      collection,
      network,
      // @ts-ignore
      QueryBuilder: JsonApiQueryBuilder,
      request: Request,
      baseUrl: 'https://example.com',
    });
    expect(client.from(Model).buildRequest()).toBeInstanceOf(Request);
  });

  it('not to throw if type is set', async () => {
    const network = new Network.Promise(fetch);
    const collection = new Collection();
    const client = new Client({
      collection,
      network,
      // @ts-ignore
      QueryBuilder: JsonApiQueryBuilder,
      request: Request,
    });
    class TestModel extends Model {
      static type = 'test';
    }
    expect(client.from(TestModel).buildRequest()).toBeInstanceOf(Request);
  });

  it('not to throw if endpoint function is set', async () => {
    const network = new Network.Promise(fetch);
    const collection = new Collection();
    const client = new Client({
      collection,
      network,
      // @ts-ignore
      QueryBuilder: JsonApiQueryBuilder,
      request: Request,
    });
    class TestModel extends Model {
      static endpoint() {
        return 'test';
      }
    }
    expect(client.from(TestModel).buildRequest()).toBeInstanceOf(Request);
  });

  it('not to throw if endpoint string is set', async () => {
    const network = new Network.Promise(fetch);
    const collection = new Collection();
    const client = new Client({
      collection,
      network,
      // @ts-ignore
      QueryBuilder: JsonApiQueryBuilder,
      request: Request,
    });
    class TestModel extends Model {
      static endpoint = 'test';
    }
    expect(client.from(TestModel).buildRequest()).toBeInstanceOf(Request);
  });

  it('should work with the MockPromiseNetwork', async () => {
    const network = new Network.Mock.Promise();
    const collection = new Collection();
    network.setAssertion((url, _options) => {
      expect(url).toBe('test-endpoint');
      return Promise.resolve([{ foo: 123 }]);
    });
    const client = new Client({
      collection,
      network,
      // @ts-ignore
      QueryBuilder: JsonApiQueryBuilder,
      request: Request,
    });
    class TestModel extends Model {
      static endpoint = 'test-endpoint';

      public foo!: number;
    }
    const resp = await client.from(TestModel).buildRequest().fetch();
    expect(resp).toBeInstanceOf(Response);
  });

  it('should work with the MockPromiseNetwork and no collection', async () => {
    const network = new Network.Mock.Promise();
    const collection = new Collection();
    network.setAssertion((url, _options) => {
      expect(url).toBe('test-endpoint');
      return Promise.resolve([{ foo: 123 }, { headers: { 'content-type': 'application/json' } }]);
    });
    const client = new Client({
      collection,
      network,
      // @ts-ignore
      QueryBuilder: JsonApiQueryBuilder,
      request: Request,
    });
    class TestModel extends Model {
      static endpoint = 'test-endpoint';

      public foo!: number;
    }
    const resp = await client.from(TestModel).buildRequest().fetch();
    console.log(resp.data);
    expect(resp).toBeInstanceOf(Response);
    expect(resp.data?.foo).toBe(123);
  });

  // it('throw on server error', async () => {
  //   const network = new Network.Promise(fetch);
  //   const collection = new Collection();
  //   const client = new Client({ collection, network, QueryBuilder: JsonApiQueryBuilder, request: Request });
  //   client.request.update(setUrl('/'));
  //   nock('http://example.com').get('/').reply(404, {});

  //   try {
  //     await client.request.fetch();
  //     expect(true).toBe(false);
  //   } catch (e) {
  //     expect(collection.length).toBe(0);
  //     expect(e).toBeInstanceOf(Response);
  //     expect(e.error).toEqual({ message: 'Invalid HTTP status: 404', status: 404 });
  //   }
  // });

  // it('throw on non-json error response', async () => {
  //   const network = new Network.Promise(fetch);
  //   const collection = new Collection();
  //   const client = new Client({ collection, network });
  //   client.request.update(setUrl('/'));
  //   nock('http://example.com').get('/').reply(404, 'Not found');

  //   try {
  //     await client.request.fetch();
  //     expect(true).toBe(false);
  //   } catch (e) {
  //     expect(collection.length).toBe(0);
  //     expect(e).toBeInstanceOf(Response);
  //     expect(e.error).toEqual({ message: 'Invalid HTTP status: 404', status: 404 });
  //   }
  // });

  // it('throw on non-json success response', async () => {
  //   const network = new Network.Promise(fetch);
  //   const collection = new Collection();
  //   const client = new Client({ collection, network, QueryBuilder: JsonApiQueryBuilder, request: Request });
  //   client.request.update(setUrl('/'));
  //   nock('http://example.com').get('/').reply(200, 'Not valid JSON');

  //   try {
  //     await client.request.fetch();
  //     expect(true).toBe(false);
  //   } catch (e) {
  //     expect(collection.length).toBe(0);
  //     expect(e).toBeInstanceOf(Response);
  //     expect(e.error).toEqual({
  //       message: 'The response is in an unexpected format',
  //       status: 200,
  //     });
  //   }
  // });
});
