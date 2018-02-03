import {Collection} from '../Collection';
import {Model} from '../Model';
import {IDictionary} from './IDictionary';
import {IIdentifier} from './IIdentifier';
import {IType} from './IType';

export interface IMetaMixin<T = Model> {
  meta: Readonly<{
    collection?: Collection;
    id: IIdentifier;
    original?: T;
    refs: IDictionary<IIdentifier>;
    type: IType;
  }>;
}
