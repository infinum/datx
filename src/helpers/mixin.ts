import {Collection} from '../Collection';
import {Model} from '../Model';

/**
 * Check if a class is of a certain type
 *
 * @export
 * @param {Function} obj Class to check
 * @param {Function} type Type to check
 * @returns {boolean} Class is of the given type
 */
// tslint:disable-next-line:ban-types
function isOfType(obj: Function, type: Function): boolean {
  let model = obj;
  while (model) {
    if (model === type) {
      return true;
    }
    model = Object.getPrototypeOf(model);
  }
  return false;
}

/**
 * Check if a class is a model
 *
 * @export
 * @param {(typeof Model | typeof Collection)} obj Class to check
 * @returns {boolean} Class is a model
 */
export function isModel(obj: typeof Model | typeof Collection): boolean {
  return isOfType(obj, Model);
}

/**
 * Check if a class is a collection
 *
 * @export
 * @param {(typeof Model | typeof Collection)} obj Class to check
 * @returns {boolean} Class is a collection
 */
export function isCollection(obj: typeof Model | typeof Collection): boolean {
  return isOfType(obj, Collection);
}
