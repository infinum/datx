import { IJsonapiModel, IResponseData } from '@datx/jsonapi';
import useSWR from 'swr';

import { QueryFn, QueryConfig } from '../types';
import { useDatx } from '../hooks/useDatx';

export function useQuery<TModel extends IJsonapiModel, TData extends IResponseData, TVariables>(
  query: QueryFn<TModel, TData, TVariables>,
  config: QueryConfig<TModel, TData, TVariables> = {},
) {
  const client = useDatx();
  const { variables, ...swrConfig } = config;
  const { key, fetcher } = query(client, variables);

  return useSWR(key, fetcher, swrConfig);
}
