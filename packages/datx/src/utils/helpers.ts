import { ISchemaDefinition } from '../interfaces/ISchemaDefinition';
import { Schema } from './types/schema';

export function lazySchema<
  // TODO: Fix this to avoid circular type reference
  TSchema extends Schema<TDefinition>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  TDefinition extends ISchemaDefinition<any, any>,
>(schemaFn: () => TSchema): TSchema {
  return schemaFn();
}
