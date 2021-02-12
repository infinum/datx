import { PureModel } from '@datx/core';

import { IRequestOptions } from './IRequestOptions';

export interface INetworkModel extends PureModel {
  save(options?: IRequestOptions): Promise<INetworkModel>;

  destroy(options?: IRequestOptions): Promise<void>;
}
