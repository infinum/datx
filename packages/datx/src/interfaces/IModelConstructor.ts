import { IDictionary, IRawModel } from 'datx-utils';

import { PureCollection } from '../PureCollection';
import { PureModel } from '../PureModel';
import { IIdentifier } from './IIdentifier';
import { IType } from './IType';

export interface IModelConstructor<T = PureModel> {
  type: IType;
  autoIdValue: IIdentifier;
  enableAutoId: boolean;

  new(data?: IRawModel, collection?: PureCollection): T;

  preprocess(data: object, collection?: PureCollection): object;
  getAutoId(): IIdentifier;
  toJSON(): IIdentifier;
}
