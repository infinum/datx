import {
  ICollectionConstructor,
  IModelConstructor,
  isCollection,
  isModel,
  isView,
  IViewConstructor,
  PureCollection,
  PureModel,
} from 'datx';

import { decorateCollection } from './decorateCollection';
import { decorateModel } from './decorateModel';
import { decorateView } from './decorateView';
import { IJsonapiCollection } from './interfaces/IJsonapiCollection';
import { IJsonapiModel } from './interfaces/IJsonapiModel';
import { IJsonapiView } from './interfaces/IJsonapiView';

export function jsonapi<T extends PureModel>(
  Base: IModelConstructor<T>,
): IModelConstructor<T & IJsonapiModel>;

export function jsonapi<T extends PureCollection>(
  Base: ICollectionConstructor<T>,
): ICollectionConstructor<T & IJsonapiCollection>;

export function jsonapi<T extends PureModel>(
  Base: IViewConstructor<T>,
): IViewConstructor<IJsonapiModel, T & IJsonapiView>;

export function jsonapi<T>(
  Base: IModelConstructor<T> | ICollectionConstructor<T> | IViewConstructor<T>,
):
  | IModelConstructor<T & IJsonapiModel>
  | ICollectionConstructor<T & IJsonapiCollection>
  | IViewConstructor<IJsonapiModel, T & IJsonapiView> {
  if (isModel(Base)) {
    // @ts-ignore
    return decorateModel(Base);
  }

  if (isCollection(Base)) {
    // @ts-ignore
    return decorateCollection(Base);
  }

  if (isView(Base)) {
    // @ts-ignore
    return decorateView<T>(Base);
  }

  throw new Error('The instance needs to be a model, collection or a view');
}
