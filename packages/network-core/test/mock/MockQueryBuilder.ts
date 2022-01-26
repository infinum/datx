import { PureModel } from '@datx/core';
import { DEFAULT_TYPE } from '@datx/utils';
import { QueryBuilder, Request, INetwork, IRequestDetails } from '../../src';

export class MockQueryBuilder<
  TModel extends typeof PureModel,
  TResponse extends InstanceType<TModel> | Array<InstanceType<TModel>>,
  TRequestClass extends typeof Request,
  TNetwork extends INetwork,
> extends QueryBuilder<TModel, TResponse, TRequestClass, TNetwork> {
  public build(): IRequestDetails {
    let url =
      this.config.url ||
      this.config.refs.modelConstructor['endpoint'] ||
      this.config.refs.modelConstructor.type;
    if (typeof url === 'function') {
      url = url(this.config.url);
    }
    if (!url || url === DEFAULT_TYPE) {
      throw new Error('URL should be defined');
    }
    return {
      url,
      method: this.config.method || 'GET',
      headers: this.config.headers,
      body: null,
      cachingKey: `${this.config.refs.modelConstructor.type}/${
        this.config.id ? this.config.id : JSON.stringify(this.config.match)
      }`,
    };
  }
}
