import {Collection, IModelConstructor, isCollection, isModel, Model} from 'datx';

import {decorateCollection} from './decorateCollection';
import {decorateModel} from './decorateModel';

export function jsonapi<T extends Model>(Base: IModelConstructor<T>|typeof Collection) {
  const BaseClass = Base as typeof Model|typeof Collection;

  if (isModel(BaseClass)) {
    return decorateModel(BaseClass as typeof Model);
  } else if (isCollection(BaseClass)) {
    return decorateModel(BaseClass as typeof Collection);
  }

  throw new Error('The instance needs to be a model or a collection');
}
