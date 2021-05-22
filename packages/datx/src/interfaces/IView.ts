export type IPropertySelectorFn<T> = (item: T) => any;
export type ICompareFn<T> = (a: T, b: T) => number;
export type ISortMethod<T> = string | IPropertySelectorFn<T> | ICompareFn<T>;
