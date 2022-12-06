import { IJsonapiModel } from '@datx/jsonapi';
import useSWR from 'swr';

import { Expression } from '../interfaces/QueryExpression';
import { DatxConfiguration } from '../interfaces/DatxConfiguration';
import { middleware } from '../middleware';
import { Data, Model } from '../interfaces/UseDatx';
import { IResponseData } from '../interfaces/IResponseData';
import { Response } from '../Response';

export function useDatx<
  TExpression extends Expression,
  TModel extends IJsonapiModel = Model<TExpression>,
  TData extends IResponseData = Data<TExpression, TModel>,
>(expression: TExpression, config?: DatxConfiguration<TData>) {
  return useSWR<Response<TData>, Response<TData>>(expression, {
    ...config,
    use: [middleware, ...(config?.use || [])],
  });
}
