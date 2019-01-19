import { ReferenceType } from '../enums/ReferenceType';
import { PureModel } from '../PureModel';
import { IType } from './IType';

export interface IReferenceOptions<T = typeof PureModel> {
  model: T | IType;
  property?: string;
  type: ReferenceType;
}
