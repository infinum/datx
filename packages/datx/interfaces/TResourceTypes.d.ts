import { Schema } from '../Schema';
import { ICustomScalar } from './ICustomScalar';
import { IResourceTypeOpts } from './IResourceTypeOpts';
export declare type TResourceTypes = ICustomScalar<any> | typeof String | typeof Date | typeof Boolean | typeof Number | Schema | TResourceArray | IResourceTypeOpts<any>;
declare type TResourceArray = [TResourceTypes];
export {};
