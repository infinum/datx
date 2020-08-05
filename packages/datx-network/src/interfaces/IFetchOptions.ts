import { View, PureCollection } from 'datx';

import { IRequestOptions } from './IRequestOptions';
import { HttpMethod } from '../enums/HttpMethod';

export interface IFetchOptions {
  url: string;
  options?: IRequestOptions;
  data?: string | FormData;
  method: HttpMethod;
  collection?: PureCollection;
  skipCache?: boolean;
  views?: Array<View>;
}
