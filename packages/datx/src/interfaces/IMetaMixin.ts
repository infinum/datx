import { IRawModel } from 'datx-utils';

import { PureCollection } from '../PureCollection';
import { PureModel } from '../PureModel';
import { IIdentifier } from './IIdentifier';
import { IType } from './IType';
import { IBucket } from './IBucket';

export interface IMetaMixin<T extends PureModel = PureModel> {
  meta: {
    collection?: PureCollection;
    id: IIdentifier;
    original?: T;
    refs: Record<string, IBucket<PureModel> | null>;
    snapshot: IRawModel;
    type: IType;
  };
}
