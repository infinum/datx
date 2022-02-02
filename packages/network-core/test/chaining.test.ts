import { Collection, Model, Attribute } from '@datx/core';
import { Network, Client, Request, Response } from '../src';
import { MockQueryBuilder } from './mock/MockQueryBuilder';

describe('Chaining', () => {
  it('should work with a basic reference case', async () => {
    const network = new Network.Mock.Promise();
    const collection = new Collection();
    network.setAssertion(async () => {
      return [
        {
          a: 123,
          id: '1',
          b: [
            { id: '1', type: 'b' },
            { id: '2', type: 'b' },
            { id: '3', type: 'b' },
          ],
        },
      ];
    });
    network.setAssertion(async () => {
      return [
        [
          { b: 1, id: '1' },
          { b: 2, id: '2' },
          { b: 3, id: '3' },
        ],
      ];
    });

    const client = new Client({
      collection,
      network,
      QueryBuilder: MockQueryBuilder,
      request: Request,
    });

    class ModelB extends Model {
      static type = 'b';

      @Attribute({ isIdentifier: true })
      public id!: string;

      public b!: number;
    }

    class ModelA extends Model {
      static type = 'a';

      public a!: number;

      @Attribute({ isIdentifier: true })
      public id!: string;

      @Attribute({ toMany: ModelB })
      public b!: Array<ModelB>;
    }

    const fetchB = (client, respA: Response<ModelA, ModelA>) =>
      respA.data &&
      client
        .from(ModelB)
        .match({ filter: { a: respA.data.id } })
        .buildRequest();

    const resp = await client.from(ModelA).id('1').buildRequest(fetchB).fetch();
    expect(resp).toBeInstanceOf(Response);
    expect(resp.data?.a).toBe(123);
    expect(resp.data?.b).toBeInstanceOf(Array);
    expect(resp.data?.b).toHaveLength(3);
    expect(resp.data?.b[0]).toBeInstanceOf(ModelB);
    expect(resp.data?.b[0].b).toBe(1);
    expect(network.verify()).toBe(true);
  });
});
