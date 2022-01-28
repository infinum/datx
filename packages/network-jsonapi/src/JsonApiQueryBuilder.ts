import { PureModel } from '@datx/core';
import { INetwork, QueryBuilder, IRequestDetails, Request } from '@datx/network';
import { DEFAULT_TYPE } from '@datx/utils';

export class JsonApiQueryBuilder<
    TModel extends typeof PureModel,
    TResponse extends InstanceType<TModel> | Array<InstanceType<TModel>>,
    TRequestClass extends typeof Request,
    TNetwork extends INetwork,
  >
  extends QueryBuilder<TModel, TResponse, TRequestClass, TNetwork>
  implements QueryBuilder<TModel, TResponse, TRequestClass, TNetwork>
{
  // build method is a custom implementation that, generates an generic IRequestDetails object with all data required for the API call
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
