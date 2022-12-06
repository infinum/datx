import { Response } from '../Response';
import { IResponseData } from './IResponseData';

export interface IFetchQueryReturn<TData extends IResponseData> {
  data?: Response<TData>;
  error?: unknown;
}
