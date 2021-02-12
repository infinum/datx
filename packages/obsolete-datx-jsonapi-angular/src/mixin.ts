import {
  ICollectionConstructor,
  IModelConstructor,
  isCollection,
  isModel,
  isView,
  IViewConstructor,
  PureCollection,
  PureModel,
} from '@datx/core';
import { jsonapi } from '@datx/jsonapi';

import { decorateCollection } from './decorateCollection';
import { decorateModel } from './decorateModel';
import { decorateView } from './decorateView';
import { IJsonapiCollection } from './interfaces/IJsonapiCollection';
import { IJsonapiModel } from './interfaces/IJsonapiModel';
import { IJsonapiView } from './interfaces/IJsonapiView';

export function jsonapiAngular<T extends PureModel>(
  Base: IModelConstructor<T>,
): IModelConstructor<T & IJsonapiModel>;

export function jsonapiAngular<T extends PureCollection>(
  Base: ICollectionConstructor<T>,
): ICollectionConstructor<T & IJsonapiCollection>;

export function jsonapiAngular<T extends PureModel>(
  Base: IViewConstructor<T>,
): IViewConstructor<IJsonapiModel, T & IJsonapiView>;

export function jsonapiAngular<T>(
  Base: IModelConstructor<T> | ICollectionConstructor<T> | IViewConstructor<T>,
):
  | IModelConstructor<T & IJsonapiModel>
  | ICollectionConstructor<T & IJsonapiCollection>
  | IViewConstructor<IJsonapiModel, T & IJsonapiView> {
  if (isModel(Base)) {
    // @ts-ignore
    return decorateModel(jsonapi(Base));
  }

  if (isCollection(Base)) {
    // @ts-ignore
    return decorateCollection(jsonapi(Base));
  }

  if (isView(Base)) {
    // @ts-ignore
    return decorateView<T>(jsonapi(Base));
  }

  throw new Error('The instance needs to be a model, collection or a view');
}
