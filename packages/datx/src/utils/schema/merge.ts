import { IResource } from '../../interfaces/IResource';
import { TResourceProp } from '../../interfaces/TResourceProp';
import { Schema } from '../../Schema';
import { mapObjectValues } from '../helpers';

function mergeProp<TSchema extends Schema>(target: IResource<TSchema>, source: IResource<TSchema>) {
  return (
    key: keyof TSchema['definition'],
    def: TSchema['definition'][typeof key],
  ): TResourceProp<typeof def, true> => {
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
  target: IResource<TSchema>,
  source: IResource<TSchema>,
): IResource<TSchema> {
  return Object.assign(
    target,
    mapObjectValues<TSchema['definition']>(schema.definition, mergeProp(target, source)),
  );
}
