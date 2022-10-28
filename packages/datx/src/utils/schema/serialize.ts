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
  contained?: Array<string | number>,
): IPlainResource<TSchema>;
export function serializeSchema<TSchema extends Schema>(
  schema: TSchema,
  data: IResource<TSchema>,
  depth: number,
  flatten: true,
  contained?: Array<string | number>,
): IFlattenedResource<TSchema>;
export function serializeSchema<TSchema extends Schema>(
  schema: TSchema,
  data: IResource<TSchema>,
  depth?: number,
  flatten?: boolean,
  contained?: Array<string | number>,
): IPlainResource<TSchema> | IFlattenedResource<TSchema>;
export function serializeSchema<TSchema extends Schema>(
  schema: TSchema,
  data: IResource<TSchema>,
  depth = Infinity,
  flatten = false,
  contained: Array<string | number> = [],
): IPlainResource<TSchema> | IFlattenedResource<TSchema> {
  if (!data) {
    return data;
  }
  contained.push(schema.id(data));
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
          return 'id' in def ? (def.id(data) as any) : undefined; // TODO: Add string|number as a valid type for plain relations
        }

        const innerItem = def.serialize(
          data[key as keyof typeof data],
          depth - 1,
          flatten,
          contained,
        ) as TResourceProp<typeof def, false>;

        if (flatten) {
          linked.push(innerItem.data);
          linked.push.apply(linked, innerItem.linked);
        } else {
          return innerItem;
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
