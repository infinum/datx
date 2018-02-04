import {IRawModel} from 'datx-utils';

import {PureCollection} from '../PureCollection';
import {PureModel} from '../PureModel';
import {IModelConstructor} from './IModelConstructor';

export interface ICollectionConstructor<T = PureCollection> {
  types: Array<typeof PureModel|IModelConstructor<PureModel>>;

  new(data?: Array<IRawModel>): T;
}
