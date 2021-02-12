import { View, PureCollection, IType, PureModel } from '@datx/core';

import { IRequestOptions } from './IRequestOptions';
import { HttpMethod } from '../enums/HttpMethod';

export interface IFetchOptions {
  url: string;
  options?: IRequestOptions;
  params?: Record<string, unknown> | null;
  data?: string | Record<string, unknown> | FormData;
  method: HttpMethod;
  collection?: PureCollection;
  skipCache?: boolean;
  views?: Array<View>;
  type?: IType | typeof PureModel;
}
