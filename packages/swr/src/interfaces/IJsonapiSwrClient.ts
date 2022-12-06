import { IJsonapiModel } from '@datx/jsonapi';
import { Fallback } from './Fallback';
import { IFetchQueryConfiguration } from './IFetchQueryConfiguration';
import { IFetchQueryReturn } from './IFetchQueryReturn';
import { Expression } from './QueryExpression';

export interface IJsonapiSwrClient {
  fallback: Fallback;
  fetchQuery: <TModel extends IJsonapiModel = IJsonapiModel>(
    expression: Expression,
    config?: IFetchQueryConfiguration,
  ) => Promise<IFetchQueryReturn<TModel> | undefined>;
}
