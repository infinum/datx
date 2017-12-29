import {Model} from '../Model';
import {IIdentifier} from './IIdentifier';

export type TRefValue = IIdentifier|Array<IIdentifier>|Model|Array<Model>|null;
