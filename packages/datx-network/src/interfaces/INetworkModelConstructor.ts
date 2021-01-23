import { INetworkModel } from './INetworkModel';
import { IModelNetworkConfig } from './IModelNetworkConfig';
import { IModelConstructor } from '@datx/core';

export interface INetworkModelConstructor extends IModelConstructor {
  network?: IModelNetworkConfig;
  new (): INetworkModel;
}
