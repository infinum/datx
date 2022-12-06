import { IJsonapiModel } from '@datx/jsonapi';

export type IResponseData<TModel extends IJsonapiModel = IJsonapiModel> =
  | TModel
  | Array<TModel>
  | null;
