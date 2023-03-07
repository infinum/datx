import { IResource } from '../../interfaces/IResource';
import { TResourceProp } from '../../interfaces/TResourceProp';
import { Schema } from '../../Schema';
import { mapObjectValues } from '../helpers';

function mergeProp<TSchema extends Schema>(
  target: Partial<IResource<TSchema>>,
  source: Partial<IResource<TSchema>>,
) {
  return (
    key: keyof TSchema['definition'],
    outerDef: TSchema['definition'][typeof key],
  ): TResourceProp<(typeof outerDef)['type']['type'], true> => {
    const def = outerDef.type.type;
    if (def instanceof Schema) {
      // @ts-ignore Figure out why this doesn't work here, but otherwise it's OK
      return mergeSchema(
        def,
        target?.[key as keyof typeof target] as IResource<typeof def>,
        source?.[key as keyof typeof source] as IResource<typeof def>,
      );
    }

    return (source[key as keyof typeof source] ??
      target[key as keyof typeof target]) as TResourceProp<typeof def, true>;
  };
}

export function mergeSchema<TSchema extends Schema>(
  schema: TSchema,
  target: Partial<IResource<TSchema>>,
  source: Partial<IResource<TSchema>>,
): IResource<TSchema> {
  return mapObjectValues<TSchema['definition']>(schema.definition, mergeProp(target, source));
}
