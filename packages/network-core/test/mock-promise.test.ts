import { PureCollection, Collection, Model } from '@datx/core';
import { Network, Client, Request, Response } from '../src';
import { MockQueryBuilder } from './mock/MockQueryBuilder';

describe('MockPromiseNetwork tests', () => {
  it('should work with the MockPromiseNetwork', async () => {
    const network = new Network.Mock.Promise();
    const collection = new Collection();
    network.setAssertion(async (url) => {
      expect(url).toBe('test-endpoint');
      return [{ foo: 123 }];
    });
    const client = new Client({
      collection,
      network,
      // @ts-ignore
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

  it('should work with the MockPromiseNetwork and no collection', async () => {
    const network = new Network.Mock.Promise();
    network.setAssertion(async (url) => {
      expect(url).toBe('test-endpoint');
      return [[{ foo: 123 }], { headers: { 'content-type': 'application/json' } }];
    });
    const client = new Client({
      network,
      // @ts-ignore
      QueryBuilder: MockQueryBuilder,
      request: Request,
    });
    class TestModel extends Model {
      static endpoint = 'test-endpoint';

      public foo!: number;
    }
    const resp = await client.from(TestModel).buildRequest().fetch();
    expect(resp).toBeInstanceOf(Response);
    expect(resp.data?.[0]?.foo).toBe(123);
    expect(resp.collection).toBeInstanceOf(PureCollection);
    expect(resp.collection.length).toBe(1);
    expect(resp.collection.findAll(TestModel)).toHaveLength(1);
  });

  it('should work with the MockPromiseNetwork and collection', async () => {
    const network = new Network.Mock.Promise();
    const collection = new Collection();
    network.setAssertion(async (url) => {
      expect(url).toBe('test-endpoint');
      return [[{ foo: 123 }], { headers: { 'content-type': 'application/json' } }];
    });
    const client = new Client({
      collection,
      network,
      // @ts-ignore
      QueryBuilder: MockQueryBuilder,
      request: Request,
    });
    class TestModel extends Model {
      static endpoint = 'test-endpoint';

      public foo!: number;
    }
    const resp = await client.from(TestModel).buildRequest().fetch();
    expect(resp).toBeInstanceOf(Response);
    expect(resp.data?.[0]?.foo).toBe(123);
    expect(resp.collection).toBe(collection);
    expect(resp.collection.length).toBe(1);
    expect(resp.collection.findAll(TestModel)).toHaveLength(1);
  });

  it('should work with the MockPromiseNetwork fromInstance instance', async () => {
    const network = new Network.Mock.Promise();
    const collection = new Collection();
    network.setAssertion(async (url) => {
      expect(url).toBe('test-endpoint');
      return [{ foo: 123 }];
    });
    const client = new Client({
      collection,
      network,
      // @ts-ignore
      QueryBuilder: MockQueryBuilder,
      request: Request,
    });
    class TestModel extends Model {
      static endpoint = 'test-endpoint';

      public foo!: number;
    }
    const resp = await client.fromInstance(new TestModel()).buildRequest().fetch();
    expect(resp).toBeInstanceOf(Response);
    expect(resp.data?.foo).toBe(123);
    expect(resp.collection).toBe(collection);
    expect(resp.collection.length).toBe(1);
    expect(resp.collection.findAll(TestModel)).toHaveLength(1);
  });

  it('should work with the MockPromiseNetwork fromInstance id', async () => {
    const network = new Network.Mock.Promise();
    const collection = new Collection();
    network.setAssertion(async (url) => {
      expect(url).toBe('test-endpoint');
      return [{ foo: 123 }];
    });
    const client = new Client({
      collection,
      network,
      // @ts-ignore
      QueryBuilder: MockQueryBuilder,
      request: Request,
    });
    class TestModel extends Model {
      static endpoint = 'test-endpoint';

      public foo!: number;
    }
    const resp = await client.fromInstance(TestModel, '1').buildRequest().fetch();
    expect(resp).toBeInstanceOf(Response);
    expect(resp.data?.foo).toBe(123);
    expect(resp.collection).toBe(collection);
    expect(resp.collection.length).toBe(1);
    expect(resp.collection.findAll(TestModel)).toHaveLength(1);
  });

  it('should work with the MockPromiseNetwork with id', async () => {
    const network = new Network.Mock.Promise();
    const collection = new Collection();
    network.setAssertion(async (url) => {
      expect(url).toBe('test-endpoint');
      return [{ foo: 123 }];
    });
    const client = new Client({
      collection,
      network,
      // @ts-ignore
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
});
