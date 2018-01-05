import {Collection, Model} from 'datx';
import {isCollection, isModel} from 'datx/dist/helpers/mixin';
import {IModelConstructor} from 'datx/dist/interfaces/IModelConstructor';

import {decorateCollection} from './decorateCollection';
import {decorateModel} from './decorateModel';

export function jsonapi<T extends Model>(Base: IModelConstructor<T>|typeof Collection) {
  const BaseClass = Base as typeof Model|typeof Collection;

  if (isModel(BaseClass)) {
    return decorateModel(BaseClass as typeof Model) as IModelConstructor<T>;
  } else if (isCollection(BaseClass)) {
    return decorateCollection(BaseClass as typeof Collection) as typeof Collection;
  }

  throw new Error('The instance needs to be a model or a collection');
}
