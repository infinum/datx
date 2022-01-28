import { Collection, Model } from '@datx/core';
import fetch from 'node-fetch';
import { Network, Client, Request } from '../src';
import { MockQueryBuilder } from './mock/MockQueryBuilder';

describe('Request', () => {
  it('should initialize', () => {
    const network = new Network.Promise(fetch);
    const collection = new Collection();
    const client = new Client({
      collection,
      network,
      // @ts-ignore
      QueryBuilder: MockQueryBuilder,
      request: Request,
    });
    expect(client).toBeTruthy();
  });

  it('should throw if no url is set', async () => {
    const network = new Network.Promise(fetch);
    const collection = new Collection();
    const client = new Client({
      collection,
      network,
      // @ts-ignore
      QueryBuilder: MockQueryBuilder,
      request: Request,
    });
    expect(() => client.from(Model).buildRequest()).toThrowError('URL should be defined');
  });

  it('should not throw if baseUrl is set', async () => {
    const network = new Network.Promise(fetch);
    const collection = new Collection();
    const client = new Client({
      collection,
      network,
      // @ts-ignore
      QueryBuilder: MockQueryBuilder,
      request: Request,
      options: {
        baseUrl: 'https://example.com',
      },
    });
    expect(client.from(Model).buildRequest()).toBeInstanceOf(Request);
  });

  it('should not throw if type is set', async () => {
    const network = new Network.Promise(fetch);
    const collection = new Collection();
    const client = new Client({
      collection,
      network,
      // @ts-ignore
      QueryBuilder: MockQueryBuilder,
      request: Request,
    });
    class TestModel extends Model {
      static type = 'test';
    }
    expect(client.from(TestModel).buildRequest()).toBeInstanceOf(Request);
  });
});
