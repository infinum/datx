import { IRequestOptions } from '@datx/jsonapi';
import { Fetcher, SWRConfiguration } from 'swr';
import { SWRInfiniteConfiguration } from 'swr/infinite/dist/infinite';
import { CollectionResponse, Response } from '../Response';
import { IGetAllSWRResponse } from './IFetchQueryReturn';
import { IResponseData } from './IResponseData';

export type DatxConfiguration<TResponseType extends IGetAllSWRResponse | Response<IResponseData>> =
  SWRConfiguration<TResponseType, TResponseType, Fetcher<TResponseType>> & {
    networkConfig?: IRequestOptions['networkConfig'];
  };

export type DatxInfiniteConfiguration<TResponseType extends CollectionResponse> =
  SWRInfiniteConfiguration<TResponseType, TResponseType, Fetcher<TResponseType>> & {
    networkConfig?: IRequestOptions['networkConfig'];
  };
