import { IPerBuildGenerator } from './generators/per-build';
import { ISequenceGenerator } from './generators/sequence';
import { IModelConstructor, PureCollection, PureModel } from '@datx/core';
import { IOneOfGenerator } from './generators/one-of';

export type ModelType = IModelConstructor<PureModel>;

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
 * Extracts all attributes from a model
 */
export type Attributes<TModelType extends ModelType> = {
  [Key in keyof OmitModelMeta<
    OmitModelActions<InstanceType<TModelType>>
  >]?: InstanceType<TModelType>[Key];
};

export type Fields<TModelType extends ModelType> = {
  readonly [Key in keyof Attributes<TModelType>]: Field<Attributes<TModelType>[Key]>;
};

export type PostBuildFn<TModelType extends ModelType> = (
  model: InstanceType<TModelType>,
) => InstanceType<TModelType>;

export interface ITraitsConfiguration<TModelType extends ModelType> {
  readonly [traitName: string]: {
    overrides?: Fields<TModelType>;
    postBuild?: PostBuildFn<TModelType>;
  };
}

export interface IConfiguration<TModelType extends ModelType> {
  readonly fields: Fields<TModelType>;
  readonly postBuild?: PostBuildFn<TModelType>;
  readonly traits?: ITraitsConfiguration<TModelType>;
}

export interface IBuildConfiguration<TModelType extends ModelType> {
  overrides?: Fields<TModelType>;
  traits?: string | Array<string>;
  // map?: (builtThing: Attributes<TModelType>) => Attributes<TModelType>;
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

/**
 * JSON:API
 */

export type JsonapiFields<TModelType extends ModelType> = Fields<TModelType> & {
  readonly meta?: Record<string, unknown>;
};

export interface IJsonapiTraitsConfiguration<TModelType extends ModelType> {
  readonly [traitName: string]: {
    overrides?: JsonapiFields<TModelType>;
    postBuild?: PostBuildFn<TModelType>;
  };
}

export interface IJsonapiConfiguration<TModelType extends ModelType> {
  readonly fields: JsonapiFields<TModelType>;
  readonly postBuild?: PostBuildFn<TModelType>;
  readonly traits?: IJsonapiTraitsConfiguration<TModelType>;
}

export type JsonapiBuildConfiguration<TModelType extends ModelType> =
  IBuildConfiguration<TModelType> & {
    overrides?: JsonapiFields<TModelType>;
  };
