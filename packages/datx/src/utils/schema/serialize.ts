import { PartialOnUndefinedDeep, Simplify } from 'type-fest';
import { ISchemaDefinition } from '../../interfaces/ISchemaDefinition';
import { ISchemaInstance } from '../../interfaces/ISchemaInstance';
import { ISchemaPlain } from '../../interfaces/ISchemaPlain';
import { Schema } from '../types/schema';

export function serializeSchema<TDefinition extends ISchemaDefinition>(
  schema: Schema<TDefinition>,
  instance: PartialOnUndefinedDeep<ISchemaInstance<TDefinition>>,
  depth = Infinity,
): Simplify<ISchemaPlain<TDefinition>> {
  const definition = schema.definition;
  const keys = Object.keys(definition);

  type TKey = keyof typeof definition & keyof typeof instance;
  const plain: Partial<ISchemaPlain<TDefinition>> = {};

  keys.forEach((key) => {
    const type = definition[key];

    if (type instanceof Schema) {
      type TInnerSchemaDefinition = typeof type extends Schema<infer TInnerDefinition>
        ? TInnerDefinition
        : never;
      const value = instance[key as TKey] as ISchemaInstance<TInnerSchemaDefinition>;

      if (depth > 0) {
        // @ts-expect-error TODO: Fix this - it should be correct[citation needed] but TS can't infer it
        plain[key] = serializeSchema<TInnerSchemaDefinition>(type, value, depth - 1);
      } else {
        plain[key as TKey] = type.getId(value) as (typeof plain)[TKey];
      }
    } else {
      const value = instance[key as TKey];

      plain[key as TKey] = type.serialize(value) as (typeof plain)[TKey];
    }
  });

  return plain as Simplify<ISchemaPlain<TDefinition>>;
}
