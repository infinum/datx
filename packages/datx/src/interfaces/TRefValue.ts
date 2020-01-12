import { PureModel } from '../PureModel';
import { IIdentifier } from './IIdentifier';
import { IModelRef } from './IModelRef';

export type TRefValue<T = PureModel> =
  | Array<IIdentifier | IModelRef | T>
  | IIdentifier
  | IModelRef
  | T
  | null;
