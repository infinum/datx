import { IPerBuildGenerator } from './generators/per-build';
import { ISequenceGenerator } from './generators/sequence';
import { IModelConstructor, PureCollection, PureModel } from '@datx/core';
import { IOneOfGenerator } from './generators/one-of';
import { IJsonapiModel } from '@datx/jsonapi';

export type ModelType = IModelConstructor<PureModel>;
export type JsonapiModelType = IModelConstructor<PureModel & IJsonapiModel>;

export type FieldGenerator<T> = ISequenceGenerator<T> | IPerBuildGenerator<T> | IOneOfGenerator<T>;

export type Field<T = any> = T | FieldGenerator<T>;

/**
 * Removes all actions (functions) from a model
 */
export type OmitModelActions<TModel> = Omit<
  TModel,
  {
    [K in keyof TModel]: TModel[K] extends (...args: Array<any>) => any ? K : never;
  }[keyof TModel]
>;

/**
 * Removes meta data from a model
 */
export type OmitModelMeta<TModel> = Omit<TModel, 'meta'>;

/**
 * Extracts all fields from a model
 */
export type Fields<TModelType extends ModelType> = {
  [Key in keyof OmitModelMeta<
    OmitModelActions<InstanceType<TModelType>>
  >]?: InstanceType<TModelType>[Key];
};

export type FactoryFields<TModelType extends ModelType> = {
  readonly [Key in keyof Fields<TModelType>]: Field<Fields<TModelType>[Key]>;
} & (TModelType extends JsonapiModelType // JSONAPI support
  ? {
      readonly meta?: Record<string, unknown>;
      readonly links?: Record<string, unknown>;
    }
  : {});

export type PostBuildFn<TModelType extends ModelType> = (
  model: InstanceType<TModelType>,
) => InstanceType<TModelType>;

export interface ITraitsConfiguration<TModelType extends ModelType> {
  readonly [traitName: string]: {
    overrides?: FactoryFields<TModelType>;
    postBuild?: PostBuildFn<TModelType>;
  };
}

export interface IConfiguration<TModelType extends ModelType> {
  readonly fields?: FactoryFields<TModelType>;
  /**
   * A trait configurations that can be applied to the model
   */
  readonly traits?: ITraitsConfiguration<TModelType>;
  /**
   * A function that can be used to modify the model after it has been built.
   * Applied after traits and overrides.
   */
  readonly postBuild?: PostBuildFn<TModelType>;
}

export interface IBuildConfiguration<TModelType extends ModelType> {
  /**
   * A list of fields to override
   */
  overrides?: FactoryFields<TModelType>;
  /**
   * Single trait or a list of traits to apply to the model
   */
  traits?: string | Array<string>;
  /**
   * A function that can be used to modify the model after it has been built
   */
  map?: (instance: InstanceType<TModelType>) => InstanceType<TModelType>;
}

export interface IFactory<TModelType extends ModelType> {
  (buildTimeConfig?: IBuildConfiguration<TModelType>): InstanceType<TModelType>;
}

export interface IFactoryContextValue {
  sequenceCounterMap: Map<string, number>;
}

export interface IFactoryContext {
  value: IFactoryContextValue;
  reset: () => void;
}

export interface IBuilderConfig<TCollection extends PureCollection, TModelType extends ModelType> {
  client: TCollection;
  model: TModelType;
  config: IConfiguration<TModelType> | undefined;
  context: IFactoryContext;
}
