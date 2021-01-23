import { IFetchOptions } from './IFetchOptions';
import { Response } from '../Response';
import { INetworkHandler } from './INetworkHandler';
import { PureModel } from '@datx/core';

export type IInterceptor<T extends PureModel = PureModel> = (
  request: IFetchOptions,
  next?: INetworkHandler,
) => Promise<Response<T>>;
