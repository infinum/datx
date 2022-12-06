import { IJsonapiModel, IRequestOptions, Response } from '@datx/jsonapi';
import { Fetcher, SWRConfiguration } from 'swr';

export type DatxConfiguration<TModel extends IJsonapiModel> = SWRConfiguration<
  Response<TModel>,
  Response<TModel>,
  Fetcher<Response<TModel>>
> & {
  networkConfig?: IRequestOptions['networkConfig'];
};
