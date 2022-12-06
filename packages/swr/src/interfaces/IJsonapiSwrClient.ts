import { IJsonapiModel } from '@datx/jsonapi';
import { Fallback } from './Fallback';
import { IFetchQueryConfiguration } from './IFetchQueryConfiguration';
import { IFetchQueryReturn } from './IFetchQueryReturn';
import { IResponseData } from './IResponseData';
import { Expression } from './QueryExpression';
import { Data, Model } from './UseDatx';

export interface IJsonapiSwrClient {
  fallback: Fallback;
  fetchQuery: <
    TExpression extends Expression,
    TModel extends IJsonapiModel = Model<TExpression>,
    TData extends IResponseData = Data<TExpression, TModel>,
  >(
    expression: TExpression,
    config?: IFetchQueryConfiguration,
  ) => Promise<IFetchQueryReturn<TData>>;
}
