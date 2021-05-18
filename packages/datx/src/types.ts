export type PropertySelectorFn<T> = (item: T) => any;
export type CompareFn<T> = (a: T, b: T) => number;
export type SortMethod<T> = string | PropertySelectorFn<T> | CompareFn<T>;
