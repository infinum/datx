import { IJsonapiModel } from '../interfaces/IJsonapiModel';
import { IResponseData } from '../interfaces/IResponseData';
import { Response } from '../Response';

export function getResponseRawData<
  TModel extends IJsonapiModel = IJsonapiModel,
  TData extends IResponseData = IResponseData<TModel>,
>(response: Response<TModel, TData>) {
  return response?.['__internal']?.response?.data;
}
