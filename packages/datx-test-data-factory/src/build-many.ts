import { IFactory, IBuildConfiguration, ModelType } from './types';

export const buildMany = <TModelType extends ModelType>(
  factory: IFactory<TModelType>,
  count: number,
  buildTimeConfig?: IBuildConfiguration<TModelType>,
) => {
  return Array.from({ length: count }, () => factory(buildTimeConfig));
};
