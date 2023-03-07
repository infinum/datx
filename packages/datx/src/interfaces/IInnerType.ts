import { TResourceProp } from './TResourceProp';
import { TResourceType } from './TResourceType';

// Define the type options object format
export interface IInnerType<T extends TResourceType> {
  type: T;
  optional?: boolean;
  defaultValue?: TResourceProp<IInnerType<T>, false>;
}
