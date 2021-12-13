import { IJsonapiModel, IResponseData } from '@datx/jsonapi';
import { Client } from './Client';
import { IQueryResult } from './IQueryResult';

export type QueryFn<TModel extends IJsonapiModel, TData extends IResponseData = IResponseData<TModel>, TVariables = Record<string, any>> = (
  client: Client,
  variables?: TVariables,
) => IQueryResult<TModel, TData>;
