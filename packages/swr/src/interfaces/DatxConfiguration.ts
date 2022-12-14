import { IRequestOptions } from '@datx/jsonapi';
import { Fetcher, SWRConfiguration } from 'swr';
import { Response } from '../Response';
import { IGetAllSWRResponse } from './IFetchQueryReturn';
import { IResponseData } from './IResponseData';

export type DatxConfiguration<TResponseType extends IGetAllSWRResponse | Response<IResponseData>> =
  SWRConfiguration<TResponseType, TResponseType, Fetcher<TResponseType>> & {
    networkConfig?: IRequestOptions['networkConfig'];
  };
