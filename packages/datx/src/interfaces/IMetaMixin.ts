import {PureCollection} from '../PureCollection';
import {PureModel} from '../PureModel';
import {IDictionary} from './IDictionary';
import {IIdentifier} from './IIdentifier';
import {IType} from './IType';

export interface IMetaMixin<T = PureModel> {
  meta: Readonly<{
    collection?: PureCollection;
    id: IIdentifier;
    original?: T;
    refs: IDictionary<IIdentifier>;
    type: IType;
  }>;
}
