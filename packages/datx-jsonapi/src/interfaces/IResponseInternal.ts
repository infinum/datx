import { View } from '@datx/core';
import { IResponseHeaders } from '@datx/utils';
import { IError, IJsonApiObject, ILink } from '@datx/jsonapi-types';

import { IHeaders } from './IHeaders';
import { IRawResponse } from './IRawResponse';
import { IRequestOptions } from './IRequestOptions';

export interface IResponseInternal {
  meta?: object;
  links?: Record<string, ILink>;
  jsonapi?: IJsonApiObject;
  headers?: IResponseHeaders;
  requestHeaders?: IHeaders;
  error?: Array<IError> | Error;
  status?: number;
  options?: IRequestOptions;
  response: IRawResponse;
  views: Array<View>;
}
