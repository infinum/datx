import { PartialOnUndefinedDeep, Simplify } from 'type-fest';
import { ISchemaDefinition } from '../../interfaces/ISchemaDefinition';
import { ISchemaInstance } from '../../interfaces/ISchemaInstance';
import { ISchemaPlain } from '../../interfaces/ISchemaPlain';
import { Schema } from '../types/schema';

export function parseSchema<TDefinition extends ISchemaDefinition>(
  schema: Schema<TDefinition>,
  plain: PartialOnUndefinedDeep<ISchemaPlain<TDefinition>>,
): Simplify<ISchemaInstance<TDefinition>> {
  const definition = schema.definition;
  const keys = Object.keys(definition);

  const instance: Partial<ISchemaInstance<TDefinition>> = {};

  keys.forEach((key: keyof typeof instance) => {
    const value = plain[key as string];
    const type = definition[key];

    instance[key] = type.parse(value) as (typeof instance)[typeof key];
  });

  return instance as ISchemaInstance<TDefinition>;
}
