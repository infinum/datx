import { View } from '@datx/core';
import { IResponseHeaders } from '@datx/utils';

import { IHeaders } from './IHeaders';
import { IResponseObject } from './IResponseObject';

export interface IResponseInternal {
  headers?: IResponseHeaders;
  requestHeaders?: IHeaders;
  error?: Array<string | Record<string, unknown>> | Error;
  status?: number;
  response: IResponseObject;
  views: Array<View>;
}
