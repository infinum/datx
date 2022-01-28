import { PureModel, Collection, getModelId } from '@datx/core';
import { Request } from './Request';
import { QueryBuilder } from './QueryBuilder';
import { INetwork } from './interfaces/INetwork';
import { IClientOptions } from './interfaces/IClientOptions';

export class Client<TNetwork extends INetwork, TRequestClass extends typeof Request> {
  private QueryBuilderConstructor: typeof QueryBuilder;
  private network: TNetwork;
  private collection?: Collection;
  private request: TRequestClass;
  private options: IClientOptions;

  constructor({
    QueryBuilder: QueryBuilderConstructor,
    network,
    collection,
    request,
    options = {},
  }: {
    QueryBuilder: typeof QueryBuilder;
    network: TNetwork;
    collection?: Collection;
    request: TRequestClass;
    options: IClientOptions;
  }) {
    this.QueryBuilderConstructor = QueryBuilderConstructor;
    this.network = network;
    this.collection = collection;
    this.request = request;
    this.options = options;
  }

  from<TModelClass extends typeof PureModel>(
    type: TModelClass,
  ): QueryBuilder<TModelClass, Array<InstanceType<TModelClass>>, TRequestClass, TNetwork> {
    return new this.QueryBuilderConstructor({
      match: [],
      headers: {},
      request: this.request,
      url: this.options.baseUrl,
      refs: {
        client: this,
        network: this.network,
        collection: this.collection,
        modelConstructor: type,
      },
    });
  }

  fromInstance<TModelClass extends typeof PureModel, TModel extends InstanceType<TModelClass>>(
    model: TModel,
  ): QueryBuilder<TModelClass, TModel, TRequestClass, TNetwork>;
  fromInstance<TModelClass extends typeof PureModel>(
    type: TModelClass,
    id: string,
  ): QueryBuilder<TModelClass, InstanceType<TModelClass>, TRequestClass, TNetwork>;
  fromInstance<TModelClass extends typeof PureModel>(
    model: InstanceType<TModelClass> | TModelClass,
    id?: string,
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
      url: this.options.baseUrl,
      refs: {
        client: this,
        network: this.network,
        collection: this.collection,
        modelConstructor: model instanceof PureModel ? (model.constructor as TModelClass) : model,
      },
    }).id(id ?? (getModelId(model) as string));
  }
}
