import { PureModel } from '@datx/core';
import { DEFAULT_TYPE } from '@datx/utils';
import {
  QueryBuilder,
  Request,
  INetwork,
  IRequestDetails,
  appendQueryParams,
  ParamArrayType,
} from '../../src';

export class MockQueryBuilder<
  TResponse extends TModelInstance | Array<TModelInstance | unknown> | unknown,
  TRequestClass extends typeof Request,
  TNetwork extends INetwork,
  TModelClass extends typeof PureModel = typeof PureModel,
  TModelInstance extends
    | (InstanceType<TModelClass> & PureModel)
    | unknown = InstanceType<TModelClass>,
> extends QueryBuilder<TResponse, TRequestClass, TNetwork, TModelClass, TModelInstance> {
  public build(): IRequestDetails {
    let url =
      this.config.options.baseUrl ||
      this.config.refs.modelConstructor['endpoint'] ||
      this.config.refs.modelConstructor.type;
    if (typeof url === 'function') {
      url = url(this.config.options.baseUrl);
    }
    if (!url || url === DEFAULT_TYPE) {
      throw new Error('URL should be defined');
    }
    if (Object.keys(this.config.match).length > 0) {
      const params = this.config.match.reduce((acc, curr) => {
        const data = { ...acc };

        Object.keys(curr).forEach((key) => {
          const value = curr[key];
          const dataValue = data[key];
          if (dataValue) {
            data[key] = [...(Array.isArray(dataValue) ? dataValue : [dataValue]), value];
          } else {
            data[key] = value;
          }
        });

        return data;
      }, {});
      url = appendQueryParams(url, params, ParamArrayType.MultipleParams, true);
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
