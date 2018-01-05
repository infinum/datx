import { Model } from '../Model';
import { IIdentifier } from './IIdentifier';
export declare type TRefValue<T = Model> = IIdentifier | Array<IIdentifier> | T | Array<T> | null;
