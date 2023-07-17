import { IJsonapiModel } from '@datx/jsonapi';
import useSWRInfinite from 'swr/infinite';

import { DatxInfiniteConfiguration } from '../interfaces/DatxConfiguration';
import { IGetRelatedResourcesExpression, InfiniteExpression } from '../interfaces/QueryExpression';
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

type Single<T> = T extends Array<infer U> ? U : T;

type InfiniteRelationResponse<
  TModel extends IJsonapiModel,
  TExpression extends InfiniteExpression,
> = NonNullable<Narrow<TExpression>> extends IGetRelatedResourcesExpression
  ? NonNullable<Narrow<TExpression>>['relation'] extends keyof TModel
    ? Single<TModel[NonNullable<Narrow<TExpression>>['relation']]> extends IJsonapiModel
      ? Single<TModel[NonNullable<Narrow<TExpression>>['relation']]>
      : never
    : never
  : TModel;

export function useDatxInfinite<
  TExpression extends InfiniteExpression,
  TModel extends IJsonapiModel = InfiniteModel<TExpression>,
>(
  expression: (
    pageIndex: number,
    previousPageData: CollectionResponse | null,
  ) => Narrow<TExpression>,
  config?: DatxInfiniteConfiguration<
    CollectionResponse<
      NonNullable<Narrow<TExpression>> extends IGetRelatedResourcesExpression
        ? InfiniteRelationResponse<TModel, Narrow<TExpression>>
        : TModel
    >
  >,
) {
  type CollectionType = CollectionResponse<
    NonNullable<Narrow<TExpression>> extends IGetRelatedResourcesExpression
      ? InfiniteRelationResponse<TModel, Narrow<TExpression>>
      : TModel
  >;

  return useSWRInfinite<CollectionType, CollectionType>(expression, {
    ...config,
    use: [middleware, ...(config?.use || [])],
  });
}
