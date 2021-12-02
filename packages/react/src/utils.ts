import { IRequestOptions } from '@datx/jsonapi';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';

import { _QueryResource } from './types';

export function pickRequestOptions({ networkConfig, cacheOptions }: IRequestOptions ={}) {
  return { networkConfig, cacheOptions };
}

export function isQueryOne<TModel>(queryArray: any): queryArray is _QueryResource<TModel> {
  return isString(queryArray[1]) || isNumber(queryArray[1]);
}
