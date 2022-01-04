import { IJsonapiModel, IRequestOptions, IResponseData, Response } from '@datx/jsonapi';
import { Fetcher, SWRConfiguration } from 'swr';

export type DatxConfiguration<
  TModel extends IJsonapiModel,
  TData extends IResponseData,
> = SWRConfiguration<
  Response<TModel, TData>,
  Response<TModel, TData>,
  Fetcher<Response<TModel, TData>>
> & {
  networkConfig: IRequestOptions['networkConfig']
};
