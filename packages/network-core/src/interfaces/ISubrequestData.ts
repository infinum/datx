import { PureModel } from '@datx/core';
import { INetwork } from './INetwork';
import { Request } from '../Request';

export interface ISubrequestData<TNetwork extends INetwork> {
  request: Request<TNetwork>;
  model: PureModel;
  key: string;
}
