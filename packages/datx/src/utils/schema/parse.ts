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
  const instance: Partial<ISchemaInstance<TDefinition>> = {};

  type TKeys = keyof typeof definition & keyof typeof plain;
  const keys = Object.keys(definition) as Array<TKeys>;

  keys.forEach((key: TKeys) => {
    const value = plain[key];
    const type = definition[key];

    instance[key] = type.parse(value) as (typeof instance)[typeof key];
  });

  return instance as ISchemaInstance<TDefinition>;
}
