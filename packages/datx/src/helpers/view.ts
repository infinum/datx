import { ICompareFn, IPropertySelectorFn } from "../interfaces/IView";


export function isPropertySelectorFn<T>(fn: IPropertySelectorFn<T> | ICompareFn<T>): fn is IPropertySelectorFn<T> {
  return fn.length === 1;
}
