import { IJsonapiModel } from '@datx/jsonapi';
import { IGetAllResponse } from '@datx/jsonapi/dist/interfaces/IGetAllResponse';
import { CollectionResponse, Response } from '../Response';
import { IResponseData } from './IResponseData';

export interface IFetchQueryReturn<TData extends IResponseData> {
  data?: Response<TData>;
  error?: unknown;
}

export interface IGetAllSWRResponse<T extends IJsonapiModel = IJsonapiModel>
  extends IGetAllResponse<T> {
  data: Array<T>;
  responses: Array<CollectionResponse<T>>;
  lastResponse: CollectionResponse<T>;
}

export interface IFetchAllQueryReturn<TModel extends IJsonapiModel> {
  data?: IGetAllSWRResponse<TModel>;
  error?: unknown;
}
