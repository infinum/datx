import { IJsonapiModel, IRequestOptions, Response } from '@datx/jsonapi';
import { Fetcher, SWRConfiguration } from 'swr';
import { IResponseData } from './IResponseData';

export type DatxConfiguration<
  TModel extends IJsonapiModel,
  TData extends IResponseData,
> = SWRConfiguration<
  Response<TModel, TData>,
  Response<TModel, TData>,
  Fetcher<Response<TModel, TData>>
> & {
  networkConfig?: IRequestOptions['networkConfig'];
};
