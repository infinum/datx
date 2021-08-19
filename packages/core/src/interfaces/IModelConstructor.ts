import { IRawModel } from '@datx/utils';

import { PureCollection } from '../PureCollection';
import { PureModel } from '../PureModel';
import { IIdentifier } from './IIdentifier';
import { IType } from './IType';

export interface IModelConstructor<T = PureModel, TExtendedModel = unknown> {
  type: IType;
  autoIdValue: IIdentifier;
  enableAutoId: boolean;

  new (data?: IRawModel, collection?: PureCollection): T & TExtendedModel;

  preprocess(data: Record<string, unknown>, collection?: PureCollection): Record<string, unknown>;
  getAutoId(): IIdentifier;
  toJSON(): IType;
}
