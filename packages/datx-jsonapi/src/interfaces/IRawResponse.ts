import {Collection} from 'datx';

import {IHeaders} from './IHeaders';
import {IResponseHeaders} from './IResponseHeaders';
import {IJsonApiObject, IResponse} from './JsonApi';

export interface IRawResponse {
  data?: IResponse;
  error?: Error;
  headers?: IResponseHeaders;
  requestHeaders?: IHeaders;
  status?: number;
  jsonapi?: IJsonApiObject;
  collection?: Collection;
}
