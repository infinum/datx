import { Collection } from '@datx/core';
import { IResponseHeaders } from '@datx/utils';

import { IHeaders } from './IHeaders';
import { IJsonApiObject, IResponse } from './JsonApi';

export interface IRawResponse {
  data?: IResponse;
  error?: Error;
  headers?: IResponseHeaders;
  requestHeaders?: IHeaders;
  status?: number;
  jsonapi?: IJsonApiObject;
  collection?: Collection;
}
