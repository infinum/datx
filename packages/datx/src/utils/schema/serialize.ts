import { IFlattenedResource } from '../../interfaces/IFlattenedResource';
import { IPlainResource, IResource } from '../../interfaces/IResource';
import { TResourceProp } from '../../interfaces/TResourceProp';
import { Schema } from '../../Schema';
import { mapObjectValues } from '../helpers';

export function serializeSchema<TSchema extends Schema>(
  schema: TSchema,
  data: IResource<TSchema>,
  depth?: number,
  flatten?: false,
): IPlainResource<TSchema>;
export function serializeSchema<TSchema extends Schema>(
  schema: TSchema,
  data: IResource<TSchema>,
  depth: number,
  flatten: true,
): IFlattenedResource<TSchema>;
export function serializeSchema<TSchema extends Schema>(
  schema: TSchema,
  data: IResource<TSchema>,
  depth = Infinity,
  flatten = false,
): IPlainResource<TSchema> | IFlattenedResource<TSchema> {
  if (!data) {
    return data;
  }
  const linked: Array<IPlainResource<Schema>> = [];
  const item = mapObjectValues<
    TSchema['definition'],
    TResourceProp<TSchema['definition'][keyof TSchema['definition']], false>
  >(
    schema.definition,
    (
      key: keyof TSchema['definition'],
      def: TSchema['definition'][typeof key],
    ): TResourceProp<typeof def, false> | undefined => {
      if ('serialize' in def) {
        if (depth === 0) {
          return undefined;
        }
        return def.serialize(data[key as keyof typeof data], depth - 1) as TResourceProp<
          typeof def,
          false
        >;
      } else if (def instanceof Schema) {
        if (depth === 0) {
          return undefined;
        }
        // @ts-ignore Figure out why this doesn't work here, but otherwise it's OK
        const innerItem = serializeSchema(
          def,
          data[key as keyof typeof data] as IResource<typeof def>,
          depth - 1,
          flatten as any, // TODO figure out why this doesn't work
        ) as IFlattenedResource<typeof def>;

        if (flatten) {
          linked.push(innerItem.data);
          linked.push.apply(linked, innerItem.linked);
        }
      }
      return data[key as keyof typeof data] as TResourceProp<typeof def, false>;
    },
  );

  if (flatten) {
    return { data: item, linked } as IFlattenedResource<TSchema>;
  }
  return item;
}
