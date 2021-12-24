import { IJsonapiModel, Response, IResponseData } from '@datx/jsonapi';
import {  Fetcher } from 'swr';
import { Key } from './Key';

export interface IQueryResult<TModel extends IJsonapiModel, TData extends IResponseData> {
  key: Key;
  fetcher: Fetcher<Response<TModel, TData>>;
}
