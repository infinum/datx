import { IBuildConfiguration, ModelType } from './types';

export const getTraits = <TModelType extends ModelType>(
  buildTimeConfig: IBuildConfiguration<TModelType> | undefined,
) => {
  const { traits = [] } = buildTimeConfig || {};

  return Array.isArray(traits) ? traits : [traits];
};
