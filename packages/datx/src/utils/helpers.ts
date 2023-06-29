import { ICustomScalar } from '../interfaces/ICustomScalar';
import { ISchemaData } from '../interfaces/ISchemaData';
import { TResourceProp } from '../interfaces/TResourceProp';
import { Schema } from '../Schema';
import { parseSchema } from './schema/parse';
import { serializeSchema } from './schema/serialize';

export function mapObjectValues<T extends ISchemaData, TReturn = TResourceProp<T[keyof T], true>>(
  obj: T,
  fn: (key: keyof T, value: typeof obj[typeof key], item: Partial<TReturn>) => TReturn | undefined,
): TReturn {
  const item: Record<string, unknown> = {};

  (Object.entries(obj) as Array<[keyof T, typeof obj[keyof T]]>).map(([key, value]) => {
    item[key as string] = fn(key, value, item as Partial<TReturn>);
  });

  return item as TReturn;
}

export function wrapSchema(schemaFn: () => Schema): ICustomScalar {
  return {
    serialize: (data, depth, flatten, contained) =>
      serializeSchema(schemaFn(), data, depth, flatten, contained),
    parseValue: (data, _key, _model, collection) => parseSchema(schemaFn(), data, collection),
  };
}

export function schemaOrReference(schemaFn: () => Schema): ICustomScalar & {
  id?: (value: any) => string | number;
} {
  return {
    id: (data) => schemaFn().id(data),
    serialize: (data, depth, flatten, contained) => {
      const ModelSchema = schemaFn();
      const id = ModelSchema.id(data);

      if (contained?.includes(id) || depth === 0) {
        return id;
      }
      contained?.push(id);

      return serializeSchema(ModelSchema, data, depth, flatten, contained);
    },
    parseValue: (data, key, model, collection) => {
      if (typeof data === 'string' || typeof data === 'number') {
        const ref = collection?.byId[data];

        if (ref) {
          return ref;
        }
        collection?.addReferenceListener(model, key, data);

        return undefined;
      }

      return parseSchema(schemaFn(), data, collection);
    },
  };
}

export function mapItems<TItem, TResult>(
  items: TItem,
  fn: (item: TItem, index: number) => TResult,
): TResult;

export function mapItems<TItem, TResult>(
  items: Array<TItem>,
  fn: (item: TItem, index: number) => TResult,
): Array<TResult>;

export function mapItems<TItem, TResult>(
  items: TItem | Array<TItem>,
  fn: (item: TItem, index: number) => TResult,
): TResult | Array<TResult> {
  if (!Array.isArray(items)) {
    return fn(items, 0);
  }

  return items.map(fn);
}
