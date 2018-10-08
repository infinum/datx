import {PatchType} from '../enums/PatchType';
import {PureModel} from '../PureModel';
import {IIdentifier} from './IIdentifier';
import {IType} from './IType';

export interface IPatch<T = PureModel> {
  patchType: PatchType;
  model: {
    type: IType;
    id: IIdentifier;
  };
  oldValue?: Partial<T>;
  newValue?: Partial<T>;
}
