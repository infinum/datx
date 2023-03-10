import { IJsonapiModel } from '@datx/jsonapi';
import useSWR from 'swr';

import { JsonapiModel } from '../interfaces/Client';
import { DatxConfiguration } from '../interfaces/DatxConfiguration';
import { IGetAllSWRResponse } from '../interfaces/IFetchQueryReturn';
import { IResponseData } from '../interfaces/IResponseData';
import {
  ExactExpressionArgument,
  Expression,
  IGetAllExpression,
  IGetRelatedResourceExpression,
  IGetRelatedResourcesExpression,
} from '../interfaces/QueryExpression';
import { Data, Model } from '../interfaces/UseDatx';
import { middleware } from '../middleware';
import { Response } from '../Response';

export function useDatx<
  TExpression extends Expression,
  TModel extends IJsonapiModel = Model<TExpression>,
  TData extends IResponseData = Data<TExpression, TModel>,
  TResponseType extends
    | IGetAllSWRResponse
    | Response<IResponseData> = ExactExpressionArgument<TExpression> extends IGetAllExpression
    ? IGetAllSWRResponse<TModel>
    : ExactExpressionArgument<TExpression> extends
        | IGetRelatedResourceExpression
        | IGetRelatedResourcesExpression
    ? ExactExpressionArgument<TExpression> extends { readonly relation: infer TRelation }
      ? TRelation extends keyof TModel
        ? TModel[TRelation] extends JsonapiModel | Array<JsonapiModel>
          ? Response<TModel[TRelation]>
          : never
        : never
      : never
    : Response<TData>,
>(expression: TExpression, config?: DatxConfiguration<TResponseType>) {
  return useSWR<TResponseType, TResponseType>(expression, {
    ...config,
    use: [middleware, ...(config?.use || [])],
  });
}
