import {ReferenceType} from '../enums/ReferenceType';
import {Model} from '../Model';

export interface IReferenceOptions<T = typeof Model> {
  model: T;
  property?: string;
  type: ReferenceType;
}
