import { View } from '@datx/core';

import { IRequestOptions } from './IRequestOptions';
import { Response } from '../Response';
import { INetworkModel } from './INetworkModel';

export interface INetworkView<T extends INetworkModel = INetworkModel> extends View<T> {
  sync(body?: Response<T>): T | Array<T> | null;

  getOne(id: string, options?: IRequestOptions): Promise<Response<T>>;
  getMany(options?: IRequestOptions): Promise<Response<T>>;
}
