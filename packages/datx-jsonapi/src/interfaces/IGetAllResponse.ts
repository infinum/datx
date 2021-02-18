import { Response } from '../Response';
import { IJsonapiModel } from './IJsonapiModel';

export interface IGetAllResponse<T extends IJsonapiModel = IJsonapiModel> {
  data: Array<T>;
  responses: Array<Response<T>>;
  lastMeta: object | undefined;
}
