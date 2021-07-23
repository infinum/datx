import { IRawModel } from '@datx/utils';

import { PureCollection } from '../PureCollection';
import { PureModel } from '../PureModel';
import { IIdentifier } from './IIdentifier';
import { IType } from './IType';
import { IModelRef } from './IModelRef';

export interface IMetaMixin<T extends PureModel = PureModel> {
  meta: {
    collection?: PureCollection;
    id: IIdentifier;
    original?: T;
    refs: Record<string, IModelRef | Array<IModelRef> | null>;
    dirty: Record<string, boolean>;
    snapshot: IRawModel;
    type: IType;
  };
}
