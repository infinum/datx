import { PureModel } from '@datx/core';
import { DEFAULT_TYPE } from '@datx/utils';
import { QueryBuilder, Request, INetwork, IRequestDetails } from '../../src';

function parametrize(obj: Record<string, unknown>, prefix = ''): Array<string> {
  const params: Array<string> = [];
  for (const [key, value] of Object.entries(obj)) {
    const paramKey = prefix ? `${prefix}[${key}]` : key;
    if (Array.isArray(value)) {
      params.push(...value.map((v) => `${paramKey}=${v}`));
    } else if (typeof value === 'object') {
      params.push(...parametrize(value as Record<string, unknown>, paramKey));
    } else {
      params.push(`${paramKey}=${value}`);
    }
  }
  return params;
}

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
    if (Object.keys(this.config.match).length > 0) {
      const params = this.config.match.map((item) => parametrize(item)).flat(1);
      url += '?' + params.join('&');
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
