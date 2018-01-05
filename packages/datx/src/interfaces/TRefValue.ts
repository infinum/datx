import {Model} from '../Model';
import {IIdentifier} from './IIdentifier';

export type TRefValue<T = Model> = IIdentifier|Array<IIdentifier>|T|Array<T>|null;
