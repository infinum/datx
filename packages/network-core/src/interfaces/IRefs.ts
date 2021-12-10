import { Collection } from '@datx/core';
import { Client } from '../Client';
import { INetwork } from './INetwork';

export interface IRefs<TNetwork extends INetwork> {
  network: TNetwork;
  client: Client<TNetwork>;
  collection: Collection;
}
