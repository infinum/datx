import { IRequestOptions } from './IRequestOptions';

export interface IResponseSnapshot {
  response: Omit<object, 'headers'> & { headers?: Array<[string, string]> };
  options?: IRequestOptions;
}
