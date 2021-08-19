import { IRequestOptions } from './IRequestOptions';

export interface IResponseSnapshot {
  response: Record<string, unknown> & { headers?: Array<[string, string]> };
  options?: IRequestOptions;
}
