import {PureCollection} from '../PureCollection';
import {PureModel} from '../PureModel';

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
 * @param {(typeof PureModel | typeof PureCollection)} obj Class to check
 * @returns {boolean} Class is a model
 */
export function isModel(obj: typeof PureModel | typeof PureCollection): boolean {
  return isOfType(obj, PureModel);
}

/**
 * Check if a class is a collection
 *
 * @export
 * @param {(typeof PureModel | typeof PureCollection)} obj Class to check
 * @returns {boolean} Class is a collection
 */
export function isCollection(obj: typeof PureModel | typeof PureCollection): boolean {
  return isOfType(obj, PureCollection);
}
