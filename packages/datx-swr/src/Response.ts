import { IGetAllResponse, IJsonapiModel, Response as BaseResponse } from '@datx/jsonapi';
import { IClientInstance } from './interfaces/Client';
import { Fallback } from './interfaces/Fallback';
import { IGetAllSWRResponse } from './interfaces/IFetchQueryReturn';
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

export const dehydrateResponse = (
  response: SingleResponse | CollectionResponse | IGetAllSWRResponse,
) => {
  // instance of IGetAllResponse
  if ('responses' in response) {
    return response.responses.map((r) => {
      // clone response to avoid mutation
      const raw = { ...r['__internal'].response };

      delete raw.collection;

      return raw;
    });
  }

  // clone response to avoid mutation
  const rawResponse = { ...response['__internal'].response };

  delete rawResponse.collection;

  return rawResponse;
};

export const hydrateResponse = (
  cacheKey: keyof Fallback,
  dehydratedResponse: Fallback[keyof Fallback],
  client: IClientInstance,
) => {
  // "getOne", "getMany", "getRelatedResource", "getRelatedResources"
  if (!Array.isArray(dehydratedResponse)) {
    return new BaseResponse(dehydratedResponse, client);
  }

  // infinite query
  // hardcoded value from swr since it's not exported
  // https://github.com/vercel/swr/blob/main/_internal/src/constants.ts#L1
  if (cacheKey.startsWith('$inf$')) {
    return dehydratedResponse.map((res) => new BaseResponse(res, client));
  }

  // "getAll"
  const response = dehydratedResponse.reduce(
    (fallbackValue, rawResponse) => {
      const res = new BaseResponse(rawResponse, client);

      fallbackValue.responses.push(res);
      fallbackValue.data.push(...(res.data as Array<IJsonapiModel>));

      return fallbackValue;
    },
    { data: [], responses: [] } as Omit<IGetAllResponse<IJsonapiModel>, 'lastResponse'>,
  );

  (response as IGetAllResponse<IJsonapiModel>).lastResponse =
    response.responses[dehydratedResponse.length - 1];

  return response as IGetAllResponse<IJsonapiModel>;
};
