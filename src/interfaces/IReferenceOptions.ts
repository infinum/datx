import {ReferenceType} from '../enums/ReferenceType';
import {Model} from '../Model';

export interface IReferenceOptions {
  model: typeof Model;
  property?: string;
  type: ReferenceType;
}
