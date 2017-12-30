import {Collection} from '../Collection';
import {IDictionary} from '../interfaces/IDictionary';
import {Model} from '../Model';
import {getModelId, getModelType} from './model/utils';

export function reducePrototypeChain<T, U>(obj: U, reduceFn: (state: T, item: U) => T, initialValue: T) {
  let value = initialValue;
  let model = obj;
  while (model) {
    value = reduceFn(value, model);
    model = Object.getPrototypeOf(model);
  }
  return value;
}
