import { Response } from '@datx/jsonapi';
import useSWR from 'swr';

import { QueryExpression } from '../interfaces/QueryExpression';
import { DatxConfiguration } from '../interfaces/DatxConfiguration';
import { middleware } from '../middleware';
import { DatxJsonapiModel } from '../interfaces/DatxJsonapiModel';

type ExtractExpression<TExpression> = TExpression extends (...args) => any
  ? ReturnType<TExpression>
  : TExpression;
type Data<
  TModel extends DatxJsonapiModel,
  TExpression extends QueryExpression<TModel>,
> = ExtractExpression<TExpression> extends { op: 'getOne' } ? TModel : Array<TModel>;

export function useQuery<TModel extends DatxJsonapiModel>(
  queryExpression: QueryExpression<TModel>,
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
