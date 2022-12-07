import { IJsonapiModel } from '@datx/jsonapi';
import { IGetAllResponse } from '@datx/jsonapi/dist/interfaces/IGetAllResponse';
import { Response } from '../Response';
import { IResponseData } from './IResponseData';

export interface IFetchQueryReturn<TData extends IResponseData> {
  data?: Response<TData>;
  error?: unknown;
}

export interface IFetchAllQueryReturn<TModel extends IJsonapiModel> {
  data?: IGetAllResponse<TModel>;
  error?: unknown;
}
