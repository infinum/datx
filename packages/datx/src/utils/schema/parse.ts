import { IPlainResource, IResource } from '../../interfaces/IResource';
import { TResourceProp } from '../../interfaces/TResourceProp';
import { Schema } from '../../Schema';
import { mapObjectValues } from '../helpers';

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
      } else if (def instanceof Schema) {
        // @ts-ignore Figure out why this doesn't work here, but otherwise it's OK
        return parseSchema(def, data[key as keyof typeof data] as IPlainResource<typeof def>);
      }
      return data[key as keyof typeof data] as TResourceProp<typeof def, true>;
    },
  );
}
