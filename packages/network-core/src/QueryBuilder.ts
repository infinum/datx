import { PureCollection, PureModel } from '@datx/core';
import { INetwork } from './interfaces/INetwork';
import { IQueryConfig } from './interfaces/IQueryConfig';
import { IRequestDetails } from './interfaces/IRequestDetails';
import { IResponseSnapshot } from './interfaces/IResponseSnapshot';
import { ISubrequest } from './interfaces/ISubrequest';
import { Request } from './Request';

export class QueryBuilder<
  TResponse extends TModelInstance | Array<TModelInstance | unknown> | unknown,
  TRequestClass extends typeof Request,
  TNetwork extends INetwork,
  TModelClass extends typeof PureModel = typeof PureModel,
  TModelInstance extends
    | (InstanceType<TModelClass> & PureModel)
    | unknown = InstanceType<TModelClass>,
> {
  protected parser: (response: IResponseSnapshot) => IResponseSnapshot = (response) => response;

  public constructor(
    public readonly config: IQueryConfig<TNetwork, TRequestClass>,
    protected chained: Array<ISubrequest<TResponse, TNetwork, TRequestClass>> = [],
  ) {}

  public extend<TNewResponse extends TModelInstance | Array<TModelInstance>>(
    config: Partial<IQueryConfig<TNetwork, TRequestClass>>,
    chained: Array<ISubrequest<TResponse, TNetwork, TRequestClass>> = [],
  ): QueryBuilder<TNewResponse, TRequestClass, TNetwork, TModelClass> {
    return new (this.constructor as typeof QueryBuilder)(Object.assign({}, this.config, config), [
      ...this.chained,
      ...chained,
    ]) as QueryBuilder<TNewResponse, TRequestClass, TNetwork, TModelClass>;
  }

  public id(modelId: string): QueryBuilder<TModelInstance, TRequestClass, TNetwork, TModelClass> {
    return this.extend<TModelInstance>({ id: modelId });
  }

  public match(
    options: Record<string, unknown>,
  ): QueryBuilder<Array<TModelInstance>, TRequestClass, TNetwork, TModelClass> {
    return this.extend<Array<TModelInstance>>({
      match: [...this.config.match, options],
    });
  }

  public build(): IRequestDetails {
    throw new Error('The build method needs to be implemented');
  }

  public withCollection(
    collection?: PureCollection,
  ): QueryBuilder<TResponse, TRequestClass, TNetwork, TModelClass, TModelInstance> {
    return this.extend({ refs: { ...this.config.refs, collection } }) as QueryBuilder<
      TResponse,
      TRequestClass,
      TNetwork,
      TModelClass,
      TModelInstance
    >;
  }

  public buildRequest(
    ...chained: Array<ISubrequest<TResponse, TNetwork, TRequestClass>>
  ): Request<TNetwork, TModelClass, TResponse, TModelInstance> {
    return new this.config.request(
      this.config.refs,
      this.build(),
      [...this.chained, ...chained],
      this.parser,
    ) as Request<TNetwork, TModelClass, TResponse, TModelInstance>;
  }
}
