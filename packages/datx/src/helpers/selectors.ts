import {IDictionary} from 'datx-utils';

import {PureCollection} from '../PureCollection';
import {PureModel} from '../PureModel';
import {getModelId, getModelType} from './model/utils';

/**
 * Helper function used to iterate trough models prototype chain and collect data for all parents
 *
 * @export
 * @template T
 * @template U
 * @param {U} obj Given model
 * @param {(state: T, item: U) => T} reduceFn Function used to collect the data
 * @param {T} initialValue Initial reducer data
 * @returns {T} Collected data
 */
// tslint:disable-next-line:export-name
export function reducePrototypeChain<T, U>(obj: U, reduceFn: (state: T, item: U) => T, initialValue: T): T {
  let value = initialValue;
  let model = obj;
  while (model) {
    value = reduceFn(value, model);
    model = Object.getPrototypeOf(model);
  }

  return value;
}
