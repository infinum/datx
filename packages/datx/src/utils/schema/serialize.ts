import { IPlainResource, IResource } from '../../interfaces/IResource';
import { TResourceProp } from '../../interfaces/TResourceProp';
import { Schema } from '../../Schema';
import { mapObjectValues } from '../helpers';

export function serializeSchema<TSchema extends Schema>(
  schema: TSchema,
  data: IResource<TSchema>,
): IPlainResource<TSchema> {
  return mapObjectValues<
    TSchema['definition'],
    TResourceProp<TSchema['definition'][keyof TSchema['definition']], false>
  >(
    schema.definition,
    (
      key: keyof TSchema['definition'],
      def: TSchema['definition'][typeof key],
    ): TResourceProp<typeof def, false> => {
      if ('serialize' in def) {
        return def.serialize(data[key as keyof typeof data]) as TResourceProp<typeof def, false>;
      } else if (def instanceof Schema) {
        // @ts-ignore Figure out why this doesn't work here, but otherwise it's OK
        return serializeSchema(def, data[key as keyof typeof data] as IResource<typeof def>);
      }
      return data[key as keyof typeof data] as TResourceProp<typeof def, false>;
    },
  );
}
