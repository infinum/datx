import { IInnerType } from './IInnerType';
import { TResourceType } from './TResourceType';

export interface IOuterType<T extends TResourceType> {
  type: IInnerType<T>;
  optional(defaultValue?: T extends TResourceType<infer TInner> ? TInner : never): IOuterType<T>;
}
