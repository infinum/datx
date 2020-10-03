import { IFetchOptions } from './IFetchOptions';
import { PureModel } from 'datx';

import { Response } from '../Response';

export type INetworkHandler<T extends PureModel = PureModel> = (
  request: IFetchOptions,
) => Promise<Response<T>>;
