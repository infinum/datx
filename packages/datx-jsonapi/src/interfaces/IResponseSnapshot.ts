import { IRawResponse } from './IRawResponse';
import { IRequestOptions } from './IRequestOptions';

export interface IResponseSnapshot {
  response: Omit<IRawResponse, 'headers'> & { headers?: Array<[string, string]> };
  options?: IRequestOptions;
}
