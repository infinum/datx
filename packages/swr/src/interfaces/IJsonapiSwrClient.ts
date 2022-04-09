import { IJsonapiModel } from '@datx/jsonapi';
import { Fallback } from './Fallback';
import { IFetchQueryReturn } from './IFetchQueryReturn';
import { Expression } from './QueryExpression';

export interface IJsonapiSwrClient {
  fallback: Fallback;
  fetchQuery: <TModel extends IJsonapiModel = IJsonapiModel>(
    expression: Expression,
  ) => Promise<IFetchQueryReturn<TModel>>;
}
