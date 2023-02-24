import { IBuildConfiguration, IConfiguration, IFactoryContext, ModelType } from './types';
import { createContext } from './context';
import { PureCollection } from '@datx/core';
import { compute } from './compute';
import { getTraits } from './traits';

export const createBuilder = <TCollection extends PureCollection, TModelType extends ModelType>(
  client: TCollection,
  model: TModelType,
  fields: IConfiguration<TModelType>['fields'] | undefined,
  config: IConfiguration<TModelType> | undefined,
  context: IFactoryContext,
) => {
  const builder = (buildTimeConfig?: IBuildConfiguration<TModelType>): InstanceType<TModelType> => {
    const computedFields = fields ? compute(fields, buildTimeConfig, context) : {};
    const traits = getTraits(buildTimeConfig);

    const data = client.add(computedFields, model) as InstanceType<TModelType>;

    if (config?.postBuild) {
      return config.postBuild(data);
    }

    return data;
  };

  builder.reset = () => {
    context.reset();
  };

  return builder;
};

export const createFactory = <TCollection extends PureCollection>(client: TCollection) => {
  const factory = <TModelType extends ModelType>(
    model: TModelType,
    config?: IConfiguration<TModelType>,
  ) => {
    const { fields } = config || {};
    const context = createContext();

    return createBuilder(client, model, fields, config, context);
  };

  factory.reset = () => {
    client.reset();
  };

  return factory;
};
