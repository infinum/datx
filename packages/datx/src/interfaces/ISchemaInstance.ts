import { IResource } from './IResource';
import { IResourceInstance } from './IResourceInstance';
import { ISchemaDefinition } from './ISchemaDefinition';

export type ISchemaInstance<TSchemaDefinition extends ISchemaDefinition> = {
  [key in keyof TSchemaDefinition]: TSchemaDefinition[key] extends IResource<
    infer TInstanceType,
    infer TPlainType
  >
    ? IResourceInstance<TSchemaDefinition[key], TInstanceType, TPlainType>
    : never;
};
