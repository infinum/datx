import { IResource } from '../../interfaces/IResource';

export function customScalar<TInstanceType, TPlainType>(
  serialize: (instance: TInstanceType) => TPlainType,
  parse: (plain: TPlainType) => TInstanceType,
  isOptional = false,
  defaultValue?: TInstanceType,
): IResource<TInstanceType, TPlainType> {
  return {
    serialize,
    parse,
    isOptional,
    defaultValue,
    optional: () => customScalar(serialize, parse, true),
    default: (value: TInstanceType) => customScalar(serialize, parse, isOptional, value),
    test: (item: unknown): item is TInstanceType => typeof item !== 'function', // TODO: Improve
  };
}
