import { PureModel } from 'datx';

import { IRequestOptions } from './IRequestOptions';

export interface INetworkModel extends PureModel {
  save(options?: IRequestOptions): Promise<INetworkModel>;

  destroy(options?: IRequestOptions): Promise<void>;
}
