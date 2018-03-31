import {
  ICollectionConstructor,
  IModelConstructor,
  isCollection,
  isModel,
  isView,
  IViewConstructor,
  PureCollection,
  PureModel,
  View,
} from 'datx';

import {decorateCollection} from './decorateCollection';
import {decorateModel} from './decorateModel';
import {decorateView} from './decorateView';
import {IJsonapiCollection} from './interfaces/IJsonapiCollection';
import {IJsonapiModel} from './interfaces/IJsonapiModel';
import {IJsonapiView} from './interfaces/IJsonapiView';

export function jsonapi<T extends PureModel>(
  Base: IModelConstructor<T>,
): IModelConstructor<T & IJsonapiModel>;

export function jsonapi<T extends PureCollection>(
  Base: ICollectionConstructor<T>,
): ICollectionConstructor<T & IJsonapiCollection>;

export function jsonapi<T extends View>(
  Base: IViewConstructor<T>,
): IViewConstructor<T & IJsonapiView>;

export function jsonapi<T extends PureModel|PureCollection>(
  Base: IModelConstructor<T>|ICollectionConstructor<T>,
) {
  if (isModel(Base)) {
    return decorateModel(Base as typeof PureModel);
  } else if (isCollection(Base)) {
    return decorateCollection(Base as typeof PureCollection);
  } else if (isView(Base)) {
    return decorateView(Base as typeof View);
  }

  throw new Error('The instance needs to be a model, collection or a view');
}
