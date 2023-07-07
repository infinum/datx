import { Simplify } from 'type-fest';
import { ISchemaDefinition } from '../../interfaces/ISchemaDefinition';
import { ISchemaInstance } from '../../interfaces/ISchemaInstance';
import { ISchemaPlain } from '../../interfaces/ISchemaPlain';
import { Schema } from '../types/schema';

export function serializeSchema<TDefinition extends ISchemaDefinition>(
  schema: Schema<TDefinition>,
  instance: ISchemaInstance<TDefinition>,
  depth = Infinity,
): Simplify<ISchemaPlain<TDefinition>> {
  const definition = schema.definition;
  const keys = Object.keys(definition);

  const plain: Partial<ISchemaPlain<TDefinition>> = {};

  keys.forEach((key: keyof typeof instance) => {
    const type = definition[key];

    if (type instanceof Schema) {
      const value = instance[key as string] as ISchemaInstance<TDefinition>;

      if (depth > 0) {
        plain[key] = serializeSchema(type, value, depth - 1) as (typeof plain)[typeof key];
      } else {
        plain[key] = type.getId(value) as (typeof plain)[typeof key];
      }
    } else {
      const value = instance[key as string];

      plain[key] = type.serialize(value) as (typeof plain)[typeof key];
    }
  });

  return plain as ISchemaPlain<TDefinition>;
}
