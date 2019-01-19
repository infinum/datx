import { IIdentifier } from './IIdentifier';
import { IType } from './IType';

export interface IRawView {
  modelType: IType;
  models: Array<IIdentifier>;
  unique: boolean;
}
