import { Schema } from '../Schema';
import { ICustomScalar } from './ICustomScalar';
import { IResourceTypeOpts } from './IResourceTypeOpts';

// Handle all possible types
export type TResourceTypes =
  | ICustomScalar<any>
  | typeof String
  | typeof Date
  | typeof Boolean
  | typeof Number
  | Schema
  | TResourceArray
  | IResourceTypeOpts<any>;
// Handle the arrays
type TResourceArray = [TResourceTypes];
