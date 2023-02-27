import {
  FieldsConfiguration,
  IBuildConfiguration,
  IConfiguration,
  IFactoryContext,
  ModelType,
  Overrides,
} from './types';
import { createContext } from './context';
import { PureCollection } from '@datx/core';
import { compute, computeField } from './compute';
import { getTraits } from './traits';

export const createBuilder = <TCollection extends PureCollection, TModelType extends ModelType>(
  client: TCollection,
  model: TModelType,
  fields: IConfiguration<TModelType>['fields'] | undefined,
  config: IConfiguration<TModelType> | undefined,
  context: IFactoryContext,
) => {
  const builder = (buildTimeConfig?: IBuildConfiguration<TModelType>): InstanceType<TModelType> => {
    const traits = getTraits(buildTimeConfig);

    const traitOverrides = traits.reduce<Overrides<TModelType>>((overrides, currentTraitKey) => {
      const hasTrait = config?.traits?.[currentTraitKey];

      if (!hasTrait) {
        throw new Error(`Trait '${currentTraitKey}' was not defined.`);
      }

      const traitsConfig = config?.traits?.[currentTraitKey] || {};

      return {
        ...overrides,
        ...(traitsConfig.overrides || {}),
      };
    }, {});

    const computedFields = fields ? compute(fields, buildTimeConfig, traitOverrides, context) : {};

    // A user might define a value in a trait that doesn't exist in the base
    // set of fields. So we need to check now if the traits set any values that
    // aren't in the base, and set them too.
    traits.forEach((trait) => {
      const traitConfig = config?.traits?.[trait] || {};

      if (!traitConfig.overrides) {
        return;
      }

      for (const stringKey of Object.keys(traitConfig.overrides)) {
        const key = stringKey as keyof FieldsConfiguration<TModelType>;

        // If the key already exists in the base fields, we'll have defined it,
        // so we don't need to worry about it.
        // @ts-ignore
        if (key in config?.fields === false) {
          // @ts-ignore
          computedFields[key] = computeField(traitConfig.overrides[key], key, context);
        }
      }
    });

    const data = client.add(computedFields, model) as InstanceType<TModelType>;

    const traitPostBuilds = traits.map((trait) => {
      const traitConfig = config?.traits?.[trait] || {};
      const postBuild = traitConfig.postBuild || ((fields) => fields);

      return postBuild;
    });

    const afterTraitPostBuildFields = traitPostBuilds.reduce((fields, traitPostBuild) => {
      return traitPostBuild(fields);
    }, data);

    if (config?.postBuild) {
      return config.postBuild(afterTraitPostBuildFields);
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
