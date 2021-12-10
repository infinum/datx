import { IRequestOptions } from '@datx/jsonapi';
import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';

import { _QueryResource, Key } from './types';

export const isFunction = (value: any): value is Function => typeof value == 'function';

export function pickRequestOptions({ networkConfig, cacheOptions }: IRequestOptions = {}) {
  return { networkConfig, cacheOptions };
}

export function isQueryOne<TModel>(queryArray: any): queryArray is _QueryResource<TModel> {
  return isString(queryArray[1]) || isNumber(queryArray[1]);
}

export const getUrl = (key: Key) => {
  if (isFunction(key)) {
    return key();
  }

  return key;
};

export const undefinedToNull = <TProps>(props: TProps): TProps =>
  JSON.parse(JSON.stringify(props)) as TProps;
