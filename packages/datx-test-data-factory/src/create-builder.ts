import { IBuildConfiguration, IBuilderConfig, ModelType } from './types';
import { getModelType, PureCollection } from '@datx/core';
import { compute } from './compute';

import { getTraitOverrides, getTraitPostBuildFunctions, getTraits } from './traits';
import { getRawData, identity } from './utils';
import { isJsonApiClass } from '@datx/jsonapi';

export const createBuilder = <TCollection extends PureCollection, TModelType extends ModelType>({
  client,
  model,
  config,
  context,
}: IBuilderConfig<TCollection, TModelType>) => {
  const { fields = {} } = config || {};

  /**
   * fields => traits => trait overrides => build time overrides
   */
  const builder = (buildTimeConfig?: IBuildConfiguration<TModelType>): InstanceType<TModelType> => {
    const traitNames = getTraits(buildTimeConfig);

    const finalFields = {
      ...fields,
      ...getTraitOverrides(traitNames, config),
      ...buildTimeConfig?.overrides,
    };

    const computedFields = compute(finalFields, context);

    const type = getModelType(model);
    const rawData = isJsonApiClass(model) ? getRawData(computedFields) : computedFields;
    const data = client.add(rawData, type) as InstanceType<TModelType>;

    // This part mutates the original data
    getTraitPostBuildFunctions(traitNames, config).reduce(
      (mutatedData, traitPostBuild) => traitPostBuild(mutatedData),
      data,
    );

    const postBuild = config?.postBuild || identity;
    const map = buildTimeConfig?.map || identity;

    return map(postBuild(data));
  };

  builder.reset = () => {
    context.reset();
  };

  return builder;
};
