import { perBuildType } from './generators/per-build';
import { sequenceType } from './generators/sequence';
import {
  Attributes,
  IBuildConfiguration,
  IConfiguration,
  Field,
  FieldsConfiguration,
  ModelType,
} from './types';
import { isGenerator, mapValues } from './utils';
import { PureCollection } from '@datx/core';

export const createFactory = <TCollection extends PureCollection>(client: TCollection) => {
  const factory = <TModelType extends ModelType>(
    model: TModelType,
    config?: IConfiguration<TModelType>,
  ) => {
    let sequenceCounterMap = new Map();

    const computeField = (fieldValue: Field<Attributes<TModelType>>, key: string) => {
      if (isGenerator(fieldValue)) {
        switch (fieldValue.type) {
          case sequenceType: {
            if (!sequenceCounterMap.has(key)) {
              sequenceCounterMap.set(key, 0);
            }

            sequenceCounterMap.set(key, sequenceCounterMap.get(key) + 1);

            return fieldValue.call(sequenceCounterMap.get(key));
          }

          case perBuildType: {
            return fieldValue.call();
          }
        }
      }

      return fieldValue;
    };

    const compute = (
      fields: FieldsConfiguration<TModelType>,
      buildTimeConfig: IBuildConfiguration<TModelType> = {},
    ) => {
      const overrides = buildTimeConfig.overrides || {};

      return mapValues(fields, (value, key) => {
        const override = overrides[key];

        if (override) {
          return computeField(override, key);
        }

        // @ts-ignore
        return computeField(value, key);
      });
    };

    const build = (buildTimeConfig?: IBuildConfiguration<TModelType>): InstanceType<TModelType> => {
      const fields = config?.fields ? compute(config?.fields, buildTimeConfig) : {};

      const data = client.add(fields, model) as InstanceType<TModelType>;

      if (config?.postBuild) {
        return config.postBuild(data);
      }

      return data;
    };

    build.reset = () => {
      sequenceCounterMap = new Map();
    };

    return build;
  };

  factory.reset = () => {
    client.reset();
  };

  return factory;
};
