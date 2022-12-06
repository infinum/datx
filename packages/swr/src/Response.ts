import { IJsonapiModel, Response as BaseResponse } from '@datx/jsonapi';

export type ResponseData = IJsonapiModel | Array<IJsonapiModel>;
export type ExtractModel<T> = T extends IJsonapiModel
  ? T
  : T extends Array<IJsonapiModel>
  ? T[0]
  : never;

export type Response<TData extends ResponseData> = TData extends Array<infer TModel>
  ? CollectionResponse<TModel extends IJsonapiModel ? IJsonapiModel : never>
  : SingleResponse<TData extends IJsonapiModel ? IJsonapiModel : never>;

type IAsync<T extends IJsonapiModel> = Promise<CollectionResponse<T>>;

export class CollectionResponse<TModel extends IJsonapiModel> extends BaseResponse<
  TModel,
  IAsync<TModel>
> {
  public get data(): Array<TModel> {
    return this.data as Array<TModel>;
  }
}

export class SingleResponse<TModel extends IJsonapiModel> extends BaseResponse<
  TModel,
  IAsync<TModel>
> {
  public get data(): TModel {
    return this.data as TModel;
  }
}
