import {Model} from '../Model';
import {IDictionary} from './IDictionary';
import {IIdentifier} from './IIdentifier';
import {IRawModel} from './IRawModel';

export interface IModelConstructor<T = Model> {
  type: string;
  autoIdValue: number ;

  new(data?: IRawModel): T;

  preprocess(data: object): object;
  getAutoId(): IIdentifier;
}
