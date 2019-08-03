import { ICollectionConstructor } from '../interfaces/ICollectionConstructor';
import { IModelConstructor } from '../interfaces/IModelConstructor';
import { IViewConstructor } from '../interfaces/IViewConstructor';
import { PureCollection } from '../PureCollection';
import { PureModel } from '../PureModel';
import { View } from '../View';

/**
 * Check if a class is of a certain type
 *
 * @export
 * @param {Function} obj Class to check
 * @param {Function} type Type to check
 * @returns {boolean} Class is of the given type
 */
function isOfType<T>(obj: any, type: T): obj is T {
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
 * @param {any} obj Class to check
 * @returns {boolean} Class is a model
 */
export function isModel(obj: typeof PureModel | IModelConstructor<any>): true;
export function isModel(obj: any): false;
export function isModel(obj: any) {
  return isOfType(obj, PureModel);
}

/**
 * Check if a class is a collection
 *
 * @export
 * @param {any} obj Class to check
 * @returns {boolean} Class is a collection
 */
export function isCollection(obj: typeof PureCollection | ICollectionConstructor<any>): true;
export function isCollection(obj: any): false;
export function isCollection(obj: any) {
  return isOfType(obj, PureCollection);
}

/**
 * Check if a class is a collection
 *
 * @export
 * @param {any} obj Class to check
 * @returns {boolean} Class is a collection
 */
export function isView(obj: typeof View | IViewConstructor<any, any>): true;
export function isView(obj: any): false;
export function isView(obj: any) {
  return isOfType(obj, View);
}
