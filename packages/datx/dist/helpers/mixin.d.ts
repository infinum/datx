import { Collection } from '../Collection';
import { Model } from '../Model';
/**
 * Check if a class is a model
 *
 * @export
 * @param {(typeof Model | typeof Collection)} obj Class to check
 * @returns {boolean} Class is a model
 */
export declare function isModel(obj: typeof Model | typeof Collection): boolean;
/**
 * Check if a class is a collection
 *
 * @export
 * @param {(typeof Model | typeof Collection)} obj Class to check
 * @returns {boolean} Class is a collection
 */
export declare function isCollection(obj: typeof Model | typeof Collection): boolean;
