import { IRequestOptions } from '@datx/jsonapi';
import { Fetcher, SWRConfiguration } from 'swr';
import { Response } from '../Response';
import { IResponseData } from './IResponseData';

export type DatxConfiguration<TData extends IResponseData> = SWRConfiguration<
  Response<TData>,
  Response<TData>,
  Fetcher<Response<TData>>
> & {
  networkConfig?: IRequestOptions['networkConfig'];
};
