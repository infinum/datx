import { ISchemaDefinition } from '../interfaces/ISchemaDefinition';
import { Schema } from './types/schema';

export function lazySchema<
  // TODO: Fix this to avoid circular type reference
  TSchema extends Schema<TDefinition>,
  TDefinition extends ISchemaDefinition,
>(schemaFn: () => TSchema): TSchema {
  return schemaFn();
}
