import { IResource } from './IResource';

export interface ISchemaDefinition<TInstance = unknown, TPlain = unknown> {
  [key: string]: IResource<TInstance, TPlain>;
}
