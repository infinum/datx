import { IJsonapiModel } from '@datx/jsonapi';
import { Fallback } from './Fallback';
import { IFetchQueryConfiguration } from './IFetchQueryConfiguration';
import { IFetchAllQueryReturn, IFetchQueryReturn } from './IFetchQueryReturn';
import { IResponseData } from './IResponseData';
import {
  ExactExpressionArgument,
  Expression,
  IGetAllExpression,
  IGetRelatedResourceExpression,
  IGetRelatedResourcesExpression,
} from './QueryExpression';
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
  ) => Promise<
    ExactExpressionArgument<TExpression> extends IGetAllExpression
      ? IFetchAllQueryReturn<TModel>
      : ExactExpressionArgument<TExpression> extends
          | IGetRelatedResourceExpression
          | IGetRelatedResourcesExpression
      ? ExactExpressionArgument<TExpression> extends { readonly relation: infer TRelation }
        ? TRelation extends keyof TModel
          ? TModel[TRelation] extends IJsonapiModel | Array<IJsonapiModel>
            ? IFetchQueryReturn<TModel[TRelation]>
            : never
          : never
        : never
      : IFetchQueryReturn<TData>
  >;
}
