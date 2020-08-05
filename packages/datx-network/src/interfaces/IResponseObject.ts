import { IResponseHeaders } from './IResponseHeaders';
import { IHeaders } from './IHeaders';
import { PureCollection } from 'datx';

export interface IResponseObject {
  data?: object;
  error?: Error;
  headers?: IResponseHeaders;
  requestHeaders?: IHeaders;
  status?: number;
  collection?: PureCollection;
}
