import { IJsonapiModel, Response as BaseResponse } from '@datx/jsonapi';
import { IResponseData } from './interfaces/IResponseData';

export type ExtractModel<T> = T extends IJsonapiModel
  ? T
  : T extends Array<IJsonapiModel>
  ? T[0]
  : never;

export type Response<TData extends IResponseData> = TData extends Array<infer TModel>
  ? CollectionResponse<TModel extends IJsonapiModel ? TModel : never>
  : SingleResponse<TData extends IJsonapiModel ? TData : never>;

type IAsync<T extends IJsonapiModel> = Promise<CollectionResponse<T>>;

export class CollectionResponse<TModel extends IJsonapiModel> extends BaseResponse<
  TModel,
  IAsync<TModel>
> {
  public get data(): Array<TModel> {
    // @ts-ignore
    return this.__data.value as Array<TModel>;
  }
}

export class SingleResponse<TModel extends IJsonapiModel> extends BaseResponse<
  TModel,
  IAsync<TModel>
> {
  public get data(): TModel {
    // @ts-ignore
    return this.__data.value as TModel;
  }
}
