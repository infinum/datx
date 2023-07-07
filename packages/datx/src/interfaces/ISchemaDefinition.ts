import { IResource } from './IResource';

export interface ISchemaDefinition {
  [key: string]: IResource<unknown, unknown>;
}
