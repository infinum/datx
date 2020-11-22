import { View } from 'datx';
import { IResponseHeaders } from 'datx-utils';

import { IHeaders } from './IHeaders';
import { IRawResponse } from './IRawResponse';
import { IRequestOptions } from './IRequestOptions';
import { IError, IJsonApiObject, ILink } from './JsonApi';

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
