import {Collection} from '../Collection';
import {IIdentifier} from '../interfaces/IIdentifier';
import {IType} from '../interfaces/IType';
import {Model} from '../Model';

export interface IMetaMixin<T = Model> {
  meta: {
    collection?: Collection;
    id: IIdentifier;
    original?: T;
    type: IType;
  };
}
