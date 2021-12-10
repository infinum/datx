import { Model } from '@datx/core';
import { INetwork } from './interfaces/INetwork';
import { IQueryConfig } from './interfaces/IQueryConfig';
import { IRequestDetails } from './interfaces/IRequestDetails';
import { ISubrequest } from './interfaces/ISubrequest';
import { Request } from './Request';

// JSON:API is integrated on this level
// Custom API is integrated on this level
export class QueryBuilder<
  TModel extends typeof Model,
  TResponse,
  TRequest extends typeof Request,
  TNetwork extends INetwork,
> {
  public constructor(public readonly config: IQueryConfig<TNetwork, TRequest>) {
    console.log(this.config);
  }

  public extend<TNewResponse>(
    config: Partial<IQueryConfig<TNetwork, TRequest>>,
  ): QueryBuilder<TModel, TNewResponse, TRequest, TNetwork> {
    return new (this.constructor as any)(Object.assign({}, this.config, config));
  }

  public id(modelId: string): QueryBuilder<TModel, InstanceType<TModel>, TRequest, TNetwork> {
    return this.extend<InstanceType<TModel>>({ id: modelId });
  }

  public match(
    options: Record<string, any>,
  ): QueryBuilder<TModel, Array<InstanceType<TModel>>, TRequest, TNetwork> {
    return this.extend<Array<InstanceType<TModel>>>({
      match: [...this.config.match, options],
    });
  }

  public build(): IRequestDetails {
    throw new Error('The build method needs to be implemented');
  }

  public request(...chained: Array<ISubrequest<TResponse, TNetwork>>) {
    return new this.config.request<any, TNetwork>(this.config.refs, this.build(), chained);
  }
}

export class JsonApiQueryBuilder<
  TModel extends typeof Model,
  TResponse,
  TRequest extends typeof Request,
  TNetwork extends INetwork,
> extends QueryBuilder<TModel, TResponse, TRequest, TNetwork> {
  // build method is a custom implementation that, generates an generic IRequestDetails object with all data required for the API call
  public build(): IRequestDetails {
    return {
      url: this.config.url as any,
      method: this.config.method as any,
      headers: this.config.headers,
      cachingKey: `${this.config.model.type}/${
        this.config.id ? this.config.id : JSON.stringify(this.config.match)
      }`,
    };
  }
}
