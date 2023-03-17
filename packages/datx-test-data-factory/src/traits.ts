import { FactoryFields, IBuildConfiguration, IConfiguration, ModelType } from './types';
import { identity } from './utils';

/**
 * REturns an array of trait names from the build time configuration
 *
 * @param buildTimeConfig
 * @returns {Array<string>} The array of trait names
 */
export const getTraits = <TModelType extends ModelType>(
  buildTimeConfig: IBuildConfiguration<TModelType> | undefined,
) => {
  const { traits = [] } = buildTimeConfig || {};

  return Array.isArray(traits) ? traits : [traits];
};

export const getTraitOverrides = <TModelType extends ModelType>(
  traits: Array<string>,
  config: IConfiguration<TModelType> | undefined,
) => {
  return traits.reduce<FactoryFields<TModelType>>((overrides, currentTraitKey) => {
    const hasTrait = config?.traits?.[currentTraitKey];

    if (!hasTrait) {
      throw new Error(`Trait '${currentTraitKey}' was not defined.`);
    }

    const traitConfig = config?.traits?.[currentTraitKey] || {};

    return {
      ...overrides,
      ...(traitConfig.overrides || {}),
    };
  }, {} as any);
};

export const getTraitPostBuildFunctions = <TModelType extends ModelType>(
  traitNames: Array<string>,
  config: IConfiguration<TModelType> | undefined,
) =>
  traitNames.map((trait) => {
    const traitConfig = config?.traits?.[trait] || {};
    const postBuild = traitConfig.postBuild || identity;

    return postBuild;
  });
