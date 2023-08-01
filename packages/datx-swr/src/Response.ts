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

export class CollectionResponse<TModel extends IJsonapiModel = IJsonapiModel> extends BaseResponse<
  TModel,
  Promise<CollectionResponse<TModel>>
> {
  public get data(): Array<TModel> {
    // @ts-expect-error __data is private but we need to access it
    return this.__data.value;
  }
}

export class SingleResponse<TModel extends IJsonapiModel = IJsonapiModel> extends BaseResponse<
  TModel,
  never
> {
  public get data(): TModel {
    // @ts-expect-error __data is private but we need to access it
    return this.__data.value;
  }
}

export function isSingleResponse<TModel extends IJsonapiModel>(
  obj: unknown,
): obj is SingleResponse<TModel> {
  return obj instanceof SingleResponse;
}

export function isCollectionResponse<TModel extends IJsonapiModel>(
  obj: unknown,
): obj is CollectionResponse<TModel> {
  return obj instanceof CollectionResponse;
}
