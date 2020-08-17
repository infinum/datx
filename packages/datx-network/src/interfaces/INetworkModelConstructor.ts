import { INetworkModel } from './INetworkModel';
import { IModelNetworkConfig } from './IModelNetworkConfig';
import { PureModel } from 'datx';

export interface INetworkModelConstructor extends PureModel {
  network?: IModelNetworkConfig;
  new (): INetworkModel;
}
