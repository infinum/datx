import {extendObservable, IObservableObject} from 'mobx';

/**
 * Map a single item or an array of items
 *
 * @export
 * @template T
 * @template U
 * @param {(T|Array<T>)} data Data to iterate over
 * @param {(item: T) => U} fn Function called for every data item
 * @returns {(U|Array<U>|null)} Return value of the callback function
 */
export function mapItems<T, U>(data: Array<T>, fn: (item: T) => U): Array<U>;
export function mapItems<T, U>(data: T, fn: (item: T) => U): U|null;
export function mapItems<T, U>(data: T|Array<T>, fn: (item: T) => U): U|Array<U>|null {
  if (data instanceof Array) {
    return data.map((item) => fn(item));
  }
  return data === null ? null : fn(data);
}

/**
 * Flatten a 2D array to a single array
 *
 * @export
 * @template T
 * @param {Array<Array<T>>} data Arrays to flatten
 * @returns {Array<T>} Flattened array
 */
export function flatten<T>(data: Array<Array<T>>): Array<T> {
  return ([] as Array<T>).concat(...data);
}

/**
 * Return a unique set of items in an array
 *
 * @export
 * @template T
 * @param {Array<T>} data Array to filter
 * @returns {Array<T>} Filtered array
 */
export function uniq<T>(data: Array<T>): Array<T> {
  return Array.from(new Set(data));
}

/**
 * Check if the given variable is an array with at least one falsy value
 *
 * @export
 * @param {any} value A variable to check
 * @returns {boolean} The given variable is an array with at least one falsy value
 */
export function isFalsyArray(value): boolean {
  return value instanceof Array && !value.every(Boolean);
}

/**
 * Add a computed property to an observable object
 *
 * @export
 * @param {object} obj Observable object
 * @param {string} key Property to add
 * @param {() => any} getter Getter function
 * @param {(name: string) => void} [setter] Setter function
 */
export function assignComputed(
  obj: object,
  key: string,
  getter: () => any,
  setter?: (name: string) => void,
) {
  const newObj = {};
  Object.defineProperty(obj, key, {
    configurable: true,
    get: getter,
    set: setter,
  });
  extendObservable(obj, newObj);
}
