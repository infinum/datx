import {Collection} from '../Collection';
import {IIdentifier} from '../interfaces/IIdentifier';
import {IType} from '../interfaces/IType';

export interface IMetaMixin {
  meta: {
    collections: Array<Collection>;
    id: IIdentifier;
    type: IType;
  };
}
