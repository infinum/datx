import { IFetchOptions } from './IFetchOptions';
import { Response } from '../Response';
import { PureModel } from '@datx/core';

export type IFinalInterceptor<T extends PureModel = PureModel> = (
  request: IFetchOptions,
) => Promise<Response<T>>;
