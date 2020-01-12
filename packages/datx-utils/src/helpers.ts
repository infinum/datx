import {
  extendObservable,
  isObservableArray,
  IObservableArray,
  observable as mobxObservable,
  set,
  isObservable,
} from 'mobx';

import { DATX_META } from './consts';

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
export function mapItems<T, U>(data: T, fn: (item: T) => U): U | null;
export function mapItems<T, U>(data: T | Array<T>, fn: (item: T) => U): U | Array<U> | null {
  if (isArray(data)) {
    // tslint:disable-next-line:no-unnecessary-callback-wrapper
    return (data as Array<T>).map((item) => fn(item));
  }

  return data === null ? null : fn(data as T);
}

/**
 * Flatten a 2D array to a single array
 *
 * @export
 * @template T
 * @param {Array<Array<T>|T>} data Arrays to flatten
 * @returns {Array<T>} Flattened array
 */
export function flatten<T>(data: Array<Array<T> | T>): Array<T> {
  return ([] as Array<T>).concat(...data);
}

/**
 * Check if the given variable is an array with at least one falsy value
 *
 * @export
 * @param {any} value A variable to check
 * @returns {boolean} The given variable is an array with at least one falsy value
 */
export function isFalsyArray(value: any): boolean {
  return isArray(value) && !value.every(Boolean);
}

function undefinedGetter(): any {
  return undefined;
}

function defaultSetter() {
  throw new Error('The setter is not defined for this property');
}

export function getMetaObj(obj: Record<string, any>): Record<string, any> {
  if (!obj.hasOwnProperty(DATX_META)) {
    Object.defineProperty(obj, DATX_META, {
      configurable: false,
      enumerable: false,
      value: mobxObservable({}, {}, { deep: false }),
    });
  }
  // @ts-ignore https://github.com/microsoft/TypeScript/issues/1863
  return obj[DATX_META];
}

export function setMeta<T = any>(obj: Record<string, any>, key: string, value: T): void {
  const meta = getMetaObj(obj);
  set(meta, key, value);
}

export function getMeta<T = any>(
  obj: Record<string, any>,
  key: string,
  defaultValue: T,
  includeChain?: boolean,
  mergeChain?: boolean,
): T;
export function getMeta<T = any>(
  obj: Record<string, any>,
  key: string,
  defaultValue?: T,
  includeChain?: boolean,
  mergeChain?: boolean,
): T | undefined;
export function getMeta<T = any>(
  obj: Record<string, any>,
  key: string,
  defaultValue?: T,
  includeChain?: boolean,
  mergeChain?: boolean,
): T | undefined {
  if (includeChain) {
    return (
      reducePrototypeChain(
        obj,
        (value, model): T => {
          const meta = getMeta(model, key, mergeChain ? {} : undefined);
          return mergeChain ? { ...meta, ...value } : ((meta || value) as T);
        },
        (mergeChain ? {} : undefined) as T,
      ) || defaultValue
    );
  }
  const meta = getMetaObj(obj);
  return meta[key] === undefined ? defaultValue : meta[key];
}

export function mergeMeta(
  obj: Record<string, any>,
  newMeta: Record<string, any>,
): Record<string, any> {
  const meta = getMetaObj(obj);

  Object.assign(meta, newMeta);

  return meta;
}

type Getter<T> = () => T;
type Setter<T> = (value: T) => void;

/**
 * Add a computed property to an observable object
 *
 * @export
 * @param {Record<string, any>} obj Observable object
 * @param {string} key Property to add
 * @param {() => any} getter Getter function
 * @param {(value: any) => void} [setter] Setter function
 */
export function assignComputed<T = any>(
  obj: Record<string, any>,
  key: string,
  getter: Getter<T> = undefinedGetter,
  setter: Setter<T> = defaultSetter,
) {
  if (isObservable(obj)) {
    throw new Error(`[datx exception] This object shouldn't be an observable`);
  }

  const computedObj = extendObservable(
    {},
    {
      get [key]() {
        return getter.call(obj);
      },
    },
  );

  Object.defineProperty(obj, key, {
    get() {
      return computedObj[key];
    },
    set(val: T) {
      setter.call(obj, val);
    },
    enumerable: true,
    configurable: true,
  });
}

export function error(...args: Array<any>) {
  // tslint:disable-next-line:no-console
  console.error(`[datx error]`, ...args);
}

export function warn(...args: Array<any>) {
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') {
    return;
  }

  // tslint:disable-next-line:no-console
  console.warn(`[datx warning]`, ...args);
}

export function deprecated(...args: Array<any>) {
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') {
    return;
  }

  // tslint:disable-next-line:no-console
  console.warn(`[datx deprecated]`, ...args);
}

export function info(...args: Array<any>) {
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') {
    return;
  }

  // tslint:disable-next-line:no-console
  console.info(`[datx info]`, ...args);
}

export function reducePrototypeChain<T, U>(
  obj: U,
  reduceFn: (state: T, item: U) => T,
  initialValue: T,
): T {
  let value = initialValue;
  let model = obj;
  while (model) {
    value = reduceFn(value, model);
    model = Object.getPrototypeOf(model);
  }

  return value;
}

export function isArray(value: Array<any> | IObservableArray<any>): true;
export function isArray(value: any): false;
export function isArray(value: any): boolean {
  return value instanceof Array || isObservableArray(value);
}

export function observable(obj: object, key: string, descriptor: PropertyDescriptor) {
  assignComputed(
    obj,
    key,
    () => getMeta(obj, `get__${key}`),
    (val: any) => {
      setMeta(obj, `get__${key}`, val);
    },
  );
}
