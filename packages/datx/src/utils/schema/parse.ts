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
    outerDef: TSchema['definition'][typeof key],
    item: Partial<IResource<TSchema>>,
  ): TResourceProp<typeof def, true> => {
    const innerDef = outerDef.type;
    const def = innerDef.type;
    if ('parseValue' in def) {
      return def.parseValue(
        data[key as keyof typeof data],
        key as string | number,
        item,
        collection,
      ) as TResourceProp<typeof def, true>;
    } else if (def instanceof Schema) {
      return parseSchema(
        def,
        data[key as keyof typeof data] as IPlainResource<typeof def>,
        collection,
      );
    } else if ('defaultValue' in innerDef) {
      return (data[key as keyof typeof data] ?? innerDef.defaultValue) as TResourceProp<
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
  extCollection?: Collection,
): IResource<TSchema>;
export function parseSchema<TSchema extends Schema>(
  schema: TSchema,
  data: Array<IPlainResource<TSchema>>,
  extCollection?: Collection,
): Array<IResource<TSchema>>;
export function parseSchema<TSchema extends Schema>(
  schema: TSchema,
  data: IPlainResource<TSchema> | Array<IPlainResource<TSchema>>,
  extCollection?: Collection,
): IResource<TSchema> | Array<IResource<TSchema>> {
  if (!data) {
    return data;
  } else if (Array.isArray(data)) {
    return data.map((item) => parseSchema(schema, item, extCollection));
  }
  const collection = extCollection || new Collection();
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
