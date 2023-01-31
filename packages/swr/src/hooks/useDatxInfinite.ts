import { IJsonapiModel } from '@datx/jsonapi';
import useSWRInfinite from 'swr/infinite';

import { DatxInfiniteConfiguration } from '../interfaces/DatxConfiguration';
import { InfiniteExpression } from '../interfaces/QueryExpression';
import { InfiniteModel } from '../interfaces/UseDatx';
import { middleware } from '../middleware';
import { CollectionResponse } from '../Response';

// eslint-disable-next-line @typescript-eslint/ban-types
type Narrow<T> = T extends Function
  ? T
  : never | T extends string | number | boolean | bigint
  ? T
  : never | T extends []
  ? []
  : never | { [K in keyof T]: Narrow<T[K]> };

export function useDatxInfinite<
  TExpression extends InfiniteExpression,
  TModel extends IJsonapiModel = InfiniteModel<TExpression>,
>(
  expression: (
    pageIndex: number,
    previousPageData: CollectionResponse | null,
  ) => Narrow<TExpression>,
  config?: DatxInfiniteConfiguration<CollectionResponse<TModel>>,
) {
  return useSWRInfinite<CollectionResponse<TModel>, CollectionResponse<TModel>>(expression, {
    ...config,
    use: [middleware, ...(config?.use || [])],
  });
}
