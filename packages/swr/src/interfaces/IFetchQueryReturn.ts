import { IJsonapiModel, Response } from '@datx/jsonapi';

export interface IFetchQueryReturn<TModel extends IJsonapiModel = IJsonapiModel> {
  data: Response<TModel>;
}
