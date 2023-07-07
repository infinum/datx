import { PartialOnUndefinedDeep } from 'type-fest';

export interface IResource<TInstanceType, TPlainType> {
  serialize: (instance: TInstanceType) => TPlainType;
  parse: (plain: TPlainType | PartialOnUndefinedDeep<TPlainType>) => TInstanceType;
  isOptional: boolean;
  defaultValue?: TInstanceType;
  optional: () => IResource<TInstanceType | undefined, TPlainType | undefined>;
  default: (value: TInstanceType) => IResource<TInstanceType, TPlainType>;
  test: (item: unknown) => item is TInstanceType;
}
