import {ReferenceType} from '../enums/ReferenceType';
import {PureModel} from '../PureModel';

export interface IReferenceOptions<T = typeof PureModel> {
  model: T;
  property?: string;
  type: ReferenceType;
}
