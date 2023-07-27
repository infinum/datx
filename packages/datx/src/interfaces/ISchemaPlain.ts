import { Simplify } from 'type-fest';
import { IResource } from './IResource';
import { IResourcePlain } from './IResourcePlain';
import { ISchemaDefinition } from './ISchemaDefinition';

type ISpecificPlainType<TInstanceType, TPlainType> = TPlainType extends ISchemaPlain<
  infer TInnerDefinition
>
  ? Simplify<ISchemaPlain<TInnerDefinition>>
  : IResourcePlain<TInstanceType, TPlainType>;

type ISchemaPlainProperty<
  TSchemaDefinition extends ISchemaDefinition,
  TSchemaProperty extends IResource<unknown, unknown> = TSchemaDefinition[keyof TSchemaDefinition],
> = TSchemaProperty extends IResource<infer TInstanceType, infer TPlainType>
  ? ISpecificPlainType<TInstanceType, TPlainType>
  : never;

export type ISchemaPlain<TSchemaDefinition extends ISchemaDefinition> = {
  [key in keyof TSchemaDefinition]: TSchemaDefinition[key] extends IResource<
    infer IKeyInstanceType,
    infer IKeyPlainType
  >
    ? IKeyPlainType extends NonNullable<IKeyPlainType>
      ? ISchemaPlainProperty<TSchemaDefinition, IResource<IKeyInstanceType, IKeyPlainType>>
      :
          | ISchemaPlainProperty<
              TSchemaDefinition,
              IResource<NonNullable<IKeyInstanceType>, NonNullable<IKeyPlainType>>
            >
          | undefined
    : never;
};
