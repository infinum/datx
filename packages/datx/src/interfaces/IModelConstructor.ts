import {PureCollection} from '../PureCollection';
import {PureModel} from '../PureModel';
import {IDictionary} from './IDictionary';
import {IIdentifier} from './IIdentifier';
import {IRawModel} from './IRawModel';
import {IType} from './IType';

export interface IModelConstructor<T = PureModel> {
  type: IType;
  autoIdValue: number ;

  new(data?: IRawModel, collection?: PureCollection): T;

  preprocess(data: object): object;
  getAutoId(): IIdentifier;
  toJSON(): IIdentifier;
}
