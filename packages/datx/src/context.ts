import { ISchemaDefinition } from './interfaces/ISchemaDefinition';
import { Schema } from './utils/types/schema';

export function context(schemas: Record<string, Schema<ISchemaDefinition>>) {
  return {
    schemas,
  };
}
