import { IFetchOptions } from './IFetchOptions';
import { INetworkHandler } from './INetworkHandler';

export type IInterceptor<TResponseType> = (
  request: IFetchOptions,
  next?: INetworkHandler,
) => TResponseType;
