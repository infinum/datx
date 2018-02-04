import {ICollectionConstructor, IModelConstructor, isCollection, isModel, PureCollection, PureModel} from 'datx';

import {decorateCollection} from './decorateCollection';
import {decorateModel} from './decorateModel';
import {IJsonapiCollection} from './interfaces/IJsonapiCollection';
import {IJsonapiModel} from './interfaces/IJsonapiModel';

export function jsonapi<T extends PureModel>(
  Base: IModelConstructor<T>,
): IModelConstructor<T & IJsonapiModel>;

export function jsonapi<T extends PureCollection>(
  Base: ICollectionConstructor<T>,
): ICollectionConstructor<T & IJsonapiCollection>;

export function jsonapi<T extends PureModel|PureCollection>(
  Base: IModelConstructor<T>|ICollectionConstructor<T>,
) {
  if (isModel(Base)) {
    return decorateModel(Base as typeof PureModel);
  } else if (isCollection(Base)) {
    return decorateCollection(Base as typeof PureCollection);
  }

  throw new Error('The instance needs to be a model or a collection');
}
