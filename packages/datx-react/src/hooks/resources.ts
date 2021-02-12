import { Model } from '@datx/core';
import { Response } from '@datx/jsonapi';
import useSWR, { ConfigInterface } from 'swr';
import { fetcherFn } from 'swr/dist/types';

import { useStores } from '@hooks/useStores';
import { IQueryResource } from './interfaces/IQueryResource';
import { IQueryResources } from './interfaces/IQueryResources';

export function useResource<TModel extends Resource = Resource, TMeta extends object = object>(
  queryResource: QueryResource<TModel>,
  config?: ConfigInterface<Response<TModel>, Response<TModel>, fetcherFn<Response<TModel>>>,
) {
  const { store } = useStores();
  let query;

  if (queryResource) {
    const [type, id, options] = queryResource;

    query = store.queryResource(type, id, options);
  }

  const swr = useSWR<Response<TModel>, Response<TModel>>(query?.key, query?.fetcher, config);

  return {
    ...swr,
    data: swr.data?.data as TModel,
    error: swr.error?.error,
    meta: swr.data?.meta as TMeta,
  };
}

export function useResources<TModel extends Resource = Resource, TMeta extends object = object>(
  queryResources: QueryResources<TModel>,
  config?: ConfigInterface<Response<TModel>, Response<TModel>, fetcherFn<Response<TModel>>>,
) {
  const { store } = useStores();
  let query;

  if (queryResources) {
    const [type, options] = queryResources;

    query = store.queryResources(type, options);
  }

  const swr = useSWR<Response<TModel>, Response<TModel>>(query?.key, query?.fetcher, config);

  return {
    ...swr,
    data: swr.data?.data as Array<TModel>,
    error: swr.error?.error,
    meta: swr.data?.meta as TMeta,
  };
}