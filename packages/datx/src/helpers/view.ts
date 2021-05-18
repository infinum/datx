import { CompareFn, PropertySelectorFn } from '../types';

export function isPropertySelectorFn<T>(fn: PropertySelectorFn<T> | CompareFn<T>): fn is PropertySelectorFn<T> {
  return fn.length === 1;
}
