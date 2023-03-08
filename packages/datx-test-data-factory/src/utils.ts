import { IRawModel, META_FIELD } from '@datx/utils';
import { MODEL_LINKS_FIELD, MODEL_META_FIELD } from '@datx/jsonapi';
import { Field, FieldGenerator, Fields, ModelType } from './types';

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

export const getRawData = <IModelType extends ModelType>(
  fields: Record<string, Fields<IModelType>>,
) => {
  const { meta, links, ...rest } = fields;

  const rawData: IRawModel = {
    ...rest,
    [META_FIELD]: {
      // fields: Object.keys(computedFields || {}).reduce((obj, key) => {
      //   // const mappedName = mapKeys[key] ?? key;
      //   obj[key] = { referenceDef: false };

      //   return obj;
      // }, {}),
      // id: computedFields.id,
      [MODEL_LINKS_FIELD]: links,
      [MODEL_META_FIELD]: meta,
      // [MODEL_PERSISTED_FIELD]: Boolean(computedFields.id),
      // type: type,
    },
  };

  return rawData;
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
