import {IModelConstructor, isCollection, isModel, PureCollection, PureModel} from 'datx';

import {decorateCollection} from './decorateCollection';
import {decorateModel} from './decorateModel';

export function jsonapi<T extends PureModel>(Base: IModelConstructor<T>|typeof PureCollection) {
  const BaseClass = Base as typeof PureModel|typeof PureCollection;

  if (isModel(BaseClass)) {
    return decorateModel(BaseClass as typeof PureModel) as IModelConstructor<T>;
  } else if (isCollection(BaseClass)) {
    return decorateCollection(BaseClass as typeof PureCollection) as typeof PureCollection;
  }

  throw new Error('The instance needs to be a model or a collection');
}
