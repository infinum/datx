import { Model, Collection } from '@datx/core';
import { Request } from './Request';
import { QueryBuilder } from './QueryBuilder';
import { INetwork } from './interfaces/INetwork';

export class Client<TNetwork extends INetwork, TRequest extends typeof Request = typeof Request> {
  private QueryBuilderConstructor: typeof QueryBuilder;
  private network: TNetwork;
  private collection: Collection;
  private request: TRequest;

  constructor({
    QueryBuilder: QueryBuilderConstructor,
    network,
    collection,
    request,
  }: {
    QueryBuilder: typeof QueryBuilder;
    network: TNetwork;
    collection: Collection;
    request: TRequest;
  }) {
    this.QueryBuilderConstructor = QueryBuilderConstructor;
    this.network = network;
    this.collection = collection;
    this.request = request;
  }

  from(type: typeof Model): QueryBuilder<typeof Model, Array<Model>, TRequest, TNetwork> {
    return new this.QueryBuilderConstructor({
      model: type,
      match: [],
      headers: {},
      request: this.request,
      refs: {
        client: this,
        network: this.network,
        collection: this.collection,
      },
    });
  }

  fromInstance(model: Model): QueryBuilder<typeof Model, Model, TRequest, TNetwork> {
    return new this.QueryBuilderConstructor({
      model: model.constructor as typeof Model,
      match: [],
      headers: {},
      request: this.request,
      refs: {
        client: this,
        network: this.network,
        collection: this.collection,
      },
    }).id(model.meta.id as string);
  }
}
