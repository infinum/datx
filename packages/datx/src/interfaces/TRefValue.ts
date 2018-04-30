import {PureModel} from '../PureModel';
import {IIdentifier} from './IIdentifier';

export type TRefValue<T = PureModel> = IIdentifier | Array<IIdentifier> | T | Array<T> | null;
