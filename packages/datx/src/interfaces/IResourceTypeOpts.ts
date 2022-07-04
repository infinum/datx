import { TResourceProp } from './TResourceProp';
import { TResourceTypes } from './TResourceTypes';

// Define the type options object format
export interface IResourceTypeOpts<T extends TResourceTypes> {
  type: T;
  optional?: boolean;
  defaultValue?: TResourceProp<T, false>;
}
