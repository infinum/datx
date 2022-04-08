import { IJsonapiModel, Response } from '@datx/jsonapi';
import useSWR from 'swr';

import { ExtractDataType, Expression } from '../interfaces/QueryExpression';
import { DatxConfiguration } from '../interfaces/DatxConfiguration';
import { middleware } from '../middleware';

type Data<
  TModel extends IJsonapiModel,
  TExpression extends Expression,
> = ExtractDataType<TExpression> extends { op: 'getOne' } ? TModel : Array<TModel>;

export function useQuery<TModel extends IJsonapiModel>(
  queryExpression: Expression,
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

// const key: Expression = { op: 'getMany', type: 'test', id: '1' };

// type Test = Data<IJsonapiModel, typeof key>
