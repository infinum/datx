import { Collection, Model } from '@datx/core';
import { Network, Client, Request, Response } from '../src';
import { MockQueryBuilder } from './mock/MockQueryBuilder';

describe('Querying', () => {
  it('should work with only models', async () => {
    const network = new Network.Mock.Promise();
    const collection = new Collection();
    network.setAssertion(async (url) => {
      expect(url).toBe('test-endpoint');
      return [{ foo: 123 }];
    });
    const client = new Client({
      collection,
      network,
      QueryBuilder: MockQueryBuilder,
      request: Request,
    });
    class TestModel extends Model {
      static endpoint = 'test-endpoint';

      public foo!: number;
    }
    const resp = await client.from(TestModel).buildRequest().fetch();
    expect(resp).toBeInstanceOf(Response);
  });

  it('should work with model instances', async () => {
    const network = new Network.Mock.Promise();
    const collection = new Collection();
    network.setAssertion(async (url) => {
      expect(url).toBe('test-endpoint');
      return [{ foo: 123 }];
    });
    const client = new Client({
      collection,
      network,
      QueryBuilder: MockQueryBuilder,
      request: Request,
    });
    class TestModel extends Model {
      static endpoint = 'test-endpoint';

      public foo!: number;
    }
    const model = new TestModel();
    const resp = await client.fromInstance(model).buildRequest().fetch();
    expect(resp).toBeInstanceOf(Response);
    expect(resp.data?.foo).toBe(123);
    expect(resp.collection).toBe(collection);
    expect(resp.collection.length).toBe(1);
    expect(resp.collection.findAll(TestModel)).toHaveLength(1);
  });

  it('should work with models and ids', async () => {
    const network = new Network.Mock.Promise();
    const collection = new Collection();
    network.setAssertion(async (url) => {
      expect(url).toBe('test-endpoint');
      return [{ foo: 123 }];
    });
    const client = new Client({
      collection,
      network,
      QueryBuilder: MockQueryBuilder,
      request: Request,
    });
    class TestModel extends Model {
      static endpoint = 'test-endpoint';

      public foo!: number;
    }
    const resp = await client.from(TestModel).id('1').buildRequest().fetch();
    expect(resp).toBeInstanceOf(Response);
    expect(resp.data?.foo).toBe(123);
    expect(resp.collection).toBe(collection);
    expect(resp.collection.length).toBe(1);
    expect(resp.collection.findAll(TestModel)).toHaveLength(1);
  });

  it('should work with models and matching', async () => {
    const network = new Network.Mock.Promise();
    const collection = new Collection();
    let apiUrl;
    network.setAssertion(async (url) => {
      apiUrl = url;
      return [{ foo: 123 }];
    });
    const client = new Client({
      collection,
      network,
      QueryBuilder: MockQueryBuilder,
      request: Request,
    });
    class TestModel extends Model {
      static endpoint = 'test-endpoint';

      public foo!: number;
    }
    const resp = await client
      .from(TestModel)
      .match({ filter: { name: 'test' } })
      .buildRequest()
      .fetch();
    expect(resp).toBeInstanceOf(Response);
    expect(apiUrl).toBe('test-endpoint?filter[name]=test');
  });
});
