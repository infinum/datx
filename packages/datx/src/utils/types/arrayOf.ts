import { IResource } from '../../interfaces/IResource';
import { customScalar } from './customScalar';

export const ArrayOf = <TItemType extends IResource<unknown, unknown>>(
  ItemType: TItemType,
): TItemType extends IResource<infer TInstanceType, infer TPlainType>
  ? IResource<Array<TInstanceType>, Array<TPlainType>>
  : never =>
  customScalar(
    (instance: Array<unknown>) => instance.map((item) => ItemType.serialize(item)),
    (plain: Array<unknown>) => plain.map((item) => ItemType.parse(item)),
  ) as any;
