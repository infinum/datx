import { IRawResponse } from './IRawResponse';
import { IRequestOptions } from './IRequestOptions';

export interface IResponseSnapshot {
  response: IRawResponse;
  options?: IRequestOptions;
}
