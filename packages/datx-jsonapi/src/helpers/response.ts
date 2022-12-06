import { IJsonapiModel } from '../interfaces/IJsonapiModel';
import { Response } from '../Response';

export function getResponseRawData<TModel extends IJsonapiModel = IJsonapiModel>(
  response: Response<TModel>,
) {
  return response?.['__internal']?.response?.data;
}
