import { Merge } from 'type-fest';

type OptionalProps<T> = {
  [key in keyof T as undefined extends T[key] ? key : never]?: T[key];
};
type RequiredProps<T> = {
  [key in keyof T as undefined extends T[key] ? never : key]-?: T[key];
};

export type IPartialProps<T> = Merge<RequiredProps<T>, OptionalProps<T>>;
