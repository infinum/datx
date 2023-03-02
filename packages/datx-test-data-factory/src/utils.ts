import { Field, FieldGenerator } from './types';

export const isGenerator = (field: Field): field is FieldGenerator<any> => {
  if (!field) return false;

  return (field as FieldGenerator<any>).type !== undefined;
};

export const mapValues = <T, U>(
  obj: Record<string, T>,
  fn: (value: T, key: string) => U,
): Record<string, U> => {
  return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, fn(value, key)]));
};

// export const mapValues = <T extends Record<string, unknown>, U>(
//   obj: T,
//   fn: (value: typeof obj[typeof key], key: keyof T) => U,
// ) => {

//   return (Object.entries(obj) as Array<[keyof T, typeof obj[keyof T]]>).reduce(
//     (acc, [key, value]) => {
//       acc[key] = fn(value, key);

//       return acc;
//     },
//     {} as Record<keyof T, U>,
//   );
// };

export const compose =
  (...fns) =>
  (x) =>
    fns.reduce((acc, fn) => fn(acc), x);
