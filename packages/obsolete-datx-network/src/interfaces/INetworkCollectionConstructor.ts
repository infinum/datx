import { PureCollection, IRawModel, IRawCollection } from '@datx/core';

import { INetworkCollection } from './INetworkCollection';

export interface INetworkCollectionConstructor extends PureCollection {
  new (data?: Array<IRawModel> | IRawCollection): INetworkCollection;
}
