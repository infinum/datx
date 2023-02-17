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
