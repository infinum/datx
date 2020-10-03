import { View, PureCollection, IType, PureModel } from 'datx';

import { IRequestOptions } from './IRequestOptions';
import { HttpMethod } from '../enums/HttpMethod';

export interface IFetchOptions {
  url: string;
  options?: IRequestOptions;
  data?: string | object | FormData;
  method: HttpMethod;
  collection?: PureCollection;
  skipCache?: boolean;
  views?: Array<View>;
  type?: IType | typeof PureModel;
}
