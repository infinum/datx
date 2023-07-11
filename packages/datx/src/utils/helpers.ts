// import { PartialOnUndefinedDeep } from 'type-fest';
import { ISchemaDefinition } from '../interfaces/ISchemaDefinition';
import { Schema } from './types/schema';

// export function mapObjectValues<T extends ISchemaData, TReturn = TResourceProp<T[keyof T], true>>(
//   obj: T,
//   fn: (key: keyof T, value: typeof obj[typeof key], item: Partial<TReturn>) => TReturn | undefined,
// ): TReturn {
//   const item: Record<string, unknown> = {};

//   (Object.entries(obj) as Array<[keyof T, typeof obj[keyof T]]>).map(([key, value]) => {
//     item[key as string] = fn(key, value, item as Partial<TReturn>);
//   });

//   return item as TReturn;
// }

export function lazySchema<TDefinition extends ISchemaDefinition>(
  schemaFn: () => Schema<TDefinition>,
): Schema<TDefinition> {
  return schemaFn();
  // return {
  //   serialize: (instance) => {
  //     const schema = schemaFn();

  //     return schema.serialize(instance);
  //   },
  //   parse: (plain: PartialOnUndefinedDeep<ISchemaPlain<TDefinition>>) => {
  //     const schema = schemaFn();

  //     return schema.parse(plain);
  //   },
  //   optional: () => {
  //     const schema = schemaFn();

  //     return schema.optional();
  //   },
  //   default(value) {
  //     const schema = schemaFn();

  //     return schema.default(value);
  //   },
  //   test(item): item is ISchemaInstance<TDefinition> {
  //     const schema = schemaFn();

  //     return schema.test(item);
  //   },
  //   get isOptional() {
  //     const schema = schemaFn();

  //     return schema.isOptional;
  //   },
  // };
}

// export function schemaOrReference(schemaFn: () => Schema): ICustomScalar & {
//   id?: (value: any) => string | number;
// } {
//   return {
//     id: (data) => schemaFn().id(data),
//     serialize: (data, depth, flatten, contained) => {
//       const ModelSchema = schemaFn();
//       const id = ModelSchema.id(data);

//       if (contained?.includes(id) || depth === 0) {
//         return id;
//       }
//       contained?.push(id);

//       return serializeSchema(ModelSchema, data, depth, flatten, contained);
//     },
//     parseValue: (data, key, model, collection) => {
//       if (typeof data === 'string' || typeof data === 'number') {
//         const ref = collection?.byId[data];

//         if (ref) {
//           return ref;
//         }
//         collection?.addReferenceListener(model, key, data);

//         return undefined;
//       }

//       return parseSchema(schemaFn(), data, collection);
//     },
//   };
// }

// export function mapItems<TItem, TResult>(
//   items: TItem,
//   fn: (item: TItem, index: number) => TResult,
// ): TResult;

// export function mapItems<TItem, TResult>(
//   items: Array<TItem>,
//   fn: (item: TItem, index: number) => TResult,
// ): Array<TResult>;

// export function mapItems<TItem, TResult>(
//   items: TItem | Array<TItem>,
//   fn: (item: TItem, index: number) => TResult,
// ): TResult | Array<TResult> {
//   if (!Array.isArray(items)) {
//     return fn(items, 0);
//   }

//   return items.map(fn);
// }
