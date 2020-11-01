import { DATX_META } from './consts';
import { IObservableArray } from './interfaces/IMobX';
import { mobx } from './mobx';

export function isArrayLike(value: any): boolean {
  return Array.isArray(value) || mobx.isObservableArray(value);
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
  if (isArrayLike(data)) {
    return (data as Array<T>).map((item) => fn(item));
  }

  return data === null ? null : fn(data as T);
}

function undefinedGetter(): any {
  return undefined;
}

function defaultSetter(): void {
  throw new Error('The setter is not defined for this property');
}

export function getMetaObj(obj: Record<string, any>): Record<string, any> {
  if (!Object.prototype.hasOwnProperty.call(obj, DATX_META)) {
    Object.defineProperty(obj, DATX_META, {
      configurable: false,
      enumerable: false,
      value: mobx.observable({}, {}, { deep: false }),
    });
  }
  // @ts-ignore https://github.com/microsoft/TypeScript/issues/1863
  return obj[DATX_META];
}

export function setMeta<T = any>(obj: Record<string, any>, key: string, value: T): void {
  const meta = getMetaObj(obj);

  mobx.set(meta, key, value);
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

          return mergeChain ? Object.assign({}, meta, value) : ((value || meta) as T);
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
): void {
  // if (isObservable(obj)) {
  //   throw new Error(`[datx exception] This object shouldn't be an observable`);
  // }

  const computedObj = mobx.extendObservable(
    {},
    {
      get getter() {
        return getter.call(obj);
      },
    },
  );

  Object.defineProperty(obj, key, {
    get() {
      return computedObj.getter;
    },
    set(val: T) {
      setter.call(obj, val);
    },
    enumerable: true,
    configurable: true,
  });
}

export function error(...args: Array<any>): void {
  // eslint-disable-next-line no-console
  console.error(`[datx error]`, ...args);
}

export function warn(...args: Array<any>): void {
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') {
    return;
  }

  // eslint-disable-next-line no-console
  console.warn(`[datx warning]`, ...args);
}

export function deprecated(...args: Array<any>): void {
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') {
    return;
  }

  // eslint-disable-next-line no-console
  console.warn(`[datx deprecated]`, ...args);
}

export function info(...args: Array<any>): void {
  if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') {
    return;
  }

  // eslint-disable-next-line no-console
  console.info(`[datx info]`, ...args);
}

export function replace<T = any>(arr: Array<T>, data: Array<T>): Array<T> {
  if (mobx.isObservableArray(arr)) {
    return (arr as IObservableArray).replace(data);
  } else {
    arr.length = 0;
    arr.push(...data);
    return arr;
  }
}
