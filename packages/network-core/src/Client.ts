import { PureModel, Collection, getModelId } from '@datx/core';
import { Request } from './Request';
import { QueryBuilder } from './QueryBuilder';
import { INetwork } from './interfaces/INetwork';

export class Client<TNetwork extends INetwork, TRequestClass extends typeof Request> {
  private QueryBuilderConstructor: typeof QueryBuilder;
  private network: TNetwork;
  private collection?: Collection;
  private request: TRequestClass;
  private baseUrl?: string;

  constructor({
    QueryBuilder: QueryBuilderConstructor,
    network,
    collection,
    request,
    baseUrl,
  }: {
    QueryBuilder: typeof QueryBuilder;
    network: TNetwork;
    collection?: Collection;
    request: TRequestClass;
    baseUrl?: string;
  }) {
    this.QueryBuilderConstructor = QueryBuilderConstructor;
    this.network = network;
    this.collection = collection;
    this.request = request;
    this.baseUrl = baseUrl;
  }

  from<TModelClass extends typeof PureModel>(
    type: TModelClass,
  ): QueryBuilder<TModelClass, Array<InstanceType<TModelClass>>, TRequestClass, TNetwork> {
    return new this.QueryBuilderConstructor({
      match: [],
      headers: {},
      request: this.request,
      url: this.baseUrl,
      refs: {
        client: this,
        network: this.network,
        collection: this.collection,
        modelConstructor: type,
      },
    });
  }

  fromInstance<TModelClass extends typeof PureModel>(
    model: InstanceType<TModelClass>,
  ): QueryBuilder<TModelClass, InstanceType<TModelClass>, TRequestClass, TNetwork> {
    return new this.QueryBuilderConstructor<
      TModelClass,
      InstanceType<TModelClass>,
      TRequestClass,
      TNetwork
    >({
      match: [],
      headers: {},
      request: this.request,
      url: this.baseUrl,
      refs: {
        client: this,
        network: this.network,
        collection: this.collection,
        modelConstructor: model.constructor as TModelClass,
      },
    }).id(getModelId(model) as string);
  }
}
