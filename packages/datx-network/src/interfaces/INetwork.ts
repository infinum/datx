import { PureModel } from '@datx/core';
import { IAsync } from './IAsync';
import { IFetchOptions } from './IFetchOptions';
import { IGeneralize } from './IGeneralize';
import { Response } from '../Response';

export interface INetwork<IA extends IAsync<any> = IAsync<any>> {
  exec<T, U = any>(asyncVal: IGeneralize<U, IA>, mapFn: (value: U) => T): IGeneralize<T, IA>;

  baseFetch<T extends TModel | Array<TModel>, TModel extends PureModel = PureModel>(
    request: IFetchOptions,
  ): IGeneralize<Response<T, TModel>, IA>;
}
