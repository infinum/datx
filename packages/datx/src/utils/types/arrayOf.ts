import { IResource } from '../../interfaces/IResource';
import { customScalar } from './customScalar';

export const ArrayOf = <TItemType>(
  ItemType: TItemType,
): TItemType extends IResource<infer TInstanceType, infer TPlainType>
  ? IResource<Array<TInstanceType>, Array<TPlainType>>
  : never => {
  type TInstance = TItemType extends IResource<infer TInstanceType, unknown>
    ? TInstanceType
    : never;
  type TPlain = TItemType extends IResource<unknown, infer TPlainType> ? TPlainType : never;
  type TReturnType = TItemType extends IResource<infer TInstanceType, infer TPlainType>
    ? IResource<Array<TInstanceType>, Array<TPlainType>>
    : never;

  const Type = ItemType as IResource<TInstance, TPlain>;

  return customScalar<Array<TInstance>, Array<TPlain>>(
    (instance: Array<TInstance>) => instance.map((item) => Type.serialize(item)),
    (plain: Array<TPlain>) => plain.map((item) => Type.parse(item)),
    (item): item is Array<TInstance> =>
      Array.isArray(item) && item.every((i: TInstance) => Type.testInstance(i)),
    (item): item is Array<TPlain> =>
      Array.isArray(item) && item.every((i: TPlain) => Type.testPlain(i)),
  ) as TReturnType;
};
