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
      const innerData = data[key as keyof typeof data];
      if ('serialize' in def) {
        const id = 'id' in def ? (def.id?.(innerData) as any) : undefined; // TODO: Add string|number as a valid type for plain relations
        if (depth === 0) {
          return id;
        }

        const innerItem = def.serialize(innerData, depth - 1, flatten, contained) as TResourceProp<
          typeof def,
          false
        >;

        if (flatten) {
          linked.push(innerItem.data);
          linked.push.apply(linked, innerItem.linked);
          return id;
        } else {
          return innerItem;
        }
      }
      return innerData as TResourceProp<typeof def, false>;
    },
  );

  if (flatten) {
    return { data: item, linked: linked.filter(Boolean) } as IFlattenedResource<TSchema>;
  }
  return item;
}
