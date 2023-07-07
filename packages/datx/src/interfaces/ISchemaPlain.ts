import { IResource } from './IResource';
import { IResourcePlain } from './IResourcePlain';
import { ISchemaDefinition } from './ISchemaDefinition';

export type ISchemaPlain<TSchemaDefinition extends ISchemaDefinition> = {
  [key in keyof TSchemaDefinition]: TSchemaDefinition[key] extends IResource<
    infer TInstanceType,
    infer TPlainType
  >
    ? IResourcePlain<TSchemaDefinition[key], TInstanceType, TPlainType>
    : never;
};
