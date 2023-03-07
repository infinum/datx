import { IInnerType } from './IInnerType';
import { TResourceType } from './TResourceType';

export interface IOuterType<T extends TResourceType> {
  type: IInnerType<T>;
  optional(defaultValue?: T): IOuterType<T>;
}
