import { View } from 'datx';

import { IHeaders } from './IHeaders';
import { IRequestOptions } from './IRequestOptions';
import { IResponseHeaders } from './IResponseHeaders';
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
