import { IPlainResource, IResource } from '../interfaces/IResource';
import { TResourceProp } from '../interfaces/TResourceProp';
import { Schema } from '../Schema';
import { mapObjectValues } from './helpers';

export function parseSchema<TSchema extends Schema>(
  schema: TSchema,
  data: IPlainResource<TSchema>,
): IResource<TSchema> {
  return mapObjectValues<TSchema['definition']>(
    schema.definition,
    (
      key: keyof TSchema['definition'],
      def: TSchema['definition'][typeof key],
    ): TResourceProp<typeof def, true> => {
      if ('parseValue' in def) {
        return def.parseValue(data[key as keyof typeof data]) as TResourceProp<typeof def, true>;
      }
      return data[key as keyof typeof data] as TResourceProp<typeof def, true>;
    },
  );
}

export function serializeSchema<TSchema extends Schema>(
  schema: TSchema,
  data: IResource<TSchema>,
): IPlainResource<TSchema> {
  return mapObjectValues<TSchema['definition']>(
    schema.definition,
    (
      key: keyof TSchema['definition'],
      def: TSchema['definition'][typeof key],
    ): TResourceProp<typeof def, false> => {
      if ('serialize' in def) {
        return def.serialize(data[key as keyof typeof data]) as TResourceProp<typeof def, false>;
      }
      return data[key as keyof typeof data] as TResourceProp<typeof def, false>;
    },
  );
}
