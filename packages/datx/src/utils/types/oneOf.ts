import { PartialOnUndefinedDeep } from 'type-fest';
import { IResource } from '../../interfaces/IResource';
import { customScalar } from './customScalar';

export function OneOf<TInstance1, TPlain1>(
  type1: IResource<TInstance1, TPlain1>,
): IResource<TInstance1, TPlain1>;

export function OneOf<TInstance1, TPlain1, TInstance2, TPlain2>(
  type1: IResource<TInstance1, TPlain1>,
  type2: IResource<TInstance2, TPlain2>,
): IResource<TInstance1 | TInstance2, TPlain1 | TPlain2>;

export function OneOf<TInstance1, TPlain1, TInstance2, TPlain2, TInstance3, TPlain3>(
  type1: IResource<TInstance1, TPlain1>,
  type2: IResource<TInstance2, TPlain2>,
  type3: IResource<TInstance3, TPlain3>,
): IResource<TInstance1 | TInstance2 | TInstance3, TPlain1 | TPlain2 | TPlain3>;

export function OneOf<
  TInstance1,
  TPlain1,
  TInstance2,
  TPlain2,
  TInstance3,
  TPlain3,
  TInstance4,
  TPlain4,
>(
  type1: IResource<TInstance1, TPlain1>,
  type2: IResource<TInstance2, TPlain2>,
  type3: IResource<TInstance3, TPlain3>,
  type4: IResource<TInstance4, TPlain4>,
): IResource<
  TInstance1 | TInstance2 | TInstance3 | TInstance4,
  TPlain1 | TPlain2 | TPlain3 | TPlain4
>;

export function OneOf<
  TOneOf extends Array<IResource<TInstanceType, TPlainType>>,
  TInstanceType,
  TPlainType,
>(...values: TOneOf) {
  return customScalar<TInstanceType, TPlainType>(
    (instance) => {
      const value = values.find((value) => value.testInstance(instance));

      if (!value) {
        throw new Error('Invalid value');
      }

      return value.serialize(instance);
    },
    (plain) => {
      const value = values.find((value) => value.testPlain(plain));

      if (!value) {
        throw new Error('Invalid value');
      }

      return value.parse(plain);
    },
    (item: TInstanceType | PartialOnUndefinedDeep<TInstanceType>): item is TInstanceType =>
      values.some((value) => value.testInstance(item)),
    (item: TPlainType | PartialOnUndefinedDeep<TPlainType>): item is TPlainType =>
      values.some((value) => value.testPlain(item)),
  );
}
