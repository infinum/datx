import { PartialOnUndefinedDeep, Simplify } from 'type-fest';
import { IResource } from '../../interfaces/IResource';
import { customScalar } from './customScalar';

export const ArrayOf = <TItemType extends IResource<unknown, unknown>>(
  ItemType: TItemType,
): TItemType extends IResource<infer TInstanceType, infer TPlainType>
  ? IResource<Array<Simplify<TInstanceType>>, Array<Simplify<PartialOnUndefinedDeep<TPlainType>>>>
  : never =>
  customScalar(
    (instance: Array<unknown>) => instance.map((item) => ItemType.serialize(item)),
    (plain: Array<unknown>) => plain.map((item) => ItemType.parse(item)),
    (item): item is Array<unknown> =>
      Array.isArray(item) && item.every((i) => ItemType.testInstance(i)),
    (item): item is Array<unknown> =>
      Array.isArray(item) && item.every((i) => ItemType.testPlain(i)),
  ) as any;
