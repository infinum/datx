import {computed, decorate, extendObservable} from 'mobx';

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
    // tslint:disable-next-line:no-unnecessary-callback-wrapper
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
export function isFalsyArray(value: any): boolean {
  return value instanceof Array && !value.every(Boolean);
}

/**
 * Add a computed property to an observable object
 *
 * @export
 * @param {object} obj Observable object
 * @param {string} key Property to add
 * @param {() => any} getter Getter function
 * @param {(value: any) => void} [setter] Setter function
 */
export function assignComputed<T = any>(
  obj: object,
  key: string,
  getter: () => T,
  setter?: (value: T) => void,
) {
  let value;
  if (key in obj) {
    value = obj[key];
    delete obj[key];
  }

  if (setter) {
    extendObservable(obj, {
      get [key]() {
        return getter();
      },
      set [key](val) {
        if (setter) {
          setter(val);
        }
      },
    });
  } else {
    extendObservable(obj, {
      get [key]() {
        return getter();
      },
    });
  }

  if (value !== undefined) {
    obj[key] = value;
  }
}

export function error(...args) {
  // tslint:disable-next-line:no-console
  console.error(`[datx error]`, ...args);
}

export function warn(...args) {
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') {
    return;
  }

  // tslint:disable-next-line:no-console
  console.warn(`[datx warning]`, ...args);
}

export function deprecated(...args) {
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') {
    return;
  }

  // tslint:disable-next-line:no-console
  console.warn(`[datx deprecated]`, ...args);
}

export function info(...args) {
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') {
    return;
  }

  // tslint:disable-next-line:no-console
  console.info(`[datx info]`, ...args);
}
