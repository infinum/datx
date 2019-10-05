import { PureModel } from '../PureModel';
import { IIdentifier } from './IIdentifier';
import { IModelRef } from './IModelRef';

export type TRefValue<T = PureModel> =
  | IIdentifier
  | Array<IIdentifier>
  | IModelRef
  | Array<IModelRef>
  | T
  | Array<T>
  | null;
