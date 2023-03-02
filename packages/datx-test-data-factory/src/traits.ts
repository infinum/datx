import { Fields, IBuildConfiguration, IConfiguration, ModelType } from './types';

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
  return traits.reduce<Fields<TModelType>>((overrides, currentTraitKey) => {
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
