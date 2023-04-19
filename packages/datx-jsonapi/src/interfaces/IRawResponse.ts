import { Collection } from '@datx/core';
import { IResponseHeaders } from '@datx/utils';
import { IJsonApiObject } from '@datx/jsonapi-types';

import { IHeaders } from './IHeaders';
import { IResponse } from './IResponse';

export interface IRawResponse {
  data?: IResponse;
  error?: Error;
  headers?: IResponseHeaders;
  requestHeaders?: IHeaders;
  status?: number;
  jsonapi?: IJsonApiObject;
  collection?: Collection;
}
