import { perBuildType } from './generators/per-build';
import { sequenceType } from './generators/sequence';
import {
  Attributes,
  Field,
  FieldsConfiguration,
  IBuildConfiguration,
  IFactoryContext,
  ModelType,
} from './types';
import { isGenerator, mapValues } from './utils';

const computeField = <TModelType extends ModelType>(
  fieldValue: Field<Attributes<TModelType>>,
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
  fields: FieldsConfiguration<TModelType>,
  buildTimeConfig: IBuildConfiguration<TModelType> = {},
  context: IFactoryContext,
) => {
  const overrides = buildTimeConfig.overrides || {};

  return mapValues(fields, (value, key) => {
    const override = overrides[key];

    if (override) {
      return computeField(override, key, context);
    }

    // @ts-ignore
    return computeField(value, key, context);
  });
};
