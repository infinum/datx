import { IJsonapiModel, IResponseData, Response } from '@datx/jsonapi';
import useSWR from 'swr';

import { Expression } from '../interfaces/QueryExpression';
import { DatxConfiguration } from '../interfaces/DatxConfiguration';
import { middleware } from '../middleware';
import { Data, Model } from '../interfaces/UseDatx';

export function useDatx<
  TExpression extends Expression,
  TModel extends IJsonapiModel = Model<TExpression>,
  TData extends IResponseData = Data<TExpression, TModel>,
>(expression: TExpression, config?: DatxConfiguration<TModel, TData>) {
  return useSWR<Response<TModel, TData>, Response<TModel, TData>>(expression, {
    ...config,
    use: [middleware, ...(config?.use || [])],
  });
}
