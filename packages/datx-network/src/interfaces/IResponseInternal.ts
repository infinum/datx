import { View } from 'datx';
import { IResponseHeaders } from 'datx-utils';

import { IHeaders } from './IHeaders';
import { IRequestOptions } from './IRequestOptions';
import { IResponseObject } from './IResponseObject';

export interface IResponseInternal {
  headers?: IResponseHeaders;
  requestHeaders?: IHeaders;
  error?: Array<string | object> | Error;
  status?: number;
  options?: IRequestOptions;
  response: IResponseObject;
  views: Array<View>;
}
