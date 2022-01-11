import { PureModel, Collection, getModelId } from '@datx/core';
import { Request } from './Request';
import { QueryBuilder } from './QueryBuilder';
import { INetwork } from './interfaces/INetwork';

export class Client<TNetwork extends INetwork, TRequestClass extends typeof Request> {
  private QueryBuilderConstructor: typeof QueryBuilder;
  private network: TNetwork;
  private collection: Collection;
  private request: TRequestClass;

  constructor({
    QueryBuilder: QueryBuilderConstructor,
    network,
    collection,
    request,
  }: {
    QueryBuilder: typeof QueryBuilder;
    network: TNetwork;
    collection: Collection;
    request: TRequestClass;
  }) {
    this.QueryBuilderConstructor = QueryBuilderConstructor;
    this.network = network;
    this.collection = collection;
    this.request = request;
  }

  from<TModelClass extends typeof PureModel>(
    type: TModelClass,
  ): QueryBuilder<TModelClass, Array<InstanceType<TModelClass>>, TRequestClass, TNetwork> {
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

  fromInstance<TModelClass extends typeof PureModel>(
    model: InstanceType<TModelClass>,
  ): QueryBuilder<TModelClass, InstanceType<TModelClass>, TRequestClass, TNetwork> {
    return new this.QueryBuilderConstructor<
      TModelClass,
      InstanceType<TModelClass>,
      TRequestClass,
      TNetwork
    >({
      model: model.constructor as TModelClass,
      match: [],
      headers: {},
      request: this.request,
      refs: {
        client: this,
        network: this.network,
        collection: this.collection,
      },
    }).id(getModelId(model) as string);
  }
}
