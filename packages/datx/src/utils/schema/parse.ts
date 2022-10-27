import { Collection } from '../../Collection';
import { IPlainResource, IResource } from '../../interfaces/IResource';
import { TResourceProp } from '../../interfaces/TResourceProp';
import { Schema } from '../../Schema';
import { SchemaMeta } from '../../SchemaMeta';
import { mapObjectValues } from '../helpers';
import { mergeSchema } from './merge';

function parseProp<TSchema extends Schema>(data: IPlainResource<TSchema>, collection?: Collection) {
  return (
    key: keyof TSchema['definition'],
    def: TSchema['definition'][typeof key],
  ): TResourceProp<typeof def, true> => {
    if ('parseValue' in def) {
      return def.parseValue(data[key as keyof typeof data], collection) as TResourceProp<
        typeof def,
        true
      >;
    } else if (def instanceof Schema) {
      // @ts-ignore Figure out why this doesn't work here, but otherwise it's OK
      return parseSchema(
        def,
        data[key as keyof typeof data] as IPlainResource<typeof def>,
        collection,
      );
    } else if ('defaultValue' in def) {
      return (data[key as keyof typeof data] ?? def.defaultValue) as TResourceProp<
        typeof def,
        true
      >;
    } else if (def instanceof Array) {
      return (
        (data[key as keyof typeof data] || []) as Array<TSchema['definition'][typeof key]>
      ).map((item) => parseSchema(def[0] as Schema, item, collection)) as TResourceProp<
        typeof def,
        true
      >;
    }
    return data[key as keyof typeof data] as TResourceProp<typeof def, true>;
  };
}

export function parseSchema<TSchema extends Schema>(
  schema: TSchema,
  data: IPlainResource<TSchema>,
  collection?: Collection,
): IResource<TSchema> {
  if (!data) {
    return data;
  }
  const item = mapObjectValues<TSchema['definition']>(
    schema.definition,
    parseProp(data, collection),
  );

  const id = schema.id(item);
  const collectionItem = collection?.byId[id];

  if (collectionItem) {
    const merged = mergeSchema(schema, collectionItem as IResource<TSchema>, item);
    return Object.assign(collectionItem, merged);
  }

  SchemaMeta.set(item, { id, type: schema.type, schema });

  if (collection) {
    return collection.add(item) as IResource<TSchema>;
  }

  return item;
}
