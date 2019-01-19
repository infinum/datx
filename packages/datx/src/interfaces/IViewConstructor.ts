import { PureCollection } from '../PureCollection';
import { PureModel } from '../PureModel';
import { View } from '../View';
import { IIdentifier } from './IIdentifier';
import { IModelConstructor } from './IModelConstructor';
import { IType } from './IType';

export interface IViewConstructor<T, V = View> {
  new(
    modelType: IModelConstructor<T> | IType,
    collection: PureCollection,
    sortMethod?: string | ((item: T) => any),
    models?: Array<IIdentifier | PureModel>,
    unique?: boolean,
  ): View<T> & V;
}
