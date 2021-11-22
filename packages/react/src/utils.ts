import {IJsonapiModel, IRequestOptions, Response } from '@datx/jsonapi';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';

import { QuerySelectFn, _QueryResource } from './types';

export function pickRequestOptions({ networkConfig, cacheOptions }: IRequestOptions ={}) {
  return { networkConfig, cacheOptions };
}

export function getData<T extends IJsonapiModel>(data: Response<T>, select: QuerySelectFn<T>) {
  if (data?.data && select) {
    return select(data?.data as T);
  }
  return data?.data as T;
}

export function isQueryOne<TModel>(queryArray: any): queryArray is _QueryResource<TModel> {
  return isString(queryArray[1]) || isNumber(queryArray[1]);
}
