import { TResourceProp } from './TResourceProp';
import { TResourceTypes } from './TResourceTypes';
export interface IResourceTypeOpts<T extends TResourceTypes> {
    type: T;
    optional?: boolean;
    defaultValue?: TResourceProp<T, false>;
}
