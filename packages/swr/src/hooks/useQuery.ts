import { IJsonapiModel, Response } from '@datx/jsonapi';
import useSWR from 'swr';

import { QueryExpression } from '../interfaces/QueryExpression';
import { DatxConfiguration } from '../interfaces/DatxConfiguration';
import { middleware } from '../middleware';

type ExtractExpression<TExpression> = TExpression extends (...args) => any
  ? ReturnType<TExpression>
  : TExpression;

type Data<
  TModel extends IJsonapiModel,
  TExpression extends QueryExpression,
> = ExtractExpression<TExpression> extends { op: 'getOne' } ? TModel : Array<TModel>;

export function useQuery<TModel extends IJsonapiModel>(
  queryExpression: QueryExpression,
  config?: DatxConfiguration<TModel, any>,
) {
  return useSWR<
    Response<TModel, Data<TModel, typeof queryExpression>>,
    Response<TModel, Data<TModel, typeof queryExpression>>
  >(queryExpression, {
    ...config,
    use: [middleware, ...(config?.use || [])],
  });
}
