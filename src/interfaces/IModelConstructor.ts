import {Model} from '../Model';
import {IRawModel} from './IRawModel';

export interface IModelConstructor<T = Model> {
  type: string;

  new(data?: IRawModel): T;
}
