import { Schema } from '../Schema';
import { ICustomScalar } from './ICustomScalar';
import { TResourceTypeOpts } from './TResourceTypeOpts';

// Handle all possible types
export type TResourceTypes =
  | ICustomScalar<any>
  | typeof String
  | typeof Date
  | typeof Boolean
  | typeof Number
  | Schema
  | TResourceArray
  | TResourceTypeOpts<any>;
// Handle the arrays
type TResourceArray = Array<TResourceTypes>;
