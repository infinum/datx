import isNumber from 'lodash/isNumber';
import isString from 'lodash/isString';
import { Key } from './interfaces/Key';
import { ResourceArguments } from './interfaces/ResourceArguments';

export const isFunction = (value: any): value is Function => typeof value == 'function';

export function isQueryOne<TModel>(queryArray: any): queryArray is ResourceArguments<TModel> {
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
