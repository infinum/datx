import { IResource } from '../../interfaces/IResource';

export function customScalar<TInstanceType, TPlainType>(
  serialize: (instance: TInstanceType) => TPlainType,
  parse: (plain: TPlainType) => TInstanceType,
  testInstance: (item: unknown) => item is TInstanceType,
  testPlain: (item: unknown) => item is TPlainType,
  isOptional = false,
  defaultValue?: TInstanceType,
): IResource<TInstanceType, TPlainType> {
  return {
    serialize,
    parse,
    isOptional,
    defaultValue,
    optional: () => customScalar(serialize, parse, testInstance, testPlain, true),
    default: (value: TInstanceType) =>
      customScalar(serialize, parse, testInstance, testPlain, isOptional, value),
    testInstance,
    testPlain,
  };
}
