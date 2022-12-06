import { IJsonapiModel, Response } from '@datx/jsonapi';
import useSWR from 'swr';

import { DatxConfiguration } from '../interfaces/DatxConfiguration';
import { Expression } from '../interfaces/QueryExpression';
import { Model } from '../interfaces/UseDatx';
import { middleware } from '../middleware';

export function useDatx<
  TExpression extends Expression,
  TModel extends IJsonapiModel = Model<TExpression>,
>(expression: TExpression, config?: DatxConfiguration<TModel>) {
  return useSWR<Response<TModel>, Response<TModel>>(expression, {
    ...config,
    use: [middleware, ...(config?.use || [])],
  });
}
