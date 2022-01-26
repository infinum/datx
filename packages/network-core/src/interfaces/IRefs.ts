import { PureCollection, PureModel } from '@datx/core';
import { Client } from '../Client';
import { Request } from '../Request';
import { INetwork } from './INetwork';

export interface IRefs<TNetwork extends INetwork, TRequestClass extends typeof Request> {
  network: TNetwork;
  client: Client<TNetwork, TRequestClass>;
  collection?: PureCollection;
  modelConstructor: typeof PureModel;
}
