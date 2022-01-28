import { PureCollection, PureModel } from '@datx/core';
// import { DEFAULT_TYPE } from '@datx/utils';
import { INetwork } from './interfaces/INetwork';
import { IQueryConfig } from './interfaces/IQueryConfig';
import { IRequestDetails } from './interfaces/IRequestDetails';
import { ISubrequest } from './interfaces/ISubrequest';
import { Request } from './Request';

// JSON:API is integrated on this level
// Custom API is integrated on this level
export class QueryBuilder<
  TModel extends typeof PureModel,
  TResponse extends InstanceType<TModel> | Array<InstanceType<TModel>>,
  TRequestClass extends typeof Request,
  TNetwork extends INetwork,
> {
  public constructor(public readonly config: IQueryConfig<TNetwork, TRequestClass>) {}

  public extend<TNewResponse extends InstanceType<TModel> | Array<InstanceType<TModel>>>(
    config: Partial<IQueryConfig<TNetwork, TRequestClass>>,
  ): QueryBuilder<TModel, TNewResponse, TRequestClass, TNetwork> {
    return new (this.constructor as typeof QueryBuilder)(Object.assign({}, this.config, config));
  }

  public id(modelId: string): QueryBuilder<TModel, InstanceType<TModel>, TRequestClass, TNetwork> {
    return this.extend<InstanceType<TModel>>({ id: modelId });
  }

  public match(
    options: Record<string, unknown>,
  ): QueryBuilder<TModel, Array<InstanceType<TModel>>, TRequestClass, TNetwork> {
    return this.extend<Array<InstanceType<TModel>>>({
      match: [...this.config.match, options],
    });
  }

  public build(): IRequestDetails {
    throw new Error('The build method needs to be implemented');
  }

  public withCollection(
    collection?: PureCollection,
  ): QueryBuilder<TModel, TResponse, TRequestClass, TNetwork> {
    return this.extend({ refs: { ...this.config.refs, collection } });
  }

  public buildRequest(
    ...chained: Array<ISubrequest<TResponse, TNetwork, TRequestClass>>
  ): Request<TNetwork, TModel, TResponse> & InstanceType<TRequestClass> {
    // @ts-ignore No way to avoid this :( But the final type is correct
    return new this.config.request(this.config.refs, this.build(), chained);
  }
}
