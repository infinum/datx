import { Collection, Model } from '@datx/core';
import { Network, Client, Request, Response, QueryBuilder } from '../src';
import { MockQueryBuilder } from './mock/MockQueryBuilder';

describe('Network error handling', () => {
  it('should throw on server error', async () => {
    const network = new Network.Mock.Promise();
    const collection = new Collection();
    network.setAssertion(async (url) => {
      expect(url).toBe('test-endpoint');
      return [{}, { status: 404 }];
    });
    const client = new Client({
      collection,
      network,
      QueryBuilder: MockQueryBuilder as typeof QueryBuilder,
      request: Request,
    });
    class TestModel extends Model {
      static endpoint = 'test-endpoint';

      public foo!: number;
    }
    const resp = await client.from(TestModel).buildRequest().fetch();
    expect(resp).toBeInstanceOf(Response);
    expect(resp.data).toBe(null);
    expect(resp.error).toBeInstanceOf(Error);
    expect((resp.error as Error).message).toBe('Response status is 404');
    expect(resp.snapshot.response.status).toBe(404);
  });

  it('should throw on non-json response', async () => {
    const network = new Network.Mock.Promise();
    const collection = new Collection();
    network.setAssertion(async (url) => {
      expect(url).toBe('test-endpoint');
      return ['Some server error'];
    });
    const client = new Client({
      collection,
      network,
      QueryBuilder: MockQueryBuilder as typeof QueryBuilder,
      request: Request,
    });
    class TestModel extends Model {
      static endpoint = 'test-endpoint';

      public foo!: number;
    }
    const resp = await client.from(TestModel).buildRequest().fetch();
    expect(resp).toBeInstanceOf(Response);
    expect(resp.data).toBe(null);
    expect(resp.error).toBeInstanceOf(Error);
    expect((resp.error as Error).message).toBe(
      'invalid json response body at  reason: Unexpected token S in JSON at position 0',
    );
    expect(resp.snapshot.response.status).toBe(200);
  });
});
