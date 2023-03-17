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

export const identity = <T>(value: T) => value;
