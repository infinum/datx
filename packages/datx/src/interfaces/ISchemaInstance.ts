import { Simplify } from 'type-fest';
import { IResource } from './IResource';
import { IResourceInstance } from './IResourceInstance';
import { ISchemaDefinition } from './ISchemaDefinition';

type ISpecificInstanceType<TInstanceType, TPlainType> = TInstanceType extends ISchemaInstance<
  infer TInnerDefinition
>
  ? Simplify<ISchemaInstance<TInnerDefinition>>
  : IResourceInstance<TInstanceType, TPlainType>;

type ISchemaInstanceProperty<
  TSchemaDefinition extends ISchemaDefinition,
  TSchemaProperty extends IResource<unknown, unknown> = TSchemaDefinition[keyof TSchemaDefinition],
> = TSchemaProperty extends IResource<infer TInstanceType, infer TPlainType>
  ? ISpecificInstanceType<TInstanceType, TPlainType>
  : never;

// export type ISchemaInstance<TSchemaDefinition extends ISchemaDefinition> = {
//   [key in keyof TSchemaDefinition]: TSchemaDefinition[key] extends NonNullable<
//     TSchemaDefinition[key]
//   >
//     ? ISchemaInstanceProperty<TSchemaDefinition, TSchemaDefinition[key]>
//     : ISchemaInstanceProperty<TSchemaDefinition, NonNullable<TSchemaDefinition[key]>> | undefined;
// };

export type ISchemaInstance<TSchemaDefinition extends ISchemaDefinition> = {
  [key in keyof TSchemaDefinition]: TSchemaDefinition[key] extends IResource<
    infer IKeyInstanceType,
    infer IKeyPlainType
  >
    ? IKeyInstanceType extends NonNullable<IKeyInstanceType>
      ? ISchemaInstanceProperty<TSchemaDefinition, IResource<IKeyInstanceType, IKeyPlainType>>
      :
          | ISchemaInstanceProperty<
              TSchemaDefinition,
              IResource<NonNullable<IKeyInstanceType>, NonNullable<IKeyPlainType>>
            >
          | undefined
    : never;
};
