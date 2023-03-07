import { perBuildType } from './generators/per-build';
import { sequenceType } from './generators/sequence';

import {
  Fields,
  Field,
  FactoryFields,
  IBuildConfiguration,
  IFactoryContext,
  ModelType,
} from './types';
import { isGenerator, mapValues } from './utils';

export const computeField = <TModelType extends ModelType>(
  fieldValue: Field<Fields<TModelType>>,
  key: string,
  context: IFactoryContext,
) => {
  const {
    value: { sequenceCounterMap },
  } = context;

  if (isGenerator(fieldValue)) {
    switch (fieldValue.type) {
      case sequenceType: {
        if (!sequenceCounterMap.has(key)) {
          sequenceCounterMap.set(key, 0);
        }

        const value = sequenceCounterMap.get(key) as number;

        sequenceCounterMap.set(key, value + 1);

        return fieldValue.call(sequenceCounterMap.get(key) as number);
      }

      case 'oneOf':
      case perBuildType: {
        return fieldValue.call();
      }
    }
  }

  return fieldValue;
};

export const compute = <TModelType extends ModelType>(
  fields: FactoryFields<TModelType>,
  buildTimeConfig: IBuildConfiguration<TModelType> = {},
  traitOverrides: Partial<FactoryFields<TModelType>> = {},
  context: IFactoryContext,
) => {
  const overrides = buildTimeConfig.overrides || {};

  return mapValues(fields, (value, key) => {
    const override = overrides[key];

    const trait = traitOverrides[key];

    if (override !== undefined) {
      return computeField(override, key, context);
    }

    if (trait !== undefined) {
      return computeField(trait, key, context);
    }

    // @ts-ignore
    return computeField(value, key, context);
  });
};
