import { isCollection, isModel, PureCollection, PureModel, View } from '@datx/core';

import { decorateCollection } from './decorateCollection';
import { decorateModel } from './decorateModel';
// import { decorateView } from './decorateView';
import { INetworkCollection } from './interfaces/INetworkCollection';
import { INetworkModel } from './interfaces/INetworkModel';
import { INetworkView } from './interfaces/INetworkView';
import { BaseRequest } from './BaseRequest';
import { INetworkCollectionConstructor } from './interfaces/INetworkCollectionConstructor';

interface INetwork<T> {
  network?: BaseRequest;

  new (): T;
}

export function withNetwork<T extends typeof PureModel>(Base: T): T & INetwork<INetworkModel>;

export function withNetwork<T extends typeof PureCollection>(
  Base: T,
): T & INetworkCollectionConstructor;

export function withNetwork<T extends typeof View>(Base: T): T & INetwork<INetworkView>;

export function withNetwork<T>(
  Base: T,
): (T & INetworkModel) | (T & INetworkCollection) | (T & INetworkView) {
  if (isModel(Base)) {
    // @ts-ignore
    return decorateModel(Base);
  }

  if (isCollection(Base)) {
    // @ts-ignore
    return decorateCollection(Base);
  }

  // if (isView(Base)) {
  //   // @ts-ignore
  //   return decorateView<T>(Base);
  // }

  throw new Error('The instance needs to be a model, collection or a view');
}
