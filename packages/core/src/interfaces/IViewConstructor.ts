import { PureCollection } from '../PureCollection';
import { PureModel } from '../PureModel';
import { View } from '../View';
import { IIdentifier } from './IIdentifier';
import { IModelConstructor } from './IModelConstructor';
import { IType } from './IType';

export type IViewConstructor<T, V = View, TExtendedView = unknown> = new (
  modelType: IModelConstructor<T> | IType,
  collection: PureCollection,
  sortMethod?: string | ((item: T) => unknown),
  models?: Array<IIdentifier | PureModel>,
  unique?: boolean,
) => View<T> & V & TExtendedView;
