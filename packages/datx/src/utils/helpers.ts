import { ISchemaData } from '../interfaces/ISchemaData';
import { TResourceProp } from '../interfaces/TResourceProp';

export function mapObjectValues<T extends ISchemaData, TReturn = TResourceProp<T[keyof T], true>>(
  obj: T,
  fn: (key: keyof T, value: typeof obj[typeof key]) => TReturn | undefined,
): TReturn {
  const entries = (Object.entries(obj) as Array<[keyof T, typeof obj[keyof T]]>).map(
    ([key, value]) => [key, fn(key, value)],
  );
  return Object.fromEntries(entries);
}
