import { IResponseHeaders } from './IResponseHeaders';
import { IHeaders } from './IHeaders';
import { PureCollection, IType, PureModel } from 'datx';

export interface IResponseObject {
  data?: object;
  error?: Error;
  headers?: IResponseHeaders;
  requestHeaders?: IHeaders;
  status?: number;
  collection?: PureCollection;
  type?: IType | typeof PureModel;
}
